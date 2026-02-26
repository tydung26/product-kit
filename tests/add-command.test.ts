import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CAC } from 'cac';

// Hoist mock fns so they're available in vi.mock factories
const { mockInstallSkills, mockPromptScope, mockPromptSkills } = vi.hoisted(() => ({
  mockInstallSkills: vi.fn().mockResolvedValue(undefined),
  mockPromptScope: vi.fn().mockResolvedValue('global'),
  mockPromptSkills: vi.fn().mockResolvedValue(['pkit:discover']),
}));

vi.mock('../src/domains/skills', () => ({
  loadAvailableSkills: () => [
    { name: 'pkit:discover', meta: { description: 'test' }, filePath: '/a' },
    { name: 'pkit:roadmap', meta: { description: 'test' }, filePath: '/b' },
  ],
}));

vi.mock('../src/domains/installation', () => ({
  installSkills: mockInstallSkills,
}));

vi.mock('../src/domains/ui/prompts', () => ({
  promptSkillSelection: mockPromptSkills,
  promptScopeSelection: mockPromptScope,
  intro: vi.fn(),
  outro: vi.fn(),
}));

import { createCli } from '../src/cli/setup';
import { registerAdd } from '../src/commands/add';

let cli: CAC;

function freshCli() {
  const c = createCli();
  registerAdd(c);
  return c;
}

function getCommand(name: string) {
  return cli.commands.find(cmd => cmd.name === name);
}

beforeEach(() => {
  vi.clearAllMocks();
  cli = freshCli();
});

describe('add command registration', () => {
  it('registers "add" command', () => {
    expect(getCommand('add')).toBeDefined();
  });

  it('has --tool option', () => {
    const cmd = getCommand('add');
    const toolOpt = cmd?.options.find((o: any) => o.rawName === '--tool <tool>');
    expect(toolOpt).toBeDefined();
  });

  it('has --scope option', () => {
    const cmd = getCommand('add');
    const scopeOpt = cmd?.options.find((o: any) => o.rawName === '--scope <scope>');
    expect(scopeOpt).toBeDefined();
  });
});

describe('add command execution', () => {
  it('installs named skills with explicit flags', async () => {
    cli.parse(['', '', 'add', 'pkit:discover', '--tool', 'claude', '--scope', 'global'], { run: true });
    await vi.waitFor(() => {
      expect(mockInstallSkills).toHaveBeenCalled();
    });

    expect(mockInstallSkills).toHaveBeenCalledWith(
      ['pkit:discover'],
      expect.objectContaining({ tools: 'claude', scope: 'global', force: true }),
    );
  });

  it('defaults tool to claude when --tool not provided', async () => {
    cli.parse(['', '', 'add', 'pkit:roadmap', '--scope', 'project'], { run: true });
    await vi.waitFor(() => {
      expect(mockInstallSkills).toHaveBeenCalled();
    });

    expect(mockInstallSkills).toHaveBeenCalledWith(
      ['pkit:roadmap'],
      expect.objectContaining({ tools: 'claude' }),
    );
  });

  it('prompts for scope when --scope not provided', async () => {
    cli.parse(['', '', 'add', 'pkit:discover'], { run: true });
    await vi.waitFor(() => {
      expect(mockPromptScope).toHaveBeenCalled();
    });
  });

  it('prompts for skill selection when no skills given', async () => {
    cli.parse(['', '', 'add', '--scope', 'global'], { run: true });
    await vi.waitFor(() => {
      expect(mockPromptSkills).toHaveBeenCalled();
    });

    expect(mockPromptSkills).toHaveBeenCalledWith(['pkit:discover', 'pkit:roadmap']);
  });

  it('skips scope prompt when --scope flag provided', async () => {
    cli.parse(['', '', 'add', 'pkit:discover', '--scope', 'project'], { run: true });
    await vi.waitFor(() => {
      expect(mockInstallSkills).toHaveBeenCalled();
    });

    expect(mockPromptScope).not.toHaveBeenCalled();
  });
});
