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

# Market Intel - Competitive Landscape Analysis

Automated competitor discovery across 4 platforms → structured analysis → dashboard-style report.

**Principles:** Evidence over opinion | Honest about strengths and gaps | Actionable recs over generic summaries | Graceful degradation when data unavailable

## Usage

```
/pkit:market-intel <product idea or market description>
```

**Do NOT use for:** Internal A/B decisions, roadmap planning (`/pkit:roadmap`), or feature prioritization.

## Workflow Overview

```
[Scope] → [Search Platforms] → [Fetch & Extract] → [Analyze] → [Compare] → [Report]
```

| Step       | Action                                          | Skip if          |
| ---------- | ----------------------------------------------- | ---------------- |
| 1. Scope   | Define product idea, competitors, focus area    | Context provided |
| 2. Search  | Run crawler scripts on all 4 platforms          | —                |
| 3. Parse   | Parse JSON output, merge and deduplicate        | —                |
| 4. Analyze | Per-competitor analysis across all dimensions   | —                |
| 5. Compare | Cross-competitor feature matrix + pricing       | —                |
| 6. Report  | Generate dashboard-style MD report              | —                |

## Helper Scripts

Platform-specific crawler scripts are bundled in `scripts/` (relative to this SKILL.md).
Each script fetches and parses data from one platform, outputting structured JSON to stdout.

**Usage:** Run via Bash tool:

```bash
python3 {skill_dir}/scripts/search-app-store.py "<keywords>" [limit]
python3 {skill_dir}/scripts/search-google-play.py "<keywords>" [limit]
python3 {skill_dir}/scripts/search-product-hunt.py "<keywords>" [limit]
python3 {skill_dir}/scripts/search-yc-launch.py "<keywords>" [limit]
```

- `{skill_dir}` = directory containing this SKILL.md
- `limit` = max results per platform (default 5, max 10)
- Output: JSON with `results[]` array (name, url, description, rating, pricing, reviews) and `errors[]` for non-fatal issues
- **Run all 4 in parallel** for speed

## Step Details

### Step 1 — Scope the Analysis

Ask if not provided:

- What product/feature/idea are we analyzing?
- Who are known competitors? (or: "find them for me")
- Focus area: pricing / features / UX / positioning / all?
- How many competitors to analyze? (default 5–8, max 10)

### Step 2 — Search Platforms

**Primary method:** Run all 4 crawler scripts in parallel via Bash tool:

```bash
python3 {skill_dir}/scripts/search-app-store.py "{keywords}" {limit}
python3 {skill_dir}/scripts/search-google-play.py "{keywords}" {limit}
python3 {skill_dir}/scripts/search-product-hunt.py "{keywords}" {limit}
python3 {skill_dir}/scripts/search-yc-launch.py "{keywords}" {limit}
```

Also run a general WebSearch: `{keywords} app alternatives competitors` to catch competitors not on these platforms.

**Fallback (if scripts unavailable):** Use WebSearch with `site:` queries:

| Platform     | Search Query Pattern                                  |
| ------------ | ----------------------------------------------------- |
| App Store    | `site:apps.apple.com {keywords}`                      |
| Google Play  | `site:play.google.com/store/apps {keywords}`          |
| Product Hunt | `site:producthunt.com/posts {keywords}`               |
| YC Launch    | `site:ycombinator.com/launches {keywords}`            |

### Step 3 — Parse & Merge Results

Parse JSON output from each script. Each result contains:

- `name`, `url`, `description`, `tagline`
- `rating`, `reviewCount`
- `pricing` (free, monthly, yearly, other)
- `reviews[]` (text, rating, sentiment)
- `errors[]` (non-fatal issues encountered)

**Merge:** Deduplicate by product name across platforms. Prioritize entries with richer data (more reviews, pricing info). Check the `errors` array — note any platform issues in the final report.

**If using WebSearch fallback:** WebFetch each result URL and manually extract the same fields.

### Step 4 — Analyze Per Competitor

For each competitor, determine:

| Dimension          | What to assess                                          |
| ------------------ | ------------------------------------------------------- |
| Problem Solved     | Core pain point addressed                               |
| Target Audience    | Primary user segment (role, context, company size)      |
| Value Proposition  | Why users choose this over alternatives                 |
| Killer Features    | Top 3 differentiating capabilities                      |
| Strengths          | Top 3 things done well (from reviews + product page)    |
| Weaknesses         | Top 3 gaps or pain points (from negative reviews/discussions) |
| Review Sentiment   | Positive / Mixed / Negative + key themes                |
| Pricing Model      | Free tier, monthly, yearly, lifetime, other tiers       |

Base analysis on **actual data** from fetched pages, reviews, and discussions — not assumptions.

### Step 5 — Cross-Compare

Build two comparison matrices:

**Feature Matrix** — identify 8–15 key features across all competitors:

| Feature   | App A     | App B     | App C     |
| --------- | --------- | --------- | --------- |
| [Feature] | ✓ / ✗ / ~ | ✓ / ✗ / ~ | ✓ / ✗ / ~ |

Legend: ✓ = strong, ~ = partial/limited, ✗ = missing

**Pricing Landscape** — normalize pricing across competitors.

Then identify:

- **Gaps no one fills well** — your opportunity
- **Table stakes** — must-have to compete
- **Emerging threats** — competitors gaining momentum

### Step 6 — Generate Report

Output a single markdown report using the template below. Save to the plan reports directory if available.

**Table width rule:** If >7 competitors, split the Competitor Dashboard into 2 tables (e.g., 1–5 and 6–10).

## Report Template

```markdown
# Market Intel Report: [Product Idea]

> **Platforms searched:** App Store, Google Play, Product Hunt, YC Launch
> **Competitors analyzed:** {count} | **Generated:** {date}

## Competitor Dashboard

| Aspect            | App A          | App B          | App C          |
| ----------------- | -------------- | -------------- | -------------- |
| Platform(s)       | PH, App Store  | Google Play    | YC Launch      |
| Problem Solved    | ...            | ...            | ...            |
| Target Audience   | ...            | ...            | ...            |
| Value Proposition | ...            | ...            | ...            |
| Killer Features   | ...            | ...            | ...            |
| Strengths         | ...            | ...            | ...            |
| Weaknesses        | ...            | ...            | ...            |
| Rating            | 4.5★ (2.3k)   | 4.1★ (800)    | N/A            |
| Review Sentiment  | Positive       | Mixed          | Positive       |

## Pricing Landscape

| App   | Free Tier | Monthly | Yearly | Other        | Notes         |
| ----- | --------- | ------- | ------ | ------------ | ------------- |
| App A | ✓         | $9      | $79    | —            | 14-day trial  |
| App B | Freemium  | $12     | —      | Lifetime $199| —             |

Use "Unknown" for pricing not found — never leave blank.

## Feature Matrix

| Feature      | A | B | C | D | E |
| ------------ | - | - | - | - | - |
| [Feature 1]  | ✓ | ✗ | ~ | ✓ | ✓ |
| [Feature 2]  | ~ | ✓ | ✓ | ✗ | ~ |

Legend: ✓ = strong, ~ = partial, ✗ = missing

## Strategic Insights

### What to Take

| Insight | Evidence | Source |
| ------- | -------- | ------ |
| ...     | ...      | App A reviews |

### What to Avoid

| Anti-pattern | Why | Evidence |
| ------------ | --- | -------- |
| ...          | ... | App C 1-star reviews |

### What to Do Uniquely

| Opportunity | Gap in Market | Our Angle |
| ----------- | ------------- | --------- |
| ...         | No one does X well | ... |

## Market Gaps & Threats

| Type            | Finding |
| --------------- | ------- |
| Unfilled gap    | ...     |
| Table stakes    | ...     |
| Emerging threat | ...     |

## Data Sources

| Competitor | Platforms Found On     | URLs          |
| ---------- | ---------------------- | ------------- |
| App A      | Product Hunt, App Store| [links]       |
| App B      | Google Play            | [links]       |
```

## Graceful Degradation

| Scenario                         | Action                                                    |
| -------------------------------- | --------------------------------------------------------- |
| Platform fetch blocked           | Use search snippet data, note in Data Sources             |
| No results on a platform         | Note "No results on {platform}", continue with rest       |
| >7 competitors analyzed          | Split Competitor Dashboard into 2 tables                  |
| Pricing not found                | Mark as "Unknown", never leave blank                      |
| Reviews unavailable              | Note "No reviews available", assess from description      |
| Entire search yields <3 hits     | Ask user for more specific keywords or known competitors  |
| WebSearch/WebFetch unavailable   | Ask user for competitor names and URLs, analyze from provided context |
| Scripts not found / Node error   | Fall back to WebSearch + WebFetch method (see Step 2 fallback)       |
| Script returns empty results     | Check `errors[]` in JSON, fall back to WebSearch for that platform   |

## Follow-up

Always end with:

> "Report complete. Want me to go deeper on any competitor, or feed these insights into `/pkit:product-design` for a PRD?"
