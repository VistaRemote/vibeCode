# 共享工程工具配置

## Biome 分层（必读）

| 文件 | 用途 |
| :--- | :--- |
| [`biome.json`](./biome.json) | **全生态基线**（缩进、引号、通用 TS 规则） |
| [`biome.server.json`](./biome.server.json) | NestJS / server |
| [`biome.web.json`](./biome.web.json) | React + Rsbuild（web） |
| [`biome.mobile.json`](./biome.mobile.json) | React Native（排除 android/ios） |
| [`biome.desktop.json`](./biome.desktop.json) | Electron（extends web） |

**每个子仓库** 根目录要有自己的 `biome.json`，`extends` 对应上表（在 Meta-Repo 内用相对路径 `../tooling/...`）。

Meta-Repo **根目录** `biome.json` 只检查脚手架（`tooling`、`.github` 等），**不**检查 `web/`、`mobile/` 业务代码（见 [meta-repo-development-spec.md](../spec/meta-repo-development-spec.md)）。

---

## Git Hooks（Husky）

各 **子仓库独立** Git，提交前在 **该仓库** 执行：

1. `biome check --staged`（仅暂存文件）
2. `pnpm test`（Rstest 单测）

提交信息由 **commitlint**（Conventional Commits）校验。

### 启用方式（Meta-Repo 内 clone）

子仓库 `package.json` 已配置：

```json
"prepare": "node ../tooling/scripts/setup-husky.mjs"
```

首次或更新依赖后：

```bash
cd server   # 或 web、shared…
pnpm install
```

将生成 `.husky/pre-commit`、`.husky/commit-msg`（带 `@vistaremote/husky` 标记，可安全覆盖）。

共享脚本：[`husky/pre-commit.sh`](./husky/pre-commit.sh)、[`scripts/setup-husky.mjs`](./scripts/setup-husky.mjs)。

**单独 clone 子仓库**（无 `../tooling`）时：将 `tooling/husky` 与 `commitlint.config.cjs` 合并进该仓，或发布 `@vistaremote/tooling`（P1）。

---

## CI / 安全 / 性能 / 发布

| 能力 | 位置 |
| :--- | :--- |
| 质量门禁 | 各仓 `ci.yml`：`setup-shared` → lint → test → build |
| shared 发布 | `shared/.github/workflows/release.yml`（tag `v*`） |
| 下游同步 | 消费者 `sync-shared.yml`（`repository_dispatch`） |
| 服务发版 | `server`/`ai` `release.yml`（Docker → GHCR） |
| 依赖审计 | `pnpm audit --audit-level=high` |
| PR 依赖审查 | `.github/workflows/dependency-review.yml` |
| 静态安全分析 | CodeQL（`javascript-typescript`） |
| Web E2E | `web/.github/workflows/e2e.yml`（Playwright） |
| Server 性能 | `server/perf/k6/` + `.github/workflows/perf.yml`（k6） |

规范：[spec/cicd-release-spec.md](../spec/cicd-release-spec.md)。

```bash
# 同步 workflow / composite action 到各子仓
node tooling/scripts/setup-github-workflows.mjs

# 手动 pin shared 版本（发版后）
node tooling/scripts/pin-shared-version.mjs 0.2.0

# 恢复本地 file: 依赖（Meta 联调）
node tooling/scripts/restore-shared-file-deps.mjs
```

模板：[`github/workflows/ci-node.yml`](./github/workflows/ci-node.yml)、[`github/actions/setup-shared`](./github/actions/setup-shared)。

### Server k6

```bash
cd server
pnpm build && pnpm start:prod   # 另开终端
pnpm test:perf                  # 需本机安装 k6
```

---

## IDE 配置（Cursor / VS Code / EditorConfig）

| 路径 | 说明 |
| :--- | :--- |
| `tooling/cursor/*.mdc` | Cursor Rules 模板（按仓库类型组合） |
| `tooling/templates/` | EditorConfig、VS Code 设置模板 |
| `tooling/scripts/setup-ide-config.mjs` | 同步到各子仓库 |

```bash
# Meta-Repo 根目录
node tooling/scripts/setup-ide-config.mjs
```

各子仓库将获得：`.editorconfig`、`.vscode/`、`.cursor/rules/`、`AGENTS.md`。

---

## Node.js

| 项 | 值 |
| :--- | :--- |
| `engines` | `>=22.0.0` |
| `.nvmrc` | `22.12.0`（Rspack/Rstest 推荐） |
| CI | `node-version: 22.12` |

各仓 `.npmrc` 可启用 `engine-strict=true`，在错误 Node 版本下阻断 `pnpm install`。

---

## package.json 脚本（每个子仓库）

```json
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "test": "rstest",
    "prepare": "node ../tooling/scripts/setup-husky.mjs"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.4.15",
    "@commitlint/cli": "^19.8.0",
    "@commitlint/config-conventional": "^19.8.0",
    "husky": "^9.1.7"
  }
}
```

`commitlint.config.cjs`：

```js
module.exports = require('../tooling/commitlint.config.subrepo.cjs');
```

---

## 子仓库 biome.json 模板

见上文各端 `extends` 路径；完整说明见 [meta-repo-development-spec.md](../spec/meta-repo-development-spec.md)。
