import assert from 'node:assert/strict';
import { test } from 'node:test';

const { validateSkillContent } = await import('../dist/domains/skills/skill-validator.js');

const validSkill = `---
name: "pkit:brainstorm"
description: Use for brainstorming product ideas and feature ideation.
license: MIT
---

# Body content here
`;

const noFrontmatter = `# Just a heading\nNo frontmatter here`;

const invalidName = `---
name: "UPPERCASE-NAME"
description: A valid description.
---`;

const descTooLong = `---
name: "pkit:test"
description: "${'x'.repeat(1025)}"
---`;

test('valid skill passes validation', () => {
  const meta = validateSkillContent(validSkill, 'test.md');
  assert.equal(meta.name, 'pkit:brainstorm');
  assert.equal(meta.license, 'MIT');
});

test('missing frontmatter throws', () => {
  assert.throws(() => validateSkillContent(noFrontmatter, 'test.md'), /No frontmatter/);
});

test('invalid name (uppercase) throws', () => {
  assert.throws(() => validateSkillContent(invalidName, 'test.md'));
});

test('description over 1024 chars throws', () => {
  assert.throws(() => validateSkillContent(descTooLong, 'test.md'));
});
