import { describe, it, expect } from 'vitest';
import { loadAvailableSkills, findSkillByName } from '../dist/domains/skills/index.js';

describe('loadAvailableSkills', () => {
  it('loads all 4 pkit commands', () => {
    const skills = loadAvailableSkills();
    expect(skills.length).toBe(4);
    const names = skills.map(s => s.name);
    expect(names).toContain('pkit:discover');
    expect(names).toContain('pkit:market-intel');
    expect(names).toContain('pkit:roadmap');
    expect(names).toContain('pkit:product-design');
  });

  it('each skill has a non-empty description in meta', () => {
    const skills = loadAvailableSkills();
    for (const skill of skills) {
      expect(skill.meta.description).toBeTruthy();
      expect(skill.meta.description.length).toBeGreaterThan(0);
    }
  });

  it('each skill filePath contains the skill directory name', () => {
    const skills = loadAvailableSkills();
    for (const skill of skills) {
      const dirName = skill.name.replace('pkit:', '');
      expect(skill.filePath).toContain(dirName);
    }
  });

  it('returns consistent results on multiple calls', () => {
    const first = loadAvailableSkills();
    const second = loadAvailableSkills();
    expect(first.map(s => s.name)).toEqual(second.map(s => s.name));
  });
});

describe('findSkillByName', () => {
  it('returns correct command', () => {
    const skill = findSkillByName('pkit:discover');
    expect(skill).toBeDefined();
    expect(skill!.name).toBe('pkit:discover');
    expect(skill!.filePath).toMatch(/SKILL\.md$/);
  });

  it('returns undefined for unknown command', () => {
    const skill = findSkillByName('pkit:nonexistent');
    expect(skill).toBeUndefined();
  });
});
