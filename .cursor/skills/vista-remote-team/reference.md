# VistaRemote 团队协作 — 参考

## 子仓库清单（SSOT）

见 [.meta/manifest.json](../../../.meta/manifest.json)。

| 键 | 路径 | 必选 | 说明 |
| :--- | :--- | :--- | :--- |
| shared | `shared/` | ✅ | 契约、Zod、错误码 |
| server | `server/` | ✅ | 信令、API、配对 |
| web | `web/` | ✅ | Client + Admin |
| desktop | `desktop/` | ⬜ | Electron Agent |
| mobile | `mobile/` | ⬜ | RN 主控 |
| ai | `ai/` | ⬜ | BullMQ / LLM |
| docs | `docs/` | ⬜ | Rspress |
| deploy | `deploy/` | ⬜ | Compose / coturn |

## 跨仓 PR 顺序示例

**功能：配对码 + WebRTC 会话**

```text
1. spec/mvp-core-flow-spec.md（Meta，若改 FR）
2. shared — pairing + signaling types
3. server — pairing.service + signaling
4. web — RemoteSessionPage
5. desktop — agent-webrtc
6. spec/implementation-status.md（Meta，更新就绪度）
```

## 分支命名

| 前缀 | 用途 |
| :--- | :--- |
| `feat/` | 功能（跨仓同名） |
| `fix/` | 修复 |
| `docs/` | 仅文档 |
| `chore/` | 工具链、依赖 |

## Biome 检查位置

| 位置 | 命令 |
| :--- | :--- |
| Meta 脚手架 | 根目录 `pnpm check` |
| server | `cd server && pnpm lint` |
| web | `cd web && pnpm lint` |
| desktop | `cd desktop && pnpm lint` |

Meta 根 **不** lint 已 clone 的子仓源码（`.gitignore` + Biome VCS）。

## 环境 profile

```bash
pnpm env:local   # 默认本机
pnpm env:dev
pnpm env:sit
pnpm env:uat
```

写入各子仓 `.env`（见 `config/environments/`）。

## Issue / PR 模板

- `.github/ISSUE_TEMPLATE/` — feature、bug、tech_debt、plugin
- `.github/PULL_REQUEST_TEMPLATE.md`

## 同步子仓脚手架

```bash
pnpm setup:subrepo-docs
node tooling/scripts/setup-ide-config.mjs server web desktop
```

## 相关 Spec 索引

| 主题 | 文档 |
| :--- | :--- |
| Meta-Repo 开发 | [meta-repo-development-spec.md](../../../spec/meta-repo-development-spec.md) |
| Git 协作 | [git-collaboration-spec.md](../../../spec/git-collaboration-spec.md) |
| 团队节奏 | [team-collaboration-spec.md](../../../spec/team-collaboration-spec.md) |
| SDD | [spec-driven-development-spec.md](../../../spec/spec-driven-development-spec.md) |
| WebRTC | [webrtc-architecture-spec.md](../../../spec/webrtc-architecture-spec.md) |
