# VistaRemote 开发入口

> 人类开发者从这里开始；AI 协作者另读 [AGENTS.md](./AGENTS.md)。

## 5 分钟上手

```bash
git clone git@github.com:VistaRemote/vista-remote.git
cd vista-remote
nvm use
./init.sh              # Windows: .\init.ps1
./dev.sh               # Windows: .\dev.ps1
```

**务必**打开 `vista-remote.code-workspace`（多 Git 根，否则 Source Control 为空）。

## 团队协作上下文（按序）

| 顺序 | 文档 | 作用 |
| :--- | :--- | :--- |
| 1 | [ROADMAP.md](./ROADMAP.md) | 里程碑与当前冲刺 |
| 2 | [plan/implementation-plan.md](./plan/implementation-plan.md) | **本迭代**需求契约与自检 |
| 3 | [spec/implementation-status.md](./spec/implementation-status.md) | 实现 vs Spec |
| 4 | [spec/team-collaboration-spec.md](./spec/team-collaboration-spec.md) | 同步节奏、PR 规则 |
| 5 | [adr/README.md](./adr/README.md) | 架构决策（TS/WebRTC/Rust/插件） |

迭代结束：`pnpm plan:check` → 更新 status / CHANGELOG / 技术债务表。

## 必读（Spec-Driven）

| 顺序 | 文档 |
| :--- | :--- |
| 1 | [spec/README.md](./spec/README.md) — Spec 索引 |
| 2 | [spec/spec-driven-development-spec.md](./spec/spec-driven-development-spec.md) — FR/US、PR |
| 3 | [spec/plugin-architecture-spec.md](./spec/plugin-architecture-spec.md) — 核心 + 插件 |
| 4 | 你负责的模块 Spec（如 `spec/server-spec.md`） |

## 多仓 Git 提交

| 改动位置 | 提交仓库 |
| :--- | :--- |
| `spec/`、`tooling/`、`ROADMAP.md` | **Meta** 根目录 |
| `web/...` | `web/` |
| `server/...` | `server/` |

IntelliJ：Commit 窗口 **Repository** 下拉选子仓。Cursor：用 workspace 或多仓库 Source Control。

## 常用命令

| 命令 | 作用 |
| :--- | :--- |
| `pnpm env:local` / `env:dev` / `env:sit` / `env:uat` | 切换 API 环境 |
| `pnpm dev:up` | Docker + install + build shared |
| `pnpm plan:check` | 迭代计划未勾选项 |
| `cd server && pnpm start:dev` | 信令/API |
| `cd web && pnpm --filter @vistaremote/web-client dev` | Web 主控 |

## 工程红线（摘要）

- 状态：**Zustand**；禁 **Redux**
- 样式：**Sass Modules + BEM**；禁 **Tailwind**
- 后端：**UUIDv7**；Controller 不写业务/SQL；DB 仅 Repository
- Prompt：**仅** [prompts/](./prompts/)；合并需 **人工 Review**

见 [spec/engineering-standards-spec.md](./spec/engineering-standards-spec.md)。

## 文档站

```bash
cd docs && pnpm install && pnpm dev
```

## 贡献流程

[CONTRIBUTING.md](./CONTRIBUTING.md) · [CHANGELOG.md](./CHANGELOG.md)
