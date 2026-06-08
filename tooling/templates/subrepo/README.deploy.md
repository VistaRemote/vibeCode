# @vistaremote/deploy

VistaRemote **部署与基础设施**：Docker Compose 全栈模板、mediasoup-controller、coturn profile、本地开发栈。

| Metadata | Value |
| :--- | :--- |
| **包名** | `@vistaremote/deploy` |
| **许可证** | [LICENSE](./LICENSE) |

本仓 **不打包** 业务应用源码；组合 `server` / `ai` / `web` 等镜像 tag 或 digest。

## 环境要求

- Node.js >= 24.0.0（推荐 24.11 LTS，见 `.nvmrc`）— 用于 lint/测试脚本
- Docker / Docker Compose（运行 compose 栈）

## 快速开始

```bash
# 推荐通过 Meta-Repo
cd vista-remote && pnpm dev:up

# 或仅本仓
cd deploy
cp compose/.env.example compose/.env
docker compose -f compose/docker-compose.dev.yml --profile coturn up -d
```

详见 [compose/README.md](./compose/README.md)。

## 脚本

| 命令 | 说明 |
| :--- | :--- |
| `pnpm lint` | Biome |
| `pnpm test` | Rstest（栈配置冒烟） |

## 目录

| 路径 | 说明 |
| :--- | :--- |
| `compose/` | 开发用 docker-compose.dev.yml |
| `mediasoup-controller/` | SFU 侧车 Node 服务 |
| `docker-compose.yml` | 顶层组合入口 |

## Spec

- 本仓：`spec/SPEC.md`
- Meta-Repo：[spec/deploy-spec.md](https://github.com/VistaRemote/vibeCode/blob/main/spec/deploy-spec.md)

## 相关仓库

[server](https://github.com/VistaRemote/server) · [ai](https://github.com/VistaRemote/ai) · [web](https://github.com/VistaRemote/web)

## 安全 · 贡献

[SECURITY.md](./SECURITY.md) · [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
