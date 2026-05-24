/**
 * Pin @vistaremote/shared to a registry SemVer in all consumer package.json files.
 * Usage (from Meta-Repo root):
 *   node tooling/scripts/pin-shared-version.mjs 0.2.0
 *   node tooling/scripts/pin-shared-version.mjs 0.2.0 server web
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const metaRoot = join(__dirname, '..', '..');

const DEFAULT_CONSUMERS = {
  server: ['package.json'],
  ai: ['package.json'],
  desktop: ['package.json'],
  mobile: ['package.json'],
  web: ['apps/client/package.json', 'apps/admin/package.json'],
};

const SHARED_PKG = '@vistaremote/shared';
const FILE_PREFIXES = ['file:', 'link:', 'workspace:'];

function pinInFile(filePath, version) {
  if (!existsSync(filePath)) return false;
  const raw = readFileSync(filePath, 'utf8');
  const pkg = JSON.parse(raw);
  let changed = false;

  const visit = (obj) => {
    if (!obj?.dependencies?.[SHARED_PKG]) return;
    const cur = obj.dependencies[SHARED_PKG];
    if (typeof cur === 'string' && FILE_PREFIXES.some((p) => cur.startsWith(p))) {
      obj.dependencies[SHARED_PKG] = `^${version}`;
      changed = true;
    }
  };

  visit(pkg);
  if (pkg.dependencies?.[SHARED_PKG] && !changed) {
    const cur = pkg.dependencies[SHARED_PKG];
    if (cur !== `^${version}`) {
      pkg.dependencies[SHARED_PKG] = `^${version}`;
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(filePath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
    console.log(`  updated ${filePath}`);
  }
  return changed;
}

function main() {
  const args = process.argv.slice(2);
  const version = args.find((a) => /^\d+\.\d+\.\d+/.test(a));
  if (!version) {
    console.error('Usage: node pin-shared-version.mjs <semver> [repo ...]');
    process.exit(1);
  }
  const clean = version.replace(/^v/, '');
  const repos = args.filter((a) => a !== version && !a.startsWith('v'));
  const targets = repos.length ? Object.fromEntries(repos.map((r) => [r, DEFAULT_CONSUMERS[r] ?? ['package.json']])) : DEFAULT_CONSUMERS;

  let total = 0;
  for (const [repo, files] of Object.entries(targets)) {
    if (!DEFAULT_CONSUMERS[repo] && !repos.includes(repo)) {
      console.warn(`skip unknown repo: ${repo}`);
      continue;
    }
    const base = join(metaRoot, repo);
    if (!existsSync(base)) {
      console.warn(`skip missing: ${repo}`);
      continue;
    }
    console.log(`[${repo}]`);
    for (const rel of files) {
      if (pinInFile(join(base, rel), clean)) total++;
    }
  }

  console.log(`\nDone. ${total} file(s) pinned to ^${clean}. Run pnpm install in each consumer.`);
}

main();
