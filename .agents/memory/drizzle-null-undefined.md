---
name: Drizzle null vs undefined
description: Drizzle rejects null for non-nullable DB columns in insert/update; must convert null to undefined
---

## The rule
When mapping Zod-parsed data (which uses `.nullish()` → `T | null | undefined`) to Drizzle insert/update values, non-nullable DB columns reject `null`. Convert with `?? undefined` or conditional spread.

```ts
// Wrong — TS2769 for non-nullable column
.values({ duration: parsed.data.duration })  // duration: string | null | undefined

// Correct
const { duration, ...rest } = parsed.data;
.values({ ...rest, duration: duration ?? undefined })

// For partial updates, use conditional spread
const updateData = {
  ...(d.title != null ? { title: d.title } : {}),
  ...(d.isPremium != null ? { isPremium: d.isPremium } : {}),
}
```

**Why:** Drizzle's insert type maps non-nullable columns to `T | undefined` (omittable) but not `T | null`. Zod's `.nullish()` produces `T | null | undefined`, so null leaks through.
