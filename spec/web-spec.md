# Web 仓库总览 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-WEB-000` |
| **仓库** | `web/` |
| **版本** | 0.2.0-draft |
| **子 Spec** | [web-client-spec.md](./web-client-spec.md) · [web-admin-spec.md](./web-admin-spec.md) |

---

## 1. 职责

`web` 仓库包含 **两个独立 Rsbuild 应用**，共享工具链与 UI 包，部署域名与鉴权角色分离：

| 应用 | 目录 | 用户 | 说明 |
| :--- | :--- | :--- | :--- |
| **用户端（Client）** | `apps/client/` | 运维、技术支持、普通主控用户 | 配对、WebRTC 远程控制 |
| **管理端（Admin）** | `apps/admin/` | 系统管理员、企业 IT | 用户/设备/会话/审计、系统配置 |

**不负责**：屏幕采集、OS 输入注入、信令服务实现（由 `server` 提供 API）。

---

## 2. 仓库结构（目标）

```text
web/
├── package.json                 # pnpm workspace 根（仅编排，不 hoist 到 Meta-Repo 根）
├── pnpm-workspace.yaml
├── rsbuild.config.base.ts       # 共享 Rspack/Rsbuild 配置
├── apps/
│   ├── client/                  # 用户端 → SPEC: web-client-spec.md
│   └── admin/                   # 管理端 → SPEC: web-admin-spec.md
├── packages/
│   └── ui/                      # antd 封装 + Sass mixins
└── spec/                        # 本仓库 Spec 镜像（与 Meta-Repo 同步）
    ├── README.md
    ├── client-spec.md
    └── admin-spec.md
```

---

## 3. 技术栈（强制）

| 类别 | 选型 |
| :--- | :--- |
| 框架 | React 18+、TypeScript |
| 构建 | **Rsbuild**（Rspack） |
| 组件库 | **Ant Design 5** |
| 样式 | **Sass**（CSS Modules） |
| 路由 | React Router 6+ |
| 状态 | Zustand 或 React Query（按场景） |
| 契约 | `@vistaremote/shared` |

详见 [frontend-toolchain-spec.md](./frontend-toolchain-spec.md)。

---

## 4. 部署与域名

| 应用 | 示例路径 | 鉴权 |
| :--- | :--- | :--- |
| Client | `https://app.example.com` | Controller Token、配对码 |
| Admin | `https://admin.example.com` | Admin JWT、RBAC |

`CORS_ORIGINS` 在 server 须同时登记两个源。

---

## 5. 共享需求

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-WEB-00 | Client 与 Admin 均 `extends` 同一 `rsbuild.config.base.ts` | 配置 diff 仅 entry/html/public |
| FR-WEB-00b | 共用 `packages/ui` 与 `styles/_variables.scss` | 主色一致 |
| FR-WEB-00c | 环境变量统一 `PUBLIC_API_BASE`、`PUBLIC_WS_URL` | `.env.example` 两份应用均有 |

---

## 6. 子文档索引

| 文档 | 内容 |
| :--- | :--- |
| [web-client-spec.md](./web-client-spec.md) | 配对、WebRTC 画布、控制指令 |
| [web-admin-spec.md](./web-admin-spec.md) | 后台 CRUD、审计、系统配置 |
| [frontend-toolchain-spec.md](./frontend-toolchain-spec.md) | Rspack、antd、Sass |

---

## 7. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.1.0-draft | 单应用主控 |
| 2026-05-24 | 0.2.0-draft | 拆分为 Client + Admin；Rsbuild + antd + Sass |
