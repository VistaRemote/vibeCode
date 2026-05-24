/**
 * Restore file:../shared (or web apps path) for Meta-Repo local development.
 * Usage: node tooling/scripts/restore-shared-file-deps.mjs
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const metaRoot = join(__dirname, '..', '..');

const TARGETS = [
  ['server', 'package.json', 'file:../shared'],
  ['ai', 'package.json', 'file:../shared'],
  ['desktop', 'package.json', 'file:../shared'],
  ['mobile', 'package.json', 'file:../shared'],
  ['web', 'apps/client/package.json', 'file:../../../shared'],
  ['web', 'apps/admin/package.json', 'file:../../../shared'],
];

const SHARED = '@vistaremote/shared';

for (const [repo, rel, spec] of TARGETS) {
  const filePath = join(metaRoot, repo, rel);
  if (!existsSync(filePath)) continue;
  const pkg = JSON.parse(readFileSync(filePath, 'utf8'));
  if (!pkg.dependencies?.[SHARED]) continue;
  pkg.dependencies[SHARED] = spec;
  writeFileSync(filePath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
  console.log(`restored ${repo}/${rel} → ${spec}`);
}

console.log('Local file: deps restored. Run pnpm install in each consumer.');
