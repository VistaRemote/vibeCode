# WebRTC 架构与媒体策略 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-WRTC-001` |
| **版本** | 1.2.0 |
| **商业化** | [commercial-tier-spec.md](./commercial-tier-spec.md) — SFU 试用后须 Pro+ |
| **关联** | [system-overview.md](./system-overview.md) · [messaging-transport-spec.md](./messaging-transport-spec.md) · [server-spec.md](./server-spec.md) |

---

## 1. 设计结论（先读）

| 决策 | 选型 | 理由 |
| :--- | :--- | :--- |
| **默认 1:1** | **P2P + STUN/TURN（coturn）** | 延迟最低、服务端无媒体带宽；符合远程桌面主场景 |
| **1:N / 穿透差 / TURN 过载** | **mediasoup SFU** | 被控单路上行；避免 coturn 成为瓶颈；多观众监控 |
| **不采用 SRS** | — | 无高并发直播需求；SRS 生态偏流媒体/CDN，与本项目 TS 全栈、低运维目标不符 |
| **默认不在 SFU 录制** | 录制在 **Desktop 端侧**；SFU 仅 Enterprise 可选 PlainTransport+FFmpeg | 见 recording-playback-spec |
| **SFU 实现** | **mediasoup**（Node.js） | 与 server/ai 同技术栈，侧车部署；**不**默认引入 LiveKit 等额外运行时 |
| **播放端** | **WebCodecs 硬解优先** + Worker 解耦主线程 | 降低抖动、避免 React 重渲染阻塞解码 |
| **弱网** | WebRTC 内置 BWE + 应用层降档 | 分辨率/帧率/码率阶梯；可手动调优 `rtcConfiguration` |

---

## 2. 拓扑与切换条件

### 2.1 模式矩阵

| 场景 | 模式 | 媒体路径 | 信令 |
| :--- | :--- | :--- | :--- |
| 1 主控 : 1 被控 | `p2p` | 端到端（host/srflx → 必要时 TURN relay） | Server 交换 SDP/ICE |
| 1 被控 : N 主控（观摩/巡检） | `sfu` | 被控 → mediasoup 单路 Publish；各主控 Subscribe | Server 下发 `session-mode: sfu` + Router 参数 |
| P2P 反复失败 | `sfu`（回退） | 同上 | Server 在 ICE 失败率超阈后升级 |
| **coturn 负载过高** | `sfu`（减压） | 新会话优先 SFU，减少 relay 带宽 | Server `TransportPolicyService` |

### 2.2 切换规则（Normative）

| ID | 条件 | 动作 |
| :--- | :--- | :--- |
| FR-WRTC-10 | Room 内主控数 `≥ 2` | 强制 `sfu`（或第二人加入时迁移） |
| FR-WRTC-11 | 同一 Session P2P ICE **失败** ≥ 2 次（可配置） | 建议/自动切换 `sfu` |
| FR-WRTC-12 | coturn **relay 带宽**或**并发分配数**超过 `TURN_LOAD_THRESHOLD` | 新 Session 默认 `sfu`；已有 P2P 不强制迁移（可配置） |
| FR-WRTC-13 | 企业策略 `forceSfu: true` | 始终 `sfu` |
| FR-WRTC-14 | 用户/套餐允许 `preferP2p: true` 且负载正常 | 1:1 保持 `p2p` |
| FR-WRTC-15 | 分配 **SFU** 前校验 `ProductFeature.WEBRTC_SFU`（试用或 Pro+） | 否则拒绝 SFU / 保持 P2P；`TRIAL_EXPIRED_REQUIRES_PRO` |

**原则**：媒体压力不应长期压在 coturn 上；TURN 用于 **穿透辅助**，不是默认数据中心中继。

**商业化**：**mediasoup SFU** 在 **试用期内** 对 `free` 开放；**试用结束后** 须 **Pro 或 Enterprise** 订阅。见 `shared` `entitlements.ts`。

---

## 3. 组件职责

```text
[Controller Web/Mobile/Desktop]
        │ WSS 信令
        ▼
[NestJS server] ── ICE 配置、TransportPolicy、Room 状态
        │
        ├──► [coturn] STUN/TURN（P2P 穿透 / 兜底 relay）
        │
        └──► [mediasoup-worker] SFU（1:N、TURN 减压、P2P 失败回退）
                ▲
[Desktop Agent] ─┘ Publish（sfu）或 P2P Offer/Answer
```

| 组件 | 职责 | 禁止 |
| :--- | :--- | :--- |
| **server** | 信令、鉴权、ICE 下发、模式决策、SFU 房间分配 | 进程内终止 RTP（除 API 调度） |
| **coturn** | STUN + TURN relay | 承担全部 1:1 媒体（设计目标） |
| **mediasoup** | SFU 路由、Simulcast/SVC（P1） | 替代信令层 |
| **desktop** | 采集、编码上行、DataChannel 控制 | 在 N 观众时 N 路上行 |
| **web/mobile** | 订阅、解码渲染、控制指令 | 主线程阻塞式解码 |

---

## 4. 编码与协商

| ID | 规则 |
| :--- | :--- |
| FR-WRTC-20 | 视频优先 **H.264**（硬件编码友好），次选 **VP8** |
| FR-WRTC-21 | 音频默认 **Opus**（可选关闭，远程桌面以画面为主） |
| FR-WRTC-22 | 弱网降档顺序：帧率 → 分辨率 → 码率上限 |
| FR-WRTC-23 | `degradationPreference` 默认 `maintain-framerate`（远程操作流畅优先） |

---

## 5. 播放与抖动（主控端）

| ID | 规则 |
| :--- | :--- |
| FR-WRTC-30 | 视频渲染与 **React 状态更新解耦**（`requestVideoFrameCallback` / 独立 canvas） |
| FR-WRTC-31 | 支持 **WebCodecs** `VideoDecoder`（硬解）时优先；不可用时回退 `<video>` + `srcObject` |
| FR-WRTC-32 | 解码在 **Web Worker**（或 OffscreenCanvas）执行，避免主线程 Long Task 导致卡顿 |
| FR-WRTC-33 | 应用层 **JitterBuffer** 平滑网络抖动（目标 50–120ms，可配置） |
| FR-WRTC-34 | 暴露「流畅 / 清晰」档位，映射不同缓冲与码率策略 |
| FR-WRTC-35 | 统计 `RTCStatsReport`（inbound-rtp jitter、framesDropped）并上报（Enterprise P1） |

### 5.1 手动调优项（开发文档详述）

- `iceTransportPolicy`：`all`（默认）/ `relay`（调试或强制 TURN）
- `bundlePolicy` / `rtcpMuxPolicy`
- `encodedInsertableStreams`（实验性，录制管线 P1）
- Sender：`maxBitrate`、`scaleResolutionDownBy`
- Receiver：playoutDelayHint（支持时）

---

## 6. mediasoup 部署要点

| 项 | 说明 |
| :--- | :--- |
| 进程 | 独立 **mediasoup-worker** 侧车（与 NestJS 同机或同 VPC） |
| 端口 | UDP 端口段防火墙放行（见 deploy-spec） |
| 与 server 通信 | Unix socket / HTTP 内网 API 创建 Router、Transport |
| 规模 | 面向 **数十路并发** 会话，非万级观众（故不用 SRS） |

---

## 7. 明确不采用 SRS 的原因

| 维度 | SRS | VistaRemote 选择 |
| :--- | :--- | :--- |
| 场景 | 高并发直播、CDN 分发 | 低并发远程桌面 + 企业监控 |
| 协议 | RTMP/HLS/WebRTC 网关 | 原生 WebRTC P2P/SFU |
| 运维 | 独立 C++ 服务、配置面大 | mediasoup + Node 侧车，与现有栈一致 |
| 开发成本 | 另一套媒体管线 | 复用 TS 与 Spec 契约 |

---

## 8. 消息通道（与视频分离）

| 类型 | 协议 | 说明 |
| :--- | :--- | :--- |
| 信令 | **WebSocket** | 非 EventSource；见 messaging-transport-spec |
| 控制 | **DataChannel** | 非 WebSocket |
| 业务推送 | **SSE** | 录制/AI/告警；非信令 |
| 遥测 | **HTTPS POST** | 批量 |

---

## 9. 跨仓库实现索引

| 仓库 | 路径 | 说明 |
| :--- | :--- | :--- |
| shared | `src/webrtc/`、`src/signaling/` | 模式、ICE、统计、信令类型 |
| server | `src/webrtc/`、`src/ice/`、`src/sfu/` | 策略、ICE API、mediasoup 适配 |
| web/client | `src/webrtc/`、`src/messaging/` | 播放器、Worker、信令 WS、SSE |
| desktop | `electron/webrtc/` | Publisher、SFU 上行 |
| mobile | `src/services/webrtc/` | RN 订阅与渲染 |
| deploy | `compose/` | coturn + mediasoup 服务 |

---

## 10. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | P2P 默认；mediasoup SFU；TURN 负载切换；WebCodecs/抖动；明确不用 SRS |
| 2026-05-24 | 1.1.0 | WS 信令 + SSE 通知；decode Worker；链接 messaging-transport-spec |
