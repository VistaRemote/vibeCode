# 开发者体验 Spec（本地环境 · 多环境 · 单仓开发）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-DX-001` |
| **版本** | 1.0.0 |
| **关联** | [meta-repo-development-spec.md](./meta-repo-development-spec.md) |

---

## 1. 新成员一键上手（Meta-Repo）

| 步骤 | 命令 |
| :--- | :--- |
| 1. 克隆 Meta-Repo | `git clone …/vista-remote.git && cd vista-remote` |
| 2. 拉子仓库 | `./init.sh` 或 `.\init.ps1` |
| 3. Node | `nvm use`（≥ 22.12） |
| 4. **一键搭建** | `./dev.sh` 或 `.\dev.ps1` |
| 5. 开工作区 | `vista-remote.code-workspace` |

`dev-up` 自动：切换 **local** 环境变量 → Docker（MySQL/Redis/Ollama）→ `pnpm install` 各仓 → `shared` build。

---

## 2. 多环境切换（Local / Dev / SIT / UAT）

SSOT：`config/environments/{local,dev,sit,uat}.env`

| 命令 | 写入各端 `.env` |
| :--- | :--- |
| `pnpm env:local` | localhost |
| `pnpm env:dev` | 远程 Dev API（改域名） |
| `pnpm env:sit` | SIT |
| `pnpm env:uat` | UAT |

**生效方式**：切换后 **重启** 正在运行的 `pnpm dev` / `pnpm start`（Rsbuild/Electron/Metro 在启动时读 env）。

当前 profile 记录在根目录 `.vista-env`。

| 子仓库 | 生成文件 |
| :--- | :--- |
| server | `.env` |
| ai | `.env` |
| web client/admin | `.env` |
| desktop | `.env` |
| mobile | `.env` |

---

## 3. 只克隆单个子仓库（如 desktop / mobile）

开发者 **只拉自己仓库** 时，在仓库内执行：

```bash
pnpm setup
# 或
node scripts/setup-dev.mjs
```

行为：

1. 若上层存在 Meta-Repo → 调用 `setup-single-repo.mjs`
2. 否则 **自动 `git clone` `../shared`** 并 `pnpm install` + build shared
3. 应用 `local` 环境（若在 Meta 内）

`package.json` 保持 `"@vistaremote/shared": "file:../shared"`。

---

## 4. 功能需求

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-DX-01 | `dev-up` 10 分钟内完成首次 local 依赖安装 | 文档步骤 |
| FR-DX-02 | `env:*` 写入全部客户端 env 文件 | apply-env 日志 |
| FR-DX-03 | desktop/mobile `pnpm setup` 无 Meta 时可 clone shared | |
| FR-DX-04 | 切换 env 不需改业务代码 | 仅重启 |

---

## 5. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | dev-up、apply-env、单仓 setup、四环境 profile |
