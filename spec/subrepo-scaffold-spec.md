# 子仓库脚手架完备性 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-SUBREPO-001` |
| **版本** | 1.0.0 |
| **关联** | [engineering-standards-spec.md](./engineering-standards-spec.md) · [licensing-spec.md](./licensing-spec.md) |

---

## 1. 目标

每个 **独立 Git 子仓库** 在 GitHub 上单独展示时，应具备开源项目最低完备性，不依赖 Meta-Repo 才能理解用途与授权。

---

## 2. 根目录必备文件（FR-SUB）

| ID | 文件 | 必须 | 说明 |
| :--- | :--- | :--- | :--- |
| FR-SUB-01 | `README.md` | ✅ | 用途、环境、快速开始、脚本表、Spec 链接 |
| FR-SUB-02 | `LICENSE` | ✅ | 与 Meta 相同文本（VistaRemote Open Source License） |
| FR-SUB-03 | `CHANGELOG.md` | ✅ | Keep a Changelog；可链 Meta 里程碑 |
| FR-SUB-04 | `SECURITY.md` | ✅ | 报告方式 + 本仓范围摘要 |
| FR-SUB-05 | `CODE_OF_CONDUCT.md` | ✅ | 与 Meta 同步 |
| FR-SUB-06 | `AGENTS.md` | ✅ | AI 协作 |
| FR-SUB-07 | `.gitignore` | ✅ | 见 gitignore 模板 |
| FR-SUB-08 | `.editorconfig`、`.nvmrc`、`biome.json` | ✅ | 工程一致 |
| FR-SUB-09 | `spec/SPEC.md` + `spec/README.md` | ✅ | 子仓 Spec 镜像 |

**推荐**：`.env.example`、`Dockerfile`（server/ai）、`.github/workflows/ci.yml`。

---

## 3. 同步工具

```bash
# Meta-Repo 根目录
node tooling/scripts/sync-subrepo-scaffold.mjs
# 覆盖 SECURITY/CHANGELOG：加 --force
```

`init.ps1` / `init.sh` 拉取子仓后应执行一次（维护者）。

模板目录：`tooling/templates/subrepo/`（含 `README.{server,web,...}.md` 完整长文档）。

恢复/更新子仓中文 README（UTF-8）：

```bash
node tooling/scripts/write-subrepo-readmes-utf8.mjs
```

---

## 4. README 最低结构

1. 标题 + 一句话描述  
2. 许可证链接  
3. 环境要求  
4. 快速开始（可复制命令）  
5. `package.json` 脚本表  
6. 关键目录  
7. Spec 链接（本仓 + Meta L1）  
8. 相关仓库  
9. SECURITY / CoC  

---

## 5. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 子仓 README/LICENSE 完备性清单与 sync 脚本 |
