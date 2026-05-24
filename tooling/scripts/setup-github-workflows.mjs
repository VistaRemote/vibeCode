/**
 * Sync GitHub Actions workflows & composite actions into sub-repos.
 * Usage: node tooling/scripts/setup-github-workflows.mjs
 *        node tooling/scripts/setup-github-workflows.mjs server web shared
 */
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const metaRoot = join(__dirname, '..', '..');
const tooling = join(metaRoot, 'tooling', 'github');

const ALL_REPOS = ['shared', 'server', 'web', 'ai', 'desktop', 'mobile', 'docs', 'deploy'];

const CONSUMERS = ['server', 'web', 'ai', 'desktop', 'mobile'];
const CONSUMER_CI = ['server', 'web', 'ai', 'desktop', 'mobile'];

function copyFile(src, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  console.log(`  ${dest.replace(metaRoot + '/', '')}`);
}

function patchCiForShared(ciPath, consumer) {
  if (!existsSync(ciPath)) return;
  let yml = readFileSync(ciPath, 'utf8');
  if (yml.includes('setup-shared')) return;

  const setupBlock = `      - name: Setup @vistaremote/shared (CI layout)
        uses: ./.github/actions/setup-shared
        with:
          consumer: ${consumer}
          shared-ref: \${{ github.event.pull_request.head.repo.full_name == 'VistaRemote/shared' && github.head_ref || 'main' }}

`;

  const anchor = '      - uses: actions/checkout@v4\n';
  if (!yml.includes(anchor)) {
    console.warn(`  skip patch (no checkout anchor): ${ciPath}`);
    return;
  }

  yml = yml.replace(
    /(  quality:\n    name:.*\n    runs-on: ubuntu-latest\n    steps:\n)(      - uses: actions\/checkout@v4\n)/,
    `$1${setupBlock}$2`,
  );

  yml = yml.replace(
    /(      - uses: actions\/setup-node@v4\n        with:\n          node-version: '22\.12'\n          cache: pnpm\n)(\n      - run: pnpm install)/g,
    `$1\n      - name: Install & verify\n        working-directory: \${{ steps.shared.outputs.consumer-path }}\n        env:\n          SHARED_CI: '1'$2`,
  );

  if (!yml.includes('id: shared')) {
    yml = yml.replace(
      '        uses: ./.github/actions/setup-shared\n',
      '        id: shared\n        uses: ./.github/actions/setup-shared\n',
    );
  }

  writeFileSync(ciPath, yml, 'utf8');
  console.log(`  patched ci.yml for ${consumer}`);
}

function syncConsumer(repo) {
  const gh = join(metaRoot, repo, '.github');
  copyFile(
    join(tooling, 'actions', 'setup-shared', 'action.yml'),
    join(gh, 'actions', 'setup-shared', 'action.yml'),
  );
  copyFile(join(tooling, 'workflows', 'sync-shared.yml'), join(gh, 'workflows', 'sync-shared.yml'));
  patchCiForShared(join(gh, 'workflows', 'ci.yml'), repo);
}

function main() {
  const args = process.argv.slice(2);
  const repos = args.length ? args.filter((r) => ALL_REPOS.includes(r)) : ALL_REPOS;

  for (const repo of repos) {
    const base = join(metaRoot, repo);
    if (!existsSync(base)) {
      console.warn(`skip missing: ${repo}`);
      continue;
    }
    console.log(`\n[${repo}]`);

    if (repo === 'shared') {
      copyFile(join(tooling, 'workflows', 'release-shared.yml'), join(base, '.github', 'workflows', 'release.yml'));
      continue;
    }

    if (CONSUMERS.includes(repo)) {
      syncConsumer(repo);
      const npmrcTpl = join(metaRoot, 'tooling', 'templates', 'npmrc.github-packages');
      const npmrcDest = join(base, '.npmrc.example');
      if (existsSync(npmrcTpl) && !existsSync(npmrcDest)) {
        copyFile(npmrcTpl, npmrcDest);
      }
    }

    if (repo === 'server' || repo === 'ai') {
      copyFile(
        join(tooling, 'workflows', 'release-service-docker.yml'),
        join(base, '.github', 'workflows', 'release.yml'),
      );
    }

    if (repo === 'web') {
      copyFile(join(tooling, 'workflows', 'release-web-static.yml'), join(base, '.github', 'workflows', 'release.yml'));
    }

    if (repo === 'docs') {
      const releaseDocs = `name: Release docs site

on:
  push:
    tags:
      - 'docs-v*'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '22.12'
          cache: pnpm
      - run: pnpm install --frozen-lockfile && pnpm build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: doc_build
      - uses: actions/deploy-pages@v4
        id: deployment
`;
      const dest = join(base, '.github', 'workflows', 'release.yml');
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, releaseDocs, 'utf8');
      console.log(`  ${dest.replace(metaRoot + '/', '')}`);
    }
  }

  console.log('\nDone. Set org secret VISTAREMOTE_CI_PAT on VistaRemote/shared for cross-repo dispatch.');
}

main();
