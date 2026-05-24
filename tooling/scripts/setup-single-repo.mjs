#!/usr/bin/env node
/**
 * First-time setup when developer only cloned one sub-repo.
 * Run from server|web|desktop|mobile|ai directory OR Meta-Repo root.
 *
 *   node ../vista-remote/tooling/scripts/setup-single-repo.mjs
 *   # or from meta root:
 *   node tooling/scripts/setup-single-repo.mjs --repo desktop
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { findMetaRoot, REPO_DIRS } from './lib/paths.mjs';

const metaRoot = findMetaRoot();
if (!metaRoot) {
  console.error('❌ Run this from Meta-Repo root or a sub-repo with ../vista-remote tooling.');
  process.exit(1);
}

const repoArg = process.argv.find((a) => a.startsWith('--repo='))?.split('=')[1];
const cwd = process.cwd();
const repoName =
  repoArg ??
  REPO_DIRS.find((d) => cwd.replace(/\\/g, '/').endsWith(`/${d}`)) ??
  null;

console.log('🛠 VistaRemote single-repo setup\n');

run('node', [join(metaRoot, 'tooling/scripts/ensure-shared.mjs'), '--clone']);
run('node', [join(metaRoot, 'tooling/scripts/apply-env.mjs'), 'local']);

if (existsSync(join(metaRoot, 'tooling/scripts/setup-ide-config.mjs'))) {
  run('node', [join(metaRoot, 'tooling/scripts/setup-ide-config.mjs')]);
}

const target = repoName ? join(metaRoot, repoName) : cwd;
if (existsSync(join(target, 'package.json'))) {
  console.log(`\n📦 pnpm install @ ${target}`);
  execSync('pnpm install', { cwd: target, stdio: 'inherit' });
}

if (existsSync(join(metaRoot, 'shared'))) {
  console.log('\n📦 build shared');
  execSync('pnpm install', { cwd: join(metaRoot, 'shared'), stdio: 'inherit' });
  try {
    execSync('pnpm build', { cwd: join(metaRoot, 'shared'), stdio: 'inherit' });
  } catch {
    console.warn('⚠️  shared build failed — check Node >= 22.12');
  }
}

console.log(`
✅ Done. Next:
   - Switch env:  pnpm env:dev   (from meta root)
   - Full stack:  pnpm dev:up
   - This repo:   cd ${repoName ?? '.'} && pnpm dev   (or pnpm start for mobile)
`);

function run(cmd, args) {
  execSync([cmd, ...args].join(' '), { cwd: metaRoot, stdio: 'inherit' });
}
