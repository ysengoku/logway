# logway

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
- [Notes](#notes)
- [Resources](#resources)
- [AI Usage](#ai-usage)
- [Authors](#authors)
- [License](#license)

</details>

## About

LogWay is a web app for planning trips. Each trip collects its flights, trains and buses, hotels, restaurants, activities and useful links, and lays them out on a calendar.

LogWay has no backend database. Data lives in a SQLite database inside the browser and is synced to the user's own cloud storage (Google Drive only at the moment), so it stays in an account the user controls.

## Features

- Sign-in with Google
- Trips: create, edit and delete; the home page splits them into upcoming and past trips
- Events: flight, transport (train, bus, ferry, car, other), hotel, restaurant, activity and link
- Local date, time and time zone for both departure and arrival of flights and transport
- Calendar view of each trip with a per-day list of events
- Sync to a hidden app folder in the user's cloud storage; changes made on another device are never silently overwritten
- Offline editing, uploaded once the connection is back
- Read-only share links for travel companions (booking references are never shared; notes only when chosen)
- English and French

## Architecture

## Project Structure

```
logway/
├─ app/                    # Vercel root directory
│  ├─ src/
│  │  ├─ db/               # SQLite in a Web Worker, migrations, tab lock
│  │  ├─ sync/             # Cloud storage adapters (Google Drive)
│  │  ├─ repositories/     # Data access for trips and events
│  │  ├─ stores/           # Pinia stores
│  │  ├─ views/            # Route-level pages
│  │  ├─ components/       # UI components
│  │  ├─ shared/           # Types and constants
│  │  ├─ locales/          # en, fr
│  │  └─ ...               # router, validators, utils, assets
│  ├─ api/auth/            # Vercel Functions for OAuth (login, callback, token, logout)
│  ├─ __tests__/unit/      # Vitest unit tests
│  ├─ public/
│  └─ package.json, vite.config.ts, vercel.json, tsconfig*.json
├─ docs/                   # Plans, decision records, archive
└─ .github/workflows/      # CI and manual preview deploy
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
cp .env.example .env.local
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

- `main` is deployed to production by Vercel.
- Preview deployments are started manually from GitHub Actions (*Run workflow*), for any branch.
- Work happens on feature branches and is merged through pull requests.
- CI (lint, type check, unit tests, build) runs on pushes to `main`.

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

## Notes

- Only one browser tab can open LogWay at a time. The local database (OPFS, `opfs-sahpool` VFS) supports a single connection, so later tabs show a message instead of the app.
- Where OPFS is unavailable (e.g. Firefox private windows), the database runs in memory and still syncs to cloud storage.
- Share links are public to anyone holding the URL; turning sharing off deletes the snapshot.

## Resources

- [SQLite WebAssembly](https://sqlite.org/wasm/doc/trunk/index.md)
- [Origin Private File System (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)
- [Web Locks API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API)
- [Google Drive API: Store application-specific data](https://developers.google.com/workspace/drive/api/guides/appdata)
- [Vercel Functions](https://vercel.com/docs/functions)

## AI Usage

## Authors

- [ysengoku](https://github.com/ysengoku)

## License
