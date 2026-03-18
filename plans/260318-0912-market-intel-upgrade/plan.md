---
status: complete
created: 2026-03-18
completed: 2026-03-18
slug: market-intel-upgrade
branch: main
---

# Plan: Market Intel Skill Upgrade

> Rewrite `skills/market-intel/SKILL.md` + add TypeScript crawler scripts for automated data collection from 4 platforms.

## Context

- Brainstorm: `plans/reports/brainstorm-260318-0912-market-intel-skill-upgrade.md`
- Phase 1 complete: SKILL.md rewritten with dashboard-style report template
- Phase 2-3: Add helper scripts for reliable platform data fetching

## Phases

| # | Phase | Status | File |
|---|-------|--------|------|
| 1 | Rewrite SKILL.md | Complete | [phase-01](phase-01-rewrite-skill.md) |
| 2 | Platform Crawler Scripts | Complete | [phase-02](phase-02-crawler-scripts.md) |
| 3 | Update SKILL.md for Scripts | Complete | [phase-03](phase-03-update-skill-for-scripts.md) |

## Key Decisions

- 4 platforms: App Store, Google Play, Product Hunt, YC Launch
- Dashboard-style report with cross-competitor tables
- 5-10 competitors per run, cap at 10
- Graceful degradation on fetch failures
- TypeScript source in `src/scripts/market-intel/`, bundled via esbuild to `skills/market-intel/scripts/`
- Bundled .mjs files are self-contained (cheerio included, zero runtime deps)
- WebSearch/WebFetch remain as fallback when scripts unavailable

## Success Criteria

- [x] SKILL.md has structured workflow for automated data collection
- [x] Platform-specific search instructions for all 4 sources
- [x] Analysis dimensions defined: problem, audience, value prop, features, strengths, weaknesses, pricing, sentiment
- [x] Dashboard-style report template with all required tables
- [x] Graceful degradation instructions for failed fetches
- [x] Follows sibling skill conventions (frontmatter, workflow table, step details, output format)
- [x] 4 crawler scripts produce valid JSON output
- [x] Scripts bundled as self-contained .mjs (no runtime deps)
- [x] Build pipeline: `pnpm run build` produces dist/ + scripts/
- [x] SKILL.md references scripts as primary data source
- [x] All existing tests pass
