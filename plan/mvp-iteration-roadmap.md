# MVP 版本迭代路线图

与 [spec/mvp-core-flow-spec.md](../spec/mvp-core-flow-spec.md)、[ROADMAP.md](../ROADMAP.md) 对齐。

> **项目级路线图** 见 [ROADMAP.md](../ROADMAP.md)（里程碑 M0–M7 + 能力分层 L1–L6）。

## 版本一览

| 版本 | 代号 | 交付物 | 状态 |
| :--- | :--- | :--- | :--- |
| **MVP-B.0** | Pair | 配对 API、防刷、LAN URL、配对页 | 🟢 |
| **MVP-B.1** | Signal | WSS 房间、P2P 降级、诊断 API、E2E 脚本 | 🟢 |
| **MVP-B.2** | Connect | offer/answer 时序、recvonly、重试、状态 UI | 🟢 |
| **MVP-B.3** | Media | 桌面采集、video 出画 | 🟢 |
| **MVP-B.4** | Control | DataChannel 键鼠、相对坐标、Win 注入 | 🟢 |
| **v0.2** | Resilience | WS 重连、ICE restart、错误分级 | 🟢 `b9` |
| **v0.3** | Perf | BWE/ABR、backgroundThrottling、DPI 注入 | ⬜ |
| **v0.4 MD-1** | Picker | 多屏选屏；单屏自动主屏无 UI | 🟢 `b9` |
| **v0.5 MD-2** | Switch | 单屏热切换 + On-Demand 编码 | 🟢 `b10` |
| **v0.6 MD-3** | Multi-Win | 多窗口 / 多路 Stream（TeamViewer 式） | ⬜ |

> **多显示器专项**：见 [multi-display-iteration-roadmap.md](./multi-display-iteration-roadmap.md)

## MVP-B.0～B.4 任务板

### MVP-B.0 配对

- [x] create/join pairing API
- [x] Web `/pairing` + sessionStorage
- [x] IP rate limit + 单测
- [x] signalingUrl 127.0.0.1
- [x] 配对页 Server health / mvpBuild 提示

### MVP-B.1 信令

- [x] peer-joined / offer broadcast
- [x] SFU→P2P 降级
- [x] fanout 去重
- [x] debug room API + mvp signaling-room
- [x] 渲染进程独占 WS（无 IPC 双连接）

### MVP-B.2 WebRTC

- [x] Agent offerer / Web answerer
- [x] Web PC 先于 join
- [x] recvonly transceiver
- [x] offer 周期性重发
- [x] 连接诊断 UI
- [x] Web 信令 WS 断线自动 re-join（v0.2 轻量）

### MVP-B.3 画面

- [x] getDisplayMedia + addTrack
- [x] video 元素播放
- [x] 首帧超时提示
- [x] 单屏默认；**多屏可选显示器**（Agent UI）
- [x] ICE/pc 状态诊断（Agent + Web）

### MVP-B.4 控制

- [x] DataChannel CONTROL
- [x] 相对坐标 schema（+ code / deltaY）
- [x] Win32 鼠标/基础键注入（koffi）
- [ ] 系统 SendInput Daemon（v0.3 完整）

## v0.2 韧性

- [x] WebSocket 断线重连 + 同一 `sessionId` re-join（Web + Agent）
- [x] `RTCPeerConnection` ICE restart（Agent offer + 控制端恢复）
- [x] 轻微/中等/严重错误分级与自动重试（`session-resilience.ts`）

## v0.3 性能与控制注入（规划）

- [x] `backgroundThrottling: false`（Agent webPreferences）
- [ ] WebRTC-BWE 驱动码率/分辨率
- [ ] 受控端 Daemon + DPI 换算

## 文档同步

| 文档 | 路径 |
| :--- | :--- |
| Spec | `spec/mvp-core-flow-spec.md` |
| 多屏 Spec / 路线图 | `spec/multi-display-spec.md` · `plan/multi-display-iteration-roadmap.md` |
| 跑通指南 | `plan/mvp-e2e-runbook.md` |
| 用户指南 | `docs/guide/mvp-getting-started.md` |
| 实现矩阵 | `spec/implementation-status.md` |

## 当前构建号

**`20260604-b10`** — v0.5 MD-2 会话内热切换显示器 + 按屏坐标注入。

## v0.5 MD-2 热切换

- [x] shared：`display-topology` / `set-active-display` / `active-display-changed`
- [x] Agent：`replaceTrack` + 重协商 offer；On-Demand 仅采当前屏
- [x] Web：工具栏切换 + `display-switching` 状态
- [x] Win32 注入按 `displayIndex` 映射屏幕 bounds
