import assert from 'node:assert/strict';
import { test } from 'node:test';
import { homedir } from 'os';
import { join } from 'path';

// Import compiled output
const { resolveTargetPaths } = await import('../dist/domains/installation/resolve-paths.js');

const home = homedir();

test('claude + global → ~/.claude/skills', () => {
  const paths = resolveTargetPaths('claude', 'global');
  assert.deepEqual(paths, [join(home, '.claude', 'skills')]);
});

test('antigravity + global → ~/.gemini/antigravity/skills', () => {
  const paths = resolveTargetPaths('antigravity', 'global');
  assert.deepEqual(paths, [join(home, '.gemini', 'antigravity', 'skills')]);
});

test('all + global → claude + antigravity (no duplicates)', () => {
  const paths = resolveTargetPaths('all', 'global');
  assert.equal(paths.length, 2);
  assert.ok(paths.includes(join(home, '.claude', 'skills')));
  assert.ok(paths.includes(join(home, '.gemini', 'antigravity', 'skills')));
});

test('opencode + global → ~/.claude/skills (shared path)', () => {
  const paths = resolveTargetPaths('opencode', 'global');
  assert.deepEqual(paths, [join(home, '.claude', 'skills')]);
});

test('claude + project → .claude/skills in cwd', () => {
  const paths = resolveTargetPaths('claude', 'project');
  assert.ok(paths[0].endsWith(join('.claude', 'skills')));
  assert.ok(paths[0].startsWith(process.cwd()));
});
