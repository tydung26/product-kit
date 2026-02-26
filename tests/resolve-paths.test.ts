import { describe, it, expect } from 'vitest';
import { homedir } from 'os';
import { join } from 'path';
import { resolveTargetPaths } from '../dist/domains/installation/resolve-paths.js';

const home = homedir();

describe('resolveTargetPaths — global scope', () => {
  it('claude + global → ~/.claude/skills', () => {
    const paths = resolveTargetPaths('claude', 'global');
    expect(paths).toEqual([join(home, '.claude', 'skills')]);
  });

  it('antigravity + global → ~/.gemini/antigravity/skills', () => {
    const paths = resolveTargetPaths('antigravity', 'global');
    expect(paths).toEqual([join(home, '.gemini', 'antigravity', 'skills')]);
  });

  it('all + global → claude + antigravity (no duplicates)', () => {
    const paths = resolveTargetPaths('all', 'global');
    expect(paths.length).toBe(2);
    expect(paths).toContain(join(home, '.claude', 'skills'));
    expect(paths).toContain(join(home, '.gemini', 'antigravity', 'skills'));
  });

  it('opencode + global → ~/.claude/skills (shared path)', () => {
    const paths = resolveTargetPaths('opencode', 'global');
    expect(paths).toEqual([join(home, '.claude', 'skills')]);
  });
});

describe('resolveTargetPaths — project scope', () => {
  it('claude + project → .claude/skills in cwd', () => {
    const paths = resolveTargetPaths('claude', 'project');
    expect(paths[0]).toMatch(/[/\\]\.claude[/\\]skills$/);
    expect(paths[0]).toContain(process.cwd());
  });

  it('antigravity + project → .agent/skills in cwd', () => {
    const paths = resolveTargetPaths('antigravity', 'project');
    expect(paths[0]).toMatch(/[/\\]\.agent[/\\]skills$/);
  });

  it('all + project → returns 2 paths (claude + antigravity)', () => {
    const paths = resolveTargetPaths('all', 'project');
    expect(paths.length).toBe(2);
  });

  it('opencode + project → .claude/skills in cwd', () => {
    const paths = resolveTargetPaths('opencode', 'project');
    expect(paths[0]).toMatch(/[/\\]\.claude[/\\]skills$/);
  });
});
