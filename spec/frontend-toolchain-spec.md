# 前端工具链与 UI 规范（L1）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-FE-TOOLCHAIN-001` |
| **版本** | 0.2.0-draft |
| **状态** | Draft |
| **适用范围** | `web/` · `desktop/` 渲染进程 · `docs/` |

---

## 1. 原则

VistaRemote **大前端生态统一采用 Rspack 系工具链**（Rsbuild / Rspress），禁止在新子项目中引入 Vite、Webpack 独立配置或 Create React App，除非经 RFC 批准。

| 场景 | 工具 | 说明 |
| :--- | :--- | :--- |
| Web 应用（用户端 / 管理端） | **Rsbuild** | `@rsbuild/core`，底层 Rspack |
| Electron 渲染进程 | **Rsbuild** | 与 Web 共享 `rsbuild.config.base.ts` |
| 文档站 | **Rspress** | Rspack 生态，与 Web 一致 |
| React Native | **Metro** | RN 官方打包器；**不得**强行 Rspack 打包 RN 运行时 |
| 共享样式 Token | **Sass 变量包** | 可放在 `web/packages/theme`，供 RN 通过构建脚本同步 CSS 变量（P1） |

### 1.1 跨端 UI：不采用 Flutter（Normative）

| ID | 决策 | 说明 |
| :--- | :--- | :--- |
| FR-FE-X-01 | **禁止** Flutter/Dart 作为 Web/Desktop/Mobile 主 UI 栈 | 见 [ADR-0007](../adr/0007-no-flutter-cross-platform-ui.md) |
| FR-FE-X-02 | 大前端统一 **React 19** + Rsbuild（Web/Desktop）+ **RN 新架构/JSI**（Mobile） | 「Flutter GPU 更快」不适用于远控；瓶颈在 WebRTC/系统 API |
| FR-FE-X-03 | DXGI/NVENC/Hook 等仅 **Rust**（`desktop/native/`），经 N-API / Native Module 接入 | 不由 Dart 实现 |

**理由摘要**：Rspack/Rsbuild（Rust 编写）已解决构建速度；Electron Chromium **WebGL2/WebGPU** 与 RN **JSI** 已缓解运行时桥接延迟。Flutter 无法替代 Rust 底层，且与 `shared` TS 契约、antd 设计体系、Nest 生态割裂。

---

## 2. UI 组件库：Ant Design

| 端 | 库 | 版本约束 |
| :--- | :--- | :--- |
| Web Client / Admin | `antd` | ^5.x |
| Desktop Renderer | `antd` | 与 Web 同 major |
| Mobile | `@ant-design/react-native` 或 `antd-mobile` | 与 Ant 设计语言一致；**不使用** Web 版 `antd` |

### 2.1 强制约定

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-UI-01 | 使用 Ant Design **ConfigProvider** 统一主题与 locale | `zh-CN` / `en-US` 可切换 |
| FR-UI-02 | 禁止引入第二套完整组件库（MUI、Chakra 等） | Code Review |
| FR-UI-03 | 远程桌面画布区域可为原生 `<video>`/Canvas，外壳布局用 antd | |
| FR-UI-04 | 管理端表格、表单、权限菜单基于 antd **ProComponents**（`@ant-design/pro-components`）优先 | Admin 列表页 |

---

## 3. 样式：Sass

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-CSS-01 | 组件样式使用 `*.module.scss`（CSS Modules + Sass） | 无全局类名污染 |
| FR-CSS-02 | 全局入口仅 `styles/global.scss` + antd reset | |
| FR-CSS-03 | 设计 Token 定义在 `styles/_variables.scss`（颜色、间距、z-index） | 与 antd theme token 对齐 |
| FR-CSS-04 | Rsbuild 启用 Sass：`tools.sass` 或官方 sass 插件 | 构建通过 |
| FR-CSS-05 | 禁止 Tailwind 作为主样式方案 | 禁止 `tailwindcss` 依赖 |
| FR-CSS-06 | **BEM** 命名：Block `remote-session`，Element `remote-session__toolbar`，Modifier `remote-session--fullscreen` | CSS Modules 内类名；禁止随意全局 `.btn` |

### 3.1 BEM 与 CSS Modules 示例

```scss
// RemoteCanvas.module.scss
.remote-canvas { }
.remote-canvas__video { }
.remote-canvas--pip { }
```

全局仅 `styles/global.scss`；业务块禁止裸 Tailwind utility 类。

### 3.2 与 Ant Design 主题联动

```typescript
// 示例：theme 变量与 Sass 共享主色
// rsbuild.config.ts 可通过 source.define 注入 SCSS 变量（可选）
```

推荐：主色、圆角等在 `ConfigProvider` 的 `theme.token` 配置；Sass 只做布局与远程画布专用样式。

---

## 4. Rsbuild 标准配置

每个前端应用须包含：

```text
apps/<name>/
├── rsbuild.config.ts      # extends ../../rsbuild.config.base.ts
├── src/
│   ├── index.tsx
│   ├── App.tsx
│   └── styles/
│       ├── global.scss
│       └── _variables.scss
├── tsconfig.json
└── package.json
```

### 4.1 环境变量

| 变量前缀 | 用途 |
| :--- | :--- |
| `PUBLIC_*` | Rsbuild 注入浏览器（API、WS URL） |

**禁止**使用 `VITE_*`（非 Vite 项目）。

### 4.2 非功能需求

| ID | 需求 | 目标 |
| :--- | :--- | :--- |
| NFR-FE-01 | 生产构建 | 单应用冷构建 < 90s |
| NFR-FE-02 | 开发 HMR | Rsbuild dev < 3s 首编译（增量） |
| NFR-FE-03 | 分包 | `react`、`antd` 独立 chunk |

---

## 5. 状态管理：Zustand

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-STATE-01 | Web/Desktop Renderer 使用 **Zustand** 管理会话/UI 状态 | 无 Redux 依赖 |
| FR-STATE-02 | **禁止 Redux**（含 RTK）除非 RFC 推翻 ADR | CI/Review 拒绝 |
| FR-STATE-03 | 服务端状态（列表、分页）可用 **TanStack Query** 或 Zustand + fetch | 与 Zustand 不冲突 |
| FR-STATE-04 | 插件 **独立** store，不得挂载到 core store 根节点 | plugin-architecture-spec |

---

## 6. 跨应用共享（web 仓库内）

| 包 | 路径 | 内容 |
| :--- | :--- | :--- |
| `@vistaremote/web-ui`（名可调整） | `web/packages/ui` | 封装 antd 业务组件、Sass mixins |
| `@vistaremote/shared` | npm / link | 类型与常量，无 React 依赖 |

Client 与 Admin **必须**复用 `packages/ui`，禁止复制粘贴相同表单组件。

---

## 7. Out of Scope

- **Flutter / Dart** 跨端 UI（见 ADR-0007）
- Vue / Svelte 技术栈
- CSS-in-JS 作为默认（styled-components 等，除非 antd 官方示例要求）

---

## 8. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.4.0-draft | §1.1 不采用 Flutter；链 ADR-0007 |
| 2026-05-24 | 0.3.0-draft | BEM、Zustand 强制、禁 Redux |
| 2026-05-24 | 0.2.0-draft | 初版：Rspack/Rsbuild、Ant Design、Sass |
