import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Meta-Repo 根目录（含 tooling/、config/） */
export function findMetaRoot(startDir = process.cwd()) {
  let dir = resolve(startDir);
  for (let i = 0; i < 8; i++) {
    if (
      existsSync(join(dir, 'tooling', 'scripts', 'apply-env.mjs')) ||
      existsSync(join(dir, 'config', 'environments', 'local.env'))
    ) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export function envFilePath(metaRoot, name) {
  return join(metaRoot, 'config', 'environments', `${name}.env`);
}

export const REPO_DIRS = [
  'shared',
  'server',
  'web',
  'desktop',
  'mobile',
  'ai',
  'docs',
  'deploy',
];
