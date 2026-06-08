---
name: vista-remote-team
description: >-
  VistaRemote Meta-Repo team workflow: multi-repo Git, .meta manifest, Spec-Driven
  Development (FR-xxx), shared-first contract changes, MVP WebRTC pairing flow,
  Biome, and cross-repo PR order. Use when contributing to VistaRemote, onboarding,
  cross-repo features, MVP remote desktop, or when the user asks about team collaboration,
  which repo to commit, or agent skills for this project.
---

# VistaRemote 团队协作

面向 **人类 + AI** 在本仓库协作时的统一流程。细节见 [reference.md](reference.md)。

## 先判断改哪个仓库

| 变更类型 | 提交到 | 不要提交到 |
| :--- | :--- | :--- |
| Spec、ROADMAP、`.meta/`、`tooling/`、`plan/` | **Meta-Repo**（vibeCode） | 子仓 |
| `shared` 类型/Schema/API 契约 | **shared** | Meta 根（无业务源码） |
| Nest API、信令、配对 | **server** | Meta |
| Web 主控/Admin | **web** | Meta |
| Electron Agent | **desktop** | Meta |
| RN 移动端 | **mobile** | Meta |
| AI Worker | **ai** | server/desktop 内嵌 LLM |

子仓路径在 `.gitignore` 中忽略，但本地 **各有独立 `.git`**。用 `vista-remote.code-workspace` 多根打开。

## 新人 10 分钟（按序读）

1. [DEVELOPMENT.md](../../../DEVELOPMENT.md) — 命令与环境
2. [ROADMAP.md](../../../ROADMAP.md) — 里程碑
3. [plan/implementation-plan.md](../../../plan/implementation-plan.md) — **本迭代必做/勿做**
4. [spec/implementation-status.md](../../../spec/implementation-status.md) — 禁止虚构 Blocked 能力
5. 正在改的模块 Spec（如 `spec/server-spec.md`）
6. [AGENTS.md](../../../AGENTS.md) — AI 硬约束

## 环境一键命令

```bash
# 首次：克隆子仓（读 .meta/manifest.json）
./init.sh                    # Windows: .\init.ps1
pnpm run init:repos          # 或 node tooling/scripts/init-repos.mjs

# 安装 + shared 构建 + Docker（可选）
./dev.sh                     # Windows: .\dev.ps1

# MVP 本机闭环（Server + Web）
.\dev-mvp.ps1                # Windows

# 仅改契约后
cd shared && pnpm build
```

## SDD 与 PR 义务（必守）

1. **新行为**须有 `FR-xxx`；无 FR → 先改 Spec 再写代码。
2. **契约**：先 **shared** PR 合并/构建，再 server / web / desktop。
3. **跨端功能**：各仓同名分支，如 `feat/webrtc-sfu`。
4. **提交**：Conventional Commits + scope（`feat(server): …`）。
5. **格式化**：Biome — Meta 根 `pnpm check:fix`；子仓内 `pnpm lint` / `pnpm check:fix`。
6. **合并前**：子仓 CI 绿 + 人工 Approve；`shared` 先于消费者。

PR 描述须含：影响的 **FR-xxx**、是否改 **shared**、验收步骤、是否仅为桩（勿写「生产就绪」）。

## 架构硬约束（摘录）

| 项 | 规则 |
| :--- | :--- |
| 仓库 | Flat Meta-Repo，**禁止** submodule/subtree |
| DB | MySQL + TypeORM，不用 PostgreSQL |
| 前端状态 | Zustand，禁止 Redux |
| 样式 | Sass Modules + BEM，禁止 Tailwind |
| 后端 | Controller → Service → Repository；UUIDv7 |
| AI 推理 | 仅 **ai** 仓 |
| Prompt | 用 [prompts/](../../../prompts/)，禁止自由编造 |

## MVP 远程桌面验收（FR-MVP-*）

本地：`.\dev-mvp.ps1` → 末尾 `OK: signaling e2e passed`；`health` 含 `mvpBuild`。

| 步骤 | 期望 |
| :--- | :--- |
| Agent | 配对码、标题构建号（如 `20260604-b8`）、选屏、`sent-offer` |
| Web `/pairing` | 输入码 → `/session`，`sess` 后 8 位与 Agent 一致 |
| 信令房间 | 诊断 **2 peers**（`agent_*` + `ctrl_*`） |
| 画面 | Web `streaming`，非长期黑屏 |
| 控制 | 浏览器操作 → Agent「最近控制」；Windows 主屏鼠标可动 |

故障：先 `.\tooling\scripts\stop-listener.ps1 -Port 3000` 再 `dev-mvp`；Agent 须新构建；勿用旧 session 书签。

详规：[spec/mvp-core-flow-spec.md](../../../spec/mvp-core-flow-spec.md)、[plan/mvp-e2e-runbook.md](../../../plan/mvp-e2e-runbook.md)。

## AI 协作者输出模板

```markdown
## 影响
- FR-xxx: …
- 仓库: shared | server | web | desktop | meta
- shared: 是/否

## 验收
1. …

## 就绪度
- [ ] 生产就绪 / [x] 桩或 MVP 演示
```

## 何时读扩展文档

- Meta-Repo / Biome 分层 → [reference.md](reference.md)
- 多屏规划 → [spec/multi-display-spec.md](../../../spec/multi-display-spec.md)
- 发布与 CI → [spec/cicd-release-spec.md](../../../spec/cicd-release-spec.md)
- 代码审查 Prompt → [prompts/code-review.prompt.md](../../../prompts/code-review.prompt.md)
