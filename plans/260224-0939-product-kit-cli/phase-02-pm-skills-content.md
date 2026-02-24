# Phase 02 — PM Skills Content (4 Skills)

## Context Links
- Parent plan: [plan.md](plan.md)
- Research: [AI Tool Skill Formats](research/researcher-01-ai-tools-skill-formats.md)

## Overview
- **Date:** 2026-02-24
- **Priority:** P0
- **Status:** pending
- **Effort:** ~2h
- **Description:** Write 4 SKILL.md files for product management workflows. Skills use `pkit:` namespace prefix for slash command invocation (e.g. `/pkit:brainstorm`). Works across Claude Code, Antigravity, and OpenCode.

## Key Insights
- Colon namespace (`pkit:name`) matches claudekit convention (`plan:hard`, `code:auto`) — directory is literally named `pkit:brainstorm`
- Slash command = directory name: `/pkit:brainstorm` invokes `~/.claude/skills/pkit:brainstorm/SKILL.md`
- Description is semantic trigger text — write exact phrases users will type
- Anti-trigger section prevents false activation from overlapping skills

## Skill Directory Structure

```
skills/
├── pkit:brainstorm/
│   └── SKILL.md
├── pkit:competitive-analysis/
│   └── SKILL.md
├── pkit:roadmap-planner/
│   └── SKILL.md
└── pkit:make-prd/
    ├── SKILL.md
    └── templates/
        └── prd-template.md
```

## Skill Specifications

---

### 1. `pkit:brainstorm`

**Slash command:** `/pkit:brainstorm`

**Triggers:** "brainstorm", "ideate", "explore ideas", "think through", "what if we", "what could we build", "idea generation", "product ideas"

**Anti-triggers:** Do NOT activate for "write a PRD", "prioritize", "roadmap" — those have dedicated skills.

**Body:**
- Role: Creative product strategist with startup + enterprise experience
- Workflow:
  1. Ask for the problem space / user segment if not provided
  2. Generate 5–10 distinct ideas (diverge first, no filtering)
  3. For each idea: one-liner, target user, core value prop, biggest risk
  4. Cluster ideas by theme
  5. Recommend top 2–3 with brief rationale
- Output: ideas as numbered list → theme clusters → recommendation table
- Always end with: "Which direction excites you most? I can go deeper on any of these."

---

### 2. `pkit:competitive-analysis`

**Slash command:** `/pkit:competitive-analysis`

**Triggers:** "competitive analysis", "analyze competitors", "compare to competitors", "how does X compare", "market analysis", "who else does this", "competitive landscape"

**Anti-triggers:** Do NOT activate for internal product comparisons or feature A/B decisions.

**Body:**
- Role: Senior product strategist with market research expertise
- Workflow:
  1. Ask for: product/feature being analyzed, known competitors (or ask to identify them), focus area (pricing, features, UX, positioning, or all)
  2. Build competitor profiles: name, positioning, target segment, pricing, key features, strengths, weaknesses
  3. Create feature comparison table (our product vs each competitor)
  4. Identify whitespace / differentiation opportunities
  5. Summarize strategic implications
- Output format:
  - Competitor profiles (one section each)
  - Comparison table (markdown)
  - Whitespace + differentiation section
  - Strategic recommendations (3 bullets max)

---

### 3. `pkit:roadmap-planner`

**Slash command:** `/pkit:roadmap-planner`

**Triggers:** "roadmap", "product roadmap", "quarterly plan", "plan next quarter", "what should we build next", "roadmap planning", "annual plan", "H1 plan", "H2 plan"

**Anti-triggers:** Do NOT activate for sprint planning (use `/pkit:make-prd`) or single-feature scoping.

**Body:**
- Role: Senior PM with experience in OKR-driven roadmap planning
- Workflow:
  1. Ask for: time horizon (quarter / half / year), strategic objectives or OKRs, current constraints (team size, dependencies), audience (internal team, exec, public)
  2. Structure using NOW / NEXT / LATER framework
  3. For each item: theme, description, why now, success metric, confidence level (High/Med/Low), dependencies
  4. Flag risks and open decisions
  5. Generate a "roadmap narrative" — 2-paragraph exec summary
- Output format:
  - NOW / NEXT / LATER table
  - Risk register (bullet list)
  - Exec narrative (2 paragraphs)
  - Open questions needing decisions

---

### 4. `pkit:make-prd`

**Slash command:** `/pkit:make-prd`

**Triggers:** "write a PRD", "product requirements", "feature spec", "draft requirements", "make a PRD", "create a PRD", "spec out this feature", "requirements document"

**Anti-triggers:** Do NOT activate for user stories only — that's a sub-task within PRD creation. Do NOT activate for roadmap planning.

**Body:**
- Role: Senior PM at a B2B SaaS company
- Workflow:
  1. Ask clarifying questions first (always): What problem does this solve? Who is the primary user? What does success look like? Any known constraints?
  2. Fill in PRD template section by section
  3. Generate user stories for key scenarios (INVEST criteria)
  4. Flag open questions and decisions needed before engineering starts
- Output: PRD using the bundled template (see `templates/prd-template.md`)

**PRD Template structure:**
```
# PRD: [Feature Name]
**Status:** Draft | **Author:** | **Date:**

## Problem
[What problem are we solving and for whom?]

## Goals & Success Metrics
| Goal | Metric | Target |
|------|--------|--------|

## User Stories
- As a [role], I want to [action] so that [benefit]
  - AC: Given / When / Then

## Requirements
### Must Have
### Should Have
### Won't Have (this version)

## Out of Scope

## Open Questions
| Question | Owner | Due |
```

---

## Implementation Steps

1. Create directory for each skill with `pkit:` prefix in name
2. Write `SKILL.md` per spec above with valid YAML frontmatter:
   ```yaml
   ---
   name: pkit:brainstorm
   description: >
     Use for brainstorming, ideation, exploring product ideas, and creative
     divergent thinking. Triggers on: brainstorm, ideate, explore ideas,
     what could we build, idea generation. Do NOT use for PRDs or roadmaps.
   license: MIT
   ---
   ```
3. Note: `name` field uses `pkit:` prefix — matches directory name exactly
4. Create `templates/prd-template.md` for `pkit:make-prd`
5. Validate each name ≤64 chars, description ≤1024 chars

## Todo List
- [ ] `skills/pkit:brainstorm/SKILL.md`
- [ ] `skills/pkit:competitive-analysis/SKILL.md`
- [ ] `skills/pkit:roadmap-planner/SKILL.md`
- [ ] `skills/pkit:make-prd/SKILL.md`
- [ ] `skills/pkit:make-prd/templates/prd-template.md`
- [ ] Validate all frontmatter

## Success Criteria
- All 4 `SKILL.md` files have valid YAML frontmatter
- Directory names exactly match `name` field values
- `/pkit:brainstorm` slash command activates the correct skill in Claude Code
- Each skill has clear trigger + anti-trigger phrasing in description

## Risk Assessment
- **Low:** Colon in directory name works on macOS/Linux; Windows may have issues (not target platform for MVP)
- Overlapping triggers between `pkit:brainstorm` and `pkit:roadmap-planner` — anti-triggers mitigate

## Next Steps
- Phase 03: Build install domain to copy `skills/pkit:*` dirs to tool directories
