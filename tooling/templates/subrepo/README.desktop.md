# @vistaremote/desktop

VistaRemote **Electron 被控 Agent**：屏幕采集、编码推流、DataChannel 控场、本地录制缓冲、配对与企业策略壳。

- **UI**：Rsbuild + React + antd（与 Web Client 同构）
- **底层性能**：**Rust**（DXGI/NVENC/Hook，N-API）— [ADR-0003](https://github.com/VistaRemote/vibeCode/blob/main/adr/0003-rust-not-cpp-for-native.md)、[ADR-0007](https://github.com/VistaRemote/vibeCode/blob/main/adr/0007-no-flutter-cross-platform-ui.md)

| Metadata | Value |
| :--- | :--- |
| **包名** | `@vistaremote/desktop` |
| **许可证** | [LICENSE](./LICENSE) |

## 环境要求

- Node.js >= 24.0.0（推荐 24.11 LTS，见 `.nvmrc`）
- pnpm >= 9
- `@vistaremote/shared`（`file:../shared`）
- Windows / macOS / Linux

## 快速开始

```bash
pnpm setup
pnpm dev            # Rsbuild 渲染进程 + Electron 主进程
```

Meta-Repo 全栈：[DEVELOPMENT.md](https://github.com/VistaRemote/vibeCode/blob/main/DEVELOPMENT.md)。

## 脚本

| 命令 | 说明 |
| :--- | :--- |
| `pnpm dev` | 开发模式 |
| `pnpm build` | 生产构建 |
| `pnpm test` | Rstest |
| `pnpm lint` | Biome |

## 目录（摘要）

| 路径 | 说明 |
| :--- | :--- |
| `electron/` | 主进程、WebRTC、托盘 |
| `src/` | 渲染进程 UI（Rsbuild） |
| `electron/recording/` | 端侧录制缓冲 |
| `native/` | Rust 性能模块（按 ROI 演进） |

## Spec

- 本仓：`spec/SPEC.md`、`ARCHITECTURE.md`
- Meta-Repo：[desktop-spec](https://github.com/VistaRemote/vibeCode/blob/main/spec/desktop-spec.md) · [desktop-performance-spec](https://github.com/VistaRemote/vibeCode/blob/main/spec/desktop-performance-spec.md)

## 相关仓库

[shared](https://github.com/VistaRemote/shared) · [server](https://github.com/VistaRemote/server) · [web](https://github.com/VistaRemote/web)

## 安全 · 贡献

[SECURITY.md](./SECURITY.md) · [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
