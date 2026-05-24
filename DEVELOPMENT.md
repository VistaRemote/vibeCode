# VistaRemote 开发入口

> 人类开发者从这里开始；AI 协作者另读 [AGENTS.md](./AGENTS.md)。

## 5 分钟上手

```bash
git clone git@github.com:VistaRemote/vista-remote.git
cd vista-remote
nvm use
./init.sh              # Windows: .\init.ps1
./dev.sh               # Windows: .\dev.ps1
```

打开 `vista-remote.code-workspace`。

## 必读（Spec-Driven）

| 顺序 | 文档 |
| :--- | :--- |
| 1 | [spec/README.md](./spec/README.md) — Spec 索引 |
| 2 | [spec/spec-driven-development-spec.md](./spec/spec-driven-development-spec.md) — **如何改需求、写 FR、提 PR** |
| 3 | [spec/implementation-status.md](./spec/implementation-status.md) — **什么能写、什么还是桩** |
| 4 | 你负责的模块 Spec（如 `spec/server-spec.md`） |
| — | 性能路线图（**仅 spec**）：`spec/performance-roadmap-spec.md` |

## 常用命令

| 命令 | 作用 |
| :--- | :--- |
| `pnpm env:local` / `env:dev` / `env:sit` / `env:uat` | 切换 API 环境（重启 dev 进程生效） |
| `pnpm dev:up` | 本地 Docker + install + build shared |
| `cd server && pnpm start:dev` | 信令/API |
| `cd web && pnpm --filter @vistaremote/web-client dev` | Web 主控 |

单仓（仅 desktop/mobile）：在该仓库执行 `pnpm setup`。

## 文档站

```bash
cd docs && pnpm install && pnpm dev
```

- 开发者手册：`/guide/developer-handbook`
- 二开与定制：`/guide/customization`
- Desktop 性能：`/architecture/desktop-performance`
- 用户指南：`/user/remote-control`

## 贡献流程

[CONTRIBUTING.md](./CONTRIBUTING.md)
