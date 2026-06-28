---
name: Clerk auth wiring
description: How Clerk is wired in this project — frontend ClerkProvider setup, backend middleware, and protected route pattern
---

## Frontend (redeemers-forge)
- `publishableKeyFromHost(hostname, VITE_CLERK_PUBLISHABLE_KEY)` resolves the key, supporting the Replit proxy
- `VITE_CLERK_PROXY_URL` env var passed as `proxyUrl` to `<ClerkProvider>` — empty in dev, set by Clerk skill in prod
- Custom `/sign-in` and `/sign-up` routes using `routing="path"` with full path props
- `routerPush`/`routerReplace` delegate to wouter's `setLocation` with base-path stripping
- Dashboard route uses `<Show when="signed-in" fallback={<SignInPage />}>` to gate access
- `@layer theme, base, clerk, components, utilities` declared in index.css before tailwind import

## Backend (api-server)
- `clerkMiddleware` from `@clerk/express` applied in `app.ts` before routes
- `publishableKeyFromHost` resolves the key per-request to support the Clerk proxy path
- `requireAuth` middleware in `src/middlewares/requireAuth.ts` — checks `getAuth(req).userId`, returns 401 if missing
- All user-specific routes use `getAuth(req)?.userId` (nullable) or `requireAuth` then `getAuth(req).userId!`
- No more `x-user-id` / `x-user-name` / `x-user-email` / `x-user-avatar` header auth anywhere

**Why:** Header-based auth was a placeholder; Clerk tokens are verified server-side via the middleware and are tamper-proof.
