# @vistaremote/server

VistaRemote **信令与 API 服务**（NestJS）：WebSocket 信令、REST、Admin、计费、配对、ICE/SFU 调度、SSE 业务通知、BullMQ 入队。

| Metadata | Value |
| :--- | :--- |
| **包名** | `@vistaremote/server` |
| **许可证** | [LICENSE](./LICENSE) |

## 环境要求

- Node.js >= 24.0.0（推荐 24.11 LTS，见 `.nvmrc`）
- pnpm >= 9
- MySQL 8、Redis（本地见 `deploy/compose` 或 Meta-Repo `pnpm dev:up`）
- 同级目录已构建的 `@vistaremote/shared`（`file:../shared`）

## 快速开始

```bash
pnpm install
cp .env.example .env   # 按需修改
pnpm start:dev
```

默认健康检查与信令路由见 `src/main.ts`。

## 脚本

| 命令 | 说明 |
| :--- | :--- |
| `pnpm start:dev` | 开发热重载 |
| `pnpm build` | 生产构建 |
| `pnpm test` | Rstest 单测 |
| `pnpm lint` | Biome |
| `pnpm test:perf` | k6 smoke（需安装 k6） |
| `pnpm migration:run` | TypeORM 迁移（实体就绪后） |

## 目录

| 路径 | 说明 |
| :--- | :--- |
| `src/signaling/` | WSS 信令网关 |
| `src/pairing/` | 配对接入 API |
| `src/billing/` | 权益与订单 |
| `src/sfu/` | SFU 调度抽象 |
| `src/queue/` | BullMQ 生产者 |
| `perf/k6/` | 性能冒烟脚本 |

## Spec

- 本仓：`spec/SPEC.md`
- Meta-Repo：[spec/server-spec.md](https://github.com/VistaRemote/vibeCode/blob/main/spec/server-spec.md) · [job-queue-spec](https://github.com/VistaRemote/vibeCode/blob/main/spec/job-queue-spec.md)

## Docker

```bash
docker build -t vistaremote/server:local .
```

发布 tag `server-v*` 见本仓 `.github/workflows/release.yml`。

## 相关仓库

[shared](https://github.com/VistaRemote/shared) · [web](https://github.com/VistaRemote/web) · [deploy](https://github.com/VistaRemote/deploy) · [ai](https://github.com/VistaRemote/ai)

## 安全 · 贡献

[SECURITY.md](./SECURITY.md) · [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) · Meta [CONTRIBUTING](https://github.com/VistaRemote/vibeCode/blob/main/CONTRIBUTING.md)
