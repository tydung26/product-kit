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

Scope → competitor profiles → feature matrix → whitespace mapping → strategic recommendations.

**Principles:** Be honest about strengths and gaps | Actionable recs over generic summaries | Evidence over opinion

## Usage

```
/pkit:market-intel <product/feature/market>
```

**Do NOT use for:** Internal A/B decisions, roadmap planning (`/pkit:roadmap`), or feature prioritization.

## Workflow Overview

```
[Scope Analysis] → [Competitor Profiles] → [Feature Comparison] → [Whitespace & Differentiation] → [Strategic Recs]
```

| Step          | Action                                       | Skip if          |
| ------------- | -------------------------------------------- | ---------------- |
| 1. Scope      | Define product, competitors, focus area      | Context provided |
| 2. Profiles   | Build competitor profiles                    | —                |
| 3. Compare    | Feature comparison matrix                    | —                |
| 4. Whitespace | Gaps, table stakes, differentiation, threats | —                |
| 5. Recommend  | 3 strategic bullets                          | —                |

## Step Details

### Step 1 — Scope the Analysis

Ask if not provided:

- What product/feature are we analyzing?
- Who are the known competitors? (or: "I'll suggest some")
- Focus area: pricing / features / UX / positioning / all?
- Audience for this analysis: internal team, investors, exec?

### Step 2 — Competitor Profiles

For each competitor, create a profile:

**[Competitor Name]**

- **Positioning:** How they describe themselves
- **Target segment:** Who they primarily serve
- **Pricing model:** Free/freemium/paid tiers (include price points if known)
- **Key strengths:** Top 3 things they do well
- **Key weaknesses:** Top 3 pain points or gaps
- **Notable features:** Differentiated capabilities worth noting

### Step 3 — Feature Comparison Table

Create a markdown comparison table:

| Feature   | Us        | Competitor A | Competitor B | Competitor C |
| --------- | --------- | ------------ | ------------ | ------------ |
| [Feature] | ✓ / ✗ / ~ | ✓ / ✗ / ~    | ...          | ...          |

Legend: ✓ = strong, ~ = partial/limited, ✗ = missing

### Step 4 — Whitespace & Differentiation

Identify:

- **Gaps no one fills well** (your opportunity)
- **Table stakes** (must-have to compete)
- **Our current differentiation** (honest assessment)
- **Threats to watch** (competitors gaining momentum)

### Step 5 — Strategic Recommendations

3 bullets max. Be direct:

- What to double down on
- What to build to close gaps
- What to monitor but not react to yet

## Output Format

```
## Competitor Profiles

### [Competitor Name]
- Positioning: ...
- Target: ...
- Pricing: ...
- Strengths: ...
- Weaknesses: ...

[repeat]

## Feature Comparison

| Feature | Us | CompA | CompB |
|---------|----|-------|-------|

## Whitespace & Differentiation

**Gaps:** ...
**Table stakes:** ...
**Our differentiation:** ...
**Threats:** ...

## Strategic Recommendations
1. ...
2. ...
3. ...
```
