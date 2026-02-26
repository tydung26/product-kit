---
name: "pkit:product-design"
description: >
  Use for product design workflow: PRD, brand guidelines, wireframes, moodboards,
  and design refinement. Triggers on: write a PRD, make a PRD, product design,
  brand guideline, design spec, feature spec, product requirements, design flow.
  Do NOT use for roadmap planning (use pkit:roadmap)
  or discovery/brainstorming (use pkit:discover).
license: MIT
---

# Product Design - PRD to Polished Design

End-to-end product design pipeline: research → PRD → brand → wireframes → moodboard → final design.

**Principles:** User pain first, solution second | Be specific, flag unknowns | No implementation details in requirements

## Usage

```
/pkit:product-design <feature-name>
```

**Do NOT use for:** Roadmap planning (`/pkit:roadmap`), discovery (`/pkit:discover`), or market intel (`/pkit:market-intel`).

## Workflow Overview

```
[Clarify] → [Write PRD] → [User Stories] → [Open Questions] → [Next Steps: Brand Guideline]
```

| Step          | Action                                    | Skip if          |
| ------------- | ----------------------------------------- | ---------------- |
| 1. Clarify    | Ask problem/user/success/constraints      | Context provided |
| 2. PRD        | Write full PRD using template             | —                |
| 3. Stories    | 3–5 user stories with acceptance criteria | —                |
| 4. Questions  | Surface all open decisions                | —                |
| 5. Next steps | Point to Brand Guideline as next step     | —                |

## Step Details

### Step 1 — Clarify (Always First)

Ask:

1. What problem does this feature solve?
2. Who is the primary user? (role, context, what they're trying to do)
3. What does success look like? (metric or observable outcome)
4. Any known constraints? (timeline, tech, dependencies, non-goals)
5. Existing mockups, data, or research to incorporate?

### Step 2 — Write the PRD

Use template below. Fill every section — no empty placeholders. Flag unknowns as open questions.

### Step 3 — Generate Core User Stories

Write 3–5 user stories:

- Format: "As a [role], I want to [action] so that [benefit]"
- INVEST criteria: Independent, Negotiable, Valuable, Estimable, Small, Testable
- Acceptance criteria in Given/When/Then format
- Flag edge cases for engineering

### Step 4 — Surface Open Questions

List every decision needed before engineering starts:

- UX decisions not yet resolved
- Technical approach questions
- Business rule ambiguities
- Dependencies on other teams

### Step 5 — Point to Next Steps

Always end with:

> "PRD is done — Step 1 of 6 complete. Next: define your **Brand Guideline** (tone, colors, typography, spacing, icon/image style). Want me to draft one based on this PRD?"

## Product Design Flow

The PRD is Step 1 of a 6-step pipeline from research to polished design:

```
[1. PRD] → [2. Brand Guideline] → [3. Wireframes] → [4. Moodboard] → [5. Design] → [6. Refine]
```

| Step               | What                                             | Output                        | Tool             |
| ------------------ | ------------------------------------------------ | ----------------------------- | ---------------- |
| 1. Research & PRD  | User needs, pain points, barriers                | PRD document                  | This command     |
| 2. Brand Guideline | Tone, colors, typography, spacing, icons, images | Brand Guideline doc           | AI-assisted      |
| 3. Wireframes      | Feed PRD + Brand Guideline → generate screens    | Layout wireframes (not final) | Google Stitch    |
| 4. Inspiration     | Browse references for specific components        | Moodboard in Figma            | Mobbin, Awwwards |
| 5. Design          | Wireframe structure + Moodboard style            | Final design                  | Figma            |
| 6. Refine          | Audit against Brand Guideline                    | Polished, consistent design   | Manual review    |

**Key rules:**

- Step 3 output = **wireframes only** — don't ship as final design
- Step 4 = search with intent (find references for specific components, not aimless browsing)
- Step 6 = check spacing, text sizes, components, colors match the guideline

## Quality Checklist

- [ ] Problem statement is user-centric (not solution-centric)
- [ ] Success metrics are measurable (not vague like "improved UX")
- [ ] Must Have list is genuinely minimum viable (not a wish list)
- [ ] Every open question has an owner assigned
- [ ] No technical implementation details in requirements

## PRD Template

See `templates/prd-template.md` for the full template.
