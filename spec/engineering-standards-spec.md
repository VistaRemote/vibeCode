# 工程规范 Spec（L1）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-ENG-001` |
| **版本** | 1.0.0 |
| **关联** | [git-collaboration-spec.md](./git-collaboration-spec.md) · [cicd-release-spec.md](./cicd-release-spec.md) · [CONTRIBUTING.md](../CONTRIBUTING.md) |

---

## 1. 目标

为 **多人协作的开源项目** 统一：代码风格、静态检查、编辑器行为、Git/PR 流程、CI 门禁与 AI 协作边界。

---

## 2. 代码格式与静态检查：Biome

| ID | 规则 | 验收 |
| :--- | :--- | :--- |
| FR-ENG-01 | 全栈 TypeScript/JavaScript **统一使用 Biome** 格式化与 Lint | 不引入 ESLint+Prettier 双栈 |
| FR-ENG-02 | 基线 `tooling/biome.json` + 端预设 server/web/mobile/desktop | 见 [meta-repo-development-spec](./meta-repo-development-spec.md) |
| FR-ENG-03 | **每个** TS 子仓库根目录 `biome.json` extends 对应预设 | 在**该仓库内** CI `pnpm lint` |
| FR-ENG-02b | Meta-Repo 根 `biome.json` **仅**脚手架，不替代子仓检查 | |
| FR-ENG-04 | 提交前在改动仓库执行 `pnpm lint` 或 `biome check .` | |
| FR-ENG-05 | MD 文档可用 `pnpm format:docs` 格式化（Meta-Repo）；MDX 在 `docs/` 仓库 | |

### 2.1 与 EditorConfig 对齐

- `.editorconfig`：UTF-8、LF、2 空格、final newline。
- IDE 保存时格式化：**Biome** 为默认 formatter（见工作区 `vista-remote.code-workspace`）。

---

## 3. Git 与提交

详见 [git-collaboration-spec.md](./git-collaboration-spec.md)（扩展版）。

| 实践 | 说明 |
| :--- | :--- |
| **Conventional Commits** | `type(scope): subject` |
| **Commitlint** | `tooling/commitlint.config.cjs` + Husky `commit-msg` |
| **分支** | `feat/*`、`fix/*`；跨库同名分支 |
| **主分支** | `main` 受保护，仅 PR 合并 |
| **开发分支** | `dev` 集成分支（可选） |
| **Signed commits** | 推荐 GPG/SSH sign（维护者必须） |
| **禁止** | force push `main`、跳过 hook（除非维护者明示） |

### 3.1 Type 枚举

`feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`

---

## 4. Pull Request 流程

| 步骤 | 要求 |
| :--- | :--- |
| 1 | 从最新 `main`/`dev` 拉分支 |
| 2 | 小步提交，信息符合 Commitlint |
| 3 | PR 使用模板，说明动机、测试、Spec 影响 |
| 4 | CI 绿（lint、build、test） |
| 5 | 至少 **1** 名 Reviewer approve（核心仓库建议 2） |
| 6 | Squash merge 或 rebase merge（团队统一一种） |
| 7 | 涉及 `shared` 的 PR 必须先合并并发布/打 tag，再合消费者 |

### 4.1 PR 检查清单（Reviewer）

- [] 符合 Spec / 已更新 Spec
- [] `shared` 优先顺序正确
- [] Biome check 通过
- [] 无密钥、`.env` 进库
- [] 套餐/权限边界（若适用）
- [] 文档与 CHANGELOG（若用户可见）

---

## 5. 编辑器与 Cursor

| 项 | 位置 |
| :--- | :--- |
| 工作区设置 | `vista-remote.code-workspace` |
| Cursor Rules | `.cursor/rules/*.mdc` |
| AI 说明 | `AGENTS.md` |
| 推荐扩展 | `.vscode/extensions.json` |

---

## 6. 业界补充实践（采纳清单）

| 实践 | VistaRemote 落地 |
| :--- | :--- |
| **EditorConfig** | `.editorconfig`（各子仓库同步一份） |
| **Cursor Rules** | 各子仓库 `.cursor/rules/`（`tooling/cursor/` + `setup-ide-config.mjs`） |
| **VS Code** | 各子仓库 `.vscode/settings.json`（Biome format on save） |
| **AGENTS.md** | 各子仓库根目录（AI 协作） |
| **Node 版本锁定** | **≥ 24**（`engines`）；`.nvmrc` 固定 **24.11 LTS**；CI 使用 `node-version: 24.11` |
| **依赖锁定** | pnpm `pnpm-lock.yaml` 进库 |
| **Git 属性** | `.gitattributes`（LF、linguist） |
| **PR/Issue 模板** | `.github/PULL_REQUEST_TEMPLATE.md`、ISSUE_TEMPLATE |
| **CODE_OF_CONDUCT** | `CODE_OF_CONDUCT.md` |
| **SECURITY** | `SECURITY.md` |
| **Dependabot** | `.github/dependabot.yml` |
| **CODEOWNERS** | `.github/CODEOWNERS`（可选路径） |
| **CI** | 各仓库：lint + **Rstest** + build；**pnpm audit**、**CodeQL**、PR **Dependency Review** |
| **Git Hooks** | 各子仓 Husky：`pre-commit` = staged Biome + 单测；`commit-msg` = commitlint |
| **单元测试** | [**Rstest**](https://rstest.rs/)（`@rstest/core`）；Rsbuild/Rslib 项目用对应 adapter |
| **E2E** | `web`：Playwright（`apps/client`） |
| **性能** | `server`：[k6](https://k6.io/)（`perf/k6/`，CI `perf.yml`） |
| **Changesets** | 多包发布时可选（P1） |
| **License** | 各子仓库 LICENSE 文件 |
| **Secrets** | 仅 CI/部署注入，`.env.example` 无真实密钥 |

### 6.1 明确不采用（避免过度工程）

- 双格式化器（Prettier + Biome 并存）
- Meta-Repo 单一 husky 管理所有子仓库 git（各仓独立 hook）
- 强制 monorepo 工具（已选 Multi-Repo）

---

## 7. 子仓库 CI 最低要求（模板）

```yaml
# .github/workflows/ci.yml（模板见 tooling/github/workflows/ci-node.yml）
jobs:
  quality:      # lint → test → build
  security-audit:
  codeql:       # 可选
# PR: dependency-review.yml
# server: perf.yml (k6)
# web: e2e.yml (Playwright)
```

---

## 8. 前端强制规范（FR-ENG-FE）

| ID | 规则 | 验收 |
| :--- | :--- | :--- |
| FR-ENG-FE-01 | 客户端状态管理 **Zustand** | Code Review / AI Review |
| FR-ENG-FE-02 | **禁止 Redux**（`redux`、`@reduxjs/toolkit`、`react-redux`） | 依赖扫描 + Review |
| FR-ENG-FE-03 | **禁止 Tailwind** 作为主样式方案 | 无 `tailwind.config.*` |
| FR-ENG-FE-04 | 样式：**Sass CSS Modules + BEM** 命名 | 见 frontend-toolchain FR-CSS-06 |
| FR-ENG-FE-05 | UI 组件库：**antd**（已规定），不引入 MUI 等第二套 | |

详见 [frontend-toolchain-spec.md](./frontend-toolchain-spec.md)。

---

## 9. 后端分层规范（FR-ENG-BE）

| ID | 规则 | 验收 |
| :--- | :--- | :--- |
| FR-ENG-BE-01 | 主键 ID：**UUIDv7**（时间有序）；禁止 UUIDv4 作为默认主键 | 实体与迁移 Review |
| FR-ENG-BE-02 | **Controller**：参数校验、鉴权装饰器、调用 Service；**禁止**业务逻辑与 SQL | 静态 Review |
| FR-ENG-BE-03 | **Service**：领域逻辑、事务边界；**禁止**直接 `Repository` 以外的裸 SQL | |
| FR-ENG-BE-04 | **Repository/DAO**：唯一数据库访问层；TypeORM `Repository` 仅在此层 | |
| FR-ENG-BE-05 | 插件不得绕过 Repository 访问核心表 | plugin-architecture-spec |

详见 [server-spec.md](./server-spec.md) §分层。

---

## 10. Prompts 与 AI 协作

| ID | 规则 |
| :--- | :--- |
| FR-ENG-AI-01 | 审查 Prompt **仅** 使用 [prompts/](../prompts/) 版本化文件 |
| FR-ENG-AI-02 | 合并 **必须** 人工 Approve；AI 审查非阻塞 |
| FR-ENG-AI-03 | 新幻觉点登记 `prompts/security-review.prompt.md` |

见 [quality-gates-spec.md](./quality-gates-spec.md)。

---

## 11. 子仓库脚手架（FR-ENG-SUBREPO）

| ID | 规则 |
| :--- | :--- |
| FR-ENG-SUBREPO-01 | 各子仓根目录满足 [subrepo-scaffold-spec.md](./subrepo-scaffold-spec.md) FR-SUB-01～09 |
| FR-ENG-SUBREPO-02 | 新建子仓或 `init` 后运行 `node tooling/scripts/sync-subrepo-scaffold.mjs` |
| FR-ENG-SUBREPO-03 | `README.md` 须可独立阅读（含 LICENSE 与快速开始） |

---

## 12. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.3.0 | Node.js 24 LTS（ADR-0005）
| 2026-05-24 | 1.2.0 | 子仓脚手架完备性
| 2026-05-24 | 1.1.0 | Zustand/BEM/UUIDv7/分层、Prompts、质量门禁引用 |
| 2026-05-24 | 1.0.0 | Biome、EditorConfig、Commitlint、Cursor Rules、PR/开源惯例 |
