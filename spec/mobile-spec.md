# Mobile 主控端 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-MOB-001` |
| **仓库** | `mobile/` |
| **技术栈** | React Native, TypeScript, **Ant Design Mobile** |
| **版本** | 0.2.0-draft |

---

## 1. 职责

**移动端主控**：触控手势 → 远程控制指令；视频渲染；信令与 WebRTC 与 web 逻辑对齐。

**不负责**：作为被控端采集屏幕（Out of Scope）。

---

## 2. 目录结构（目标）

```text
mobile/
├── src/
│   ├── screens/
│   │   ├── PairingScreen.tsx
│   │   └── RemoteScreen.tsx
│   ├── services/
│   │   ├── signaling.ts
│   │   ├── webrtc.ts          # react-native-webrtc
│   │   └── control.ts
│   ├── components/
│   └── navigation/
├── android/
├── ios/
└── package.json
```

---

## 3. 性能（JSI）

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-MOB-PERF-01 | 使用 **React Native 新架构** + **JSI** 绑定 `react-native-webrtc` 热路径 | 远控时 JS 线程 Long Task 低于 Web 回退方案 |
| FR-MOB-PERF-02 | 触控 → `ControlEnvelope` 在 UI 线程外批量合并（防抖） | 滑动流畅 |
| FR-MOB-PERF-03 | 视频渲染用 **原生 Surface/TextureView**，避免纯 JS canvas | 30fps 稳定 |

详见 [product-positioning-spec.md](./product-positioning-spec.md)、[webrtc-architecture-spec.md](./webrtc-architecture-spec.md)（主控播放以 Web 为基准）。

---

## 4. 核心依赖

| 包 | 用途 |
| :--- | :--- |
| `react-native-webrtc` | PeerConnection、媒体轨 |
| `@react-navigation/native` | 路由 |
| `antd-mobile` 或 `@ant-design/react-native` | UI 组件（与 Web antd 设计语言一致） |

**构建**：RN 使用 **Metro**（非 Rsbuild）；样式可用 Sass（`react-native-sass` 或构建时编译为 StyleSheet，P1）。

**注意**：Metro 与 Monorepo symlink 不兼容——`shared` 通过 npm 包引用，禁止 Meta-Repo 根目录 hoist 到 mobile。

---

## 5. 功能需求

| ID | 需求 | 验收标准 |
| :--- | :--- | :--- |
| FR-MOB-01 | 配对码加入 Room，流程同 web | |
| FR-MOB-02 | 远程画面全屏，`RTCView` 渲染 | 横竖屏适配 |
| FR-MOB-06 | 传输模式与 web 一致：默认 P2P，SFU 仅订阅 | 见 webrtc-architecture-spec |
| FR-MOB-07 | 弱网降档与 `maintain-framerate` 发送策略（P1） | |
| FR-MOB-03 | 单指拖动 → `mouse-move` 序列 | 流畅无抖动 |
| FR-MOB-04 | 单击 → `mouse-down` + `mouse-up` | |
| FR-MOB-05 | 双指捏合 → 滚轮或缩放（默认映射滚轮） | 行为写入用户文档 |
| FR-MOB-06 | 软键盘弹出时发送 `key-down/up` | 可输入英文 |
| FR-MOB-07 | 后台/来电时暂停发送并提示重连 | |
| FR-MOB-08 | iOS/Android 权限文案与 App Store 审核合规 | |

---

## 6. 平台要求

| 平台 | 最低版本 |
| :--- | :--- |
| iOS | 15+ |
| Android | API 26+ |

---

## 7. 非功能需求

| ID | 需求 | 目标 |
| :--- | :--- | :--- |
| NFR-MOB-01 | 冷启动到配对页 | < 2s（中端机） |
| NFR-MOB-02 | 电池：无会话时无 WebRTC 常驻 | |

---

## 8. Out of Scope

- 平板专属布局优化（P1）
- 蓝牙外设映射

---

## 9. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.1.0-draft | 初稿 |
| 2026-05-24 | 0.2.0-draft | Ant Design Mobile；Metro 说明 |
| 2026-05-24 | 0.3.0-draft | JSI 性能 FR-MOB-PERF |
