#!/usr/bin/env node
/**
 * Ensure ../shared exists for single-repo developers (desktop/mobile/web).
 * Usage: node tooling/scripts/ensure-shared.mjs [--clone]
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { findMetaRoot } from './lib/paths.mjs';

const clone = process.argv.includes('--clone');
const cwd = process.cwd();
const metaRoot = findMetaRoot(cwd) ?? dirname(cwd);
const sharedPath = existsSync(join(cwd, 'shared'))
  ? join(cwd, 'shared')
  : join(dirname(cwd), 'shared');

if (existsSync(join(sharedPath, 'package.json'))) {
  console.log(`✅ shared ready: ${sharedPath}`);
  verifyPackageJson(cwd);
  process.exit(0);
}

const sharedSibling = join(dirname(cwd), 'shared');
if (existsSync(join(sharedSibling, 'package.json'))) {
  console.log(`✅ shared found at ${sharedSibling}`);
  verifyPackageJson(cwd);
  process.exit(0);
}

if (!clone) {
  console.error(`
❌ @vistaremote/shared not found.

Options:
  1) Clone Meta-Repo and run ./init.sh (recommended)
  2) From your repo (${cwd}):
       node ${metaRoot ? join(metaRoot, 'tooling/scripts/ensure-shared.mjs') : '...'} --clone
     (clones shared to ../shared)
  3) Set package.json dependency to published @vistaremote/shared version
`);
  process.exit(1);
}

console.log('📦 Cloning shared to ../shared ...');
execSync('git clone git@github.com:VistaRemote/shared.git shared', {
  cwd: dirname(cwd),
  stdio: 'inherit',
});
verifyPackageJson(cwd);
console.log('✅ shared cloned. Run: pnpm install && cd ../shared && pnpm build');

function verifyPackageJson(repoDir) {
  const pkgPath = join(repoDir, 'package.json');
  if (!existsSync(pkgPath)) return;
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const dep = pkg.dependencies?.['@vistaremote/shared'];
  if (dep?.includes('file:')) {
    console.log(`   package.json: @vistaremote/shared → ${dep}`);
  } else if (!dep) {
    console.warn('⚠️  package.json has no @vistaremote/shared dependency');
  }
}
