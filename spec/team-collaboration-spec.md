# 团队协作与上下文指引 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-TEAM-001` |
| **版本** | 1.0.0 |
| **关联** | [release-planning-spec.md](./release-planning-spec.md) · [git-collaboration-spec.md](./git-collaboration-spec.md) |

---

## 1. 目标

降低 Meta-Repo + 多子仓带来的 **上下文切换成本**，让成员快速回答：

- 当前在做什么里程碑？
- 我该改哪个仓库？
- 什么能写、什么是技术债务？
- PR 谁审、AI 能做什么不能做什么？

---

## 2. 上下文指引（新人 10 分钟）

| 顺序 | 文档 | 得到什么 |
| :--- | :--- | :--- |
| 1 | [DEVELOPMENT.md](../DEVELOPMENT.md) | 环境、命令、多仓提交 |
| 2 | [ROADMAP.md](../ROADMAP.md) | 里程碑与当前冲刺 |
| 3 | [plan/implementation-plan.md](../plan/implementation-plan.md) | **本迭代** 必做与勿做 |
| 4 | [implementation-status.md](./implementation-status.md) | 模块就绪度 |
| 5 | 负责模块 L1 Spec | FR 边界 |
| 6 | [adr/README.md](../adr/README.md) | 不可推翻的架构决策 |

**AI 协作者**：读 [AGENTS.md](../AGENTS.md) + [prompts/README.md](../prompts/README.md)，禁止自由编造 Prompt。

**Cursor Skills（项目级）**：[.cursor/skills/vista-remote-team/SKILL.md](../.cursor/skills/vista-remote-team/SKILL.md) — 多仓协作、SDD、MVP 验收流程（团队共享）。

---

## 3. 团队状态同步节奏

| 节奏 | 活动 | 产出 |
| :--- | :--- | :--- |
| **日** | 异步：Issue/PR 评论；阻塞标 `blocked` label | — |
| **周** | 维护者更新 `ROADMAP` 当前冲刺 + `implementation-plan` | 全员可见迭代焦点 |
| **迭代末** | `pnpm plan:check` + 更新 status/CHANGELOG/债务表 | 技术债务透明 |
| **里程碑** | 发版说明 + docs 用户向章节 | CHANGELOG 新版本 |

---

## 4. 协作模式（Meta-Repo）

| 场景 | 模式 |
| :--- | :--- |
| 跨端功能 | **同名分支** `feat/xxx` 在 shared → server → web 顺序 PR |
| 仅 Web | 只 clone/open `web` 仓，不必改 Meta |
| Spec 变更 | Meta-Repo PR；实现 PR 在子仓 |
| 插件开发 | **独立仓库** + Manifest；不 PR 进主仓业务目录 |
| 紧急修复 | `fix/*` 可跳过 ROADMAP 小步，但必须补 CHANGELOG/Status |

---

## 5. Issue / PR 约定

| 类型 | 模板 | 说明 |
| :--- | :--- | :--- |
| 功能 | `feature_request.yml` | 链到 FR 或新建 FR 草案 |
| 插件提案 | `plugin_proposal.yml` | 见 plugin-architecture-spec |
| 技术债务 | `tech_debt.yml` | 从 plan 自检登记 |
| PR | `PULL_REQUEST_TEMPLATE.md` | 必填 Spec/仓库/质量清单 |

**合并规则**（组织级 Branch Protection）：

| ID | 规则 |
| :--- | :--- |
| FR-TEAM-10 | `main`：**至少 1 名人工 Approve**（核心仓 2 名） |
| FR-TEAM-11 | CI 全绿（lint、test、build） |
| FR-TEAM-12 | 禁止 AI bot 账号作为唯一 Approve |
| FR-TEAM-13 | `shared` 合并先于消费者 |

---

## 6. 沟通渠道（建议）

| 用途 | 建议 |
| :--- | :--- |
| 决策记录 | ADR + Spec PR |
| 讨论草案 | GitHub Discussion / Issue |
| 实时阻塞 | Issue `@mention` + `blocked` label |

---

## 7. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 初版上下文指引与同步节奏 |
| 2026-05-26 | 1.0.1 | 登记 Cursor Skill `vista-remote-team` |
