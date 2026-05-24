# Web 用户端（Client）Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-WEB-CLIENT-001` |
| **应用** | `web/apps/client/` |
| **版本** | 0.2.0-draft |
| **父文档** | [web-spec.md](./web-spec.md) |

---

## 1. 职责

面向 **主控用户** 的轻量 Web 应用：配对码加入会话、WebRTC 收流、发送远程控制指令。

---

## 2. 页面结构

| 路由 | 页面 | 组件（antd） |
| :--- | :--- | :--- |
| `/` | 首页/登录（P1 OAuth） | `Card`, `Form`, `Button` |
| `/pairing` | 输入配对码 | `Input`, `Form` |
| `/session/:roomId` | 远程桌面 | 自定义 `RemoteCanvas` + `Layout` |
| `/settings` | 画质、快捷键说明 | `Drawer` / 独立页 |

样式：各页 `*.module.scss`，全局 `styles/global.scss`。

---

## 3. 功能需求

| ID | 需求 | 验收标准 |
| :--- | :--- | :--- |
| FR-WCL-01 | 配对页提交码后连接 WS 并加入 Room | `message.error` 展示 `shared` 错误码 |
| FR-WCL-02 | 1:1 作为 Controller 完成 SDP 交换 | 视频渲染帧可见 |
| FR-WCL-03 | 画布捕获 pointer/wheel/keyboard → DataChannel | 映射 `ControlEnvelope` |
| FR-WCL-04 | 全屏、适应窗口 | `FullscreenOutlined` 或浏览器 API |
| FR-WCL-05 | 连接状态机 UI | `Badge` + `Spin`：`idle`→`connecting`→`connected`→`reconnecting`→`failed` |
| FR-WCL-06 | ICE 仅来自 Server API | |
| FR-WCL-07 | SFU（mediasoup）模式仅 Subscribe | 被控单路上行 |
| FR-WCL-11 | `RemotePlayer`：WebCodecs 优先，回退 video；`JitterBuffer` + 流畅/清晰档位 | 主线程无长任务解码 |
| FR-WCL-12 | `RtcTuning` 与 Server ICE API 一致 | 见 `web/apps/client/src/webrtc/` |
| FR-WCL-13 | 信令 **WebSocket**（`SignalingClient`），非 SSE | messaging-transport-spec |
| FR-WCL-14 | 业务通知 **SSE**（`EventStreamClient`），与信令分离 | |
| FR-WCL-15 | 登录后 Controller JWT；信令前换取 **Signaling Ticket** | [authorization-spec](./authorization-spec.md) |
| FR-WCL-16 | UI/能力按 `orgRole` + Plan 隐藏（如录制、多屏监控） | `shared` Permission |
| FR-WCL-15 | 解码优先 **decode.worker** + `DecodeWorkerBridge` | 主线程仅上屏 |
| FR-WCL-08 | 响应式：最小宽度 1024px 为 P0；窄屏只读提示（P1） | |
| FR-WCL-09 | Pro：我的录制列表与回放播放器 | `plan=pro` |
| FR-WCL-10 | Pro：会话结束后查看 AI 摘要 | 只读 Markdown |

---

## 4. 非功能需求

| ID | 需求 | 目标 |
| :--- | :--- | :--- |
| NFR-WCL-01 | 首屏 JS（gzip） | < 350KB（antd 按需加载后） |
| NFR-WCL-02 | Rsbuild 生产构建 | < 60s |
| NFR-WCL-03 | antd 按需引入 + Rsbuild `source.transformImport` | 无全量 antd |

---

## 5. 安全

- Token：`sessionStorage`
- 仅 HTTPS；`X-Frame-Options: DENY`

---

## 6. Out of Scope

- 用户管理、设备批量导入（属 Admin）
- PWA 离线

---

## 7. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.2.0-draft | 自 web-spec 拆出；antd + Sass |
