---
phase: 1
title: Rewrite SKILL.md
priority: high
status: complete
effort: small
---

# Phase 1: Rewrite SKILL.md

## Overview

Replace current `skills/market-intel/SKILL.md` with upgraded version featuring automated data collection workflow, structured analysis pipeline, and dashboard-style report template.

## Key Insights

- Sibling skills follow consistent pattern: frontmatter → title → principles → usage → workflow table → step details → output format
- WebSearch + WebFetch are native tools — no scripts needed
- Platform-specific `site:` search queries yield best results
- Google Play may block direct fetches — need fallback to search snippets
- Tables >7 columns become unreadable — split if >7 competitors

## Related Code Files

- **Modify:** `skills/market-intel/SKILL.md`
- No other files affected

## Implementation Steps

### 1. Frontmatter (keep existing, no changes needed)

```yaml
---
name: "pkit:market-intel"
description: >
  Use for competitive analysis, market research, and understanding the competitive
  landscape. Triggers on: competitive analysis, market intel, analyze competitors,
  compare to competitors, who else does this, market analysis, competitive landscape,
  how does X compare to Y. Do NOT use for internal feature comparisons, A/B test
  decisions, or product roadmaps.
license: MIT
---
```

### 2. Title + Principles (update)

Keep same structure as sibling skills. Update principles to emphasize evidence-based analysis.

### 3. Workflow Overview (rewrite)

New 6-step pipeline:

```
[Scope] → [Search Platforms] → [Fetch & Extract] → [Analyze] → [Compare] → [Report]
```

| Step | Action | Skip if |
|------|--------|---------|
| 1. Scope | Define product idea, known competitors, focus area | Context provided |
| 2. Search | WebSearch all 4 platforms for related apps | — |
| 3. Fetch | WebFetch top results, extract structured data | — |
| 4. Analyze | Per-competitor analysis across all dimensions | — |
| 5. Compare | Cross-competitor feature matrix + pricing | — |
| 6. Report | Generate dashboard-style MD report | — |

### 4. Step Details (rewrite each)

**Step 1 — Scope:** Same ask-if-not-provided pattern as current. Add: "How many competitors? (default 5-8, max 10)"

**Step 2 — Search Platforms:** Platform-specific search queries:
- App Store: `site:apps.apple.com {keyword}`
- Google Play: `site:play.google.com/store/apps {keyword}`
- Product Hunt: `site:producthunt.com/posts {keyword}`
- YC Launch: `site:ycombinator.com/launches {keyword}`

Instructions: Run all 4 searches in parallel. Collect top 5-10 unique products across platforms.

**Step 3 — Fetch & Extract:** For each competitor found:
- WebFetch the product page
- Extract: name, description, pricing, ratings, key features
- If fetch fails: note failure, use search snippet data instead (graceful degradation)
- For App Store: try iTunes Lookup API (`itunes.apple.com/lookup?term=`)

**Step 4 — Analyze:** Per competitor, determine:
- Problem solved
- Target audience
- Value proposition
- Killer features (top 3)
- Strengths (top 3)
- Weaknesses (top 3, from reviews/discussions)
- Review sentiment (positive/mixed/negative + key themes)
- Pricing model (free tier, monthly, yearly, lifetime, other)

**Step 5 — Compare:** Build cross-competitor matrices:
- Feature comparison table (✓/~/✗)
- Pricing landscape table
- Identify: gaps no one fills, table stakes, threats

**Step 6 — Report:** Output complete dashboard-style MD report using template.

### 5. Report Template (new section)

Full template from brainstorm report with all tables:
- Header with metadata
- Competitor Dashboard (transposed: aspects as rows, apps as columns)
- Pricing Landscape
- Feature Matrix
- Strategic Insights (What to Take / Avoid / Do Uniquely)
- Market Gaps & Threats
- Data Sources with URLs

### 6. Error Handling Section (new)

Add explicit graceful degradation rules:
- Platform fetch blocked → use search snippet data
- No results on a platform → note in report, continue
- >7 competitors → split dashboard into 2 tables
- Pricing not found → mark as "Unknown" not blank

## Todo

- [x] Rewrite `skills/market-intel/SKILL.md` following steps above
- [x] Verify frontmatter unchanged
- [x] Verify follows sibling skill conventions
- [x] Verify all 4 platforms have search instructions
- [x] Verify report template has all required tables
- [x] Verify graceful degradation instructions present

## Success Criteria

- SKILL.md is self-contained — no external dependencies
- Follows same structural pattern as `discover/SKILL.md` and `product-design/SKILL.md`
- All 4 platforms have explicit search query patterns
- Report template matches brainstorm-agreed dashboard style
- Error handling covers all identified risks

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| SKILL.md too long (>200 lines) | Acceptable for skill files — they're prompt instructions, not code. No modularization needed. |
| Instructions too prescriptive | Keep flexible — "prefer X" not "must X" |
