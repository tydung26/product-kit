---
name: "pkit:roadmap"
description: >
  Use for product roadmap planning, quarterly planning, annual planning, and
  prioritizing what to build over a time horizon. Triggers on: roadmap, product
  roadmap, quarterly plan, Q1 plan, H1 plan, annual plan, what should we build
  next, plan next quarter, roadmap planning session. Do NOT use for single-sprint
  planning or writing individual PRDs.
license: MIT
---

# Roadmap - OKR-Driven Product Planning

Context → NOW/NEXT/LATER bucketing → risk register → open decisions → exec narrative.

**Principles:** Tie everything to outcomes | Include confidence levels | Different views for different audiences

## Usage

```
/pkit:roadmap <product/team/time-horizon>
```

**Do NOT use for:** Sprint planning, writing PRDs (`/pkit:product-design`), or market intel (`/pkit:market-intel`).

## Workflow Overview

```
[Gather Context] → [NOW/NEXT/LATER] → [Risk Register] → [Open Decisions] → [Exec Narrative]
```

| Step         | Action                                   | Skip if          |
| ------------ | ---------------------------------------- | ---------------- |
| 1. Context   | Ask horizon, OKRs, constraints, audience | Context provided |
| 2. Bucket    | NOW/NEXT/LATER with metrics + confidence | —                |
| 3. Risks     | Top 3–5 risks + mitigation               | —                |
| 4. Decisions | Unresolved calls blocking the roadmap    | —                |
| 5. Narrative | 2-paragraph exec summary                 | —                |

## Step Details

### Step 1 — Gather Context

Ask if not provided:

- Time horizon: quarter / half / year?
- Strategic objectives or OKRs (the "why" behind the roadmap)?
- Team constraints: size, key dependencies, known blockers?
- Audience: engineering team, exec, investors, public?

### Step 2 — Bucket into NOW / NEXT / LATER

Structure all items using this framework:

- **NOW** — actively being built this period (committed)
- **NEXT** — high confidence, next 1–2 periods (directional)
- **LATER** — intentional bets, exploratory (speculative)

For each item:

| Field          | Description                    |
| -------------- | ------------------------------ |
| Theme          | Broad initiative it belongs to |
| Item           | Feature or capability name     |
| Why now        | Ties to which objective/OKR    |
| Success metric | How we'll know it worked       |
| Confidence     | High / Med / Low               |
| Dependencies   | Blocking teams or milestones   |

### Step 3 — Risk Register

List the top 3–5 risks to the roadmap:

- What's the risk?
- Impact if it hits (High/Med/Low)
- Mitigation approach

### Step 4 — Open Decisions

Call out anything that needs a decision before the roadmap is final:

- Unresolved prioritization calls
- Missing alignment from stakeholders
- Unknowns that could change sequencing

### Step 5 — Exec Narrative

Write a 2-paragraph summary suitable for a leadership meeting:

- Para 1: What we're focused on and why (ties to strategy)
- Para 2: What we're deliberately NOT doing and the trade-offs

## Output Format

```
## Roadmap: [Product/Team] — [Time Horizon]

### NOW (Committed)
| Theme | Item | Why Now | Metric | Confidence | Dependencies |
|-------|------|---------|--------|-----------|--------------|

### NEXT (Directional)
[same table]

### LATER (Speculative)
[same table]

## Risk Register
| Risk | Impact | Mitigation |
|------|--------|------------|

## Open Decisions
- [ ] [Decision needed] — Owner: [Name] — By: [Date]

## Exec Narrative
[Paragraph 1: focus + rationale]

[Paragraph 2: trade-offs + what we're not doing]
```
