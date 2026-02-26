import { describe, it, expect } from 'vitest';
import { validateSkillContent } from '../dist/domains/skills/skill-validator.js';

const validContent = `---
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

const emptyContent = ``;

const bodyOnly = `# Just a heading

Some body content with no frontmatter delimiters at all.`;

const validWithExtraFields = `---
description: Use for brainstorming product ideas and feature ideation.
argument-hint: <topic-or-problem-space>
author: Jane Doe
version: 1.0.0
---

# Body content here
`;

describe('validateSkillContent — valid', () => {
  it('valid content passes validation', () => {
    const meta = validateSkillContent(validContent, 'test.md');
    expect(meta.description).toBe('Use for brainstorming product ideas and feature ideation.');
    expect(meta.argumentHint).toBe('<topic-or-problem-space>');
  });

  it('valid content with extra frontmatter fields still passes', () => {
    const meta = validateSkillContent(validWithExtraFields, 'test.md');
    expect(meta.description).toBe('Use for brainstorming product ideas and feature ideation.');
    expect(meta.argumentHint).toBe('<topic-or-problem-space>');
  });
});

describe('validateSkillContent — invalid', () => {
  it('missing frontmatter throws', () => {
    expect(() => validateSkillContent(noFrontmatter, 'test.md')).toThrow(/No frontmatter/);
  });

  it('missing description throws', () => {
    expect(() => validateSkillContent(missingDescription, 'test.md')).toThrow();
  });

  it('description over 256 chars throws', () => {
    expect(() => validateSkillContent(descTooLong, 'test.md')).toThrow();
  });

  it('empty file content throws', () => {
    expect(() => validateSkillContent(emptyContent, 'test.md')).toThrow(/No frontmatter/);
  });

  it('content with only body (no frontmatter delimiters) throws', () => {
    expect(() => validateSkillContent(bodyOnly, 'test.md')).toThrow(/No frontmatter/);
  });
});
