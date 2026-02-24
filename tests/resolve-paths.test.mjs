import assert from 'node:assert/strict';
import { test } from 'node:test';
import { homedir } from 'os';
import { join } from 'path';

// Import compiled output
const { resolveTargetPaths } = await import('../dist/domains/installation/resolve-paths.js');

const home = homedir();

test('claude + global → ~/.claude/commands/pkit', () => {
  const paths = resolveTargetPaths('claude', 'global');
  assert.deepEqual(paths, [join(home, '.claude', 'commands', 'pkit')]);
});

test('antigravity + global → ~/.gemini/antigravity/commands/pkit', () => {
  const paths = resolveTargetPaths('antigravity', 'global');
  assert.deepEqual(paths, [join(home, '.gemini', 'antigravity', 'commands', 'pkit')]);
});

test('all + global → claude + antigravity (no duplicates)', () => {
  const paths = resolveTargetPaths('all', 'global');
  assert.equal(paths.length, 2);
  assert.ok(paths.includes(join(home, '.claude', 'commands', 'pkit')));
  assert.ok(paths.includes(join(home, '.gemini', 'antigravity', 'commands', 'pkit')));
});

test('opencode + global → ~/.claude/commands/pkit (shared path)', () => {
  const paths = resolveTargetPaths('opencode', 'global');
  assert.deepEqual(paths, [join(home, '.claude', 'commands', 'pkit')]);
});

test('claude + project → .claude/commands/pkit in cwd', () => {
  const paths = resolveTargetPaths('claude', 'project');
  assert.ok(paths[0].endsWith(join('.claude', 'commands', 'pkit')));
  assert.ok(paths[0].startsWith(process.cwd()));
});
