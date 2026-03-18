---
phase: 3
title: Update SKILL.md for Scripts
priority: medium
status: complete
effort: small
completed: 2026-03-18
depends_on: [2]
---

# Phase 3: Update SKILL.md for Scripts

## Overview

Update SKILL.md Steps 2 and 3 to instruct Claude to use the helper scripts instead of raw WebSearch/WebFetch for platform data collection.

## Related Code Files

- **Modify:** `skills/market-intel/SKILL.md`

## Implementation Steps

1. Add a "Helper Scripts" section after Workflow Overview explaining available scripts
2. Update **Step 2 — Search Platforms**: instruct Claude to run scripts via Bash tool in parallel
3. Update **Step 3 — Fetch & Extract**: instruct Claude to parse JSON output from scripts
4. Keep WebSearch/WebFetch as fallback in Graceful Degradation table
5. Add script unavailability scenario to degradation table

### New section to add (after Workflow Overview):

```markdown
## Helper Scripts

Platform-specific crawler scripts are bundled in `scripts/` directory (relative to this SKILL.md).
Each script fetches and parses data from one platform, outputting structured JSON to stdout.

**Usage:** Run via Bash tool:
\```bash
node {skill_dir}/scripts/search-app-store.mjs "<keywords>" [limit]
node {skill_dir}/scripts/search-google-play.mjs "<keywords>" [limit]
node {skill_dir}/scripts/search-product-hunt.mjs "<keywords>" [limit]
node {skill_dir}/scripts/search-yc-launch.mjs "<keywords>" [limit]
\```

- `{skill_dir}` = directory containing this SKILL.md
- `limit` = max results per platform (default 5, max 10)
- Output: JSON with `results[]` array and `errors[]` for non-fatal issues
- Run all 4 in parallel for speed
```

### Updated Step 2:

Replace WebSearch table with: "Run all 4 helper scripts in parallel via Bash. Fall back to WebSearch if scripts fail."

### Updated Step 3:

Replace WebFetch instructions with: "Parse JSON output from scripts. Each result includes name, description, pricing, rating, reviews, features."

## Todo

- [x] Add Helper Scripts section to SKILL.md
- [x] Update Step 2 to use scripts
- [x] Update Step 3 to parse script JSON
- [x] Add script failure fallback to Graceful Degradation
- [x] Verify SKILL.md is coherent end-to-end

## Success Criteria

- SKILL.md clearly instructs Claude to use scripts as primary data source
- WebSearch/WebFetch remain as documented fallback
- Script path uses `{skill_dir}` relative reference
