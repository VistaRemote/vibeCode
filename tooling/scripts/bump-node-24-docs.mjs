#!/usr/bin/env node
/** One-off: align docs to Node 24 (UTF-8 safe). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const replacements = [
  ['>=22.0.0', '>=24.0.0'],
  ['≥ 22.0.0', '≥ 24.0.0'],
  ['**≥ 22.0.0**', '**≥ 24.0.0**'],
  ['**≥ 22**', '**≥ 24**'],
  ['≥ 22（', '≥ 24（'],
  ['≥ 22.', '≥ 24.'],
  ['Node.js ≥ 22', 'Node.js ≥ 24'],
  ['Node.js 22+', 'Node.js 24+'],
  ['22.12 LTS', '24.11 LTS'],
  ['22.12.0', '24.11.0'],
  ['22.12+', '24.11+'],
  ['22.x', '24.x'],
  ["node-version: '22.12'", "node-version: '24.11'"],
  ['node-version: 22.12', 'node-version: 24.11'],
  ['node:22-alpine', 'node:24-alpine'],
  ['Node >= 22.12', 'Node >= 24.11'],
  ['≥ 22.12', '≥ 24.11'],
  ['禁止写 18.x / 20.x', '禁止写 18.x / 20.x / 22.x'],
  ['Node.js ≥ 22**', 'Node.js ≥ 24**'],
];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(p);
      continue;
    }
    if (!/\.(md|mdx|yml|mjs|sh|ps1|mdc)$/u.test(ent.name) && !ent.name.startsWith('Dockerfile')) {
      continue;
    }
    if (p.includes('bump-node-24-docs.mjs')) continue;
    let text = fs.readFileSync(p, 'utf8');
    const orig = text;
    for (const [from, to] of replacements) {
      text = text.split(from).join(to);
    }
    if (text !== orig) {
      fs.writeFileSync(p, text, 'utf8');
      console.log(path.relative(root, p));
    }
  }
}

walk(root);
console.log('done');
