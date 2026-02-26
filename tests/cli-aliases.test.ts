import { describe, it, expect, beforeAll } from 'vitest';
import { createCli } from '../dist/cli/setup.js';
import { registerInstall } from '../dist/commands/install/index.js';
import { registerList } from '../dist/commands/list/index.js';
import { registerUpdate } from '../dist/commands/update/index.js';
import { registerRemove } from '../dist/commands/remove/index.js';
import type { CAC } from 'cac';

let cli: CAC;

beforeAll(() => {
  cli = createCli();
  registerInstall(cli);
  registerList(cli);
  registerUpdate(cli);
  registerRemove(cli);
});

function getCommand(name: string) {
  return cli.commands.find(cmd => cmd.name === name);
}

describe('CLI command aliases', () => {
  it('init has alias "i"', () => {
    expect(getCommand('init')?.aliasNames).toContain('i');
  });

  it('list has alias "ls"', () => {
    expect(getCommand('list')?.aliasNames).toContain('ls');
  });

  it('update has alias "u"', () => {
    expect(getCommand('update')?.aliasNames).toContain('u');
  });

  it('remove has alias "rm"', () => {
    expect(getCommand('remove')?.aliasNames).toContain('rm');
  });
});
