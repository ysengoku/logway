# 個人クラウド移行計画（Supabase → SQLite + Google Drive）

作成日: 2026-10-31
状態: 方針合意済み・実装前

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
2. `/api/auth/callback` → 認可コードをトークンと交換する。リフレッシュトークンは**暗号化して httpOnly Cookie** に保存する（サーバー側にセッション DB は持たない）
3. `/api/auth/token` → Cookie のリフレッシュトークンから、短命のアクセストークンを発行してブラウザに返す
4. ブラウザはそのアクセストークンで **Drive API を直接**呼ぶ
5. `/api/auth/logout` → Cookie を削除し、トークンを失効させる

### スコープ

- `openid email profile`：ログイン、表示用のメールアドレス
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
| `SESSION_SECRET` | Cookie の暗号化キー |
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
4. 違っていたら（別の端末で更新されていたら）、**上書きしない**。最新版を読み込み直し、「別の端末で更新されていたため、最新の状態を読み込みました。直前の変更は保存されていません」と表示する

> Drive API には条件付き更新（If-Match）がないため、確認とアップロードの間にわずかな隙がある。1人利用ではまず起きないので許容する。

### オフライン

- オフライン中もローカルで編集できる（`dirty` のまま）
- オンラインに戻ったら、上の「変更したとき」の3番から再開する

### OPFS が使えない環境

- Firefox のプライベートウィンドウや、サイトデータをブロックしている設定などでは OPFS が使えない。その場合は、メモリ上の SQLite で動かす
- 同期は同じように動く（起動時に毎回 Drive からダウンロードし、変更はアップロードする）ので、データは Drive に保存される
- ユーザーには何も表示しない。端末に保存していることはユーザーが意識しない部分なので、表示しても混乱させるだけになる

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
| `ResetPasswordView`, `EmailChangeModal`, `PasswordField`, パスワード関連のバリデーター | 削除 |
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
4. **ログインなしで試せるデモモード**：同期なしで、端末内の SQLite だけに保存するモード。サーバー側の仕組みは不要で、Google アカウントなしでも試せる（旧 `DEMO_SESSION_TODO.md` の案を v2 向けに置き換えたもの）。入れる場合、画面上で「データはこのブラウザにだけ保存されます」と明示する

決定済み: 閲覧リンクから予約番号を常に除外し、メモは既定で除外する（セクション6）
