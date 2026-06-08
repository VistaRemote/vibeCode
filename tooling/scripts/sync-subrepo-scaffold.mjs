#!/usr/bin/env node
/**
 * 同步子仓库标准脚手架：LICENSE、CODE_OF_CONDUCT、SECURITY、CHANGELOG（若缺失）。
 * Usage: node tooling/scripts/sync-subrepo-scaffold.mjs [--force]
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadMetaManifest } from './lib/meta-manifest.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const force = process.argv.includes('--force');

const manifest = loadMetaManifest(root);
const REPOS = manifest.installOrder.filter((k) => manifest.projects[k]);

function scopeFor(repo) {
  return manifest.projects[repo]?.description ?? '';
}

function syncFile(repo, name, src) {
  const dest = resolve(root, repo, name);
  if (existsSync(dest) && !force) return false;
  copyFileSync(src, dest);
  return true;
}

let updated = 0;
for (const repo of REPOS) {
  syncFile(repo, 'LICENSE', resolve(root, 'LICENSE'));
  syncFile(repo, 'CODE_OF_CONDUCT.md', resolve(root, 'CODE_OF_CONDUCT.md'));

  const secTpl = readFileSync(
    resolve(root, 'tooling/templates/subrepo/SECURITY.md'),
    'utf8',
  ).replace('<!-- REPO_SCOPE -->', scopeFor(repo) || repo);
  const secPath = resolve(root, repo, 'SECURITY.md');
  if (!existsSync(secPath) || force) {
    writeFileSync(secPath, secTpl);
    updated++;
  }

  const clPath = resolve(root, repo, 'CHANGELOG.md');
  if (!existsSync(clPath) || force) {
    copyFileSync(
      resolve(root, 'tooling/templates/subrepo/CHANGELOG.md'),
      clPath,
    );
    updated++;
  }
}

console.log(`sync-subrepo-scaffold: ${REPOS.length} repos processed, ${updated} file(s) written/updated.`);
