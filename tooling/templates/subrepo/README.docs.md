# VistaRemote 文档站

基于 [Rspress 2](https://rspress.rs/)（**Rspack 生态**）的技术文档：架构、部署、API、产品优势与二开指南。

| Metadata | Value |
| :--- | :--- |
| **仓库** | `VistaRemote/docs` |
| **许可证** | [LICENSE](./LICENSE) |

## 环境要求

- Node.js >= 24.0.0（推荐 24.11 LTS，见 `.nvmrc`）
- pnpm >= 9

## 开发

```bash
pnpm install
pnpm dev
```

浏览器打开终端提示的地址（默认 `http://localhost:5173`）。

## 构建

```bash
pnpm build
pnpm preview
```

静态产物在 `doc_build/`。

## 推荐阅读

| 读者 | 文档 |
| :--- | :--- |
| 老板 / IT 负责人 | [技术选型优势](./docs/zh/architecture/tech-advantages.mdx) · [产品定位](./docs/zh/architecture/positioning.mdx) |
| 开发者 | [跨端技术栈](./docs/zh/architecture/cross-platform-stack.mdx) · [开发者手册](./docs/zh/guide/developer-handbook.mdx) |
| 运维 | [Docker 部署](./docs/zh/deploy/docker.mdx) |

## 目录

| 路径 | 说明 |
| :--- | :--- |
| `docs/zh/` | 简体中文（默认） |
| `docs/en/` | English |
| `spec/` | 本仓库 Spec 镜像 |

## Spec

Meta-Repo [spec/docs-spec.md](https://github.com/VistaRemote/vibeCode/blob/main/spec/docs-spec.md)

## 变更与安全

[CHANGELOG.md](./CHANGELOG.md) · [SECURITY.md](./SECURITY.md) · [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
