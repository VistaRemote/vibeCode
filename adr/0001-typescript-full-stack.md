# ADR-0001: TypeScript 全栈主语言

| Metadata | Value |
| :--- | :--- |
| **状态** | Accepted |
| **日期** | 2026-05-24 |

## 背景

远程桌面需 Web、Desktop（Electron）、Mobile（RN）、Server（API/信令）多端协同；团队希望 **单一主语言** 降低招聘与二开成本，并借助 RN/Electron/Node 性能持续改进。

## 决策

- **主栈**：TypeScript（React + NestJS + Electron + RN）
- **契约**：`@vistaremote/shared` 为跨端 SSOT
- **例外**：AI 重算力 `python-worker`；原生性能模块用 **Rust**（见 ADR-0003），不用 C++；**不** 采用 Flutter/Dart 跨端 UI（见 ADR-0007）

## 理由

- 开发者基数最大，插件社区可仅用 TS 开发
- 与 Rsbuild/Rspack、Biome、Rstest 工具链一致
- Meta-Repo 多仓仍可独立发布，不强制 Monorepo

## 后果

- 禁止引入第二套主语言业务栈（如 Go 微服务）除非新 ADR
- Python 仅限 ML 推理边界，不承载信令/会话

## 关联

- [ADR-0007](./0007-no-flutter-cross-platform-ui.md)
- [product-positioning-spec.md](../spec/product-positioning-spec.md)
- [frontend-toolchain-spec.md](../spec/frontend-toolchain-spec.md)
