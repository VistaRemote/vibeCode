# 消息与推流传输规范 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-MSG-001` |
| **版本** | 2.0.0 |
| **关联** | [webrtc-architecture-spec.md](./webrtc-architecture-spec.md) · [server-spec.md](./server-spec.md) |

---

## 1. 结论（先读）

**不采用单一 EventSource 承载全部「消息」。** 按延迟与方向拆分：

| 数据类型 | 协议 | 路径 / 通道 | 方向 |
| :--- | :--- | :--- | :--- |
| **WebRTC 信令**（SDP/ICE/房间/模式） | **WebSocket (WSS)** | `/signaling` | 双向、低延迟 |
| **远程控制**（键鼠/触控） | **WebRTC DataChannel** | `control` | 双向、极低延迟 |
| **Agent 遥测批量** | **HTTPS POST** | `/api/v1/telemetry/events` | 客户端 → 服务端 |
| **管理端/业务通知** | **SSE (EventSource)** | `/api/v1/events/stream?userId=` | 服务端 → 浏览器 |
| **视频/音频** | **WebRTC RTP** | P2P 或 mediasoup | 媒体面 |

因此：**信令 = WebSocket**；**通知 = SSE**；**控制 = DataChannel**。

**异步后台任务**（AI 审计、录制摘要等）**不** 走本 Spec，统一用 **BullMQ + Redis**，见 [job-queue-spec.md](./job-queue-spec.md)。

---

## 2. 功能需求

| ID | 需求 | 验收 | 阶段 |
| :--- | :--- | :--- | :--- |
| FR-MSG-01 | WebRTC 信令走 WSS `/signaling` | `SignalingGateway` | P2 ✅ |
| FR-MSG-02 | 控制走 DataChannel | WS 无 `ControlEnvelope` | P1 |
| FR-MSG-03 | SSE 业务事件 | `EventStreamClient` | P1 |
| FR-MSG-04 | 遥测 HTTPS 批量 | telemetry API | P1 |
| FR-MSG-05 | SSE 心跳 30s | `ping` | P2 ✅ |
| FR-MSG-06 | 多实例信令 **Redis Pub/Sub** | `RedisSignalingBus` | P2 ✅ |
| FR-MSG-07 | SSE 按 **userId/orgId** 过滤 | `serverEvent.audience` | P2 ✅ |
| FR-MSG-08 | 多实例 SSE **Redis** 广播 | `RedisEventsBus` | P2 ✅ |
| FR-MSG-09 | HTTP 信令回退 | `POST /api/v1/signaling/envelope` | P1 |
| FR-MSG-10 | WSS 升级须 **Signaling Ticket**（短期 JWT） | 握手 401 无票 | P3 |
| FR-MSG-11 | SSE 须 **Controller/Admin JWT**；`userId` 与 `sub` 一致 | 禁止仅凭 query 匿名订阅 | P3 |

鉴权详见 [authorization-spec.md](./authorization-spec.md)。

---

## 3. SSE 受众（`shared`）

```typescript
audience?: {
  userIds?: string[];
  orgId?: string;
  broadcast?: boolean;  // ping 等全局事件
}
```

`serverEventMatchesUser(event, userId, orgId)` 用于服务端过滤。

---

## 4. 前端 Worker（P2）

| Worker | 路径 | 职责 |
| :--- | :--- | :--- |
| `decode.worker` | web `webrtc/workers/` | 解码 + 抖动缓冲 |
| `stats.worker` | web `webrtc/workers/` | 聚合 RTCStats 摘要 |
| Electron | `desktop/electron/webrtc/stats-collector` | 主进程 getStats |
| RN | `mobile/.../stats-collector` | 定时采样（无 Worker） |

---

## 5. 后端（P2）

| 组件 | 说明 |
| :--- | :--- |
| `SignalingGateway` | `@nestjs/platform-ws`，路径 `/signaling` |
| `SignalingDispatcherService` | 本地 socket + Redis fanout |
| `RedisSignalingBus` | 频道 `vistaremote:signaling:{roomId}` |
| `EventsStreamRegistry` | 按 userId 过滤 SSE |
| `RedisEventsBus` | 频道 `vistaremote:events:broadcast` |
| `mediasoup-controller` | `deploy/mediasoup-controller`，HTTP 创建 Room |

---

## 6. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 初稿 |
| 2026-05-24 | 2.0.0 | WSS Gateway、Redis 信令/SSE、受众过滤、mediasoup-controller、stats Worker |
