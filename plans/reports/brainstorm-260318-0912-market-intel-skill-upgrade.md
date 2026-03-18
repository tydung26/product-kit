# Brainstorm: Market Intel Skill Upgrade

> Date: 2026-03-18 | Status: Complete

## Problem Statement

Current `pkit:market-intel` is prompt-only competitive analysis. No automated data collection, no structured analysis pipeline, no standardized report output. User wants automated competitor discovery + deep analysis from real platform data.

## Agreed Approach

Upgrade SKILL.md to instruct Claude to use **WebSearch + WebFetch** across 4 platforms, analyze 5-10 competitors, output a **single dashboard-style MD report**.

### Platforms (4)

| Platform | Search Method | Data Available |
|----------|--------------|----------------|
| App Store | `site:apps.apple.com` + iTunes Lookup API | Description, rating, reviews, pricing |
| Google Play | `site:play.google.com` | Description, rating, reviews, pricing |
| Product Hunt | `site:producthunt.com` | Tagline, description, upvotes, discussions |
| YC Launch | `site:ycombinator.com/launches` | Description, founder pitch, comments |

### Implementation: Prompt-Only (No Scripts)

Enhanced SKILL.md with structured workflow instructions. No Python, no MCP, no external deps. Uses native WebSearch/WebFetch tools.

### Analysis Dimensions (Per Competitor)

- Problem solved
- Target audience
- Value proposition
- Killer features
- Strengths & weaknesses
- Review sentiment summary
- Pricing model (free/monthly/yearly/lifetime/other)

### Report Structure (Dashboard-Style)

```
# Market Intel Report: [Product Idea]
> Platforms: App Store, Google Play, Product Hunt, YC Launch
> Competitors: {count} | Generated: {date}

## Competitor Dashboard
| Aspect | App A | App B | ... |
|--------|-------|-------|-----|
| Platform(s) | ... | ... | ... |
| Problem Solved | ... | ... | ... |
| Target Audience | ... | ... | ... |
| Value Proposition | ... | ... | ... |
| Killer Features | ... | ... | ... |
| Strengths | ... | ... | ... |
| Weaknesses | ... | ... | ... |
| Rating | 4.5★ (2.3k) | ... | ... |
| Review Sentiment | ... | ... | ... |

## Pricing Landscape
| App | Free | Monthly | Yearly | Other | Notes |
|-----|------|---------|--------|-------|-------|

## Feature Matrix
| Feature | A | B | C | ... |
|---------|---|---|---|-----|
Legend: ✓ strong, ~ partial, ✗ missing

## Strategic Insights

### What to Take
| Insight | Evidence | Source |
|---------|----------|--------|

### What to Avoid
| Anti-pattern | Why | Evidence |
|-------------|-----|----------|

### What to Do Uniquely
| Opportunity | Gap | Angle |
|-------------|-----|-------|

## Market Gaps & Threats
| Type | Finding |
|------|---------|
| Unfilled gap | ... |
| Table stakes | ... |
| Emerging threat | ... |

## Data Sources
| Competitor | Platforms | URLs |
|------------|-----------|------|
```

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Implementation | Prompt-only SKILL.md | KISS — WebSearch/WebFetch are native tools, no scripts needed |
| Platforms | 4 (App Store, GPlay, PH, YC) | Covers mobile + web + startup ecosystems |
| Competitor count | 5-10, cap at 10 | Beyond 10 tables become unreadable, tokens explode |
| Error handling | Graceful degradation | Skip failed platform, note in report, continue |
| Report format | Single dashboard-style MD | User preference; table-heavy cross-comparison |
| Model | Current model (no override) | Simpler, user's choice |
| Report output | Single file | No modular sub-commands |

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Google Play blocking fetches | Medium | Fall back to search snippets |
| Stale/cached page data | Low | Note data freshness in report |
| 10-column table readability | Medium | Split into 2 tables of 5 if >7 competitors |
| Token budget (many fetches) | Medium | Prioritize data-rich sources, limit fetch depth |
| Reviews truncated on fetch | Low | Extract what's available, note limitations |

## What This Does NOT Need (YAGNI)

- No MCP servers
- No Python scripts
- No model switching/subagent override
- No modular sub-commands
- No database or caching layer

## Next Steps

1. Rewrite `skills/market-intel/SKILL.md` with new workflow
2. Test with a real product idea across all 4 platforms
3. Iterate on report template based on actual output quality
