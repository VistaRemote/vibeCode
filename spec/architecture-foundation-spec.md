# 基础架构就绪 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-FOUNDATION-001` |
| **版本** | 1.0.0 |
| **关联** | [implementation-status.md](./implementation-status.md) |

---

## 1. 目标

定义「开发者克隆后即可开工」的 **最低基础架构**，与产品全量能力区分。

---

## 2. 基础架构清单（Normative）

| ID | 组件 | 就绪标准 | 当前 |
| :--- | :--- | :--- | :--- |
| F-01 | Meta-Repo `init` + `dev-up` | 文档化一键命令 | ✅ |
| F-02 | `shared` 构建可被各仓 `file:` 引用 | `pnpm build` 成功 | ✅ |
| F-03 | 环境 profile local/dev/sit/uat | `apply-env` 写各仓 `.env` | ✅ |
| F-04 | Docker 本地依赖 | postgres/redis/ollama compose | ✅ |
| F-05 | Spec 索引 + SDD 流程 | README + SDD spec | ✅ |
| F-06 | Biome + Husky 每仓 | lint on commit | ✅ |
| F-07 | 信令 WSS 服务 | `/signaling` 可连 | ✅ |
| F-08 | 权益 SSOT | `shared/billing/entitlements` | ✅ |
| F-09 | 权限 SSOT | `shared/auth` + policy | ✅ |
| F-10 | 文档站可运行 | `cd docs && pnpm dev` | ✅ |
| F-11 | 业务数据持久化 | TypeORM 实体 + 迁移 | 🟡 P1 |
| F-12 | 用户登录 JWT | Controller/Admin 签发 | 🟡 P1 |
| F-13 | E2E 1:1 远程 | 配对→视频→控制 | 🟡 MVP-B |

**基础架构阶段完成**：F-01～F-10 为 ✅ 时，团队可 **并行开发各模块功能**；F-11～F-13 为 **产品 MVP 闭环**，按迭代补齐。

---

## 3. 单仓开发者

| 场景 | 要求 |
| :--- | :--- |
| 仅 desktop/mobile | `pnpm setup` + 同级 `shared` |
| 无 Meta 父目录 | 允许；使用 published `@vistaremote/shared` 或 clone shared |

见 [developer-experience-spec.md](./developer-experience-spec.md)。

---

## 4. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 基础架构清单 |
