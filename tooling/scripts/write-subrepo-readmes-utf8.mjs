#!/usr/bin/env node
/**
 * Copy full UTF-8 README templates into subrepos.
 * Run from Meta-Repo root: node tooling/scripts/write-subrepo-readmes-utf8.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const tplDir = path.join(root, 'tooling/templates/subrepo');

const map = {
  server: 'README.server.md',
  web: 'README.web.md',
  mobile: 'README.mobile.md',
  desktop: 'README.desktop.md',
  shared: 'README.shared.md',
  ai: 'README.ai.md',
  deploy: 'README.deploy.md',
  docs: 'README.docs.md',
};

for (const [repo, tpl] of Object.entries(map)) {
  const src = path.join(tplDir, tpl);
  const dest = path.join(root, repo, 'README.md');
  if (!fs.existsSync(src) || !fs.existsSync(path.dirname(dest))) {
    console.warn('skip', repo);
    continue;
  }
  fs.copyFileSync(src, dest);
  const ok = /[\u4e00-\u9fff]/.test(fs.readFileSync(dest, 'utf8'));
  console.log('wrote', repo, ok ? 'utf8-ok' : 'WARN-no-cjk');
}
