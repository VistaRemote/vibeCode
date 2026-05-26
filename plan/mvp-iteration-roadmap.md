# MVP 版本迭代路线图

与 [spec/mvp-core-flow-spec.md](../spec/mvp-core-flow-spec.md)、[ROADMAP.md](../ROADMAP.md) 对齐。

> **项目级路线图** 见 [ROADMAP.md](../ROADMAP.md)（里程碑 M0–M7 + 能力分层 L1–L6）。

## 版本一览

| 版本 | 代号 | 交付物 | 状态 |
| :--- | :--- | :--- | :--- |
| **MVP-B.0** | Pair | 配对 API、防刷、LAN URL、配对页 | 🟡 进行中 |
| **MVP-B.1** | Signal | WSS 房间、P2P 降级、诊断 API、E2E 脚本 | 🟡 进行中 |
| **MVP-B.2** | Connect | offer/answer 时序、recvonly、重试、状态 UI | 🟡 进行中 |
| **MVP-B.3** | Media | 桌面采集、video 出画 | 🟡 进行中 |
| **MVP-B.4** | Control | DataChannel 键鼠、相对坐标 | 🟡 进行中 |
| **v0.2** | Resilience | WS 重连、ICE restart、错误分级 | ⬜ |
| **v0.3** | Perf | BWE/ABR、backgroundThrottling、DPI 注入 | ⬜ |
| **v0.4 MD-1** | Picker | 多屏用户：连接前选择显示器（向日葵式） | ⬜ |
| **v0.5 MD-2** | Switch | 单屏热切换 + On-Demand 编码 | ⬜ |
| **v0.6 MD-3** | Multi-Win | 多窗口 / 多路 Stream（TeamViewer 式） | ⬜ |

> **多显示器专项**（捕获 / 编码 / 交互三层）：见 [multi-display-iteration-roadmap.md](./multi-display-iteration-roadmap.md) · [spec/multi-display-spec.md](../spec/multi-display-spec.md)

## MVP-B.0～B.4 任务板

### MVP-B.0 配对

- [x] create/join pairing API
- [x] Web `/pairing` + sessionStorage
- [ ] IP rate limit（本次）
- [x] signalingUrl 127.0.0.1

### MVP-B.1 信令

- [x] peer-joined / offer broadcast
- [x] SFU→P2P 降级
- [x] fanout 去重
- [ ] debug room API（本次）
- [ ] Agent IPC 缓冲（已有）

### MVP-B.2 WebRTC

- [x] Agent offerer / Web answerer
- [x] Web PC 先于 join
- [ ] recvonly transceiver（本次）
- [ ] offer 周期性重发（本次）
- [ ] 连接诊断 UI（本次）

### MVP-B.3 画面

- [x] getDisplayMedia + addTrack
- [x] video 元素播放
- [ ] 首帧超时提示（本次）
- [x] **单屏**：自动主屏（多屏用户仅主屏，见 multi-display-spec）
- [ ] 诊断展示当前 `displayIndex`（可选）

### MVP-B.4 控制

- [x] DataChannel CONTROL
- [x] 相对坐标 schema
- [ ] 系统 SendInput（v0.3）

## v0.2 韧性（规划）

- WebSocket 指数退避重连 + 同一 `sessionId` re-join
- `RTCPeerConnection` ICE restart
- 轻微：ICE/信令自动重试；中等：降分辨率；严重：提示重配

## v0.3 性能与控制注入（规划）

- `BrowserWindow` `backgroundThrottling: false`
- WebRTC-BWE 驱动码率/分辨率
- 受控端 Daemon + DPI 换算（desktop-performance-spec）

## 文档同步

| 文档 | 路径 |
| :--- | :--- |
| Spec | `spec/mvp-core-flow-spec.md` |
| 多屏 Spec / 路线图 | `spec/multi-display-spec.md` · `plan/multi-display-iteration-roadmap.md` |
| 跑通指南 | `plan/mvp-e2e-runbook.md` |
| 用户指南 | `docs/guide/mvp-getting-started.md` |
| 实现矩阵 | `spec/implementation-status.md` |
