#!/usr/bin/env node
/**
 * 扫描 plan/implementation-plan.md 未勾选条目，供迭代自检与 Meta CI。
 * Usage: node tooling/scripts/check-implementation-plan.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const planPath = resolve(root, 'plan/implementation-plan.md');

const text = readFileSync(planPath, 'utf8');
const unchecked = [];
for (const line of text.split('\n')) {
  if (/^- \[ \]/.test(line)) {
    unchecked.push(line.trim());
  }
}

console.log(`\n📋 Implementation plan: ${planPath}\n`);

if (unchecked.length === 0) {
  console.log('✅ No unchecked items in section 3 (implementation checklist).\n');
  process.exit(0);
}

console.log(`⚠️  ${unchecked.length} unchecked item(s):\n`);
for (const item of unchecked) {
  console.log(`  ${item}`);
}
console.log(
  '\n→ Move unfinished work to §4.1 Technical Debt or next iteration FR.\n',
);
process.exit(unchecked.length > 0 ? 1 : 0);
