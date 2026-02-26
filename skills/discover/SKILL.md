---
name: "pkit:discover"
description: >
  Use for product discovery, ideation, exploring solutions, and customer segment
  slicing. Triggers on: discover, brainstorm, ideate, explore ideas, what if we,
  what could we build, idea generation, think through options, who is the customer.
  Do NOT use for writing PRDs (use pkit:product-design), roadmaps
  (use pkit:roadmap), or market intel (use pkit:market-intel).
license: MIT
---

# Discover - Structured Product Ideation

Divergent thinking → customer slicing → clustered themes → top picks with next steps.

**Principles:** Quantity over quality (diverge first) | Ground in real user needs | Be specific, not generic

## Usage

```
/pkit:discover <product/feature/problem-space>
```

**Do NOT use for:** Writing PRDs (`/pkit:product-design`), roadmaps (`/pkit:roadmap`), or market intel (`/pkit:market-intel`).

## Workflow Overview

```
[Clarify Problem] → [Slice Customer Segment] → [Generate 5-10 Ideas] → [Cluster by Theme] → [Top 2-3 Picks] → [Next Steps]
```

| Step         | Action                                     | Skip if                   |
| ------------ | ------------------------------------------ | ------------------------- |
| 1. Clarify   | Ask problem/user/constraints/prior art     | Context already provided  |
| 2. Slice     | Narrow customer segment via who-where test | Specific segment provided |
| 3. Diverge   | Generate 5–10 ideas, no filtering          | —                         |
| 4. Cluster   | Group into 2–4 themes                      | —                         |
| 5. Recommend | Pick top 2–3, present as table             | —                         |
| 6. Open door | Offer deeper dives                         | —                         |

## Step Details

### Step 1 — Clarify the Problem Space

Ask:

- What problem are we solving?
- Who is the primary user? (role, context, pain level)
- Any known constraints? (timeline, tech stack, team size, budget)
- What's already been tried?

### Step 2 — Slice the Customer Segment

Narrow down **who** you're building for. Vague audience → vague ideas.

**Slicing questions (repeat until specific):**

1. Within this customer group, who has the **strongest need**?
2. Will **everyone** buy/use it, or only a subset?
3. **Why** do they want this? Underlying motivation?
4. Is there a **trigger or forcing function** driving them?
5. What **other groups** share that same motivation?

**Two answer types:**

- **Demographic cluster** — role, company size, geography, etc.
- **Goal/motivation cluster** — shared objectives and pain drivers

**Keep slicing until you can answer both:**

- **Who** are they? (specific enough to describe a real person)
- **Where** do you find them? (channels, communities, platforms)

Can't answer "where"? Segment too broad — slice again.

**Pick focus using:** 1) Ability to pay & market size 2) Ease of reach 3) Personal energy

### Step 3 — Diverge: Generate Ideas

Generate **5–10 distinct ideas**. No filtering yet.

Per idea: **Name** | **One-liner** | **Target user** | **Core value prop** | **Biggest risk**

### Step 4 — Cluster by Theme

Group into 2–4 themes. Label each (e.g. "Self-serve automation", "Human-in-the-loop", "Data visibility").

### Step 5 — Recommend Top 2–3

Pick strongest by: user value, feasibility, differentiation, strategic fit.

| Idea | Why Strong | Key Risk | Suggested Next Step |
| ---- | ---------- | -------- | ------------------- |

### Step 6 — Open the Door

Always end with:

> "Which direction excites you most? I can go deeper on any of these — user stories, a quick PRD, or a competitive check."

## Output Format

```
## Target Segment

**Who:** [specific persona]
**Where:** [channels/communities to reach them]
**Why them:** [motivation + ability to pay + reachability]

## Ideas

1. **[Name]**
   - What: ...
   - Who: ...
   - Value: ...
   - Risk: ...

[repeat for all ideas]

## Themes

**Theme A: [Label]** — ideas 1, 3, 7
**Theme B: [Label]** — ideas 2, 5, 9

## Top Picks

| Idea | Why Strong | Key Risk | Next Step |
|------|-----------|----------|-----------|

> Which direction excites you most?...
```
