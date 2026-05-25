#!/usr/bin/env node
/**
 * AI PR Review 辅助：组装审查上下文；可选调用 LLM API。
 * 未配置 AI_REVIEW_API_KEY 时仅打印审查清单路径（workflow 不失败）。
 *
 * Usage:
 *   node tooling/scripts/ai-pr-review.mjs --prompt prompts/code-review.prompt.md
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const promptRel = arg('--prompt', 'prompts/code-review.prompt.md');
const promptPath = resolve(root, promptRel);

if (!existsSync(promptPath)) {
  console.error(`Prompt not found: ${promptPath}`);
  process.exit(1);
}

const prompt = readFileSync(promptPath, 'utf8');
const prTitle = process.env.PR_TITLE ?? '(local)';
const prBody = process.env.PR_BODY ?? '';
const changedFiles = process.env.CHANGED_FILES ?? '';

console.log('--- VistaRemote AI Review Context ---');
console.log(`Prompt: ${promptRel}`);
console.log(`PR: ${prTitle}`);
console.log('--- Prompt (excerpt) ---');
console.log(`${prompt.slice(0, 800)}...\n`);

if (!process.env.AI_REVIEW_API_KEY) {
  console.log(
    'ℹ️  AI_REVIEW_API_KEY not set — skipping LLM call. Post review manually using prompts/.\n',
  );
  process.exit(0);
}

// Extension point: wire OpenAI-compatible API using prompt + prBody + changedFiles
console.log(
  'ℹ️  LLM integration stub: configure provider in ai-pr-review.mjs when ready.\n',
);
process.exit(0);
