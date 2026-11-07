# logway

> [!WARNING]
> **LogWay v2 is under active development.**
> v2 is a major rewrite with changes to both the app and the tech stack. Features described below may be incomplete or still changing. Until v2 is released, the production site shows only a maintenance page. The previous version (v1) is kept at the [`v1.0.0`](https://github.com/ysengoku/logway/tree/v1.0.0) tag.

<!-- <img src="" width="100%" /> -->

<div align="center">
  <img src="https://img.shields.io/github/commit-activity/t/ysengoku/logway?style=flat-square&color=9D9E0A" />
  <img src="https://img.shields.io/github/created-at/ysengoku/logway?style=flat-square&color=9D9E0A" />
  <img src="https://img.shields.io/github/issues/ysengoku/logway?style=flat-square&color=9D9E0A" />
</div>

## Table of Contents

<details>
<summary>Click to Show / Hide</summary>

- [About](#about)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
- [Development](#development)
  - [Workflow](#workflow)
  - [Linting & Formatting](#linting--formatting)
  - [Testing](#testing)
- [Versioning](#versioning)
- [Notes](#notes)
- [Resources](#resources)
- [Authors](#authors)
- [License](#license)

</details>

## About

LogWay is a web app for managing travel itineraries. Each trip brings together flights, trains, buses, accommodation, restaurants, activities and useful links, all organized in a calendar view.

LogWay has no backend database. Instead, it stores data in a SQLite database directly in the browser and syncs it with the user's own cloud storage (currently Google Drive). This keeps users in control of their data, which remains in their own cloud account.

## Features

- Sign-in with Google ![Not implemented](https://img.shields.io/badge/not_implemented-lightgrey)
- Trips: create, edit and delete; the home page splits them into upcoming and past trips
- Events: flight, transport (train, bus, ferry, car, other), hotel, restaurant, activity and link
- Local date, time and time zone for both departure and arrival of flights and transport
- Calendar view of each trip with a per-day list of events
- Sync to a hidden app folder in the user's cloud storage; changes made on another device are never silently overwritten ![Not implemented](https://img.shields.io/badge/not_implemented-lightgrey)
- Read-only share links for travel companions (booking references are never shared; notes only when chosen) ![Not implemented](https://img.shields.io/badge/not_implemented-lightgrey)
- Interface available in English and French, switchable from the header

## Architecture

```mermaid
flowchart LR
  subgraph Browser["User's browser"]
    UI["Vue views<br/>Pinia stores"]
    Repo["Repositories"]
    Lock["Tab lock<br/>(Web Locks)"]
    subgraph Worker["Web Worker"]
      SQLite["SQLite WASM"]
    end
    OPFS[("OPFS<br/>local working copy")]
    Sync["Sync module<br/>(StorageAdapter)"]

    UI --> Repo --> SQLite --> OPFS
    Lock -. one tab only .-> SQLite
    Sync <--> OPFS
  end

  subgraph Vercel["Vercel Functions"]
    Auth["/api/auth/*<br/>login · callback · token · logout"]
  end

  subgraph Google["Google"]
    OAuth["Google OAuth"]
    subgraph Drive["User's Google Drive"]
      AppData[("appDataFolder<br/>logway.sqlite")]
      Snapshot[("Share snapshot<br/>(JSON, link-only read)")]
    end
  end

  Companion["Companion's browser<br/>/share/:fileId"]

  UI -- sign in --> Auth
  Auth <--> OAuth
  Auth -- short-lived access token --> Sync
  Sync <-- download / upload .db --> AppData
  Sync -- create / update / delete --> Snapshot
  Companion -- read-only, API key --> Snapshot
```

The server stores no trip data. Vercel Functions only handle Google OAuth and keep the refresh token in an encrypted httpOnly cookie. The browser calls the Drive API directly with a short-lived access token.

## Project Structure

```
logway/
├─ app/                    # Vercel root directory
│  ├─ api/                 # Vercel functions
│  │  ├─ auth/
│  │  └─ _lib/
│  ├─ src/
│  │  ├─ db/               # SQLite in a Web Worker, migrations, tab lock
│  │  ├─ repositories/     # Data access for trips and events
│  │  ├─ stores/           # Pinia stores
│  │  ├─ views/            # Route-level pages
│  │  ├─ components/       # UI components (forms, modals, event cards, header)
│  │  ├─ shared/types/     # Shared TypeScript types
│  │  ├─ constants/        # Event types, languages, regex
│  │  ├─ lib/              # Font Awesome icons, initial locale
│  │  ├─ locales/          # en, fr
│  │  ├─ router/
│  │  ├─ validators/
│  │  ├─ utils/
│  │  └─ assets/styles/
│  ├─ __tests__/unit/      # Vitest unit tests
│  ├─ public/
│  └─ package.json, vite.config.ts, vercel.json, tsconfig*.json, .env.example
├─ docs/                   # Migration plan, database notes, archived Supabase migrations
├─ .github/workflows/      # CI and manual preview deploy
└─ .coderabbit.yaml        # CodeRabbit review settings
```

## Tech Stack

<!-- Use utils/TECH_STACK_LIST.md -->

**Languages:**   

<div>   
  <img src="https://img.shields.io/badge/TypeScript-333333?style=for-the-badge&logo=typescript&logoColor=3178C6" />
  <img src="https://img.shields.io/badge/SQL-333333?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/SCSS-333333?style=for-the-badge&logo=sass&logoColor=CC6699" />
</div>
<br />

**Frameworks & Libraries:**   

<div>
  <img src="https://img.shields.io/badge/Vue.js-333333?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" />
  <img src="https://img.shields.io/badge/Vue_Router-333333?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" />
  <img src="https://img.shields.io/badge/Pinia-333333?style=for-the-badge&logo=pinia&logoColor=FFD859" />
  <img src="https://img.shields.io/badge/Vue_I18n-333333?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" />
</div>
<br />

**Database:**   

<div>
  <img src="https://img.shields.io/badge/SQLite_(WebAssembly_+_OPFS)-333333?style=for-the-badge&logo=SQLite&logoColor=white&logoSize=auto" />
</div>
<br />

**Authentication & Cloud Storage:**   

<div>
  <img src="https://img.shields.io/badge/Google_OAuth_2.0-333333?style=for-the-badge&logo=google&logoColor=4285F4" />
  <img src="https://img.shields.io/badge/Google_Drive_API-333333?style=for-the-badge&logo=googledrive&logoColor=4285F4" />
  <!-- <img src="https://img.shields.io/badge/Dropbox_API-333333?style=for-the-badge&logo=dropbox&logoColor=0061FF" /> -->
</div>
<br />

**Tools:**   
<div>
  <img src="https://img.shields.io/badge/Vite-333333?style=for-the-badge&logo=vite&logoColor=646CFF"/>
  <img src="https://img.shields.io/badge/Vitest-333333?style=for-the-badge&logo=vitest&logoColor=6E9F18"/>
  <img src="https://img.shields.io/badge/ESLint-333333?style=for-the-badge&logo=eslint&logoColor=4B32C3"/>
  <img src="https://img.shields.io/badge/Oxlint-333333?style=for-the-badge&logo=rust&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prettier-333333?style=for-the-badge&logo=prettier&logoColor=F7B93E"/>
  <img src="https://img.shields.io/badge/pnpm-333333?style=for-the-badge&logo=pnpm&logoColor=F69220"/>
  <img src="https://img.shields.io/badge/GitHub_Actions-333333?style=for-the-badge&logo=github-actions&logoColor=2088FF" />
</div>
<br />

**Infrastructure:**   
<div>
  <img src="https://img.shields.io/badge/Vercel-333333?style=for-the-badge&logo=vercel&logoColor=white" />
</div>
<br />

**Development Environment:**   
<div>
  <img src="https://img.shields.io/badge/Node.js_26-333333?style=for-the-badge&logo=nodedotjs&logoColor=339933" />
</div>

## Getting Started

### Prerequisites

- Node.js 26
- pnpm 10
- [Vercel CLI](https://vercel.com/docs/cli) (runs the OAuth functions locally)
- A Google Cloud OAuth client (web application) with the Google Drive API enabled

### Installation

```sh
git clone https://github.com/ysengoku/logway.git
cd logway/app
pnpm install
```

Copy the example environment file and fill in the values (each variable is described in the file):

```sh
cp .env.example .env
```

On Vercel, set the same variables in the project settings.

### Usage

```sh
vercel dev        # app + OAuth functions
pnpm dev          # app only, without sign-in
pnpm build        # type-check and production build
```

## Development

### Workflow

- Work happens on feature branches and is merged into `v2` through pull requests, which CodeRabbit reviews automatically.
- `main` is the default branch and is deployed to production by Vercel. Until v2 is released, production runs in maintenance mode, and `v2` will be merged into `main` again for the release.
- Preview deployments are started manually from GitHub Actions (*Run workflow*), for any branch.
- CI (lint, type check, unit tests, build) runs on pushes to `main` and `v2`, and can also be started manually.

### Linting & Formatting

Oxlint runs first and ESLint covers the rest; `eslint-plugin-oxlint` turns off the ESLint rules that Oxlint already checks.

```sh
pnpm lint         # fix what can be fixed
pnpm lint:ci      # check only (used in CI)
pnpm format       # Prettier
```

### Testing

Unit tests use Vitest and live in `app/__tests__/unit/`. Repository and migration tests run against a real in-memory SQLite database (the same WebAssembly build as the app), not mocks.

```sh
pnpm test:unit
pnpm exec vitest run __tests__/unit/db/migrate.test.ts   # single file
```

## Versioning

![Latest Release](https://img.shields.io/github/v/release/ysengoku/logway?style=flat)

#### v2.0.0 ![In development](https://img.shields.io/badge/In_development-lightgrey)

- Trip data stored in SQLite in the browser and synced to the user's own Google Drive, with no backend database
- Single Vue app deployed on Vercel, with Vercel Functions for Google OAuth
- Collaborative editing from v1 is removed; trips are shared with travel companions through read-only links only

#### v1.0.0

- Vue frontend deployed on Vercel
- Hono API server deployed on Render
- Supabase for the database and authentication
- Collaborative trips: other users join with an invite code and edit the trip together

## Notes

- Only one browser tab can open LogWay at a time. The local database (OPFS, `opfs-sahpool` VFS) supports a single connection, so later tabs show a message instead of the app.
- LogWay requires an internet connection and browser storage (OPFS). If either is unavailable, the app shows an error screen instead of letting users make changes that can't be saved.
- Share links are public to anyone holding the URL; turning sharing off deletes the snapshot.
- Setting `VITE_MAINTENANCE_MODE=true` replaces the whole app with a maintenance page, without opening the local database. The variable is read at build time, so redeploy after changing it.

## Resources

- [SQLite WebAssembly](https://sqlite.org/wasm/doc/trunk/index.md)
- [Origin Private File System (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)
- [Web Locks API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)
- [Google Drive API: Store application-specific data](https://developers.google.com/workspace/drive/api/guides/appdata)
- [Vercel Functions](https://vercel.com/docs/functions)

## Authors

- [ysengoku](https://github.com/ysengoku)

## License

This project is licensed under the [MIT License](LICENSE).
