# Architecture Overview

## Purpose
This document provides an overview of the backend architecture after migrating from Render to Vercel Serverless. It explains the main components, request flow, and integration points.

## High-Level Components
- **Frontend**: Static assets and SPA, deployed separately (not covered here)
- **API (Backend)**: Hono app running as Vercel Serverless Functions
- **Supabase**: Managed database and authentication

## Request Flow
1. **Client** sends an HTTP request to the Vercel API endpoint (e.g., `/api/hono`).
2. **Vercel** invokes the Serverless handler (`api/hono.ts`).
3. The handler converts the Vercel request to a Fetch API-compatible `Request` object.
4. The handler calls `app.fetch(request)` to delegate routing and business logic to the Hono app.
5. The Hono app processes the request, interacts with Supabase as needed, and returns a response.
6. The handler converts the response to a Vercel-compatible response and sends it back to the client.

## Key Points
- The backend is stateless and runs in a serverless environment (cold start possible).
- All business logic and routing are handled by the Hono app (`server/src/index.ts`).
- Supabase credentials are managed via environment variables and never exposed to the frontend.
- No persistent server process; each request is handled independently by Vercel Functions.

## Diagram

Client → Vercel API Gateway → Serverless Handler (`api/hono.ts`) → Hono App → Supabase

## Notes
- For local development, the Hono app can still be run with a local server (`serve()`), guarded by environment variables.
- Only the public Supabase anon key is ever used in the frontend; service role keys are server-only.
- This architecture enables easy scaling and zero server maintenance.
