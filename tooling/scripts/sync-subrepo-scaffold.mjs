#!/usr/bin/env node
/**
 * 同步子仓库标准脚手架：LICENSE、CODE_OF_CONDUCT、SECURITY、CHANGELOG（若缺失）。
 * Usage: node tooling/scripts/sync-subrepo-scaffold.mjs [--force]
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const force = process.argv.includes('--force');

const REPOS = [
  'shared',
  'server',
  'web',
  'desktop',
  'mobile',
  'ai',
  'docs',
  'deploy',
];

const SCOPE = {
  shared: '协议类型、Zod Schema、错误码、计费与插件 Manifest 契约。',
  server: 'NestJS 信令、REST API、Admin、计费与配对服务。',
  web: 'Rsbuild Web 用户端与管理台（React + antd）。',
  desktop: 'Electron Agent：采集、编码、录制缓冲、本地 AI 钩子。',
  mobile: 'React Native 移动端主控与 WebRTC 客户端。',
  ai: 'BullMQ AI Worker、LLM 客户端、python-worker 编排。',
  docs: 'Rspress 文档站（用户指南与开发者手册）。',
  deploy: 'Docker Compose、mediasoup-controller、coturn 部署清单。',
};

function syncFile(repo, name, src) {
  const dest = resolve(root, repo, name);
  if (existsSync(dest) && !force) return false;
  copyFileSync(src, dest);
  return true;
}

let updated = 0;
for (const repo of REPOS) {
  syncFile(repo, 'LICENSE', resolve(root, 'LICENSE'));
  syncFile(repo, 'CODE_OF_CONDUCT.md', resolve(root, 'CODE_OF_CONDUCT.md'));

  const secTpl = readFileSync(
    resolve(root, 'tooling/templates/subrepo/SECURITY.md'),
    'utf8',
  ).replace('<!-- REPO_SCOPE -->', SCOPE[repo] ?? '');
  const secPath = resolve(root, repo, 'SECURITY.md');
  if (!existsSync(secPath) || force) {
    writeFileSync(secPath, secTpl);
    updated++;
  }

  const clPath = resolve(root, repo, 'CHANGELOG.md');
  if (!existsSync(clPath) || force) {
    copyFileSync(
      resolve(root, 'tooling/templates/subrepo/CHANGELOG.md'),
      clPath,
    );
    updated++;
  }
}

console.log(`sync-subrepo-scaffold: ${REPOS.length} repos processed, ${updated} file(s) written/updated.`);
