#!/usr/bin/env node
/**
 * One-shot local dev bootstrap (Meta-Repo root).
 *   node tooling/scripts/dev-up.mjs
 *   node tooling/scripts/dev-up.mjs --skip-docker
 *   node tooling/scripts/dev-up.mjs --env dev
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync, spawnSync } from 'node:child_process';
import { findMetaRoot } from './lib/paths.mjs';

const metaRoot = findMetaRoot();
if (!metaRoot) {
  console.error('❌ Run from VistaRemote Meta-Repo root.');
  process.exit(1);
}

const skipDocker = process.argv.includes('--skip-docker');
const withAi = process.argv.includes('--with-ai');
const envName = process.argv.find((a) => a.startsWith('--env='))?.split('=')[1] ?? 'local';

console.log('🚀 VistaRemote dev-up\n');

check('node', ['-v']);
check('pnpm', ['-v']);
if (!skipDocker) check('docker', ['version']);

run('node', [join(metaRoot, 'tooling/scripts/apply-env.mjs'), envName]);

if (!skipDocker) {
  const compose = join(metaRoot, 'deploy/compose/docker-compose.dev.yml');
  console.log('\n🐳 docker compose up -d (mysql, redis, ollama)...');
  execSync(`docker compose -f "${compose}" up -d`, {
    cwd: join(metaRoot, 'deploy/compose'),
    stdio: 'inherit',
    shell: true,
  });
  if (withAi) {
    execSync(`docker compose -f "${compose}" --profile ai up -d`, {
      cwd: join(metaRoot, 'deploy/compose'),
      stdio: 'inherit',
      shell: true,
    });
  }
}

const installOrder = ['shared', 'server', 'web', 'ai', 'desktop', 'mobile'];
for (const dir of installOrder) {
  const p = join(metaRoot, dir);
  if (!existsSync(join(p, 'package.json'))) {
    console.log(`⏭️  skip ${dir} (not cloned — run ./init.sh)`);
    continue;
  }
  console.log(`\n📦 pnpm install → ${dir}`);
  execSync('pnpm install', { cwd: p, stdio: 'inherit' });
}

if (existsSync(join(metaRoot, 'shared/package.json'))) {
  console.log('\n🔨 pnpm build → shared');
  try {
    execSync('pnpm build', { cwd: join(metaRoot, 'shared'), stdio: 'inherit' });
  } catch {
    console.warn('⚠️  shared build failed');
  }
}

printNextSteps(metaRoot, envName, skipDocker);

function check(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(`❌ Missing: ${cmd}`);
    process.exit(1);
  }
}

function run(cmd, args) {
  execSync([cmd, ...args].join(' '), { cwd: metaRoot, stdio: 'inherit' });
}

function printNextSteps(root, env, skipDocker) {
  console.log(`
════════════════════════════════════════════════════════════
✅ Bootstrap complete — environment: ${env}

Start services (separate terminals):

  cd server && pnpm start:dev
  cd web && pnpm --filter @vistaremote/web-client dev
  cd web && pnpm --filter @vistaremote/web-admin dev
  cd ai && pnpm start:dev
  cd desktop && pnpm dev
  cd mobile && pnpm start

Docs:  cd docs && pnpm dev

Switch API target (no reinstall):
  pnpm env:dev | pnpm env:sit | pnpm env:uat
  Then restart the app you are running.

${skipDocker ? '' : 'Docker: mysql :3306, redis :6379, ollama :11434'}
════════════════════════════════════════════════════════════
`);
}
