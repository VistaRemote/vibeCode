import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMetaManifest, listProjectKeys } from './meta-manifest.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Meta-Repo 根目录（含 .meta/manifest.json 或 config/environments） */
export function findMetaRoot(startDir = process.cwd()) {
  let dir = resolve(startDir);
  for (let i = 0; i < 8; i++) {
    if (
      existsSync(join(dir, '.meta', 'manifest.json')) ||
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

/** @deprecated 使用 getRepoDirs(metaRoot) */
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

/**
 * @param {string} [startDir]
 * @returns {string[]}
 */
export function getRepoDirs(startDir = process.cwd()) {
  const root = findMetaRoot(startDir);
  if (!root) return REPO_DIRS;
  try {
    return listProjectKeys(loadMetaManifest(root));
  } catch {
    return REPO_DIRS;
  }
}
