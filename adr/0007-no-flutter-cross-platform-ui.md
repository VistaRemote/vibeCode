# ADR-0007: 跨端 UI 不采用 Flutter

| Metadata | Value |
| :--- | :--- |
| **状态** | Accepted |
| **日期** | 2026-05-24 |

## 背景

远程桌面产品需 **Web、Electron 桌面、React Native 移动** 三端主控/控制台 UI，并与 NestJS 后端、WebRTC、`shared` 契约深度集成。业界常见替代方案为 **Flutter**（Dart + Skia/Impeller GPU 渲染），宣传点多为「一套代码、GPU 直绘、比 JS 跨端更流畅」。

VistaRemote 的大前端已统一 **Rsbuild/Rspack（Rust 实现的高速打包）+ React 19 + Ant Design**；桌面为 Electron（Chromium），移动为 React Native 新架构（JSI）。需明确 **不** 将 Flutter 作为跨端 UI 主栈。

## 决策

- **跨端 UI 主栈**：React 系 — Web/Admin/Desktop Renderer 用 **Rsbuild**；Mobile 用 **React Native + Metro** + antd-mobile 系
- **禁止**：新子项目以 Flutter/Dart 作为主 UI 或业务逻辑层；禁止用 Flutter 实现 Desktop Agent 采集/编码/键鼠 Hook
- **原生性能模块**：屏幕捕获、硬件编码、系统级输入等由 **Rust**（`desktop/native/`，N-API）承担，见 [ADR-0003](./0003-rust-not-cpp-for-native.md) — **不由 Dart/Flutter 承担**

## 理由

### 1. 「Flutter GPU 比 JS 跨端快」已非当前瓶颈

| 层面 | 现状 |
| :--- | :--- |
| **构建** | Rspack/Rsbuild 以 Rust 编写，冷启动与增量编译已达「数百毫秒～秒级」量级，Meta-Repo 分仓避免 Monorepo 构建黑洞 |
| **Web / Electron** | Chromium 对 **WebGL2 / WebGPU** 支持成熟；远程画面以 `<video>` / WebCodecs 硬解为主，外壳 UI 用 React + antd 即可 |
| **React Native** | **新架构 + JSI** 使 JS 与 Native（`react-native-webrtc` 等）热路径接近零拷贝直连，历史「桥接延迟」已不是主矛盾 |
| **React 19** | 并发渲染、Suspense 等进一步改善交互卡顿 |

Flutter 的核心卖点（Skia/Impeller 直绘）主要优化 **自绘 UI 控件树** 的帧率，而 VistaRemote 主控端的性能敏感点在 **音视频管线与系统 API**，不在 Dart 布局性能。

### 2. 远程桌面底层能力 Dart/Flutter 无法胜任

以下能力 **必须** 使用 OS 级 API 与原生库，Flutter 生态无成熟、可维护的等价方案：

| 能力 | 需要的技术 | Flutter/Dart |
| :--- | :--- | :--- |
| Windows 低延迟截屏 | **DXGI Desktop Duplication** | 无一等公民支持 |
| 硬件编码 | **NVENC / QSV / VAAPI** | 需大量 FFI 胶水，非 Flutter 强项 |
| 系统级键鼠 Hook | Win/macOS 全局输入注入 | 与 Flutter 渲染栈无关，仍需 C++/Rust |
| 零帧 IPC / 共享内存 | 与 Electron Agent Service 协同 | 不适合放在 Dart isolate |

因此即便 UI 用 Flutter，**仍要另起 C++/Rust 进程或插件**，团队维护 **Dart + Rust/C++** 双轨，收益低于 **TypeScript 外壳 + Rust 核心**（见 ADR-0003）。

### 3. 与现有工程资产一致

- **契约**：`@vistaremote/shared`、信令、SSE、BullMQ Job 类型均为 TypeScript SSOT
- **插件**：`plugin-architecture-spec` 面向 TS 动态 `import()` / N-API，非 Flutter plugin 模型
- **招聘与二开**：国内 React/NestJS 储备远大于 Flutter；客户定制 Admin/SSO 以 TS 模块为主
- **工具链**：Biome、Rstest、Rsbuild 已统一；引入 Flutter 需 **Dart 工具链 + 双套 CI**，破坏 Meta-Repo 轻量原则

### 4. Rust 分工清晰，不替代 React 跨端

- **Rspack/Rsbuild**：Rust 用于 **打包性能**，不改变运行时 UI 框架
- **可选 WASM**：前端热点可用 Rust→WASM 优化（与 Flutter 无关）
- **运行时原生**：Rust 工程师通过 **N-API（napi-rs）** 编译 Node 原生模块供 **Electron** 主进程/Agent Service 使用；RN 侧通过 **Native Module + JSI** 暴露同一套底层能力（按平台封装）

Flutter 无法减少 Rust 需求量，反而增加 Dart 层维护成本。

## 后果

- `mobile/` 保持 React Native；`web/`、`desktop/` 渲染进程保持 Rsbuild + React
- 性能路线图（DXGI、NVENC 等）仅在 `desktop/native/`（Rust）立项，见 `performance-roadmap-spec`
- PR 引入 Flutter 子工程或 Dart 业务代码 → 需新 ADR 推翻本决策

## 备选方案

| 方案 | 未采纳原因 |
| :--- | :--- |
| **Flutter 全端** | 底层采集/编码仍要原生；`shared` 契约与 Nest 生态割裂 |
| **Flutter 仅 Mobile** | 三端两套 UI 体系（RN Web 已有投入）；JSI 方案已满足远控 |
| **仅 Web，无 RN** | 产品需移动端主控（US-02）；RN 与 Web 共享 TS 逻辑 |

## 关联

- [ADR-0001](./0001-typescript-full-stack.md) · [ADR-0003](./0003-rust-not-cpp-for-native.md)
- [frontend-toolchain-spec.md](../spec/frontend-toolchain-spec.md)
- [mobile-spec.md](../spec/mobile-spec.md)
- [desktop-performance-spec.md](../spec/desktop-performance-spec.md)
