# VistaRemote Prompts（版本化）

| Metadata | Value |
| :--- | :--- |
| **规范** | [quality-gates-spec.md](../spec/quality-gates-spec.md) FR-QUAL-10 |

## 规则（强制）

| ID | 规则 |
| :--- | :--- |
| P-01 | **禁止** 在 Issue/PR/聊天中临时编造长 Prompt 代替本目录文件 |
| P-02 | 修改 Prompt = 正常 PR，需人工 Review |
| P-03 | 发现 AI **高频幻觉** → 更新 `security-review.prompt.md` 的「已知幻觉」表 |
| P-04 | CI `ai-code-review` 仅引用本目录相对路径 |

## 文件清单

| 文件 | 用途 |
| :--- | :--- |
| [code-review.prompt.md](./code-review.prompt.md) | 通用 PR 审查 |
| [security-review.prompt.md](./security-review.prompt.md) | 安全、套餐、幻觉点 |
| [spec-compliance.prompt.md](./spec-compliance.prompt.md) | Spec/FR 对照 |
| [plugin-review.prompt.md](./plugin-review.prompt.md) | 插件 Manifest/权限审查 |

## 使用方式

**维护者 / CI**：`node tooling/scripts/ai-pr-review.mjs --prompt prompts/code-review.prompt.md`

**Cursor Agent**：在 AGENTS.md 中指向本目录；对话可说「按 `prompts/code-review.prompt.md` 审查此 PR」。

## 与 Cursor Rules 区别

| | `prompts/` | `.cursor/rules/` |
| :--- | :--- | :--- |
| 用途 | 可复现审查清单、CI | 日常编码风格 |
| 变更 | 需 Review，记 CHANGELOG | 工程约定 |
