# LogWay v2 — Product Requirements

This document describes **what** v2 delivers and **why**, not how it is implemented.

## Summary

LogWay v2 moves trip data out of a hosted database and into the user's own cloud storage. The app keeps a SQLite database in the browser and syncs it as a single file to a hidden folder in the user's Google Drive. The server only handles Google sign-in and stores no trip data and no personal data.

Collaborative editing from v1 is removed. Viewers get read-only share links instead.

## Background

v1 (tag `v1.0.0`) ran on Vue + Hono + Supabase:

- Supabase Auth managed user accounts (email and password sign-in).
- The Supabase database stored every user's trips, events and profiles.
- Other users could join a trip with an invite code and edit it together.

This meant the project operated a database of personal data (travel dates, bookings, email addresses) on behalf of its users, with the security, privacy and compliance duties that come with it. v2 removes that responsibility by design: **data lives on the user's device and in the user's own cloud account**.

## Goals and non-goals

### Goals

1. **Users own their data.** Trip data is stored only on the user's device and in their own Google Drive.
2. **The server holds no user data.** The server keeps only the OAuth client secret. Sessions live in an encrypted cookie on the user's browser.
3. **No silent data loss.** A device with old data never overwrites newer data without asking the user.
4. **Same trip-planning experience as v1** for a single user: trips, events, calendar view, two languages.
5. **Share a trip with viewers** through a read-only link that never exposes booking references.

### Non-goals (v2.0)

- Real-time or simultaneous editing on several devices
- Collaborative editing between users (removed from v1)
- Row-level merging of conflicting changes (except duplicate files, see TS-17)
- Cloud providers other than Google Drive (Dropbox comes after v2.0. Apple and Microsoft are out of scope)
- Protecting data from other people who use the same browser profile. Signing out removes the local database (UI preferences in `localStorage`, such as the language, are kept). If the session expires without signing out, local data stays on the device until the next sign-in, and is replaced if another Google account signs in.

## Users

| Persona | Description | Main needs |
|---|---|---|
| **Planner** | Plans trips, on a laptop or a phone. Has a Google account. | While planning, see what is already scheduled. During the trip, check the plans for the day. Keep the schedule simple, like a calendar app, with only the essential details. Trust that data is not lost or shared. |
| **Viewer** | Travels with the planner, or stays home and wants to know where the planner is (e.g. family). May not have a Google account or LogWay. | See the itinerary without signing in, without being able to change it |

## Product principles

**The server stores nothing.** The server only handles Google sign-in and has no database. Trip data and sessions are kept on the user's side (the browser and the user's Google Drive).
- **Never lose data silently.** When in doubt, stop and ask the user, or keep both versions.
- **Saved means uploaded.** A change counts as saved only after Drive accepts it. The UI says so when it is not.
- **Share the minimum.** Share links leave out anything that could be used to act on a booking.
- **Fail visibly.** When something cannot work (no OPFS, another tab open, offline at startup), show a clear screen instead of a half-working app.

## Scope

| Area | v2.0 | Later | Removed |
|---|---|---|---|
| Sign-in | Google | + Dropbox | Email and password, password reset, email change |
| Storage | Browser SQLite + Google Drive | + Dropbox | Supabase |
| Trips and events | All v1 event types | | |
| Sharing | Read-only link per trip | | Invite codes, trip members, joint editing |
| Profile | Name and picture from Google, language in `localStorage` | | Display name and avatar stored in the database |
| Data control | Delete via Drive settings. In-app "delete all data" (undecided) | | |
| Try without an account | | Demo mode (§13) | |

## User stories

### Sign-in and session

| ID | Persona | Story | Acceptance criteria | Done |
|---|---|---|---|---|
| US-A1 | Planner | I want to sign in with my Google account so that I can start using the app. | The sign-in page shows only "Sign in with Google". After consent, the user lands on the home page. No email address is requested. | ✅ |
| US-A2 | Planner | I want to understand why LogWay asks for Drive access before I agree. | The sign-in page explains the requested permissions in English and French. | [#33](https://github.com/ysengoku/logway/issues/33) |
| US-A3 | Planner | I want a clear message when sign-in fails. | Each known callback error (`access_denied`, `invalid_state`, `missing_scope`, `token_exchange_failed`, `unknown`) shows a translated message. `missing_scope` tells the user to allow Drive access. | [#33](https://github.com/ysengoku/logway/issues/33) |
| US-A4 | Planner | I want to stay signed in while I use the app, so that I am not interrupted while planning. | The session is extended on use, up to 30 days after sign-in, and ends after 7 days without use. If less than one day remains when the app starts or the tab becomes visible, the user is asked to sign in again before starting work. | ✅ |
| US-A5 | Planner | I want to be sent to the sign-in page whenever my session ends, wherever it ends. | When the session ends during a Drive call, the user is redirected to sign-in, not left on a page that needs sign-in. | [#41](https://github.com/ysengoku/logway/issues/41) |
| US-A6 | Planner | I do not want to be signed out because the server had a temporary problem. | A 503 or network error at startup shows a retry state, not the sign-in page. The refresh is retried with backoff. | [#32](https://github.com/ysengoku/logway/issues/32) |
| US-A7 | Planner | I want to sign out. | The session cookie and the local database are deleted. If sign-out fails, the user stays signed in and sees a message. | [#42](https://github.com/ysengoku/logway/issues/42) |

### Trips and events

Carried over from v1. Must keep working on local SQLite.

| ID | Persona | Story | Acceptance criteria | Done |
|---|---|---|---|---|
| US-B1 | Planner | I want to create, edit and delete trips. | Changes remain after reload. Home splits trips into upcoming and past. | ✅ |
| US-B2 | Planner | I want to add flights, transport, hotels, restaurants, activities and links to a trip. | All six event types can be created, edited and deleted. Flights and transport have local date, time and time zone for departure and arrival. | ✅ |
| US-B3 | Planner | I want to see my trip on a calendar with a list of events per day. | | ✅ |
| US-B4 | Planner | I want to use the app in English or French. | Language can be switched from the header and is remembered. All error messages are translated and internal errors are not shown. | ✅ |

### Sync across devices

| ID | Persona | Story | Acceptance criteria | Done |
|---|---|---|---|---|
| US-C1 | Planner | I want my trips saved to my Google Drive automatically. | After a change, the data is uploaded within a few seconds without user action. The file is in Drive's hidden app folder and not visible in "My Drive". |  |
| US-C2 | Planner | I want to see the latest data when I open the app on another device. | On startup and when the tab becomes visible, a newer Drive version replaces local data if there are no local unsynced changes. |  |
| US-C3 | Planner | I want to choose what happens when two devices changed the data. | Upload is blocked when Drive has a newer version. The user chooses "keep cloud" or "keep this device". The dialog shows when the cloud version was modified and says that the other side's changes are lost. |  |
| US-C4 | Planner | I want to know when my changes are not saved to Drive. | When an upload fails, the app shows an "unsynced" state and a retry button. The user can keep working. The upload is retried automatically when the connection comes back. |  |
| US-C5 | Planner | I do not want unsynced changes lost when my session expires. | After re-signing in with the same account, pending local changes are uploaded (or the conflict choice is shown). Signing out on purpose discards them. | [#25](https://github.com/ysengoku/logway/issues/25) |
| US-C6 | Planner | I do not want one Google account's data uploaded to another account. | If the user signs in with a different Google account, the local database is discarded and replaced from that account's Drive. | [#26](https://github.com/ysengoku/logway/issues/26) |
| US-C7 | Planner | I want to be warned before I close the tab with changes that are not saved to Drive. | While there are unsynced changes, closing or reloading the tab shows the browser's leave-page warning. No warning is shown when everything is synced. Mobile browsers that do not support the warning are not covered. | [#43](https://github.com/ysengoku/logway/issues/43) |
| US-C8 | Planner | I want my unsynced changes uploaded when my session ends while I am using the app. | When the session ends, if there are unsynced changes and the access token in memory is still valid, the changes are uploaded before the user is sent to sign-in. | [#25](https://github.com/ysengoku/logway/issues/25) |
| US-C8 | Planner | I want my unsynced changes uploaded when my session ends while I am using the app. | When the session ends, if there are unsynced changes and the access token in memory is still valid, the changes are uploaded before the user is sent to sign-in. | |

### Reliability

| ID | Persona | Story | Acceptance criteria | Done |
|---|---|---|---|---|
| US-D1 | Planner | I want a clear message if my browser cannot store data. | When OPFS is unavailable, the app does not start and lists likely causes (private window, blocked site data, old browser, full storage). | ✅ |
| US-D2 | Planner | I want to know if LogWay is already open in another tab. | Only one tab opens the database. Other tabs show a "open in another tab" message. | ✅ |
| US-D3 | Planner | I want my data recovered if the file gets corrupted. | A downloaded file that fails `integrity_check` is not used. The latest valid Drive revision is restored. |  |
| US-D4 | Planner | I want to retry when I am offline at startup. | The app shows a blocking screen with a retry button. It continues without reload once the connection is back. |  |

### Share with viewers

| ID | Persona | Story | Acceptance criteria | Done |
|---|---|---|---|---|
| US-E1 | Planner | I want to turn on a share link for one trip. | Turning sharing on creates a link. Anyone with the link can view. |  |
| US-E2 | Viewer | I want to view the itinerary without an account. | `/share/:fileId` works in a signed-out browser and is read-only. |  |
| US-E3 | Planner | I want the shared view to stay up to date. | Saving a shared trip updates the shared copy. |  |
| US-E4 | Planner | I want my booking references never shared, and notes shared only if I choose. | `booking_ref` is never in the shared copy. `note` is excluded unless the user chose "share notes" when turning sharing on. |  |
| US-E5 | Planner | I want to stop sharing. | Turning sharing off deletes the shared copy, and the old link stops working. |  |

### Trust and transparency

| ID | Persona | Story | Acceptance criteria | Done |
|---|---|---|---|---|
| US-F1 | Planner | I want to read how my data is handled. | A privacy policy page is reachable without sign-in. | ✅ |
| US-F2| Planner | I want to know how to delete all my data. | The privacy policy explains deletion through Drive settings → Manage apps. | ✅ |

## Technical stories

Work that has no user-facing behavior on its own but is required by the stories above.

| ID | Task | Rationale | Status |
|---|---|---|---|
| TS-01 | Flatten the repo into one `app/` package and drop the Hono server | The server only runs the OAuth functions | ✅ |
| TS-02 | Run `@sqlite.org/sqlite-wasm` in a Web Worker with the `opfs-sahpool` VFS | Trip data is stored in the browser, and it works in Safari without COOP/COEP headers | ✅ |
| TS-03 | Run migrations based on `meta.schema_version` | A database created by an older version can be opened by a newer one | ✅ |
| TS-04 | Keep the existing repository interface for the SQLite repositories | Views and stores do not need to change | ✅ |
| TS-05 | Let only one tab open the database (Web Locks) | Two tabs never write to the OPFS file at the same time | ✅ |
| TS-06 | Vercel Functions for OAuth: login, callback, token, logout (PKCE, state) | The OAuth client secret stays on the server, and the server needs nothing else | ✅ |
| TS-07 | Encrypt the refresh token in an `__Secure-` httpOnly cookie (AES-256-GCM) with 30-day absolute and 7-day idle limits | The refresh token never reaches JavaScript, the server needs no session database, and a stolen cookie can only be used for a limited time | ✅ |
| TS-08 | Check `Origin` on auth POST endpoints | Other sites cannot get a token or sign the user out (CSRF) | ✅ |
| TS-09 | Refresh the access token before it expires, sharing one in-flight request | Drive calls do not fail because the token expired, and parallel calls do not refresh twice | ✅ |
| TS-10 | Toast system for notifications | Errors and sync states are shown to the user in one consistent way | ✅ |
| TS-11 | Self-host fonts and replace Material Icons with Font Awesome | The app makes no third-party requests, and the CSP can stay strict | ✅ |
| TS-12 | Export and import the database file from the worker | The whole database can be uploaded to Drive and replaced from Drive as one file | ✅ |
| TS-13 | Google Drive API client (list, download, create, update) | The browser calls Drive directly, so trip data never passes through the server | ✅ |
| TS-14 | Sync store: startup check, debounced upload, version check before upload | Changes reach Drive without user action, and a newer version on Drive is never overwritten | |
| TS-15 | Track `lastSyncedVersion` and `dirty` locally | The app knows whether Drive changed since the last sync, and whether local changes are waiting to be uploaded | |
| TS-16 | Store the Google account ID (`sub`) in `meta` and return it from `/api/auth/token` | Data of one Google account is never uploaded to another account | [#26](https://github.com/ysengoku/logway/issues/26) |
| TS-17 | Merge duplicate `logway.sqlite` files by row, keep the oldest file, delete the rest after upload succeeds | When two devices create the file at the same time, no data is split between files, and every device picks the same file | |
| TS-18 | Test that every table in `sqlite_master` is covered by the duplicate merge | A table added later is never left out of the merge without notice | |
| TS-19 | Integrity check after download and restore from Drive revisions | A corrupted file is never used, and the data can still be recovered | |
| TS-20 | Share snapshot: JSON file with `drive.file` scope, link-only permission, API-key reader | Viewers can read one trip without signing in, and nothing else in the user's Drive is exposed | |
| TS-21 | CSP and security headers in `vercel.json` (report-only first) | Injected scripts cannot run or send the access token to other sites | [#21](https://github.com/ysengoku/logway/issues/21) |
| TS-22 | Remove leftovers of v1: `PasswordField`, password validator, Supabase steps in CI | No unused v1 code is left to maintain | |
| TS-23 | Lazy-load the SQLite WASM after sign-in | The sign-in page loads quickly, and visitors who do not sign in never download the WASM (about 1 MB) | |
| TS-24 | (After v2.0) `StorageAdapter` interface | Dropbox can be added without changing the sync logic | |

## Non-functional requirements

| Area | Requirement |
|---|---|
| Privacy | The server stores nothing (it has no database). No analytics. |
| Security | Refresh token never reaches JavaScript. Access token is kept in memory only. CSRF protection on auth POST endpoints. CSP before release. |
| Data safety | No upload overwrites a newer Drive version without user choice. Corrupted downloads are never applied. |
| Browsers | Current Chrome, Firefox, Safari (desktop and iOS). No COOP/COEP headers required. |
| Performance | The app is usable on a throttled connection (DevTools "Fast 4G"). The WASM is not loaded before sign-in. |
| Languages | English and French for every user-visible string, including errors. |
| Compliance | Privacy policy in place before the OAuth consent screen goes to production. Google API Services User Data Policy (Limited Use) respected. Only strictly necessary cookies, so no consent banner. |

## Risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Two devices upload at almost the same time (Drive has no `If-Match`) | One upload overwrites the other | Low (single user) | Version check right before upload. Drive revision history allows recovery. Accepted for v2.0. |
| Whole-file sync gets slow as the database grows | Slow startup and saves | Low for personal trip data | Measure file size during testing. Revisit if it grows past a few MB. |
| No server-side session store | A stolen cookie cannot be revoked individually | Low | 30-day absolute limit. The user can revoke LogWay's access from their Google account. |
