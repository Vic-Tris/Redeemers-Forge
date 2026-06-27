# The Redeemer's Forge

A full-stack premium Christian content platform — stories, devotionals, videos, books, community, premium subscriptions, and an admin panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/redeemers-forge run dev` — run the React frontend (proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind v4 + shadcn/ui, wouter routing, TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (tables: users, posts, videos, books, categories, comments, likes, bookmarks, subscriptions, notifications)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts (~30 endpoints)
- `lib/db/src/schema/index.ts` — database schema (Drizzle ORM)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — generated Zod schemas (do not edit)
- `artifacts/api-server/src/routes/` — backend route handlers
- `artifacts/redeemers-forge/src/pages/` — React pages
- `artifacts/redeemers-forge/src/components/` — shared UI components
- `artifacts/redeemers-forge/src/index.css` — design tokens (deep navy + gold theme)

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed hooks + Zod schemas; never hand-write fetch calls
- Auth is header-based (`x-user-id`, `x-user-name`, `x-user-email`, `x-user-avatar`) — Clerk integration not yet wired
- `PostList` API response is `{ posts: Post[], total: number }` (not a plain array); `Video[]` and `Book[]` are plain arrays
- Subscription checkout returns a placeholder URL until Stripe is connected; plans are hardcoded (monthly $9.99, yearly $79.99)
- Featured/trending post sub-routes must be registered BEFORE `/:id` in Express to avoid path conflicts

## Product

- **Home** — hero featured post + quick links to devotionals, videos, community
- **Stories** — browsable faith stories and testimonials with cover images
- **Story Reader** — full article view with like/bookmark actions
- **Devotionals** — daily devotional posts filtered by type
- **Videos** — sermon & teaching video library
- **Books** — Christian book library (free + premium)
- **Search** — full-text search across posts, videos, books
- **Community** — discussion feed + premium community CTA
- **Premium** — subscription plans ($9.99/mo, $79.99/yr) with feature comparison
- **Dashboard** — user profile, subscription status, saved bookmarks
- **Admin** — platform analytics, top content, recent posts/videos/books

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT use `page`/`offset` params interchangeably: `ListPostsParams` uses `limit` + `offset` (not `page`)
- `PostList` is `{ posts: Post[], total: number }` — access items via `.posts` not directly
- Orval generates `UseQueryOptions` with required `queryKey`; avoid passing bare `{ enabled }` — either omit options or import the queryKey helper
- `useGetGlobalAnalytics` (not `useGetAnalytics`) for the admin analytics endpoint
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change before touching frontend code

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
