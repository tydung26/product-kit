# Code Review: Market Intel Crawler Scripts

> **Scope:** 8 files | ~960 LOC (TS source) + 35 LOC (build config) | Full review
> **Build:** PASS (tsc + esbuild) | **Lint:** PASS | **Tests:** 33/33 PASS
> **Scout findings:** NaN limit bug, deepFind recursion risk, untyped JSON responses, sequential fetch bottleneck, 1.4MB bundle size

## Overall Assessment

**Solid implementation.** Clean architecture with proper separation of concerns: shared types/helpers extracted to `shared-types.ts`, consistent CLI interface across all 4 scripts, good error handling patterns. The esbuild `splitting` config correctly deduplicates cheerio into a shared chunk. SKILL.md integration is well-documented with fallback paths.

One confirmed bug (NaN limit), a few medium-priority improvements, and one file over the 200-line guideline.

## Critical Issues

None.

## High Priority

### 1. BUG: `parseArgs` returns `NaN` limit when non-numeric string passed

**File:** `src/scripts/market-intel/shared-types.ts:48`

When `args[1]` is a non-numeric string (e.g., `"abc"`), `parseInt("abc", 10)` returns `NaN`. `Math.max(NaN, 1)` evaluates to `NaN`, and `Math.min(NaN, 10)` also evaluates to `NaN`. This causes `.slice(0, NaN)` to return an empty array in all scripts, producing zero results with no error message.

**Impact:** Silent data loss. User gets empty results with no explanation.

**Fix:**
```typescript
const parsed = parseInt(args[1] || "5", 10);
const limit = Math.min(Math.max(Number.isNaN(parsed) ? 5 : parsed, 1), 10);
```

### 2. Untyped `res.json()` responses treated as trusted

**File:** `search-app-store.ts:42, 86`

`res.json()` returns `Promise<any>`. The code accesses nested properties (`data?.feed?.entry`, `searchData.results`) without runtime validation. If the API returns an unexpected shape (e.g., an error object, rate limit response), the code may throw an uncaught `TypeError` on property access.

**Impact:** App Store script -- line 86 assigns to typed `searchData` but the cast is implicit. If iTunes returns `{ errorMessage: "..." }` instead of `{ results: [...] }`, the `searchData.results?.length` check on line 95 saves it, but `data?.feed?.entry` on line 43 in `fetchReviews` has no similar guard.

**Fix:** Add a guard before accessing nested properties:
```typescript
const raw = await res.json();
const entries: ITunesReview[] = Array.isArray(raw?.feed?.entry) ? raw.feed.entry : [];
```

This pattern applies to all `res.json()` calls. Not critical since try/catch blocks exist, but defensive.

## Medium Priority

### 3. Sequential fetching in all scrapers creates a performance bottleneck

**Files:** All 4 `search-*.ts` files

Each script fetches individual app/post pages sequentially in a `for` loop. For a limit of 5, this means 5 sequential HTTP requests after the initial search. With a 10s timeout each, worst case is 50s of waiting.

**Impact:** Slow execution, especially for Google Play and Product Hunt which fetch detail pages.

**Fix:** Use `Promise.allSettled` for parallel fetching with the existing `safeFetch` timeout as guard:
```typescript
const fetchPromises = appUrls.map(async (url) => {
  const res = await safeFetch(url);
  if (!res.ok) { errors.push(`Failed: ${url}: ${res.status}`); return null; }
  const html = await res.text();
  return extractAppDetails(cheerio.load(html), url);
});
const settled = await Promise.allSettled(fetchPromises);
const results = settled
  .filter((r): r is PromisedFulfilledResult<CompetitorEntry | null> => r.status === "fulfilled")
  .map(r => r.value)
  .filter(Boolean) as CompetitorEntry[];
```

### 4. `deepFind` has no cycle/depth protection

**File:** `search-product-hunt.ts:64-75`

The recursive `deepFind` function traverses arbitrary JSON without a max depth. `__NEXT_DATA__` in Next.js apps can be deeply nested (10+ levels). While `JSON.parse` output won't have circular references, the stack depth is unbounded.

Similarly, `findPosts` (line 192-205) recursively walks the same `__NEXT_DATA__` object.

**Impact:** Unlikely to crash in practice since `__NEXT_DATA__` objects are finite, but adds unnecessary risk. Could cause stack overflow if a site embeds abnormally large JSON.

**Fix:** Add a depth limit parameter:
```typescript
function deepFind(obj: unknown, predicate: (...) => boolean, maxDepth = 15): unknown | null {
  if (maxDepth <= 0 || !obj || typeof obj !== "object") return null;
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (predicate(key, value)) return value;
    const found = deepFind(value, predicate, maxDepth - 1);
    if (found) return found;
  }
  return null;
}
```

### 5. File size: `search-product-hunt.ts` (258 lines) and `search-yc-launch.ts` (240 lines) exceed 200-line guideline

Per project rules, code files over 200 lines should be modularized.

**Recommendation:** Extract common patterns into shared helpers:
- `extractPostUrls` / `extractLaunchUrls` share the same "find links by selector, deduplicate, normalize" pattern -- could be a shared `extractUrlsBySelector(selector, baseUrl)` in `shared-types.ts`
- `extractComments` in product-hunt and the similar review extraction in yc-launch are near-identical -- could be a shared `extractReviewSnippets(selector)` helper

This would bring both files under 200 lines while improving DRY.

### 6. Bundled `scripts/` directory not in `.gitignore` but contains generated files

The `skills/market-intel/scripts/` directory contains esbuild output (generated, not hand-written). The `build-scripts.mjs` already does `rmSync(outDir, ...)` before each build, and chunk hashes change between builds.

Currently these files are untracked. If committed, every rebuild changes chunk filenames (`chunk-TQTAD3N4.mjs`), creating noisy diffs.

**Options:**
- **Commit them** (needed for `npm publish` since `files: ["skills/"]` in package.json) -- accept noisy diffs
- **Add to .gitignore and use `prepublishOnly`** to generate before publish -- cleaner git history but scripts not available after `git clone`

**Recommendation:** Since these are needed for npm consumers, commit them but add a comment in `.gitignore` explaining the decision. Also consider pinning esbuild chunk names via the `chunkNames` option to reduce diff noise:
```javascript
chunkNames: "chunk-[name]", // stable chunk names across builds
```

## Low Priority

### 7. `url.includes()` for deduplication is O(n^2)

**Files:** `search-google-play.ts:25,33`, `search-product-hunt.ts:44`, `search-yc-launch.ts:28`

Using `Array.includes()` in a loop for deduplication is O(n^2). With a max of 10 results this is negligible, but a `Set` would be cleaner and communicate intent better.

### 8. Import uses `.js` extension in TypeScript source

**Files:** All 4 search scripts import `from "./shared-types.js"`

The `.js` extension is required for ESM resolution (which esbuild uses), and this is correct for the bundling setup. However, the `tsconfig.json` uses `module: "CommonJS"`. TypeScript accepts the `.js` extension and resolves it to `.ts` during compilation, and esbuild handles it independently, so this works. But it may confuse contributors who see `.js` imports in a `.ts` file with CommonJS module config.

**Recommendation:** Add a brief comment in `shared-types.ts` header:
```typescript
// NOTE: Imports use .js extension for ESM compatibility (esbuild bundles these as ESM)
```

### 9. `safeFetch` User-Agent string is from Chrome 120 (dated)

**File:** `shared-types.ts:86`

Chrome 120 was released in 2023. Some bot-detection systems flag outdated UA strings. Not a functional issue currently.

**Recommendation:** Update to a more recent version string when convenient.

### 10. `search-app-store.ts` fetches reviews sequentially per app

**File:** `search-app-store.ts:101-102`

Reviews are fetched one app at a time inside the main loop. Since review fetching is independent per app, these could be parallelized.

## Edge Cases Found by Scout

| Edge Case | Status | Notes |
|-----------|--------|-------|
| Empty query string (`""`) | Handled | `parseArgs` exits with usage error |
| No CLI arguments | Handled | `parseArgs` exits with usage error |
| Non-numeric limit (`"abc"`) | **BUG** | Returns NaN, causes empty results silently |
| Limit 0 or negative | Handled | Clamped to 1 |
| Limit > 10 | Handled | Clamped to 10 |
| API returns non-JSON | Handled | try/catch wraps all `res.json()` calls |
| Network timeout | Handled | `safeFetch` aborts after 10s |
| Google Play JS-rendered page | Handled | Error message notes "page may be JS-rendered" |
| Product Hunt __NEXT_DATA__ missing | Handled | Falls back to HTML meta tags |
| Deeply nested __NEXT_DATA__ | Risk | No depth limit on `deepFind` |
| HTTP redirect (301/302) | Handled | `fetch` follows redirects by default |
| Rate limiting (429) | Partial | Treated as generic non-ok response, no retry |
| `res.json()` returns unexpected shape | Partial | Optional chaining saves most paths, but no runtime type check |

## Positive Observations

- **Excellent DRY implementation**: Shared types, `parseArgs`, `outputResult`, `outputError`, `safeFetch`, and `truncate` properly extracted
- **Consistent error contract**: All scripts output valid JSON even on errors, exit 0 so Claude can read output
- **Smart esbuild config**: `splitting: true` deduplicates cheerio into a 1.3MB shared chunk instead of 4x1.3MB
- **Defensive HTML parsing**: All `JSON.parse` calls wrapped in try/catch, multiple fallback strategies (JSON-LD -> meta tags -> page content)
- **Good build hygiene**: `rmSync` + `mkdirSync` before each build prevents stale output
- **SKILL.md integration is thorough**: Script usage documented, fallback to WebSearch documented, graceful degradation table covers script failures
- **iTunes review fetching is a nice touch**: Goes beyond search results to pull actual user reviews
- **`encodeURIComponent` used consistently** for all URL query parameters -- no injection risk

## Recommended Actions (Priority Order)

1. **Fix NaN limit bug** in `parseArgs` (high -- silent data loss)
2. **Guard `res.json()` responses** with `Array.isArray` checks (high -- defensive)
3. **Parallelize detail page fetching** with `Promise.allSettled` (medium -- performance)
4. **Add depth limit to `deepFind`** and `findPosts` (medium -- safety)
5. **Extract shared URL extraction and review snippet helpers** to reduce file sizes under 200 lines (medium -- maintainability)
6. **Decide git strategy for bundled scripts** -- commit with stable chunk names or gitignore (medium -- git hygiene)
7. **Use `Set` for URL deduplication** (low -- clarity)
8. **Add ESM import comment** (low -- contributor DX)

## Metrics

- Type Coverage: High (strict mode, all interfaces defined, typed helper returns)
- Test Coverage: Existing 33 tests pass; no new tests for scripts (acceptable -- these are CLI tools tested manually)
- Linting Issues: 0

## Unresolved Questions

- **Bundled scripts commit strategy:** Should `skills/market-intel/scripts/` be committed (needed for npm publish) or gitignored (cleaner history)? The `prepublishOnly` script runs build before publish, so gitignoring could work. But users who `git clone` and want to test locally would need to `pnpm build` first.
- **Rate limiting strategy:** All 4 scripts fire requests without delays. Running all 4 in parallel (as SKILL.md instructs) means 4 search requests + up to 40 detail requests in quick succession. Should there be a small delay between detail page fetches to avoid rate limiting?
- **cheerio bundle size (1.3MB chunk):** Acceptable for a CLI tool, but worth noting for npm package size. The total `scripts/` directory is 1.4MB. Is this acceptable for the npm package?
