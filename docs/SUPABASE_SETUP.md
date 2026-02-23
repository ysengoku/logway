# Supabase Setup

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed via pnpm in `server/`
- A Supabase account at [supabase.com](https://supabase.com)

---

## 1. Create a Supabase Project

1. Log in to [supabase.com](https://supabase.com)
2. Click **New project**
3. Fill in the details:
   - **Name**: `project_name`
   - **Database Password**: set a strong password and save it somewhere safe
   - **Region**: choose the one closest to you
4. Click **Create new project** and wait ~1–2 minutes

---

## 2. Get Your API Keys

Go to **Settings → API** and note down:

- `Project URL`
- `Publishable API Key`

Add them to `server/.env`:

```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_api_key
PORT=3000
```

---


Supabase setup · MD
Copier

# Supabase Setup

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed via pnpm in `server/`
- A Supabase account at [supabase.com](https://supabase.com)

---

## 1. Create a Supabase Project

1. Log in to [supabase.com](https://supabase.com)
2. Click **New project**
3. Fill in the details:
   - **Name**: `logway`
   - **Database Password**: set a strong password and save it somewhere safe
   - **Region**: choose the one closest to you
4. Click **Create new project** and wait ~1–2 minutes

---

## 2. Get Your API Keys

Go to **Settings → API** and note down:

- `Project URL`
- `anon public` key

Add them to `server/.env`:

```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
PORT=3000
```

---

## 3. Install the Supabase CLI

The CLI is managed as a dev dependency inside `server/`:

```bash
cd server
pnpm add -D supabase
pnpm approve-builds
# Select "supabase" and approve with y
```

Add the following script to `logway/package.json` to avoid typing the full binary path every time:

```json
"scripts": {
  "supabase": "./server/node_modules/.bin/supabase"
}
```

You can then run any Supabase CLI command from the project root:

```bash
# Equivalent to: ./server/node_modules/.bin/supabase 
pnpm supabase --version
pnpm supabase login
pnpm supabase db push
```

---

## 4. Log In to Supabase CLI

```bash
pnpm supabase login
```

A browser window will open. Approve the token and return to the terminal.

---

## 5. Link to Your Supabase Project

Find your **Reference ID** in **Settings → General** on the Supabase dashboard.

```bash
pnpm supabase link --project-ref YOUR_REFERENCE_ID
# Enter your database password when prompted
```

---

## 6. Creating New Migrations

Whenever you need to change the database schema, create a new migration file instead of editing existing ones:

```bash
pnpm supabase migration new your_migration_name
```

Edit the generated file in `supabase/migrations/`, then push:

```bash
pnpm supabase db push
```

---

## 7. Run Migrations

Apply all migrations to your remote Supabase database:

```bash
pnpm supabase db push
```

This will create the `events` table along with the `updated_at` auto-update trigger.

---

## Database Schema

The `events` table uses a **single-table design** to store all event types (`flight`, `transport`, `hotel`, `restaurant`, `activity`, `link`). Columns that are not relevant to a given event type will be `NULL`.

See `supabase/migrations/` for the full schema definition.
