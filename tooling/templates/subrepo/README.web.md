# @vistaremote/web

VistaRemote **Web 前端 monorepo**：用户主控端（Client）与管理台（Admin），**Rsbuild + React 19 + antd + Sass**。跨端 UI 与 Desktop/Mobile 统一 React 系，**不采用 Flutter**（[ADR-0007](https://github.com/VistaRemote/vibeCode/blob/main/adr/0007-no-flutter-cross-platform-ui.md)）。

| Metadata | Value |
| :--- | :--- |
| **包名** | `@vistaremote/web` |
| **许可证** | [LICENSE](./LICENSE) |

## 应用

| 应用 | 路径 | 说明 |
| :--- | :--- | :--- |
| **Web Client** | `apps/client` | 远程主控、配对、WebRTC 播放 |
| **Admin** | `apps/admin` | 用户、订单、权限管理 |
| **UI 包** | `packages/ui` | 共享 antd 业务组件 |

## 环境要求

- Node.js >= 24.0.0（推荐 24.11 LTS，见 `.nvmrc`）
- pnpm >= 9
- `@vistaremote/shared`：`file:../shared` 且已 `pnpm build`

## 快速开始

```bash
pnpm install
cp apps/client/.env.example apps/client/.env
pnpm dev:client
# 管理台：pnpm dev:admin
```

API 地址由 `PUBLIC_*` 环境变量注入（见 `rsbuild.config.base.ts`）。

## 脚本

| 命令 | 说明 |
| :--- | :--- |
| `pnpm dev:client` | 用户端开发服务器 |
| `pnpm dev:admin` | 管理台开发服务器 |
| `pnpm build` | 构建全部应用 |
| `pnpm test` | 各包 Rstest |
| `pnpm lint` | Biome |

Client E2E：`cd apps/client && pnpm exec playwright test`（见 `e2e.yml`）。

## 工程约定

- 状态：**Zustand**（禁止 Redux）
- 样式：**Sass CSS Modules + BEM**（禁止 Tailwind）
- UI：**antd** / ProComponents（Admin）

见 Meta-Repo [frontend-toolchain-spec](https://github.com/VistaRemote/vibeCode/blob/main/spec/frontend-toolchain-spec.md)。

## Spec

- 本仓：`spec/SPEC.md`、`spec/client-spec.md`、`spec/admin-spec.md`
- Meta-Repo：[spec/web-spec.md](https://github.com/VistaRemote/vibeCode/blob/main/spec/web-spec.md)

## 相关仓库

[shared](https://github.com/VistaRemote/shared) · [server](https://github.com/VistaRemote/server) · [docs](https://github.com/VistaRemote/docs)

## 安全 · 贡献

[SECURITY.md](./SECURITY.md) · [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
