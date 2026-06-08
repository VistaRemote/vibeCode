#!/usr/bin/env node
/**
 * Run a command with env vars from a profile (without writing .env files).
 *   node tooling/scripts/run-with-env.mjs local -- pnpm --dir server start:dev
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { envFilePath, findMetaRoot } from './lib/paths.mjs';

const metaRoot = findMetaRoot();
const sep = process.argv.indexOf('--');
const envName = sep > 2 ? process.argv[2] : process.argv[2] ?? 'local';
const cmdArgs = sep >= 0 ? process.argv.slice(sep + 1) : process.argv.slice(3);

if (!cmdArgs.length) {
  console.error('Usage: run-with-env.mjs <local|dev|sit|uat> -- <command...>');
  process.exit(1);
}

const raw = readFileSync(envFilePath(metaRoot, envName), 'utf8');
const env = { ...process.env };
for (const line of raw.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const r = spawnSync(cmdArgs[0], cmdArgs.slice(1), {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});
process.exit(r.status ?? 1);
