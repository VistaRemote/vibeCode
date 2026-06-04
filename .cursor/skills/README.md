# VistaRemote Cursor Skills

项目级 Agent Skills，随仓库共享，便于团队与 AI 统一协作方式。

## 技能列表

| Skill | 路径 | 用途 |
| :--- | :--- | :--- |
| **vista-remote-team** | [vista-remote-team/SKILL.md](./vista-remote-team/SKILL.md) | Meta-Repo 多仓、SDD、跨仓 PR、MVP 验收、硬约束 |

## 使用方式

1. **自动**：Agent 根据 `description` 在 VistaRemote 相关任务中选用（见各 Skill 的 YAML frontmatter）。
2. **显式**：对话中说明「按 vista-remote-team skill」或 `@vista-remote-team`（视 Cursor 版本而定）。
3. **新人**：先读 [DEVELOPMENT.md](../../DEVELOPMENT.md)，再让 Agent 加载 `vista-remote-team`。

## 新增 Skill

1. 在本目录新建 `your-skill-name/SKILL.md`（含 `name`、`description` frontmatter）。
2. 保持 SKILL.md **< 500 行**；长文放 `reference.md`。
3. 更新本 README 与 [AGENTS.md](../../AGENTS.md)。
4. 可选：在 [spec/team-collaboration-spec.md](../../spec/team-collaboration-spec.md) 登记。

规范见 Cursor 官方技能编写指南（个人环境：`~/.cursor/skills-cursor/create-skill`）。
