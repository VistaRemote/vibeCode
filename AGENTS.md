# VistaRemote — Agent / AI 协作说明

面向 Cursor、Copilot 等 AI 协作者。人类开发者请从 [DEVELOPMENT.md](./DEVELOPMENT.md) 与 [CONTRIBUTING.md](./CONTRIBUTING.md) 开始。

## 必读 Spec（按序）

1. [spec/README.md](./spec/README.md) — 索引
2. [spec/spec-driven-development-spec.md](./spec/spec-driven-development-spec.md) — **SDD 工作流**
3. [spec/implementation-status.md](./spec/implementation-status.md) — **禁止在 Blocked 依赖上虚构完整实现**
4. [spec/system-overview.md](./spec/system-overview.md)
5. 正在修改的模块 Spec（如 `spec/server-spec.md`）
6. 性能迭代（**仅 spec，不写 docs 用户页**）：`spec/performance-roadmap-spec.md`

## 硬约束

| 项 | 规则 |
| :--- | :--- |
| 契约 | 仅改 `shared`，再改其他仓库 |
| 数据库 | PostgreSQL + TypeORM（生态默认，不用 MySQL OLTP） |
| 格式化 | Biome，`pnpm check:fix` |
| 提交信息 | Conventional Commits + scope |
| AI 推理 | 仅 `ai` 仓库，不在 server/desktop 内嵌 LLM |
| Spec 边界 | 新行为须有 FR-xxx；无 FR 则先补 Spec |
| 前端状态 | **Zustand**；禁止 Redux |
| 样式 | Sass Modules + **BEM**；禁止 Tailwind |
| 后端分层 | Controller → Service → Repository；主键 **UUIDv7** |
| 插件 | 独立仓 + `shared/plugin/manifest`；不污染主仓业务目录 |
| Prompt | **禁止自由编造**；用 [prompts/](./prompts/) 版本化文件 |
| 架构决策 | 遵循 [adr/](./adr/README.md)；性能 Rust 见 spec（不写 docs 排期） |

## 功能开发检查清单

- [ ] 已读 [ROADMAP](./ROADMAP.md) 与 [plan/implementation-plan.md](./plan/implementation-plan.md) 本迭代 FR
- [ ] 已读 `implementation-status` 相关行
- [ ] Spec diff（FR + 验收）与代码同 PR 或 Spec 先行
- [ ] `shared` build/test 通过（若改契约）
- [ ] 用户可见 → `docs/docs/zh|en/user` 或 `guide`
- [ ] 更新 `spec/implementation-status.md`（若改变就绪度）
- [ ] 插件变更对照 `spec/plugin-architecture-spec.md`
- [ ] 发现 AI 幻觉 → 更新 `prompts/security-review.prompt.md`

## 输出要求

- 标明影响的 **FR-xxx** Requirement ID（若有）
- 说明是否触及 `shared`
- 给出建议验收步骤
- 若仅为桩/演示，明确标注，勿写成生产就绪

## Cursor Skills（团队协作）

| Skill | 说明 |
| :--- | :--- |
| [vista-remote-team](.cursor/skills/vista-remote-team/SKILL.md) | Meta-Repo 多仓提交、SDD/FR、跨仓 PR 顺序、MVP 验收、硬约束 |

索引：[.cursor/skills/README.md](./.cursor/skills/README.md)

## Cursor Rules

详见 [.cursor/rules/](./.cursor/rules/)。
