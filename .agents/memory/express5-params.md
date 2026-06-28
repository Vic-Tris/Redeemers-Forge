---
name: Express 5 params/headers casting
description: Express 5 types req.params[*] and req.headers[*] as string | string[]; must cast to String() before passing to parseInt or Drizzle eq()
---

## The rule
Always cast `req.params.*` and `req.headers['x-*']` with `String(...)` before passing to `parseInt()` or Drizzle's `eq()`.

```ts
// Wrong — TS2345 in Express 5
const id = parseInt(req.params.id);
eq(table.col, req.params.id)

// Correct
const id = parseInt(String(req.params.id));
eq(table.col, String(req.params.id))
```

**Why:** Express 5's TypeScript types widen params/headers to `string | string[]` for correctness. This causes TS2345 when passed to APIs expecting `string`.
