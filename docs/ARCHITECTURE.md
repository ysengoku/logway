# Application Architecture Overview

## Purpose
This document provides an overview of the application architecture, including frontend, backend (API), database, and infrastructure.

## High-Level Components

- **Frontend**: Single Page Application (SPA) built with Vue 3 and Vite, located in the `frontend/` directory. Deployed as static assets to Vercel.
- **API (Backend)**: Hono app (TypeScript) running as Vercel Serverless Functions, located in the `server/` directory. Handles all business logic and API routing.
- **Database & Auth**: Supabase provides managed PostgreSQL and authentication. Accessed securely from the backend.
- **CI/CD**: GitHub Actions (or Vercel built-in CI) for automated testing and deployment.
- **Infrastructure/Hosting**: Vercel for both frontend and backend (serverless functions).

## System Request Flow

1. **User** accesses the application via a browser. The SPA is served from Vercel's CDN.
2. **Frontend** makes API requests (e.g., `/api/hono`) to Vercel's serverless backend.
3. **Vercel** invokes the serverless handler (`api/hono.ts`), which converts the request and passes it to the Hono app.
4. **Hono app** processes the request, applies business logic, and interacts with Supabase as needed.
5. **Supabase** handles database queries and authentication.
6. **Response** flows back through the Hono app and Vercel to the frontend, updating the UI.

## Key Points

- The system is fully serverless and stateless; each API request is handled independently.
- All sensitive credentials (e.g., Supabase service role key) are managed as environment variables and never exposed to the frontend.
- Only the public Supabase anon key is used in the frontend for client-side SDK access.
- Local development is supported via local servers and environment variable guards.
- CI/CD ensures code quality and safe deployments.


## Diagram (Mermaid)

```mermaid
flowchart TD
	 A[User (Browser)]
	 B[Vercel CDN (Static SPA)]
	 C[Frontend (Vue 3, Vite)]
	 D[Vercel API Gateway]
	 E[Serverless Handler (api/hono.ts)]
	 F[Hono App (Business Logic)]
	 G[Supabase (DB & Auth)]

	 A --> B
	 B --> C
	 C --> D
	 D --> E
	 E --> F
	 F --> G
	 G -- Response --> F
	 F -- Response --> E
	 E -- Response --> D
	 D -- Response --> C
	 C -- UI Update --> A
```

## Notes
- The architecture enables easy scaling, zero server maintenance, and fast global delivery.
- For local development, the backend can be run with a local server (`serve()`), guarded by environment variables.
- The system is designed to minimize risk of secret leakage and maximize maintainability.
