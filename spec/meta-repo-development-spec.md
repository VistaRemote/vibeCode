# Meta-Repo 独立开发、发布与 Biome 分层 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-META-DEV-001` |
| **版本** | 1.0.0 |
| **关联** | [engineering-standards-spec.md](./engineering-standards-spec.md) |

---

## 1. 核心结论（先读）

| 问题 | 答案 |
| :--- | :--- |
| web / mobile 如何单独开发？ | 进入 **各自 Git 仓库目录**，独立 `pnpm install` / `pnpm dev`，在 **该仓库** 提交与开 PR |
| 如何单独发布？ | **每个子仓库独立版本与流水线**（npm 包、Docker 镜像、静态站、安装包），无「整个 Meta-Repo 打一个包」 |
| 每个子项目都要 `biome.json` 吗？ | **是**。每个含 TS/JS 的仓库根目录要有，且 **在仓库内** 跑 `pnpm lint` |
| Meta-Repo 根要 `biome.json` 吗？ | **要，但只管脚手架**（`tooling/`、`.github/`、`package.json` 等），**不**替代子仓库检查 |
| 前后端风格差异？ | **共享基线** `tooling/biome.json` + **端专属** `biome.server.json` / `biome.web.json` / `biome.mobile.json` |

---

## 2. 为什么 Meta-Repo 根 `pnpm check` 扫不到 web/mobile？

Meta-Repo `.gitignore` 忽略了 `/web/`、`/server/` 等（它们是 **独立 Git 仓库**）。

Biome 开启 `vcs.useIgnoreFile` 后，在根目录执行 `pnpm check` **不会**检查已 clone 的子目录代码。

因此：

```text
Meta-Repo 根 pnpm check  →  仅 Meta 自有文件（规范、CI、tooling）
web/ 内 pnpm lint        →  仅 Web 仓库
mobile/ 内 pnpm lint     →  仅 Mobile 仓库
```

---

## 3. 单独开发流程

### 3.1 首次（全栈联调）

```bash
git clone <meta-repo>
cd vista-remote
./init.sh                    # 拉齐 server、web、mobile、shared…
./dev.sh                     # 一键：local 环境 + Docker + pnpm install + build shared
# 用 vista-remote.code-workspace 打开
```

多环境 API：见 [developer-experience-spec.md](./developer-experience-spec.md)（`pnpm env:dev` 等）。

### 3.2 只开发 Web

```bash
cd web
pnpm install
pnpm dev                     # 通常 apps/client 或根脚本转发
# 改代码、pnpm lint、git commit、git push → VistaRemote/web 远端
```

**不需要**在 Meta-Repo 根提交业务代码（根仓库通常无 web 源码的 Git 记录）。

### 3.3 只开发 Mobile

```bash
cd mobile
pnpm install
pnpm start                   # Metro
pnpm lint
git push → VistaRemote/mobile
```

### 3.4 只开发 Server

```bash
cd server
pnpm install
pnpm dev
pnpm lint
git push → VistaRemote/server
```

### 3.5 跨端功能（如改 shared + server + web）

1. 各仓库建 **同名分支** `feat/xxx`
2. 先 **shared** PR 合并并发包（若用 npm link / 版本号）
3. 再 **server**、**web** 分别 PR，CI 各自通过

---

## 4. 单独发布（各仓库）

| 仓库 | 产物 | 版本 | 发布方式（示例） |
| :--- | :--- | :--- | :--- |
| **shared** | `@vistaremote/shared` npm 包 | SemVer tag | GitHub Packages / npm |
| **server** | Docker 镜像 / 二进制 | 与 server tag 一致 | CI build → registry |
| **web** | `client` / `admin` 静态资源 | 随 web tag 或 deploy 仓 compose 引用 | CI → OSS/CDN |
| **mobile** | iOS / Android 包 | app version | Fastlane / 商店 |
| **desktop** | exe / dmg | electron version | GitHub Releases |
| **docs** | 静态文档站 | docs tag | CI → Pages |
| **deploy** | Compose / Helm | 组合各镜像 digest 或 tag | 维护者发版说明 |
| **ai** | Worker 镜像 | 独立 tag | 同 server |
| **Meta-Repo** | 无运行时产物 | 仅规范版本 | 文档与 init 脚本，不部署 |

**deploy 仓库** 通过镜像 tag / 环境变量 **组合** 各服务版本，实现「一次部署一套系统」，但 **构建仍分仓库**。

---

## 5. Biome 分层配置

```text
tooling/
├── biome.json              # 全生态基线（引号、分号、缩进、通用 TS 规则）
├── biome.server.json       # NestJS：测试文件放宽 any 等
├── biome.web.json          # React + Rsbuild + SCSS 模块
├── biome.mobile.json       # RN：排除 android/ios 构建目录
└── biome.desktop.json      # extends web + Electron 产物排除

Meta-Repo 根/
└── biome.json              # extends 基线，仅服务脚手架文件

server/biome.json           # extends ../tooling/biome.server.json
web/biome.json              # extends ../tooling/biome.web.json
mobile/biome.json           # extends ../tooling/biome.mobile.json
```

### 5.1 子仓库 `biome.json` 模板（在 Meta-Repo 内开发）

**server/biome.json**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.15/schema.json",
  "extends": ["../tooling/biome.server.json"]
}
```

**web/biome.json**

```json
{
  "extends": ["../tooling/biome.web.json"]
}
```

**mobile/biome.json**

```json
{
  "extends": ["../tooling/biome.mobile.json"]
}
```

### 5.2 单独 clone 子仓库时（无 Meta 父目录）

子仓库 **独立 Git** 中应提交自己的 `biome.json`（不要依赖 `../tooling` 相对路径）。任选其一：

1. 将 `tooling/biome.web.json` 与 `tooling/biome.json` **合并**为单文件 `biome.json` 提交到 web 仓库；或  
2. 发布内部包 `@vistaremote/biome-config`（P1）：`extends: ["@vistaremote/biome-config/web"]`；或  
3. 团队统一 clone Meta-Repo，始终在子目录 `cd web && pnpm lint`（推荐）。

> Meta 根 `biome.json` 已通过 `files.includes` 排除 `web/`、`server/` 等目录，避免与子仓配置冲突。

### 5.3 子仓库 IDE 配置（Cursor / EditorConfig / VS Code）

各子仓库应包含（已用脚本同步，源文件在 `tooling/`）：

| 文件 | 说明 |
| :--- | :--- |
| `.editorconfig` | 缩进、换行（与 Biome 一致） |
| `.vscode/extensions.json` | 推荐 Biome、EditorConfig |
| `.vscode/settings.json` | 保存时 Biome 格式化 |
| `.cursor/rules/*.mdc` | 核心约定 + 仓专属规则（如 `nestjs-server.mdc`） |
| `AGENTS.md` | 本仓 AI 协作说明 |

Meta-Repo 内更新模板后执行：

```bash
node tooling/scripts/setup-ide-config.mjs
# 或指定仓库：node tooling/scripts/setup-ide-config.mjs server web
```

单独 clone 子仓库时，上述文件应 **提交到该仓库 Git**（不依赖 `../tooling`）。

### 5.4 Meta-Repo 根 `biome.json` 职责

| 检查对象 | 是否 |
| :--- | :--- |
| `tooling/*.json` | ✅ |
| `package.json`、`.github/` | ✅ |
| `spec/*.md` | ❌（排除 MD，用 `format:docs`） |
| `web/`、`mobile/` 源码 | ❌（被 gitignore，且应在子仓 lint） |

---

## 6. CI / Hooks 约定

### 6.1 Git Hooks（各子仓库）

| 钩子 | 行为 |
| :--- | :--- |
| `pre-commit` | `biome check --staged` + `pnpm test`（Rstest） |
| `commit-msg` | commitlint（Conventional Commits） |

通过 `package.json` → `"prepare": "node ../tooling/scripts/setup-husky.mjs"` 安装。详见 [tooling/README.md](../tooling/README.md)。

### 6.2 CI（各子仓库）

```yaml
# quality: setup-shared → lint → test → build
# security-audit: pnpm audit --audit-level=high
# codeql: javascript-typescript（有 TS 构建的仓库）
# dependency-review: PR 依赖变更审查
# sync-shared: repository_dispatch 自动 bump @vistaremote/shared
# release: tag 触发（见 cicd-release-spec.md）
```

| 仓库 | 附加流水线 |
| :--- | :--- |
| **shared** | `release.yml`（tag `v*` → GitHub Packages + 通知消费者） |
| **server** | `perf.yml`（k6）；`release.yml`（`server-v*` → GHCR） |
| **web** | `e2e.yml`；`release.yml`（`web-v*` 静态 artifact） |
| **ai** | `release.yml`（`ai-v*` → GHCR） |
| **docs** | `release.yml`（`docs-v*` → GitHub Pages） |

依赖 `@vistaremote/shared` 的仓在 CI 中使用 composite action **`setup-shared`**（兄弟目录布局，兼容本地 `file:../shared`）。

**发布流程**详见 [cicd-release-spec.md](./cicd-release-spec.md)。同步 workflow 模板：

```bash
node tooling/scripts/setup-github-workflows.mjs
```

Meta-Repo CI **仅** 脚手架 `biome check` + audit，不替代子仓。

---

## 7. Node.js 版本

| 项 | 约定 |
| :--- | :--- |
| 最低版本 | **24.x**（`package.json#engines`: `>=24.0.0`） |
| 推荐版本 | **24.11 LTS**（各仓 `.nvmrc`、CI `node-version: 24.11`） |
| 生产 / Docker | `node:24-alpine` 或等价镜像（见 deploy-spec） |

---

## 8. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 独立开发/发布说明；Biome 分层 |
