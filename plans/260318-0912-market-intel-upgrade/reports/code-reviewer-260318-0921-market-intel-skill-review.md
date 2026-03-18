# Code Review: `skills/market-intel/SKILL.md` Rewrite

> **Scope:** Single file review — prompt/skill file, not code
> **File:** `skills/market-intel/SKILL.md` (216 lines)
> **Compared against:** `discover/SKILL.md`, `naming/SKILL.md`, `product-design/SKILL.md`, `roadmap/SKILL.md`

## Overall Assessment

**Strong rewrite.** The file is well-structured, covers all 4 platforms, has a complete report template with all required tables, and includes comprehensive graceful degradation rules. The structural conventions match sibling skills closely. A few minor issues below.

## Structural Consistency Check

| Convention | discover | naming | product-design | roadmap | market-intel | Pass? |
|---|---|---|---|---|---|---|
| YAML frontmatter (name, description, license) | Y | Y | Y | Y | Y | OK |
| `# Title` with subtitle pattern | Y | Y | Y | Y | Y | OK |
| `**Principles:**` one-liner | Y | Y | Y | Y | Y | OK |
| `## Usage` with code block | Y | Y | Y | Y | Y | OK |
| `**Do NOT use for:**` line | Y | - | Y | Y | Y | OK |
| `## Workflow Overview` with ASCII pipeline + table | Y | - | Y | Y | Y | OK |
| `## Step Details` with `### Step N` | Y | Y | Y | Y | Y | OK |
| `## Output Format` or `## Report Template` | Y | - | Y | Y | Y | OK |
| Closing "open door" / follow-up prompt | Y | Y | Y | - | **Missing** | Issue |

**Verdict:** Follows conventions well. One gap noted below.

## Issues Found

### Medium Priority

**1. Missing follow-up / "open door" prompt at end of workflow**

Sibling skills (`discover`, `naming`, `product-design`) end with a follow-up prompt guiding the user to next steps. Examples:
- discover: "Which direction excites you most? I can go deeper..."
- naming: "Want more in a specific style, or variations on any of these?"
- product-design: "PRD is done... Want me to draft one based on this PRD?"

`market-intel` has no equivalent. Step 6 just says "Output a single markdown report... Save to the plan reports directory if available." and stops.

**Recommendation:** Add a closing line to Step 6 or as a separate "Step 7 — Follow Up" section:

```markdown
Always end with:

> "Report complete. Want me to go deeper on any competitor, update the analysis with additional keywords, or feed these insights into a `/pkit:product-design` PRD?"
```

---

**2. iTunes Lookup API URL is incorrect**

Line 80: `https://itunes.apple.com/search?term={name}&entity=software`

The `search` endpoint works, but the skill text on line 80 says "iTunes Lookup API" while using the `/search` endpoint. The actual Lookup API is `/lookup?id=`. This is a naming inconsistency, not a functional bug -- the search endpoint is the right one to use for discovery. But calling it "Lookup API" is misleading.

**Recommendation:** Change the label:

```markdown
- **App Store:** Try iTunes Search API: `https://itunes.apple.com/search?term={name}&entity=software`
```

---

**3. "Our differentiation" removed without replacement**

The old version had "Our current differentiation (honest assessment)" in Step 4. The new version's Step 5 identifies gaps, table stakes, and threats but drops the self-assessment angle. The Strategic Insights section partially covers this with "What to Do Uniquely", but it is framed as opportunity rather than current-state assessment.

This may be intentional (the skill is for market analysis, not self-assessment), but worth flagging. If the user's product already exists, knowing where it currently stands relative to competitors is valuable.

**Recommendation:** Optional -- consider adding a note in Step 5:

```markdown
If analyzing an **existing product**, also assess: where does it currently stand on the feature matrix? What's the honest gap?
```

---

### Low Priority

**4. Inconsistent feature count guidance**

Step 5 says "identify 8-15 key features" but the Feature Matrix example in the report template only shows 2 features with columns A-E (5 competitors). This is fine as an abbreviated example, but could be confusing. A brief note like "(abbreviated example)" would help.

---

**5. Report Template section heading is at wrong level**

Line 130: `## Report Template` appears as a peer to `## Step Details` and `## Workflow Overview`. Structurally, this is the output format section and is consistent with how `discover` uses `## Output Format` and `roadmap` uses `## Output Format`. But the template is referenced from Step 6 ("using the template below"), making it feel like it should be nested under Step 6. The current flat structure is fine for readability though -- this is a style observation, not a bug.

---

**6. Error Handling section uses "Error Handling" heading instead of something more convention-aligned**

No sibling skill has an "Error Handling" section. This is new and specific to market-intel's data-fetching nature, so it makes sense. However, the title could be more specific: "Graceful Degradation Rules" would match the principle stated at the top and better convey that these are fallback behaviors, not error codes.

**Recommendation:**

```markdown
## Graceful Degradation
```

---

## Platform Coverage Verification

| Platform | Search query pattern | Fetch tips | Fallback on failure | Pass? |
|---|---|---|---|---|
| App Store | `site:apps.apple.com {keywords}` | iTunes Search API | Yes (search snippets) | OK |
| Google Play | `site:play.google.com/store/apps {keywords}` | If blocked, use snippets | Yes (search snippets) | OK |
| Product Hunt | `site:producthunt.com/posts {keywords}` | Upvote count, tagline, maker comments | Yes (search snippets) | OK |
| YC Launch | `site:ycombinator.com/launches {keywords}` | Founder pitch, launch comments | Yes (search snippets) | OK |
| General search | `{keywords} app alternatives competitors` | - | - | OK |

All 4 platforms covered with specific instructions. General search also included as 5th source.

## Report Template Completeness

| Required Table | Present? | Notes |
|---|---|---|
| Competitor Dashboard | Y | Transposed format (aspects as rows), split rule for >7 |
| Pricing Landscape | Y | Includes "Unknown" rule for missing data |
| Feature Matrix | Y | Legend included |
| Strategic Insights (What to Take / Avoid / Do Uniquely) | Y | 3 sub-tables |
| Market Gaps & Threats | Y | Covers unfilled gap, table stakes, emerging threat |
| Data Sources | Y | Competitor + platforms + URLs |
| Report metadata header | Y | Platforms searched, count, date |

All required tables present and complete.

## Graceful Degradation Rules

| Scenario | Covered? |
|---|---|
| Platform fetch blocked | Y - use search snippet data |
| No results on a platform | Y - note and continue |
| >7 competitors | Y - split dashboard |
| Pricing not found | Y - mark "Unknown" |
| Reviews unavailable | Y - note, assess from description |
| Entire search yields <3 hits | Y - ask user for more keywords |
| WebSearch tool unavailable | **N** - not addressed |
| WebFetch tool unavailable | **N** - not addressed |

**Minor gap:** No guidance for when WebSearch or WebFetch tools are entirely unavailable (e.g., the AI model doesn't have access to these tools). This is an edge case but the old version was purely prompt-based and didn't depend on tool access. Consider adding a single fallback line:

```markdown
| WebSearch/WebFetch unavailable | Ask user for competitor names and URLs, analyze from provided context |
```

## Positive Observations

- Clean structural alignment with sibling skills
- Parallel search instruction ("Run all 4 searches in parallel") is efficient
- "Base analysis on actual data... not assumptions" is a strong guardrail
- Table split rule for >7 competitors shows thoughtful UX for markdown readability
- Graceful degradation is well-covered with 6 explicit scenarios
- Deduplication instruction ("Deduplicate by product name. Prioritize products appearing on multiple platforms") prevents redundancy
- "Never leave blank" rule for pricing prevents incomplete reports
- Platform-specific extraction tips (upvote count for PH, founder pitch for YC) show domain awareness
- Evidence-based framing throughout (Strategic Insights require "Evidence" and "Source" columns)

## Recommended Actions (Priority Order)

1. **Add follow-up prompt** at end of report generation (medium -- convention alignment)
2. **Add WebSearch/WebFetch unavailable fallback** to Error Handling table (medium -- completeness)
3. **Fix "iTunes Lookup API" label** to "iTunes Search API" (low -- accuracy)
4. **Consider renaming** "Error Handling" to "Graceful Degradation" (low -- convention alignment)
5. **Optionally add** existing-product self-assessment note to Step 5 (low -- scope decision)

## Unresolved Questions

- Is the omission of "our differentiation" intentional? The old version positioned this as analyzing your product vs competitors. The new version is purely external-facing. If the intent is "analyze the market before we build anything", the omission is correct. If it should also support "how do we compare to competitors", Step 5 needs the self-assessment angle back.
- Should there be a line count concern? At 216 lines this is the longest skill file (next is discover at 131). The plan explicitly says this is acceptable for skill files since they're prompt instructions. Confirmed reasonable given the report template content.
