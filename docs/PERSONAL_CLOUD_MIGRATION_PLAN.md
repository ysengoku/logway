# 個人クラウド移行計画（Supabase → SQLite + Google Drive）

作成日: 2026-10-31
状態: フェーズ2（Google ログイン）実装中

## 1. 目的と決定事項

Supabase（認証・データベース）をなくし、ユーザーのデータをユーザー自身のクラウドに保存する。

| 項目 | 決定内容 |
|---|---|
| ホスティング | Vercel を継続（フロント + Vercel Functions） |
| 認証 | Google OAuth（メール/パスワード認証は廃止） |
| データベース | ブラウザ内の SQLite（WASM）。端末の OPFS に保存 |
| クラウド保存先 | Google Drive の隠しフォルダ（appDataFolder）に `.db` ファイルを1つ置く |
| 2つ目のクラウド | Dropbox（Google の完成後）。Apple・Microsoft は対象外 |
| 共同編集 | 廃止（招待・メンバー機能を削除） |
| 同行者への共有 | 旅行ごとの閲覧専用リンク |
| 複数端末 | 同時編集はサポートしない。ただし古いデータで上書きして黙ってデータが消えることは防ぐ |

## 2. 全体構成

```
ブラウザ
 ├─ Vue アプリ（画面・ストアはほぼ現状のまま）
 ├─ repositories/ ── ローカル SQLite を読み書きする（旧 api/ 層。HTTP でサーバーを呼んでいたものを差し替え）
 ├─ SQLite WASM（Web Worker 内）+ OPFS（端末内の作業コピー）
 └─ 同期モジュール ── StorageAdapter 経由で Drive の .db をダウンロード/アップロード
                         ├─ GoogleDriveAdapter（今回）
                         └─ DropboxAdapter（後で）

Vercel Functions（app/api/、フレームワークなし）
 └─ OAuth 専用: ログイン開始 / コールバック / アクセストークン発行 / ログアウト
    （データの読み書きにはサーバーを使わない）
```

- 画面とストアは今どおり `tripRepository.getAll()` などを呼ぶ。`repositories/` の中身だけを SQLite 版に差し替えるので、画面側の変更は最小限で済む。
- サーバー側の関数は4つだけなので Hono は使わず、Vercel 標準の書き方（`export function GET(request: Request)` など）にする。

### ディレクトリ構成

```
logway/
├─ app/              ← Vercel の Root Directory
│  ├─ src/           ← アプリのコード（db/, repositories/, shared/, views/ など）
│  ├─ api/           ← Vercel Functions（フェーズ2で auth/ を追加）
│  ├─ __tests__/     ← テスト
│  └─ package.json, vite.config.ts, vercel.json など
├─ docs/             ← 計画書、ADR、archive/（旧 Supabase のマイグレーションなど）
└─ .github/
```
- サーバーにはデータを一切置かない。サーバーが持つのは OAuth のクライアントシークレットだけ。

## 3. 認証（Google OAuth）

### 流れ

1. `/api/auth/login` → Google の同意画面へリダイレクトする（PKCE + state を使う）
2. `/api/auth/callback` → 認可コードをトークンと交換する。リフレッシュトークンは**暗号化して httpOnly Cookie** に保存する（サーバー側にセッション DB は持たない）。id_token は保存しない
3. `POST /api/auth/token` → Cookie のリフレッシュトークンから、短命のアクセストークンを発行してブラウザに返す
4. ブラウザはそのアクセストークンで **Drive API を直接**呼ぶ
5. `POST /api/auth/logout` → Cookie を削除し、トークンを失効させる

### 実装メモ

**Cookie**

- 属性は `HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=7日`（`_lib/cookies.ts`）
- セッションの Cookie は `refresh_token` だけ。読み書きと削除は `_lib/session.ts` にまとめる

**リフレッシュトークンの暗号化**（`_lib/encrypt.ts`）

- AES-256-GCM（Web Crypto）。GCM の認証タグで改ざんも検出できるので、別の署名は付けない
- 鍵は `SESSION_SECRET` を base64 デコードした 32 バイトをそのまま使う。読み込み時に長さを確認し、32 バイトでなければ起動時にエラーにする
- IV は暗号化のたびに 12 バイトのランダム値を作る。Cookie の値は `base64url(iv).base64url(暗号文)`
- 暗号化する中身は、リフレッシュトークンと有効期限の JSON（`{ token, expiresAt }`、`expiresAt` はミリ秒）。期限はログイン時から 7日で、更新しても延長しない（盗まれた Cookie を使える期間に上限をつけるため）
- 復号に失敗したら（改ざん、鍵の変更など）、または中身の形が違えば `null` を返し、ログインしていない状態として扱う。鍵を変えると全員がログアウトされる
- 期限切れなら Google でリフレッシュトークンを失効（revoke）させてから `null` を返す

**`prompt=consent` が必要な理由**

- Google は同意済みのユーザーにはリフレッシュトークンを返さない。リフレッシュトークンを Cookie にしか持たないので、Cookie が切れたり別のブラウザでログインしたりしたときに取り直せるよう、毎回同意画面を出す

**`/api/auth/token`**

- POST だけを受け付ける（副作用があり、先読みなどで呼ばれないようにするため）。`Cache-Control: no-store`
- `Origin` が `APP_URL` のオリジンと一致しなければ 403 を返す（CSRF 対策。`SameSite=Lax` に重ねる）
- 返す値は `{ token, expiresIn, profile }`（型は `src/shared/types/auth.ts` の `Session`。API とクライアントで共有する）
- `profile`（名前と画像）は、リフレッシュ時に Google が返す id_token から取り出す。Google から直接受け取った値なので署名は検証しない。表示にだけ使い、権限の判断には使わない。取り出せなければ `null`
- Cookie が使えない（ない、復号できない、期限切れ）か、Google に拒否された（`invalid_grant`）ときは 401 を返し、Cookie を削除する
- Google の一時的な失敗（5xx など）では 503 を返し、Cookie は残す（再読み込みで元に戻れるように）

**`/api/auth/logout`**

- `Origin` が `APP_URL` のオリジンと一致しなければ 403 を返し、Cookie は削除しない（他のサイトから勝手にログアウトさせられないようにするため）
- 同じオリジンからのリクエストなら、Cookie は常に削除し、常に 200 を返す
- Google での失効（revoke）はできればやっておくもの。Cookie がない、または revoke に失敗しても、ログアウトは止めない

**クライアント**

- サーバーの呼び出しは `src/api/auth.ts`、パスは `src/api/paths.ts` にまとめる
- アクセストークンは Pinia ストアのメモリにだけ持ち、永続化しない。再読み込みしたら `/api/auth/token` で取り直す
- `isAuthenticated` は `session !== null`。`session` に値が入るのは、サーバーがリフレッシュトークンを有効と判断したときだけ
- ログアウトに失敗したら（ネットワークエラー、5xx）、Cookie が消えていない可能性があるので、ログイン状態を残して通知する
- 画面遷移はストアではなくコンポーネントで行う（router がストアを import しているため、逆向きにすると循環参照になる）

**未実装**

- アクセストークンの期限前の更新。401 のときだけ `session` を消し、ネットワークエラーでは残す。同時に複数の更新が走らないよう、取得中の Promise を共有する
- ログアウト失敗の通知

### スコープ

- `openid`, `https://www.googleapis.com/auth/userinfo.profile`：ログイン、表示用の名前と画像（メールアドレスは取得しない）
- `https://www.googleapis.com/auth/drive.appdata`：隠しフォルダの .db
- `https://www.googleapis.com/auth/drive.file`：閲覧リンク用のスナップショット（アプリが作ったファイルだけ）

> 要確認: 各スコープの区分（non-sensitive / sensitive）。sensitive が含まれる場合、アプリの公開に Google の審査が必要になる。

### Google Cloud 側の準備

- OAuth 同意画面と、OAuth クライアント ID（ウェブアプリ）を作る
- リダイレクト URI は完全一致が必要。プレビュー URL は毎回変わるので、**ブランチ固定のエイリアス**（例: `logway-git-staging-ysengokus-projects.vercel.app`）を登録する
- 注意: 同意画面が「テスト」状態のままだと、**リフレッシュトークンが 7日で失効する**。自分だけで使う間もこの制限はかかるので、早めに「本番」状態にする

### 環境変数（Vercel）

| 変数 | 用途 |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth |
| `SESSION_SECRET` | Cookie の暗号化キー。32 バイトのランダム値を base64 にしたもの（`openssl rand -base64 32`）。環境ごとに別の値にする |
| `APP_URL` | リダイレクト URI の組み立て |
| `VITE_GOOGLE_API_KEY` | 閲覧ページで公開スナップショットを読むためのキー（HTTP リファラーで制限する） |

## 4. データ（SQLite）

### スキーマ

Supabase のテーブルをほぼそのまま移す。認証や共同編集に関わる列とテーブルは削除する。

```sql
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
-- schema_version などを保存する

CREATE TABLE trips (
  id             TEXT PRIMARY KEY,      -- crypto.randomUUID()
  title          TEXT NOT NULL,
  start_date     TEXT,                  -- YYYY-MM-DD
  end_date       TEXT,
  share_file_id  TEXT,                  -- 閲覧リンク用スナップショットの Drive ファイル ID（共有していなければ NULL）
  created_at     TEXT NOT NULL,         -- ISO8601
  updated_at     TEXT NOT NULL
);

CREATE TABLE events (
  id       TEXT PRIMARY KEY,
  trip_id  TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  type     TEXT NOT NULL CHECK (type IN ('flight','transport','hotel','restaurant','activity','link')),
  -- 以下は現在の events テーブルと同じ列（flight_number 〜 note, check_out_time）
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX events_trip_id ON events(trip_id);

```

- 削除するもの: `owner_id`, `invite_code`, `trip_members`, RLS, `find_trip_by_invite_code`, `handle_new_user`
- `updated_at` はトリガーではなく、リポジトリ層で設定する

### マイグレーション

- `meta.schema_version` を見て、`app/src/db/migrations/NNN_*.sql` を順番に適用する
- 起動時、Drive から .db を読み込んだ直後に実行する

### SQLite の実装

- 公式の `@sqlite.org/sqlite-wasm` を Web Worker 内で動かす
- VFS は **`opfs-sahpool`** を使う（COOP/COEP ヘッダーが不要で、Safari でも動く）
- WASM（約 1MB）は、ログイン後に遅延読み込みする

## 5. 同期（Drive ⇄ 端末）

### 保存場所

- Drive の appDataFolder に `logway.sqlite` を1つ置く。ユーザーには見えない
- 端末側にはローカル状態として `lastSyncedVersion`（Drive のファイルバージョン）と `dirty`（未アップロードの変更があるか）を持つ

### 起動時・タブに戻ったとき（`visibilitychange`）

1. Drive のファイル情報（`version`）を取得する
2. `lastSyncedVersion` と違い、かつ `dirty` でなければ → ダウンロードしてローカルを置き換える
3. 違っていて、かつ `dirty` なら → 衝突として扱う（後述）
4. Drive にファイルがなければ → 初回なのでローカルの空の DB をアップロードする

### 変更したとき

1. ローカルの SQLite に書き込み、`dirty = true` にする
2. 2〜3秒の間に変更がなければ、まとめてアップロードする
3. **アップロード直前に Drive の `version` を確認する**。`lastSyncedVersion` と同じならアップロードし、新しい `version` を記録する
4. 違っていたら（別の端末で更新されていたら）、**自動では上書きしない**。どちらを残すかをユーザーに選んでもらう
   - **クラウドを残す**：Drive の版をダウンロードしてローカルを置き換える。ローカルの未同期の変更は消える
   - **ローカルで上書きする**：ローカルの版をアップロードする。別の端末での変更は消える（Drive のリビジョン履歴からしばらくは復元できる）
   - 選ぶ材料として、Drive のファイルの `modifiedTime`（クラウド側がいつ更新されたか）を表示する。どちらを選んでも反対側の変更が丸ごと消えることを明記する
   - 行単位のマージはしない（ファイル全体で同期しているため）。必要になれば後のバージョンで検討する

> Drive API には条件付き更新（If-Match）がないため、確認とアップロードの間にわずかな隙がある。1人利用ではまず起きないので許容する。

### オフライン・通信の失敗

オフライン、または認証や Drive への通信に失敗したとき（`/api/auth/token` の 503 を含む）の扱い。

| 場面 | 失敗したとき |
|---|---|
| 起動時・タブに戻ったとき | 画面を止めて、再試行ボタンを出す。Drive の最新データを確認できないので、閲覧もできないようにする |
| 保存したとき | 使い続けられるようにして、「未同期」の表示と再試行ボタンを出す |

- 編集は、Drive へのアップロードが成功して初めて保存済みとする
- `navigator.onLine` は画面の切り替えだけに使う。通信できるかの最終的な判断は、Drive への通信の成否で行う

### OPFS が使えない環境

- メモリ上の SQLite には切り替えない。操作できるのに保存されない状態を避けるため
- アプリを起動せず、考えられる原因を挙げたエラー画面を表示する（プライベートウィンドウ、サイトデータのブロック、古いブラウザ、ストレージの不足など）

### 複数タブ

- opfs-sahpool は1つのタブからしか開けないので、Web Locks でデータベースを使えるタブを1つに限る（フェーズ1で実装済み）
- 2つ目以降のタブはアプリを起動せず、「別のタブで開いています」というメッセージだけを表示する

### 破損対策

- ダウンロード後に `PRAGMA integrity_check` を実行する
- 失敗したら、Drive のリビジョン履歴から最新の正常な版を取得して復元する
- 端末の OPFS は Safari などで消えることがあるが、正本は Drive にあるので再ダウンロードで復旧できる

## 6. 閲覧リンク（同行者向け）

- 旅行の「共有」を ON にすると、その旅行と予定を **JSON スナップショット**として Drive の通常領域に作る（`drive.file` スコープ）。権限は「リンクを知っている全員が閲覧可」にする
- `trips.share_file_id` にファイル ID を保存する
- 共有中の旅行を保存したときは、スナップショットも更新する
- 共有 OFF → スナップショットを削除し、`share_file_id` を NULL にする
- 閲覧ページ `/share/:fileId` はログイン不要。`VITE_GOOGLE_API_KEY` で公開ファイルを読み、読み取り専用で表示する（SQLite は読み込まない）
- スナップショットは閲覧専用のコピーなので、壊れても本体には影響しない

### スナップショットに含めない項目

- **予約番号（`booking_ref`）は常に除外する**。予約番号と姓があれば、他人でも航空券などの予約を変更・キャンセルできることが多く、リンクが転送・漏洩したときの実害が大きいため
- **メモ（`note`）は既定で除外する**。共有を ON にするときに「メモも共有する」を選べるようにする

## 7. 削除・変更する機能

| 対象 | 対応 |
|---|---|
| `AuthView`（メール/パスワード） | 「Google でログイン」ボタンだけにする |
| `ResetPasswordView`, `EmailChangeModal`, `PasswordField`, パスワード関連のバリデーター | 削除（`ResetPasswordView` と、Supabase 版ストアのテストは削除済み。`PasswordField` と `validators/password.ts` は残っている） |
| `JoinTripModal`, `JoinTripForm`, `TripMembers`, `stores/members`, `api/members` | 削除（フェーズ1で実施済み） |
| プロフィール（`profile` テーブル、表示名、アイコン） | 削除済み。言語設定は `localStorage` に保存する |
| `SettingsView` | パスワードとメールの変更を Google ログインへの移行時に削除する |
| `server/`（Hono、Supabase のルート）、`api/hono.ts`、`shared/` のワークスペース | 削除（構成変更で実施済み。`shared/` は `src/shared/` に移動） |
| `@supabase/supabase-js` | 削除（フロントのログインで使っているため、フェーズ2の後） |
| `supabase/`（マイグレーション、設定） | `docs/archive/supabase/` に移動済み。データ移行の方針が決まったら扱いを決める |
| Vercel の `SUPABASE_*`, `VITE_SUPABASE_*`, `VITE_API_URL` | 削除 |
| `ARCHITECTURE.md`, `docs/ARCHITECTURE.md`, `docs/SUPABASE_SETUP.md`, 旧デプロイ手順書 | 削除済み。v2 の設計は README の Architecture と ADR に書く |

## 8. 作業の順番

各フェーズをブランチに分け、v2 に PR で入れる。動作確認は Preview デプロイ（GitHub Actions から手動実行、ブランチは任意）で行う。

| # | フェーズ | 内容 | 完了の条件 |
|---|---|---|---|
| 1 | ローカル SQLite 化 | SQLite WASM、スキーマ、マイグレーション、`repositories/` の SQLite 版。メンバー・招待機能の削除（ローカルの旅行 ID ではサーバー側のメンバー機能が動かないため、フェーズ4から前倒し）。ログインは Supabase のまま残し、データは端末内だけに保存する | 旅行と予定の作成・編集・削除が、再読み込みしても残る |
| 2 | Google ログイン | Vercel Functions の OAuth ルート、Cookie セッション、ログイン画面、ルーターのガード | ログインとログアウトができ、アクセストークンを取得できる |
| 3 | Drive 同期 | `StorageAdapter`、`GoogleDriveAdapter`、起動時・保存時の同期、衝突の検知、破損時の復元 | 2台の端末（またはブラウザ）で、セクション5の動きを確認できる |
| 4 | Supabase の撤去 | セクション7の削除、依存パッケージ・環境変数の整理、ドキュメントの更新 | Supabase なしで本番が動く |
| 5 | 閲覧リンク | スナップショットの作成・更新・削除、`/share/:fileId` ページ | ログインしていないブラウザで閲覧できる |
| 6 | Dropbox | `DropboxAdapter`、Dropbox の OAuth、ログイン画面でのプロバイダ選択 | Dropbox でもフェーズ3と5が動く |

- フェーズ1〜4の間は、本番（main）は今の Supabase 版のまま動かし続ける
- **フェーズ5まで完了したら v2 を main に入れてリリースする**（Google Drive のみ）。Dropbox（フェーズ6）はリリース後に追加する

## 8.1 リリース前チェックリスト

旧 `PRODUCTION_DEPLOY_CHECKLIST.md` から、v2 でも有効な項目を引き継いだもの。

- [ ] オフライン・タイムアウト時に、ユーザーにわかるメッセージを出す。通信が戻れば再読み込みせずに続けられる
- [ ] 回線を絞った状態（DevTools の throttling）で、起動と同期を確認する
- [ ] エラーメッセージをすべて翻訳する（リポジトリの `ApiError` のメッセージ、ストアの既定メッセージなど）。SQLite などの内部エラーをそのまま表示しない（`TripView.onEditTrip`、`HomeView.createTrip` を含む）
- [ ] Vercel のログを確認できるようにし、問題があれば直前のデプロイに戻す手順（Instant Rollback）を確認しておく
- [ ] Google の OAuth 同意画面を「本番」にする（「テスト」のままだとリフレッシュトークンが7日で失効する）
- [ ] プライバシーポリシーのページを用意する（セクション9）
- [ ] README にスクリーンショット、公開 URL、Architecture を載せる

## 9. データ保護・規約

法的助言ではなく、2026-10-31 時点の整理。

- **自分だけで使う間**：GDPR の家庭内活動の例外（第2条2項(c)）に当たり、ほぼ対象外
- **他の人にも公開する場合**：旅行データとメールアドレスをサーバー側に保存しないので、Supabase 版よりリスクは小さい。ただし次が必要になる
  - プライバシーポリシー（Google の OAuth 同意画面を本番にするときにも URL が必要）
  - データ削除方法の案内（Drive の設定 →「アプリの管理」から隠しデータを削除できる）
- **Cookie**：ログイン維持用の Cookie は必要不可欠な Cookie に当たり、同意バナーは不要（CNIL の考え方）。アクセス解析を入れる場合は同意が必要
- **Google API Services User Data Policy（Limited Use）**：取得したデータをアプリの機能以外に使わない

## 10. 未決定事項

1. **今の Supabase のデータを移すか**：移すなら、Supabase から書き出して SQLite に取り込む一回きりのスクリプトをフェーズ4の前に作る
2. **データの全削除機能**：設定画面に「Drive 上のデータを含めてすべて削除」を置くか
3. **Google のスコープ区分と審査の要否**（セクション3）
4. **利用中のセッション延長**：今はログインから 7日で切れ、使っていても延長しない。実際に使って様子を見てから、`/api/auth/token` が成功するたびに期限を延ばすか決める。延ばす場合も上限は残し、Cookie の中にログイン時刻（または上限の期限）を別に持つ（#27）
5. **セッションの管理を Redis で行うか**：今はサーバー側にセッション DB を持たない（個人情報を持たないため）。そのため特定のセッションだけを無効にできず、無効にする手段は Google での revoke だけ。後のバージョンで、Redis（Upstash など）に「ランダムなセッション ID → 期限、無効かどうか」だけを保存する形を検討する。名前、メールアドレス、Google の ID、IP、端末の情報は保存しない。切り替え時、Redis に記録のない古い Cookie は無効にするか、期限まで受け付けるかを決める
6. **ログインなしで試せるデモモード**：同期なしで、端末内の SQLite だけに保存するモード。サーバー側の仕組みは不要で、Google アカウントなしでも試せる（旧 `DEMO_SESSION_TODO.md` の案を v2 向けに置き換えたもの）。入れる場合、画面上で「データはこのブラウザにだけ保存されます」と明示する

決定済み: 閲覧リンクから予約番号を常に除外し、メモは既定で除外する（セクション6）
