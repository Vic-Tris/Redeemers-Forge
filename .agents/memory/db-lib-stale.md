---
name: DB lib stale declarations
description: lib/db is a composite TS lib; its .d.ts declarations go stale and cause spurious "no exported member" errors
---

## The rule
Always run `pnpm run typecheck:libs` (which runs `tsc --build`) before running a leaf-artifact typecheck (e.g. `pnpm --filter @workspace/api-server run typecheck`).

**Why:** `lib/db` and other composite libs emit `.d.ts` declarations tracked by `.tsbuildinfo`. After a fresh clone or after changing a lib, the declarations may be missing or stale. Leaf artifacts depend on those `.d.ts` files for type resolution. Missing exports (`error TS2305: Module '@workspace/db' has no exported member 'postsTable'`) are almost always stale declarations, not a missing export.

**How to apply:** When you see TS2305 "has no exported member" from a `@workspace/*` lib, run `pnpm run typecheck:libs` first. Only investigate the schema/export if errors persist after that.
