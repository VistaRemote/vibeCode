# 自动化质量门禁 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-QUALITY-001` |
| **版本** | 1.0.0 |
| **关联** | [engineering-standards-spec.md](./engineering-standards-spec.md) · [cicd-release-spec.md](./cicd-release-spec.md) · [prompts/README.md](../prompts/README.md) |

---

## 1. 目标

多人协作下，用 **可重复的自动化 + 受控 AI 辅助** 保证合并质量；AI 输出 **不替代** 人工 Review。

---

## 2. 门禁分层

```text
本地（Husky）→ PR CI（GitHub Actions）→ 人工 Review → 合并
                    ↓
              AI Code Review（建议性评论）
```

| 层级 | 门禁 | 失败是否阻断合并 |
| :--- | :--- | :--- |
| L0 本地 | Biome + commitlint + 单测（staged） | 开发者自行修复 |
| L1 CI | lint / test / build | **是** |
| L2 安全 | pnpm audit、Dependency Review、CodeQL | **是**（可配置例外） |
| L3 契约 | `pnpm plan:check`（Meta）、PR 模板字段 | Meta：**建议**；可升级为 required |
| L4 AI Review | `ai-code-review` workflow | **否**（仅评论） |
| L5 人工 | CODEOWNERS + Approve | **是** |

---

## 3. 各仓 CI 最低集（FR-QUAL）

| ID | 规则 |
| :--- | :--- |
| FR-QUAL-01 | 模板 `tooling/github/workflows/ci-node.yml` 同步到各子仓 |
| FR-QUAL-02 | PR 触发 `dependency-review.yml` |
| FR-QUAL-03 | `server` 含 k6 smoke；`web` 含 Playwright smoke |
| FR-QUAL-04 | 禁止 `--no-verify` 合并进 `main`（维护者明示除外） |

---

## 4. AI Code Review（Normative）

### 4.1 原则

| ID | 规则 |
| :--- | :--- |
| FR-QUAL-10 | Prompt **仅** 来自 `prompts/` 目录版本化文件 |
| FR-QUAL-11 | AI Review 结果为 **非阻塞** Comment |
| FR-QUAL-12 | 合并必须 **人工 Approve** |
| FR-QUAL-13 | 幻觉高发点维护在 `prompts/security-review.prompt.md` |

### 4.2 工作流

| 文件 | 作用 |
| :--- | :--- |
| `.github/workflows/ai-code-review.yml` | PR `opened`/`synchronize` 触发 |
| `tooling/scripts/ai-pr-review.mjs` | 组装 diff 摘要 + 调用 Prompt 模板 |
| `prompts/code-review.prompt.md` | 通用审查清单 |
| `prompts/security-review.prompt.md` | 安全/套餐/幻觉点 |

**密钥**：`AI_REVIEW_API_KEY`（组织 Secret，可选）；未配置时 workflow **跳过** 并提示，不失败 CI。

### 4.3 AI 审查范围（检查清单）

- Spec/FR 引用是否在 PR 描述中
- `shared` 变更是否先于消费者
- 是否引入禁止栈（Redux、Tailwind、Controller 内 SQL）
- 密钥/`.env` 泄漏
- 套餐 bypass（free 调 enterprise API）
- 已知幻觉 API（见 security-review prompt）

---

## 5. Branch Protection（组织设置清单）

维护者在 GitHub 组织/仓库设置：

| 项 | 设置 |
| :--- | :--- |
| Require pull request | ✅ |
| Required approvals | ≥ 1（shared/server ≥ 2） |
| Require status checks | `quality` / `lint` / `test` / `build` |
| Require conversation resolution | 推荐 ✅ |
| Restrict pushes to `main` | ✅ |
| Allow force push | ❌ |

---

## 6. Meta-Repo 专属

| 工作流 | 文件 |
| :--- | :--- |
| Meta CI | `.github/workflows/meta-ci.yml` |
| Plan check | 增加 job：`pnpm plan:check` |

---

## 7. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | AI Review 流程、门禁分层、Branch Protection 清单 |
