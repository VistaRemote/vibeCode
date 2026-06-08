# ADR-0003: 性能热点用 Rust，不用 C++

| Metadata | Value |
| :--- | :--- |
| **状态** | Accepted |
| **日期** | 2026-05-24 |

## 背景

Desktop 捕获、编码、零帧 IPC 等路径需原生优化；需控制内存安全与跨平台构建复杂度。

## 决策

- 原生性能模块放在 `desktop/native/`（及未来必要 crates）
- **语言**：Rust（napi-rs / FFI 至 Electron）
- **禁止**：新增 C++ 业务模块；遗留 C++ 仅通过 Rust 封装或淘汰
- **节奏**：按 [performance-roadmap-spec.md](../spec/performance-roadmap-spec.md) ROI 立项（R1–R6），**不对用户文档承诺时间表**

## 理由

- 内存安全、现代工具链（cargo）、与 TS 通过 **N-API（napi-rs / Node-Addon-API）** 衔接
- Rust 模块编译为 **`.node` 原生扩展**，由 Electron 主进程或 **Agent Service** 加载；RN 侧通过 **Native Module + JSI** 暴露同一底层能力（按平台封装）
- 远程桌面热点（**DXGI 截屏、NVENC/QSV 硬件编码、系统级键鼠 Hook、零帧 IPC**）**Dart/Flutter 无法胜任**，必须由 Rust/C++ 级原生实现；本项目统一 **Rust**，禁止再叠 C++ 业务模块
- 避免 C++ 与 Electron/Node ABI 长期纠缠
- **Rspack/Rsbuild 已用 Rust 加速前端构建**；可选 **WASM** 优化浏览器热点——与 UI 框架无关。Rust 工程师可 **纯粹专注音视频底层**，不维护 Flutter/Dart 层（见 [ADR-0007](./0007-no-flutter-cross-platform-ui.md)）
- 团队可渐进引入，不阻塞 MVP TS 交付；维护者熟悉 Rust 时 ROI 更高

## 后果

- `desktop/native/README.md` 为占位直至 R1 立项
- PR 引入 `.cpp` 业务代码 → CI/Review 拒绝（除非维护者 ADR 修订）

## 关联

- [ADR-0007](./0007-no-flutter-cross-platform-ui.md)
- [desktop-performance-spec.md](../spec/desktop-performance-spec.md)
- [spec/docs-spec.md](../spec/docs-spec.md) FR-DOC-06（用户文档不写 Rust 排期）
