# Next.js 15.5.18 Upgrade - Current Status

## Goal
Update `@neshca/cache-handler` package to be compatible with Next.js 15.5.18.

## Progress

### Completed
- [x] Updated `internal/next-common/package.json`: Next.js `15.5.18`
- [x] Updated `apps/cache-testing/package.json`: Next.js `15.5.18`
- [x] Updated `packages/cache-handler/package.json`: peer dep `"next": ">= 15.0.0 < 16"`
- [x] Fixed `CachedRouteKind` const enum (use string constants)
- [x] Fixed `static-generation-async-storage` → `work-async-storage`
- [x] Fixed `fetchCacheKey` → `generateCacheKey`
- [x] Fixed `incrementalCache.get()` kind/isFallback params
- [x] Fixed LRU cache `calculateObjectSize` enum values
- [x] Fixed `register-initial-cache.ts` kind values

### In Progress - Next.js 15.5.18 API Changes

#### Fixed
- [x] `softTags` property - only on `GetIncrementalFetchCacheContext` (kind: FETCH), not on union type
  - File: `packages/cache-handler/src/cache-handler.ts:843`
  - Fix: Used `'softTags' in ctx` type guard

- [x] `revalidate` and `tags` removed from set context types
  - File: `packages/cache-handler/src/cache-handler.ts:894`
  - Fix: Extract from `ctx.revalidate` (15.1.6) or `ctx.cacheControl.revalidate` (15.5.18)

#### Remaining Issues
- [ ] Type conflict between Next.js 15.1.6 and 15.5.18 in `nesh-cache.ts`
  - Error: `IncrementalCacheEntry` type incompatible between versions
  - File: `packages/cache-handler/src/functions/nesh-cache.ts:290,333`
  - Cause: `@repo/next-common` imports types from 15.1.6 but cache-handler uses 15.5.18
  - The `IncrementalCacheEntry` type changed:
    - 15.1.6: Single type with `revalidateAfter`, `curRevalidate`, `isFallback`
    - 15.5.18: Split into `IncrementalResponseCacheEntry` and `IncrementalFetchCacheEntry`
  - The `CachedRouteKind` const enum values are incompatible between versions

#### Next.js 15.5.18 API Changes (vs 15.1.6)
1. `GetIncrementalFetchCacheContext` has `softTags`, `GetIncrementalResponseCacheContext` doesn't
2. `SetIncrementalFetchCacheContext` and `SetIncrementalResponseCacheContext`:
   - No longer have `revalidate` property
   - Response context has `cacheControl: { revalidate, expire }` instead
   - Fetch context has `tags` on the value, not context
3. `IncrementalCacheEntry` split into two types:
   - `IncrementalResponseCacheEntry` (for pages, routes, etc.)
   - `IncrementalFetchCacheEntry` (for fetch cache)
4. `IncrementalCacheValue` type unchanged but const enum incompatible

## Key Files
- `packages/cache-handler/src/cache-handler.ts` - Main cache handler (lines 843, 894 fixed)
- `packages/cache-handler/src/functions/nesh-cache.ts` - Has remaining type conflicts (lines 290, 333)
- `internal/next-common/src/next-common.ts` - Shared type definitions
- `internal/next-common/package.json` - Next.js version dependency

## Cache Context Types (15.5.18)
```typescript
interface GetIncrementalFetchCacheContext {
  kind: IncrementalCacheKind.FETCH;
  revalidate?: Revalidate;
  fetchUrl?: string;
  fetchIdx?: number;
  tags?: string[];
  softTags?: string[];
}

interface GetIncrementalResponseCacheContext {
  kind: Exclude<IncrementalCacheKind, IncrementalCacheKind.FETCH>;
  isRoutePPREnabled?: boolean;
  isFallback: boolean;
}

interface SetIncrementalFetchCacheContext {
  fetchCache: true;
  fetchUrl?: string;
  fetchIdx?: number;
  tags?: string[];
  isImplicitBuildTimeCache?: boolean;
}

interface SetIncrementalResponseCacheContext {
  fetchCache?: false;
  cacheControl?: CacheControl;
  isRoutePPREnabled?: boolean;
  isFallback?: boolean;
}

interface CacheControl {
  revalidate: Revalidate;
  expire: number | undefined;
}
```
