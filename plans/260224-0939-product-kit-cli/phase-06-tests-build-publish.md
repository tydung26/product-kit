# Phase 06 — Tests, Build & npm Publish

## Context Links
- Parent plan: [plan.md](plan.md)
- Depends on: all previous phases

## Overview
- **Date:** 2026-02-24
- **Priority:** P1
- **Status:** pending
- **Effort:** ~1h
- **Description:** Write unit tests for the installation domain, configure the Bun build pipeline, and prepare for npm publish with proper package metadata.

## Key Insights
- Focus tests on path resolution and conflict detection — highest risk logic
- Bun's built-in test runner (`bun test`) is sufficient; no need for Vitest
- npm publish requires clean `dist/` and `skills/` in `files` array
- Use semantic-release or manual versioning — manual is simpler for v0

## Requirements
- Unit tests for `resolve-paths.ts` (all tool + scope combos)
- Unit tests for `skill-validator.ts` (valid/invalid frontmatter)
- Unit tests for `manifest-manager.ts` (CRUD operations)
- Build produces `dist/index.js` that runs on Node ≥18
- `npm publish` works with correct `files` array

## Architecture

```
tests/
├── installation/
│   ├── resolve-paths.test.ts
│   └── manifest-manager.test.ts
├── skills/
│   └── skill-validator.test.ts
└── integration/
    └── install-flow.test.ts      # End-to-end install to temp dir
```

## Related Code Files
- Create: `tests/installation/resolve-paths.test.ts`
- Create: `tests/installation/manifest-manager.test.ts`
- Create: `tests/skills/skill-validator.test.ts`
- Create: `tests/integration/install-flow.test.ts`
- Modify: `package.json` — add test script, finalize publish config

## Implementation Steps

### 1. Unit tests

**`resolve-paths.test.ts`:**
```ts
import { test, expect } from 'bun:test';
test('all + global → claude and antigravity paths', () => {
  const paths = resolveTargetPaths('all', 'global');
  expect(paths).toContain(join(home, '.claude', 'skills'));
  expect(paths).toContain(join(home, '.gemini', 'antigravity', 'skills'));
  expect(paths.length).toBe(2); // claude(+opencode) + antigravity
});
test('opencode + global → claude path (shared)', () => {
  const paths = resolveTargetPaths('opencode', 'global');
  expect(paths).toContain(join(home, '.claude', 'skills'));
});
```

**`skill-validator.test.ts`:**
```ts
test('valid skill passes', () => {
  expect(validateSkill({ name: 'prd-writer', description: 'Draft PRDs', license: 'MIT' })).toBeTruthy();
});
test('invalid name (uppercase) fails', () => {
  expect(() => validateSkill({ name: 'PRD-Writer', description: '...' })).toThrow();
});
```

**`install-flow.test.ts` (integration):**
```ts
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
test('install to temp dir succeeds', async () => {
  const tmpDir = await mkdtemp(join(tmpdir(), 'pk-test-'));
  // override TOOL_PATHS for test
  await installSkills(['prd-writer'], { tools: 'claude', scope: 'global', _destOverride: tmpDir });
  expect(await exists(join(tmpDir, 'prd-writer', 'SKILL.md'))).toBe(true);
  await rm(tmpDir, { recursive: true });
});
```

### 2. Build configuration

**`package.json` scripts:**
```json
{
  "scripts": {
    "build": "bun build src/index.ts --outfile dist/index.js --target node --minify",
    "test": "bun test tests/",
    "type-check": "tsc --noEmit",
    "lint": "biome check src/",
    "prepublishOnly": "bun run type-check && bun run lint && bun run test && bun run build"
  }
}
```

**`package.json` publish config:**
```json
{
  "name": "product-kit",
  "version": "0.1.0",
  "license": "MIT",
  "files": ["dist/", "skills/", "bin/", "README.md"],
  "bin": { "pk": "bin/pk.js" },
  "keywords": ["product-management", "ai", "claude", "antigravity", "opencode", "skills", "pm"]
}
```

### 3. `bin/pk.js` — ensure executable
```js
#!/usr/bin/env node
require('../dist/index.js');
```
Must `chmod +x bin/pk.js` before publish.

### 4. README.md (minimal, in project root)
```markdown
# product-kit

PM skills for Claude Code, Antigravity, and OpenCode.

## Install
npm install -g product-kit

## Usage
pk install              # Interactive skill selection
pk install prd-writer   # Install specific skill
pk list                 # Show available/installed skills
pk update               # Update all installed skills
pk remove prd-writer    # Remove a skill
pk doctor               # Diagnose installation issues
```

### 5. Publish checklist
```bash
bun run prepublishOnly   # Run all checks
npm version 0.1.0
npm publish --access public
```

## Todo List
- [ ] `tests/installation/resolve-paths.test.ts`
- [ ] `tests/installation/manifest-manager.test.ts`
- [ ] `tests/skills/skill-validator.test.ts`
- [ ] `tests/integration/install-flow.test.ts`
- [ ] Add `test` script to `package.json`
- [ ] Verify `bun run build` produces working `dist/index.js`
- [ ] Add `prepublishOnly` gate script
- [ ] `chmod +x bin/pk.js`
- [ ] Write minimal `README.md`
- [ ] Dry run: `npm publish --dry-run` to verify package contents

## Success Criteria
- `bun test` → all tests pass (0 failures)
- `npm publish --dry-run` shows correct files (dist/, skills/, bin/, README.md)
- `npm install -g product-kit` → `pk --help` works on a fresh machine

## Risk Assessment
- **Low-Medium:** Integration test needs path override support built into install domain
- If `bun build` has issues with `@clack/prompts` (ESM), may need to use `--format cjs`

## Security Considerations
- `prepublishOnly` gate prevents publishing broken or unvetted code
- Review `files` array — ensure no `.env`, private keys, or test fixtures published
- `npm publish` requires 2FA for public packages

## Next Steps
- Iterate skill content based on real-world testing with Claude/Antigravity/OpenCode
- Consider v0.2: registry support (fetch skills from GitHub)
- Consider v0.3: `pk create` command to scaffold new custom skills
