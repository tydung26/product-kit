import assert from 'node:assert/strict';
import { test } from 'node:test';

const { validateSkillContent } = await import('../dist/domains/skills/skill-validator.js');

const validCommand = `---
description: Use for brainstorming product ideas and feature ideation.
argument-hint: <topic-or-problem-space>
---

# Body content here
`;

const noFrontmatter = `# Just a heading\nNo frontmatter here`;

const missingDescription = `---
argument-hint: <something>
---`;

const descTooLong = `---
description: "${'x'.repeat(257)}"
---`;

test('valid command passes validation', () => {
  const meta = validateSkillContent(validCommand, 'test.md');
  assert.equal(meta.description, 'Use for brainstorming product ideas and feature ideation.');
  assert.equal(meta.argumentHint, '<topic-or-problem-space>');
});

test('missing frontmatter throws', () => {
  assert.throws(() => validateSkillContent(noFrontmatter, 'test.md'), /No frontmatter/);
});

test('missing description throws', () => {
  assert.throws(() => validateSkillContent(missingDescription, 'test.md'));
});

test('description over 256 chars throws', () => {
  assert.throws(() => validateSkillContent(descTooLong, 'test.md'));
});
