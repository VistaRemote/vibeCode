# @vistaremote/shared

VistaRemote **协议层 SSOT**：跨端 TypeScript 类型、常量、Zod Schema、计费 DTO、插件 Manifest、信令与控制信封。

| Metadata | Value |
| :--- | :--- |
| **包名** | `@vistaremote/shared` |
| **许可证** | [LICENSE](./LICENSE)（个人非盈利免费；商业使用须单独授权） |

## 环境要求

- Node.js >= 24.0.0（推荐 24.11 LTS，`nvm use`）
- pnpm >= 9

## 快速开始

```bash
pnpm install
pnpm build
pnpm test
```

Meta-Repo 内其他子仓通过 `file:../shared` 引用；发布后使用 GitHub Packages SemVer。

## 脚本

| 命令 | 说明 |
| :--- | :--- |
| `pnpm build` | Rslib 构建 ESM + CJS |
| `pnpm test` | Rstest 单测 |
| `pnpm lint` | Biome check |

## 目录

| 路径 | 说明 |
| :--- | :--- |
| `src/signaling/` | 信令消息与信封 |
| `src/billing/` | 套餐、权益、订单 DTO |
| `src/pairing/` | 配对、深链 |
| `src/plugin/` | 插件 Manifest 契约 |
| `src/recording/` | 录制配置与上传 DTO |

## Spec

- 本仓：`spec/SPEC.md`
- Meta-Repo：[spec/shared-spec.md](https://github.com/VistaRemote/vibeCode/blob/main/spec/shared-spec.md)

## 发布

合并 `main` 后维护者打 tag `v*`，触发 `release.yml` → `@vistaremote/shared` on GitHub Packages。

## 相关仓库

[server](https://github.com/VistaRemote/server) · [web](https://github.com/VistaRemote/web) · [desktop](https://github.com/VistaRemote/desktop) · [mobile](https://github.com/VistaRemote/mobile)

## 安全

[SECURITY.md](./SECURITY.md) · [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
