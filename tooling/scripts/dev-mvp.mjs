#!/usr/bin/env node
/**
 * MVP 本地调试（Node 版；Windows 推荐用仓库根目录 dev-mvp.ps1）
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { findMetaRoot } from './lib/paths.mjs';

const metaRoot = findMetaRoot();
if (!metaRoot) {
  console.error('❌ Run from VistaRemote Meta-Repo root.');
  process.exit(1);
}

if (process.platform === 'win32') {
  console.log('Windows: 请使用 .\\dev-mvp.ps1（独立窗口，避免端口与进程问题）\n');
  const psArgs = ['-ExecutionPolicy', 'Bypass', '-File', join(metaRoot, 'dev-mvp.ps1')];
  if (process.argv.includes('--with-desktop')) psArgs.push('-WithDesktop');
  const ps = spawnSync('powershell', psArgs, { stdio: 'inherit', cwd: metaRoot });
  process.exit(ps.status ?? 1);
}

const withDesktop = process.argv.includes('--with-desktop');
const pnpm = 'pnpm';

console.log('🚀 VistaRemote MVP dev\n');
run('node', [join(metaRoot, 'tooling/scripts/apply-env.mjs'), 'local']);

const sharedDir = join(metaRoot, 'shared');
if (existsSync(join(sharedDir, 'package.json'))) {
  spawnSync(pnpm, ['build'], {
    cwd: sharedDir,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' },
  });
}

for (const dir of ['server', 'web', ...(withDesktop ? ['desktop'] : [])]) {
  const cwd = join(metaRoot, dir);
  if (!existsSync(join(cwd, 'package.json'))) continue;
  spawnSync(pnpm, ['install'], {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' },
  });
}

const children = [];
const stopAll = () => {
  for (const c of children) {
    try {
      c.kill('SIGTERM');
    } catch {
      /* ignore */
    }
  }
};
process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});

async function waitForHealth(maxSec = 45) {
  for (let i = 0; i < maxSec; i++) {
    try {
      const res = await fetch('http://localhost:3000/health');
      if (res.ok) {
        const body = await res.json();
        if (body.status === 'ok') return true;
      }
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

start('server', join(metaRoot, 'server'), [pnpm, 'start:dev']);
console.log('⏳ 等待 http://localhost:3000/health …');
if (!(await waitForHealth())) {
  console.error('❌ Server 未在 45s 内就绪');
  stopAll();
  process.exit(1);
}
console.log('✅ Server 就绪');

start('web-client', join(metaRoot, 'web'), [pnpm, 'dev:client']);

console.log(`
  API    http://localhost:3000/health
  Web    http://localhost:5173/pairing
  Ctrl+C 结束
`);

await new Promise(() => {});

function start(name, cwd, [cmd, ...args]) {
  console.log(`▶ ${name}`);
  const child = spawn(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development', FORCE_COLOR: '1' },
  });
  child.on('exit', (code) => {
    if (code) console.error(`✖ ${name} exited ${code}`);
  });
  children.push(child);
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: metaRoot, stdio: 'inherit', shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
