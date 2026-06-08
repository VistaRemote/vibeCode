/**
 * Install/update Husky hooks for VistaRemote sub-repos (Meta-Repo layout).
 * Invoked from package.json: "prepare": "node ../tooling/scripts/setup-husky.mjs"
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = process.cwd();
const huskyDir = join(repoRoot, '.husky');
const marker = '# @vistaremote/husky';
const toolingHusky = join(repoRoot, '..', 'tooling', 'husky');
const useSharedScripts = existsSync(join(toolingHusky, 'pre-commit.sh'));

const preCommit = useSharedScripts
  ? `#!/usr/bin/env sh
${marker}
set -e
cd "$(dirname "$0")/.."
sh ../tooling/husky/pre-commit.sh
`
  : `#!/usr/bin/env sh
${marker}
set -e
cd "$(dirname "$0")/.."
pnpm exec biome check --staged --files-ignore-unknown=true --no-errors-on-unmatched
pnpm test
`;

const commitMsg = `#!/usr/bin/env sh
${marker}
set -e
cd "$(dirname "$0")/.."
pnpm exec commitlint --edit "$1"
`;

mkdirSync(huskyDir, { recursive: true });

function writeHook(name, content) {
  const file = join(huskyDir, name);
  if (existsSync(file)) {
    const current = readFileSync(file, 'utf8');
    if (!current.includes(marker)) {
      return;
    }
  }
  writeFileSync(file, content, { mode: 0o755 });
  try {
    chmodSync(file, 0o755);
  } catch {
    /* Windows */
  }
}

writeHook('pre-commit', preCommit);
writeHook('commit-msg', commitMsg);
