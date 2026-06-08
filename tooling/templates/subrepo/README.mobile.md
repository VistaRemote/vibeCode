# @vistaremote/mobile

VistaRemote **移动端主控**（React Native 新架构 + JSI）：触控远控、`react-native-webrtc`、信令与 `shared` 契约对齐。**不采用 Flutter**（[ADR-0007](https://github.com/VistaRemote/vibeCode/blob/main/adr/0007-no-flutter-cross-platform-ui.md)）。

| Metadata | Value |
| :--- | :--- |
| **包名** | `@vistaremote/mobile` |
| **许可证** | [LICENSE](./LICENSE) |

## 职责

- 配对、远程会话、套餐权益展示
- **不负责**被控端屏幕采集（见 `desktop` 仓库）

## 环境要求

- Node.js >= 24.0.0（推荐 24.11 LTS，见 `.nvmrc`）
- pnpm >= 9
- React Native 开发环境（Android Studio / Xcode）
- `@vistaremote/shared`（`file:../shared`）

## 快速开始

```bash
pnpm setup
cp .env.example .env
pnpm start          # 带 env 的 Metro
pnpm android        # 或 pnpm ios
```

## 性能约定

- 新架构 + **JSI** 绑定 WebRTC 热路径
- 视频用原生 Surface/TextureView，非纯 JS Canvas

见 Meta [mobile-spec](https://github.com/VistaRemote/vibeCode/blob/main/spec/mobile-spec.md)。

## Spec

- 本仓：`spec/SPEC.md`
- Meta-Repo：[spec/mobile-spec.md](https://github.com/VistaRemote/vibeCode/blob/main/spec/mobile-spec.md)

## 相关仓库

[shared](https://github.com/VistaRemote/shared) · [server](https://github.com/VistaRemote/server) · [web](https://github.com/VistaRemote/web)

## 安全 · 贡献

[SECURITY.md](./SECURITY.md) · [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
