# CI/CD 与发布规范 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-CICD-001` |
| **版本** | 1.0.0 |
| **关联** | [meta-repo-development-spec.md](./meta-repo-development-spec.md) · [git-collaboration-spec.md](./git-collaboration-spec.md) |

---

## 1. 核心原则

| 原则 | 说明 |
| :--- | :--- |
| **分仓构建、分仓发布** | 无「整个 Meta-Repo 打一个运行时包」；各仓库独立 tag / 镜像 / 静态资源 |
| **shared 先行** | 契约变更必须先发布 `@vistaremote/shared`，再触发消费者同步 |
| **本地 `file:`、CI 兄弟目录** | Meta-Repo 内开发用 `file:../shared`；GitHub Actions 用 `setup-shared` 检出兄弟目录布局 |
| **生产用 Registry** | Docker / 离线构建从 **GitHub Packages** 安装固定 SemVer |

---

## 2. 发布拓扑

```text
shared  tag v*  ──►  npm @vistaremote/shared (GitHub Packages)
        │
        └── repository_dispatch: shared-published
                 │
                 ├── server / web / ai / desktop / mobile
                 │         sync-shared.yml → PR chore/bump-shared-x.y.z
                 │
                 └── (可选) 各仓 tag 后 release.yml → 镜像 / 静态站 / Releases

deploy 仓：组合各服务镜像 tag / digest，不构建业务代码
Meta-Repo：仅脚手架 CI，不发布运行时
```

---

## 3. shared 发布

| ID | 规则 |
| :--- | :--- |
| FR-CICD-01 | 合并到 `main` 后，维护者打 tag `vMAJOR.MINOR.PATCH`（与 `package.json#version` 一致） |
| FR-CICD-02 | `shared/.github/workflows/release.yml` 构建并发布至 `npm.pkg.github.com` |
| FR-CICD-03 | 发布成功后向消费者仓库发送 `repository_dispatch`（`shared-published`） |
| FR-CICD-04 | 需要组织 Secret **`VISTAREMOTE_CI_PAT`**（`repo` + `workflow`），供跨仓触发 |

---

## 4. 消费者同步

| ID | 规则 |
| :--- | :--- |
| FR-CICD-10 | 各消费者 `sync-shared.yml` 接收 `version`，运行 `pin-shared-version.mjs` |
| FR-CICD-11 | 自动开 PR：`chore/bump-shared-x.y.z`，标题 `chore(deps): bump @vistaremote/shared to x.y.z` |
| FR-CICD-12 | PR 必须通过本仓 CI（lint / test / build）后合并 |
| FR-CICD-13 | **本地 Meta 开发**仍可用 `file:../shared`；合并 registry 版本后执行 `pnpm install` 即可 |

依赖写法（发布后）：

```json
"@vistaremote/shared": "^0.2.0"
```

配合 `.npmrc`（模板见 `tooling/templates/npmrc.github-packages`）：

```ini
@vistaremote:registry=https://npm.pkg.github.com
```

---

## 5. 各仓发布产物

| 仓库 | 触发 | 产物 | 工作流 |
| :--- | :--- | :--- | :--- |
| **shared** | tag `v*` | npm 包 | `release.yml` |
| **server** | tag `server-v*` | Docker 镜像 `ghcr.io/vistaremote/server` | `release.yml` |
| **ai** | tag `ai-v*` | Docker 镜像 `ghcr.io/vistaremote/ai` | `release.yml` |
| **web** | tag `web-v*` | 静态资源 artifact（client + admin） | `release.yml` |
| **desktop** | tag `desktop-v*` | GitHub Release 安装包（占位） | `release.yml` |
| **docs** | tag `docs-v*` | GitHub Pages | `release.yml` |
| **mobile** | tag `mobile-v*` | 构建校验 artifact（商店流水线 P1） | `release.yml` |
| **deploy** | tag `deploy-v*` | 校验 compose / 发布说明 | `release.yml` |

**推荐发版节奏**：`shared` → 合并各消费者 bump PR → 各业务仓打 tag → `deploy` 更新 compose 中的镜像 tag。

---

## 6. CI 约定（已有 + 新增）

| 阶段 | 内容 |
| :--- | :--- |
| PR / push | `ci.yml`：setup-shared → lint → test → build |
| shared 发布 | `release.yml` |
| 依赖同步 | `sync-shared.yml` |
| 服务发版 | `release.yml`（tag 触发） |

Meta-Repo：`meta-ci.yml` 仅脚手架，不替代子仓。

---

## 7. Secrets 清单（组织 / 仓库）

| Secret | 用途 |
| :--- | :--- |
| `VISTAREMOTE_CI_PAT` | shared 发布后发 `repository_dispatch`；可选用于跨仓 PR |
| `GITHUB_TOKEN` | 默认可发布本仓 Packages（`packages: write`） |
| `GHCR` | 使用 `GITHUB_TOKEN` 推送 `ghcr.io/<org>/<repo>` |

---

## 8. 维护命令

```bash
# Meta-Repo 根：同步 workflow / action 到各子仓
node tooling/scripts/setup-github-workflows.mjs

# 手动模拟 shared 发布后 bump（在消费者仓目录）
node ../tooling/scripts/pin-shared-version.mjs 0.2.0
pnpm install
```

---

## 9. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 初稿：shared 发布、消费者 dispatch、分仓 release 模板 |
