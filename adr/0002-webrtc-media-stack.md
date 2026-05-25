# ADR-0002: WebRTC + mediasoup 媒体栈

| Metadata | Value |
| :--- | :--- |
| **状态** | Accepted |
| **日期** | 2026-05-24 |

## 背景

需要低延迟屏幕传输、可选 SFU 多观众、私有化部署；团队规模不适合自研完整媒体服务器。

## 决策

- **传输**：WebRTC（P2P 优先，Enterprise SFU 经 mediasoup）
- **信令**：自有 NestJS WSS + `shared` 信令 DTO（非第三方信令 SaaS 锁定）
- **TURN**：coturn（deploy profile）
- **播放优化**：WebCodecs / Worker / JitterBuffer（web-client-spec、webrtc-architecture-spec）

## 理由

- 行业标准，端侧硬件编解码成熟
- mediasoup 可私有化，契合「非千万并发」定位
- 与 TS 全栈一致，控制器用 Node

## 后果

- 插件 **不得** 替换核心 ICE/DTLS 路径
- 若引入 LiveKit 等，需新 ADR 并抽象 `SfuProvider` 接口（已有 stub 方向）

## 备选方案

| 方案 | 未采纳原因 |
| :--- | :--- |
| 纯 WebSocket 传屏 | 延迟与带宽差 |
| 商用仅 SaaS SFU | 违背私有化/二开 |

## 关联

- [webrtc-architecture-spec.md](../spec/webrtc-architecture-spec.md)
- [deploy-spec.md](../spec/deploy-spec.md)
