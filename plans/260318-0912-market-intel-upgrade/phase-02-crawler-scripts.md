---
phase: 2
title: Platform Crawler Scripts
priority: high
status: complete
effort: medium
completed: 2026-03-18
---

# Phase 2: Platform Crawler Scripts

## Overview

Add TypeScript helper scripts that Claude calls via Bash during skill execution to fetch/parse store data. Scripts are bundled into self-contained `.mjs` files with zero runtime dependencies.

## Architecture

```
src/scripts/market-intel/          ← TS source (compiled, not published)
├── shared-types.ts                ← shared output types + helpers
├── search-app-store.ts            ← iTunes Search API (JSON)
├── search-google-play.ts          ← HTML scrape + regex
├── search-product-hunt.ts         ← HTML scrape + embedded JSON
└── search-yc-launch.ts            ← HTML scrape

skills/market-intel/
├── SKILL.md
└── scripts/                       ← bundled .mjs output (committed, published)
    ├── search-app-store.mjs
    ├── search-google-play.mjs
    ├── search-product-hunt.mjs
    └── search-yc-launch.mjs
```

**Why this split:**
- `skills/` is published via npm — only bundled output ships
- `src/scripts/` stays with source code — normal TS development
- esbuild bundles cheerio into each .mjs — zero deps at runtime
- Node >= 18 guaranteed (package.json engines) — built-in fetch available

## Script Interface

All scripts share the same CLI interface:

```bash
# Usage
node scripts/search-{platform}.mjs "<keywords>" [limit]

# Example
node scripts/search-app-store.mjs "todo productivity" 5
```

**Input:** keyword string + optional limit (default 5, max 10)
**Output:** JSON to stdout

### Shared Output Schema

```typescript
interface CrawlResult {
  platform: "app_store" | "google_play" | "product_hunt" | "yc_launch";
  query: string;
  timestamp: string;
  results: CompetitorEntry[];
  errors: string[];  // non-fatal errors (e.g., "reviews not available")
}

interface CompetitorEntry {
  name: string;
  url: string;
  description: string;
  tagline?: string;
  rating?: number;        // 1-5 scale, null if unavailable
  reviewCount?: number;
  pricing: PricingInfo;
  features: string[];     // extracted feature list
  reviews: ReviewSnippet[]; // top 3 positive + 3 negative
}

interface PricingInfo {
  free: boolean;
  monthly?: number;       // USD, null if unknown
  yearly?: number;
  other?: string;         // "Lifetime $199", "Enterprise: contact"
}

interface ReviewSnippet {
  text: string;
  rating?: number;
  sentiment: "positive" | "negative" | "neutral";
}
```

## Platform Implementation Details

### 1. App Store (`search-app-store.ts`)

**API:** iTunes Search API — `https://itunes.apple.com/search?term={keywords}&entity=software&limit={limit}&country=us`

- Returns clean JSON — no HTML parsing needed
- Fields: trackName, description, price, averageUserRating, userRatingCount, screenshotUrls
- For pricing: check `price` field + `formattedPrice`
- For reviews: use `https://itunes.apple.com/rss/customerreviews/id={trackId}/sortBy=mostRecent/json` (RSS feed, JSON format)
- **Reliability: HIGH** — stable public API

### 2. Google Play (`search-google-play.ts`)

**Method:** Fetch `https://play.google.com/store/search?q={keywords}&c=apps` then individual app pages.

- Search page: extract app URLs from HTML using cheerio
- App page: extract title, description, rating, price from structured data (JSON-LD `<script type="application/ld+json">`)
- Reviews: extract from review section HTML
- **Reliability: MEDIUM** — Google may block; fallback to search-only data
- Fallback: if page fetch fails, extract what we can from search result HTML

### 3. Product Hunt (`search-product-hunt.ts`)

**Method:** Fetch `https://www.producthunt.com/search?q={keywords}` then individual post pages.

- Search: extract product cards from HTML
- Post page: Product Hunt embeds `__NEXT_DATA__` JSON in page — parse for rich structured data
- Fields from __NEXT_DATA__: name, tagline, description, votesCount, reviewsRating, topics, makers
- Reviews/comments: extract from discussion section
- **Reliability: MEDIUM-HIGH** — __NEXT_DATA__ is stable in Next.js apps

### 4. YC Launch (`search-yc-launch.ts`)

**Method:** Fetch `https://www.ycombinator.com/launches?q={keywords}` then individual launch pages.

- Search: extract launch cards from HTML
- Launch page: extract company name, tagline, description, founder pitch
- Comments: extract from discussion section
- No ratings/pricing typically available — mark as N/A
- **Reliability: MEDIUM** — HTML structure may change

## Infrastructure Changes

### New devDependencies

```json
{
  "cheerio": "^1.0.0",
  "esbuild": "^0.25.0"
}
```

### New build script in package.json

```json
{
  "scripts": {
    "build:scripts": "node build-scripts.mjs",
    "build": "tsc && npm run build:scripts"
  }
}
```

### Build config (`build-scripts.mjs` in project root)

```javascript
import { build } from "esbuild";
import { readdirSync } from "fs";

const scriptDir = "src/scripts/market-intel";
const outDir = "skills/market-intel/scripts";

const entries = readdirSync(scriptDir)
  .filter(f => f.startsWith("search-") && f.endsWith(".ts"));

await build({
  entryPoints: entries.map(f => `${scriptDir}/${f}`),
  bundle: true,
  platform: "node",
  format: "esm",
  outdir: outDir,
  outExtension: { ".js": ".mjs" },
  banner: { js: "#!/usr/bin/env node" },
  target: "node18",
  external: [],  // bundle everything
});
```

### tsconfig.json update

Add `src/scripts/` to include paths (if not already covered by `src/**/*`).

## Implementation Steps

1. Install devDependencies: `pnpm add -D cheerio esbuild @types/cheerio`
2. Create `build-scripts.mjs` in project root
3. Update `package.json` scripts: `build` → `tsc && node build-scripts.mjs`
4. Create `src/scripts/market-intel/shared-types.ts` — types + output helper
5. Create `src/scripts/market-intel/search-app-store.ts`
6. Create `src/scripts/market-intel/search-google-play.ts`
7. Create `src/scripts/market-intel/search-product-hunt.ts`
8. Create `src/scripts/market-intel/search-yc-launch.ts`
9. Run `pnpm run build` — verify bundles output to `skills/market-intel/scripts/`
10. Test each script manually: `node skills/market-intel/scripts/search-app-store.mjs "todo" 3`
11. Run existing tests: `pnpm test` — verify nothing broken

## Todo

- [x] Install cheerio + esbuild devDependencies
- [x] Create build-scripts.mjs
- [x] Update package.json build script
- [x] Create shared-types.ts
- [x] Create search-app-store.ts
- [x] Create search-google-play.ts
- [x] Create search-product-hunt.ts
- [x] Create search-yc-launch.ts
- [x] Build and verify bundles
- [x] Manual test each script
- [x] Run existing test suite

## Success Criteria

- All 4 scripts produce valid JSON output
- Each script handles errors gracefully (non-zero exit + error JSON, never crashes)
- Bundled .mjs files are self-contained (no node_modules required)
- Existing 33 tests still pass
- Build pipeline works: `pnpm run build` produces both dist/ and scripts/

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Google Play blocks requests | Medium | Use realistic User-Agent header, fallback to search-only data |
| Product Hunt __NEXT_DATA__ structure changes | Low | Fallback to HTML extraction with cheerio |
| esbuild cheerio bundling issues | Low | cheerio is pure JS, bundles cleanly |
| Bundled .mjs file size | Low | cheerio is ~200KB bundled, acceptable |
| Scripts fail silently | Medium | Always output valid JSON, include errors array |
