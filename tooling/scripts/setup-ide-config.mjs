/**
 * Sync EditorConfig, VS Code, Cursor rules, AGENTS.md into sub-repos (Meta-Repo layout).
 * Usage: node tooling/scripts/setup-ide-config.mjs
 *        node tooling/scripts/setup-ide-config.mjs server web
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const metaRoot = join(__dirname, '..', '..');
const toolingDir = join(metaRoot, 'tooling');
const cursorDir = join(toolingDir, 'cursor');
const templatesDir = join(toolingDir, 'templates');

const REPO_RULES = {
  shared: ['vista-remote-core', 'typescript-biome', 'shared-protocol'],
  server: ['vista-remote-core', 'typescript-biome', 'nestjs-server'],
  ai: ['vista-remote-core', 'typescript-biome', 'ai-worker'],
  web: ['vista-remote-core', 'typescript-biome', 'react-rspack'],
  desktop: ['vista-remote-core', 'typescript-biome', 'electron-desktop'],
  mobile: ['vista-remote-core', 'typescript-biome', 'mobile-rn'],
  docs: ['vista-remote-core', 'typescript-biome', 'docs-rspress'],
  deploy: ['vista-remote-core', 'deploy-infra'],
};

const REPO_AGENTS = {
  shared: {
    name: '@vistaremote/shared',
    spec: 'spec/SPEC.md · Meta `spec/shared-spec.md`',
    cmds: '`pnpm build` · `pnpm test` · `pnpm lint`',
  },
  server: {
    name: '@vistaremote/server',
    spec: 'spec/SPEC.md · Meta `spec/server-spec.md`',
    cmds: '`pnpm start:dev` · `pnpm test` · `pnpm lint`',
  },
  ai: {
    name: '@vistaremote/ai',
    spec: 'spec/SPEC.md · Meta `spec/ai-behavior-architecture-spec.md`',
    cmds: '`pnpm start:dev` · `pnpm test` · Ollama via `deploy/compose`',
  },
  web: {
    name: '@vistaremote/web',
    spec: 'spec/SPEC.md · web-client / web-admin Spec',
    cmds: '`pnpm dev:client` · `pnpm dev:admin` · `pnpm test`',
  },
  desktop: {
    name: '@vistaremote/desktop',
    spec: 'spec/SPEC.md · Meta `spec/desktop-spec.md`',
    cmds: '`pnpm dev` · `pnpm test` · `electron/edge-ai/`',
  },
  mobile: {
    name: '@vistaremote/mobile',
    spec: 'spec/SPEC.md · Meta `spec/mobile-spec.md`',
    cmds: '`pnpm start` · `pnpm test`',
  },
  docs: {
    name: '@vistaremote/docs',
    spec: 'Meta `spec/docs-spec.md`',
    cmds: '`pnpm dev` · `pnpm build`',
  },
  deploy: {
    name: '@vistaremote/deploy',
    spec: 'spec/SPEC.md · Meta `spec/deploy-spec.md`',
    cmds: '`docker compose -f compose/docker-compose.dev.yml up`',
  },
};

function writeAgents(repoKey, repoPath) {
  const info = REPO_AGENTS[repoKey];
  const content = `# ${info.name} — Agent 协作说明

面向 Cursor 等 AI 协作者。人类开发者见 Meta-Repo [CONTRIBUTING.md](../CONTRIBUTING.md)（若在 Meta 内开发）。

## 本仓库

| 项 | 说明 |
| :--- | :--- |
| Spec | ${info.spec} |
| 常用命令 | ${info.cmds} |
| 格式化 | Biome — \`pnpm lint\` |
| 测试 | Rstest — \`pnpm test\` |
| Node | ≥ 24（\`.nvmrc\` → 24.11 LTS） |

## 硬约束

- 跨端契约只改 **shared**，再改本仓。
- 遵循 [.cursor/rules/](./.cursor/rules/) 与 Meta \`spec/\`。
- 提交：Conventional Commits（Husky commitlint）。

## Meta-Repo 全览

克隆父仓库时使用 \`vista-remote.code-workspace\` 多根工作区。
`;
  writeFileSync(join(repoPath, 'AGENTS.md'), content, 'utf8');
}

function syncRepo(repoKey) {
  const repoPath = join(metaRoot, repoKey);
  if (!existsSync(repoPath)) {
    console.warn(`skip ${repoKey}: directory missing`);
    return;
  }

  copyFileSync(
    join(templatesDir, 'editorconfig'),
    join(repoPath, '.editorconfig'),
  );

  mkdirSync(join(repoPath, '.vscode'), { recursive: true });
  copyFileSync(
    join(templatesDir, 'vscode', 'extensions.json'),
    join(repoPath, '.vscode', 'extensions.json'),
  );
  copyFileSync(
    join(templatesDir, 'vscode', 'settings.json'),
    join(repoPath, '.vscode', 'settings.json'),
  );

  const rulesDir = join(repoPath, '.cursor', 'rules');
  mkdirSync(rulesDir, { recursive: true });

  for (const rule of REPO_RULES[repoKey]) {
    const src = join(cursorDir, `${rule}.mdc`);
    const dest = join(rulesDir, `${rule}.mdc`);
    copyFileSync(src, dest);
  }

  writeAgents(repoKey, repoPath);
  console.log(`synced IDE config → ${repoKey}/`);
}

const args = process.argv.slice(2);
const targets = args.length > 0 ? args : Object.keys(REPO_RULES);

for (const key of targets) {
  if (!REPO_RULES[key]) {
    console.warn(`unknown repo: ${key}`);
    continue;
  }
  syncRepo(key);
}
