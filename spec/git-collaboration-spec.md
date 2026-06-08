# Git 与协作规范 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-GIT-001` |
| **版本** | 1.0.0 |
| **关联** | [engineering-standards-spec.md](./engineering-standards-spec.md) |

---

## 1. 跨库依赖提交顺序

当修改涉及 `shared` 契约时，**禁止逆向操作**：

1. **`shared`**：修改类型/常量 → commit → push（或发 npm 预发布包）
2. **消费者**：`server`、`web`、`desktop`、`mobile`、`ai` 拉取最新 shared
3. **各业务仓**：分别 commit / PR

---

## 2. 分支策略

| 分支 | 用途 | 规则 |
| :--- | :--- | :--- |
| `main` | 生产就绪 | 仅 PR 合并；禁止直接 push |
| `dev` | 日常集成 | 可选；功能分支合并目标 |
| `feat/*` | 功能 | 与 Spec 功能 ID 或模块对应 |
| `fix/*` | 修复 | 可带 issue 号 `fix/123-mouse-offset` |
| `chore/*` | 工具/文档 | 无用户可见变更 |
| `release/*` | 发布 | 仅维护者 |

**跨库功能**：所有相关仓库使用 **相同分支名**（例：`feat/admin-users`）。

---

## 3. Commit Message（Conventional Commits）

**格式：**

```text
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

| type | 说明 |
| :--- | :--- |
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 仅文档 |
| `style` | 格式（不影响逻辑，含 Biome 纯格式提交） |
| `refactor` | 重构 |
| `perf` | 性能 |
| `test` | 测试 |
| `build` | 构建/依赖 |
| `ci` | CI 配置 |
| `chore` | 其他维护 |
| `revert` | 回滚 |

**scope 示例**：`webrtc`、`admin`、`shared`、`desktop`、`ipc`、`deps`

**示例：**

```text
feat(server): add admin user list API with plan filter

fix(desktop): restore telemetry channel after reconnect

docs(docs): add Biome and PR workflow to engineering guide
```

**Breaking change**：footer 写 `BREAKING CHANGE: 描述`，或 type 后加 `!`：`feat(shared)!: rename ControlKind enum`

### 3.1 本地校验

Meta-Repo 与各子仓库（配置后）通过 **Husky + commitlint** 校验，配置见 `tooling/commitlint.config.cjs`。

### 3.2 `.gitignore` 标准（FR-GIT-16）

| ID | 规则 |
| :--- | :--- |
| FR-GIT-16 | 各子仓库根目录必须有 `.gitignore`，与 `tooling/templates/gitignore.*` 对齐 |
| FR-GIT-17 | **禁止**提交 `node_modules/`、`dist/`、`.env`（保留 `.env.example`）、构建缓存与本地密钥 |
| FR-GIT-18 | Meta-Repo 根 `.gitignore` **排除**子仓库目录（`/server/`、`/shared/` 等），子仓各自独立 Git |

**模板路径：**

| 子仓类型 | 模板 |
| :--- | :--- |
| Node/TS（shared、server、web、desktop、mobile、ai） | `tooling/templates/gitignore.node-ts` |
| docs | `tooling/templates/gitignore.docs` |
| deploy | `tooling/templates/gitignore.deploy` |

---

## 4. Pull Request 流程

```text
fork/branch → push → 开 PR → CI 通过 → Code Review → merge → 删分支
```

| ID | 规则 |
| :--- | :--- |
| FR-GIT-10 | PR 标题遵循 Conventional Commits |
| FR-GIT-11 | 使用 `.github/PULL_REQUEST_TEMPLATE.md` |
| FR-GIT-12 | 关联 Issue：`Closes #123` / `Fixes #456` |
| FR-GIT-13 | 每个 PR 聚焦单一主题；超大 PR 拆分 |
| FR-GIT-14 | 合并前 **rebase** 到目标分支最新提交（或按团队约定 squash） |
| FR-GIT-15 | 合并策略：默认 **Squash merge** 到 `main`（保持历史简洁） |

### 4.1 Reviewer 职责

- 对照 Spec 与套餐/安全边界
- 确认 Biome / 构建 / 测试
- 对 `shared` 变更要求消费者 PR 链接或合并顺序说明

---

## 5. 提交流程（开发者日常）

1. `git checkout main && git pull`
2. `git checkout -b feat/your-feature`（各相关仓库同名）
3. 开发；保存时 Biome 格式化
4. `pnpm lint` / `biome check .`
5. `git add` → `git commit`（触发 commitlint）
6. `git push -u origin feat/your-feature`
7. 在 GitHub 创建 PR，填写模板
8. 根据 Review 修改，push 追加 commit 或 squash 本地

---

## 6. 禁止事项

- 向 `main` force push
- 提交 `.env`、密钥、私有证书
- `--no-verify` 跳过 hook（除非维护者批准并说明）
- 在未更新 `shared` 的情况下修改跨端 DTO 字段

---

## 7. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.1.0 | 初稿 |
| 2026-05-24 | 1.0.0 | PR 流程、commitlint、分支、Review 清单 |
