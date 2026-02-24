import assert from 'node:assert/strict';
import { test } from 'node:test';

const { loadAvailableSkills, findSkillByName } = await import('../dist/domains/skills/index.js');

test('loads all 4 pkit skills', () => {
  const skills = loadAvailableSkills();
  assert.equal(skills.length, 4);
  const names = skills.map(s => s.name);
  assert.ok(names.includes('pkit:brainstorm'));
  assert.ok(names.includes('pkit:competitive-analysis'));
  assert.ok(names.includes('pkit:roadmap-planner'));
  assert.ok(names.includes('pkit:make-prd'));
});

test('findSkillByName returns correct skill', () => {
  const skill = findSkillByName('pkit:brainstorm');
  assert.ok(skill);
  assert.equal(skill.name, 'pkit:brainstorm');
});

test('findSkillByName returns undefined for unknown skill', () => {
  const skill = findSkillByName('pkit:nonexistent');
  assert.equal(skill, undefined);
});
