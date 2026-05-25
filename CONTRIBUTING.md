# Contributing to VistaRemote

感谢参与 **VibeCode · VistaRemote** 开源协作。本项目为 **Meta-Repo + 多独立 Git 仓库**，请先阅读本指南与 [spec/engineering-standards-spec.md](./spec/engineering-standards-spec.md)。

---

## 快速链接

| 文档 | 说明 |
| :--- | :--- |
| **[DEVELOPMENT.md](./DEVELOPMENT.md)** | **开发入口**（命令、Spec 顺序） |
| [SDD 规范](./spec/spec-driven-development-spec.md) | Spec 先行、FR、PR 义务 |
| [实现状态](./spec/implementation-status.md) | 什么能写、什么是桩 |
| [工程规范 Spec](./spec/engineering-standards-spec.md) | Biome、CI、PR、开源惯例 |
| [Git 协作 Spec](./spec/git-collaboration-spec.md) | 分支、提交、跨库顺序 |
| [CI/CD 与发布 Spec](./spec/cicd-release-spec.md) | shared 发布、下游自动 bump、分仓 tag |
| [Spec 索引](./spec/README.md) | 实现前必读 |
| [文档站](./docs/README.md) | Rspress：`cd docs && pnpm dev` |
| [AGENTS.md](./AGENTS.md) | AI 协作者约定 |
| [ROADMAP.md](./ROADMAP.md) | 里程碑与当前冲刺 |
| [CHANGELOG.md](./CHANGELOG.md) | 版本变更记录 |
| [plan/implementation-plan.md](./plan/implementation-plan.md) | 当前迭代契约与自检 |
| [adr/README.md](./adr/README.md) | 架构决策记录 |
| [prompts/README.md](./prompts/README.md) | 版本化 AI 审查 Prompt |
| [团队协作 Spec](./spec/team-collaboration-spec.md) | 上下文指引与同步节奏 |
| [质量门禁 Spec](./spec/quality-gates-spec.md) | CI + AI Review + Branch Protection |
| [插件架构 Spec](./spec/plugin-architecture-spec.md) | 核心 + 插件生态 |

---

## 1. 环境准备

- **Node.js** ≥ 24（推荐 .nvmrc 中的 **24.11 LTS**，与 Rspack/Rstest 及生产环境一致；见 [ADR-0005](./adr/0005-node-24-lts.md)）
- **pnpm** ≥ 9
- **Git** 2.40+
- 克隆 Meta-Repo 后执行 `./init.sh`（Windows：`.\init.ps1`）拉取子仓库
- **一键本地环境**：`./dev.sh` 或 `pnpm dev:up`（见 [开发者体验 Spec](./spec/developer-experience-spec.md)）
- **切换 API 环境**：`pnpm env:local` | `env:dev` | `env:sit` | `env:uat` 后重启各端 dev 进程

### IDE（必做）

使用 **`vista-remote.code-workspace`** 打开多根工作区，否则只能看到一个 Git 仓库。

**IntelliJ**：Settings → Version Control → Directory Mappings，并为每个子仓选择 Commit 窗口顶部的 **Repository**。

**合并规则**：`main` 须 **人工 Approve** + CI 绿；AI Code Review 仅建议性评论（见 [quality-gates-spec](./spec/quality-gates-spec.md)）。

安装推荐扩展（Cursor/VS Code 会提示）：

- [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) — 格式化与 Lint
- EditorConfig for VS Code

**各子仓库**（`server/`、`web/`、`ai/` 等）也有独立的：

- `.editorconfig`、`.vscode/settings.json`（保存时 Biome 格式化）
- `.cursor/rules/`（仓专属 Cursor Rules）
- `AGENTS.md`（本仓协作说明）

在 Meta-Repo 根目录同步 IDE 模板：

```bash
node tooling/scripts/setup-ide-config.mjs
```

---

## 2. 代码规范：Biome

我们使用 **[Biome](https://biomejs.dev/)** 统一格式化与静态检查（不用 Prettier + ESLint 双栈）。

```bash
# Meta-Repo 根目录
pnpm install
pnpm check        # 检查
pnpm check:fix    # 检查并自动修复
```

各子仓库（`server`、`web` 等）在引入 `package.json` 后应：

1. 复制 [`tooling/biome.json`](./tooling/biome.json) 为仓库根 `biome.json`（或 extends）
2. 添加脚本：`"lint": "biome check ."`
3. CI 中运行 `pnpm lint`

配置说明见 [tooling/README.md](./tooling/README.md)。

**重要（Meta-Repo）**：在根目录 `pnpm check` **不会**检查 `web/`、`server/` 等子目录业务代码。请到对应子仓库执行 `pnpm lint`。单独开发/发布见 [spec/meta-repo-development-spec.md](./spec/meta-repo-development-spec.md)。

---

## 3. Git 提交规范

采用 [Conventional Commits](https://www.conventionalcommits.org/)：

```text
feat(web): add pairing page form validation
fix(server): correct plan guard for free users
docs(docs): document PR workflow
```

- **跨库功能**：各仓库使用 **相同分支名**
- **改协议**：必须先合并 `shared`，再合 `server` / 客户端

### 提交前检查（子仓库）

在 **业务子仓库**（如 `server/`、`web/`）执行 `pnpm install` 后会安装 Husky：

| 阶段 | 检查 |
| :--- | :--- |
| `pre-commit` | 暂存文件 Biome + **Rstest 单测** |
| `commit-msg` | Conventional Commits（commitlint） |

Meta-Repo 根目录仅校验脚手架与提交信息，**不**跑子仓单测。配置见 [tooling/README.md](./tooling/README.md)。

```bash
cd server && pnpm install   # 生成 .husky
git commit -m "feat(server): add health check"
```

详见 [spec/git-collaboration-spec.md](./spec/git-collaboration-spec.md)。

---

## 4. Pull Request 流程

1. Fork（外协）或在本组织仓库创建分支
2. 确保 `pnpm check` / 子项目 `pnpm lint` 通过
3. 推送并创建 PR，填写 [PR 模板](.github/PULL_REQUEST_TEMPLATE.md)
4. 等待 CI 与 Code Review
5. 维护者 Squash merge 到 `main`

**Review 关注点**：Spec 合规、`shared` 顺序、无密钥、套餐权限、测试说明。

---

## 5. 发布与 CI/CD（多仓）

推荐顺序见 [spec/cicd-release-spec.md](./spec/cicd-release-spec.md)：

1. **`shared`**：合并后打 tag `v0.2.0` → 发布 `@vistaremote/shared` 到 GitHub Packages，并 `repository_dispatch` 通知消费者。
2. **消费者**（server / web / ai / desktop / mobile）：`sync-shared.yml` 自动开 PR 升级依赖；合并后打各自 tag（如 `server-v0.2.0`）。
3. **`deploy`**：更新 compose 中的镜像 tag，打 `deploy-v*`。

**组织 Secret**（在 `VistaRemote/shared` 仓库配置）：

- `VISTAREMOTE_CI_PAT`：跨仓触发 `shared-published`（需 `repo` + `workflow` 权限）。

**本地仍用 `file:../shared`** 联调；需要恢复 file 依赖时：

```bash
node tooling/scripts/restore-shared-file-deps.mjs
```

同步 GitHub Actions 模板到各子仓：

```bash
node tooling/scripts/setup-github-workflows.mjs
```

---

## 6. 行为准则与安全

- [Contributor Covenant](./CODE_OF_CONDUCT.md)
- 漏洞报告见 [SECURITY.md](./SECURITY.md)，**请勿**公开提 Issue

---

## 7. 文档贡献

- 用户文档：编辑 `docs/docs/zh/`（及 `en/`），在 `docs/` 目录 `pnpm dev` 预览
- Spec：先改 Meta-Repo `spec/`，再同步子仓库 `spec/SPEC.md`

---

## 8. 问题反馈

使用 GitHub Issue 模板（Bug / Feature）。提供：环境、复现步骤、期望与实际、相关仓库名。

---

再次感谢你的贡献。
