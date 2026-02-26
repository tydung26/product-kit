import assert from 'node:assert/strict';
import { test } from 'node:test';

const { loadAvailableSkills, findSkillByName } = await import('../dist/domains/skills/index.js');

test('loads all 4 pkit commands', () => {
  const skills = loadAvailableSkills();
  assert.equal(skills.length, 4);
  const names = skills.map(s => s.name);
  assert.ok(names.includes('pkit:discover'));
  assert.ok(names.includes('pkit:market-intel'));
  assert.ok(names.includes('pkit:roadmap'));
  assert.ok(names.includes('pkit:product-design'));
});

test('findSkillByName returns correct command', () => {
  const skill = findSkillByName('pkit:discover');
  assert.ok(skill);
  assert.equal(skill.name, 'pkit:discover');
  assert.ok(skill.filePath.endsWith('SKILL.md'));
});

test('findSkillByName returns undefined for unknown command', () => {
  const skill = findSkillByName('pkit:nonexistent');
  assert.equal(skill, undefined);
});
