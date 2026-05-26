# MVP 核心链路规范（配对 → 信令 → WebRTC → 画面/控制）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-MVP-CORE-001` |
| **版本** | 1.0.0 |
| **状态** | Active |
| **关联** | [webrtc-architecture-spec.md](./webrtc-architecture-spec.md) · [messaging-transport-spec.md](./messaging-transport-spec.md) · [agent-distribution-spec.md](./agent-distribution-spec.md) · [desktop-performance-spec.md](./desktop-performance-spec.md) |

---

## 1. 目标与范围

**MVP-B 唯一北极星**：在局域网/本机环境下，完成 **1 Agent + 1 Controller** 的闭环：

```text
配对 (Pairing) → 信令 (Signaling) → WebRTC (ICE/SDP) → 画面 (RTP) + 控制 (DataChannel)
```

本 Spec 定义分阶段能力、功能 ID、验收标准与测试方式。未标「MVP」的条目归入 **v0.2+**，不在 MVP 阻断发布。

---

## 2. 阶段拆解与版本映射

| 阶段 | 版本 | 目标 | 阻断 MVP |
| :--- | :--- | :--- | :--- |
| **P0 配对** | MVP-B.0 | 创建/消费配对会话，防刷，局域网 URL | 是 |
| **S0 信令** | MVP-B.1 | WSS join/offer/answer/ICE，房间可见，可诊断 | 是 |
| **W0 WebRTC** | MVP-B.2 | P2P 1:1，STUN，连接状态可观测 | 是 |
| **M0 画面** | MVP-B.3 | 受控端采集，控制端 `<video>` 出画 | 是 |
| **C0 控制** | MVP-B.4 | DataChannel 键鼠事件到达 Agent（日志验证） | 是 |
| **R0 韧性** | v0.2 | 断线重连、重传、分级错误 | 否 |
| **P1 性能** | v0.3+ | ABR/BWE、后台节流关闭、DPI 注入 | 否 |

---

## 3. 功能需求与验收

### 3.1 配对阶段 (Pairing & Authentication)

| ID | 需求 | MVP 实现 | 验收标准 | 测试 |
| :--- | :--- | :--- | :--- | :--- |
| FR-MVP-P01 | Agent 创建配对会话 | `POST /devices/pairing-session` | 返回 `numericCode`、`sessionId` | API 单测 / Agent UI 显示码 |
| FR-MVP-P02 | Controller 数字码加入 | `POST /auth/pairing` | 返回 `sessionId`、`signalingUrl` 与 Agent 一致 | E2E 脚本 + UI sess 后 8 位一致 |
| FR-MVP-P03 | 配对防刷 | 同 IP 60s 内 ≤20 次 join/create | 超限 HTTP 429 + `RATE_LIMITED` | 单测连打 21 次 |
| FR-MVP-P04 | 局域网优化 | `signalingUrl` 使用 `127.0.0.1`（可 env 覆盖） | 无公网依赖即可 WS 连接 | 断外网后本机仍可连 |
| FR-MVP-P05 | 一次性配对 | `allowMultiController: false` 时二次 join 返回 `PAIRING_CONSUMED` | 文档 + 单测 | pairing.service.test |
| FR-MVP-P06 | 会话恢复提示 | 刷新 `/session` 从 `sessionStorage` 恢复 join | 30min 内 F5 仍可连（同 server 进程） | 手工 |

### 3.2 信令阶段 (Signaling Exchange)

| ID | 需求 | MVP 实现 | 验收标准 | 测试 |
| :--- | :--- | :--- | :--- | :--- |
| FR-MVP-S01 | WSS `/signaling` | Nest `SignalingGateway` | 双端可 join 同一 `sessionId` | `mvp-signaling-e2e.mjs` |
| FR-MVP-S02 | peer-joined 广播 | 第二人 join 后第一人收到 | Agent inbox 含 `peer-joined` | E2E |
| FR-MVP-S03 | 1:1 强制 P2P | `viewerCount===2` → `mode:p2p` | 无 `session-mode` SFU 推送 | E2E ctrl inbox |
| FR-MVP-S04 | 无 SFU 拒绝 join | 无权益时降级 P2P，不返回 error | ctrl join `ok` | signaling.service.test |
| FR-MVP-S05 | offer/answer 中继 | `broadcast` 到对端 socket | ctrl 收到 offer | E2E |
| FR-MVP-S06 | 信令诊断 API | `GET /api/v1/debug/signaling/room/:id`（dev） | 返回 `roomPeers`、`liveSockets` | 会话页轮询展示 |
| FR-MVP-S07 | 消息不双发 | fanout 仅经 bus 一次 | agent 仅 1 条 peer-joined | E2E 日志 |
| FR-MVP-S08 | Agent 信令缓冲 | 渲染就绪前 main 缓冲 IPC | 早到的 joined 不丢 | 单测/手工 |
| FR-MVP-S09 | 断线重连 | v0.2 | WS 断开后 5s 内自动 re-join | 后续 |

### 3.3 WebRTC 建立 (ICE & Peer Connection)

| ID | 需求 | MVP 实现 | 验收标准 | 测试 |
| :--- | :--- | :--- | :--- | :--- |
| FR-MVP-W01 | STUN 下发 | `GET /api/v1/ice/servers` | 至少 1 个 `stun:` | curl |
| FR-MVP-W02 | Agent 为 offerer | `createOffer` + `addTrack` | Agent `sent-offer` | UI |
| FR-MVP-W03 | Web 为 answerer | PC 就绪后再 `join`；缓冲早到 offer | Web `answered` | UI |
| FR-MVP-W04 | 媒体轨 vs DC 分离 | 视频 RTP；`control` DataChannel | ontrack 触发 + DC open | 手工 |
| FR-MVP-W05 | recvonly 兼容 | Web `addTransceiver('video',{direction:'recvonly'})` | Chrome/Edge 出画 | 手工 |
| FR-MVP-W06 | offer 重试 | Agent 每 4s 重发直至 connected | 丢首包后可恢复 | 手工弱网 |
| FR-MVP-W07 | 连接状态 UI | 展示 `iceConnectionState` / `connectionState` | 非黑盒 | 会话页诊断区 |
| FR-MVP-W08 | TURN | env 配置；MVP 本机可仅 STUN | 跨 NAT 场景 v0.2 验收 | 后续 |

### 3.4 画面与控制 (Media & Control)

| ID | 需求 | MVP 实现 | 验收标准 | 测试 |
| :--- | :--- | :--- | :--- | :--- |
| FR-MVP-M01 | 桌面采集 | Electron `setDisplayMediaRequestHandler` | Agent 非 capturing 卡死 | 选屏成功 |
| FR-MVP-M02 | 控制端渲染 | `<video>` + `srcObject` | `streaming` 且有画面 | 目视 |
| FR-MVP-M03 | 控制事件 | DC `mouse-move` 等 | Agent 显示「最近控制」 | 移动鼠标 |
| FR-MVP-M04 | 相对坐标 | payload `x/y` 0..1 | 日志见小数 | 单测 schema |
| FR-MVP-M05 | DPI 物理像素注入 | v0.3 C++ 插件 | — | 后续 |
| FR-MVP-M06 | backgroundThrottling 关闭 | v0.3 `backgroundThrottling:false` | — | 后续 |
| FR-MVP-M07 | ABR/BWE | v0.3 编码降级 | — | 后续 |

### 3.5 全链路监控与错误 (Observability)

| ID | 需求 | MVP 实现 | 验收标准 |
| :--- | :--- | :--- | :--- |
| FR-MVP-O01 | 分级错误文案 | 信令/ICE/WebRTC 分 tag 展示 | 用户可见原因 |
| FR-MVP-O02 | 一键重试 | 会话页「重新连接」 | 点击后重走 join+offer |
| FR-MVP-O03 | dev-mvp 自检 | 脚本末尾 E2E | `OK: signaling e2e passed` |
| FR-MVP-O04 | 自动恢复 | v0.2 | 断网重连策略 |

---

## 4. 非功能（MVP）

| 项 | 要求 |
| :--- | :--- |
| 延迟 | 局域网 RTT &lt; 50ms 时首帧 &lt; 3s |
| 并发 | 单 server 进程 ≥10 房间（内存） |
| 安全 | MVP 无 JWT；限 IP 刷码；生产禁用 debug API |

---

## 5. 测试清单（发布前）

- [ ] `.\dev-mvp.ps1` 通过且 E2E OK
- [ ] Agent `sent-offer` → Web `streaming`
- [ ] sess 后 8 位与 Agent 一致
- [ ] 诊断 API 显示 2 个 peer
- [ ] 鼠标移动 Agent 有控制日志
- [ ] `server` 单测 signaling + pairing 通过

---

## 7. 全项目能力地图（补充用户拆解）

与 [ROADMAP.md](../ROADMAP.md) L1–L6 一致，此处仅列 MVP 必须项。

| 层级 | 用户关切 | MVP-B | v0.2 | v0.3+ |
| :--- | :--- | :--- | :--- | :--- |
| 配对 | 防刷、局域网 | ✅ Rate limit、127.0.0.1 | JWT 票 | MDM |
| 信令 | WS 稳定、并发、重连 | ✅ 直写 socket + bus | 自动 re-join | 多区域 |
| WebRTC | STUN/TURN、轨/DC 分离 | ✅ | ICE restart | TURN 策略 |
| 画面 | 后台节流、ABR | video 出画 | — | BWE、throttling off |
| 控制 | DPI、Daemon 注入 | 相对坐标 DC | 合批 | 原生注入 |
| 传输 | DC 优先、重传 | CONTROL DC | 优先级 | — |
| 监控 | 分级错误、重试 | 诊断 UI + 重连 | 自动恢复 | 遥测大盘 |

**本地 MVP 环境约束**：`server/.env` 勿启用 `REDIS_URL`（除非已启动 Redis）；见 `dev-mvp.ps1` / `run-dev.ps1`。

---

## 8. Changelog

| 日期 | 版本 | 说明 |
| :--- | :--- | :--- |
| 2026-05-25 | 1.1.0 | 补充 ROADMAP 对齐、Redis/MVP 环境说明 |
| 2026-05-25 | 1.0.0 | 初版：MVP 核心链路拆解与验收表 |
