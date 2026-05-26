# VistaRemote 产品路线图（ROADMAP）

| Metadata | Value |
| :--- | :--- |
| **当前里程碑** | **M2 MVP-B** — 1:1 远程闭环（配对→信令→WebRTC→画面/控制） |
| **核心 Spec** | [spec/mvp-core-flow-spec.md](./spec/mvp-core-flow-spec.md) |
| **迭代看板** | [plan/mvp-iteration-roadmap.md](./plan/mvp-iteration-roadmap.md) |
| **跑通指南** | [plan/mvp-e2e-runbook.md](./plan/mvp-e2e-runbook.md) |

---

## 愿景

**TypeScript 全栈 + 插件生态** 的远程桌面：官方做好 **WebRTC 媒体面 + 安全合规**，垂直场景由插件扩展。

---

## 里程碑（修订）

| 里程碑 | 目标 | 状态 | 关键验收 |
| :--- | :--- | :--- | :--- |
| **M0** | Spec / 工具链 / 契约 | 🟢 | `pnpm setup`、`dev-mvp.ps1` |
| **M2 MVP-B** | **1:1 本机/LAN 闭环** | 🟡 | Agent `sent-offer`、Web `streaming`、DC 控制日志 |
| **M1 MVP-A** | MySQL + JWT + 真实鉴权 | ⬜ | 配对票、审计 |
| **M3 MVP-C** | BullMQ + AI 摘要 | ⬜ | 队列任务可追踪 |
| **M4 MVP-D** | 录制 + MinIO | ⬜ | Pro 套餐 |
| **M5 ENT-1** | 企业遥测 + 告警 | ⬜ | 规则入库 |
| **M6–7** | 插件 α/β | ⬜ | Manifest + vt-cli |

> **顺序说明**：先 **M2 跑通演示**（当前），再 **M1 持久化与鉴权**，避免未连通就叠企业能力。

---

## 能力分层（你提供的拆解 + 补充）

### L1 配对与接入（MVP-B.0）

| 能力 | 说明 | 版本 |
| :--- | :--- | :--- |
| 数字码 / 链接 / QR | 三种入口 | MVP-B |
| 防刷 Rate Limit | IP 窗口限流 | MVP-B |
| 局域网优先 | `127.0.0.1` 信令 URL、无公网依赖 | MVP-B |
| JWT / 信令票 | 短期票校验 WSS | M1 |
| 设备指纹 / 企业 MDM | Managed 部署 | ENT |

### L2 信令（MVP-B.1）

| 能力 | 说明 | 版本 |
| :--- | :--- | :--- |
| WSS `/signaling` | join / offer / answer / ICE | MVP-B |
| 1:1 强制 P2P | 2 人不走 SFU 拒绝 | MVP-B |
| 同进程直写 socket | Redis 不可用时仍能扇出 | MVP-B |
| 房间诊断 API | debug room peers | MVP-B |
| 断线重连 / 会话恢复 | 指数退避 re-join | v0.2 |
| 多实例 Redis Pub/Sub | 已骨架 | P2 |

### L3 WebRTC（MVP-B.2）

| 能力 | 说明 | 版本 |
| :--- | :--- | :--- |
| STUN（+可选 TURN） | `GET /ice/servers` | MVP-B |
| Agent offerer / Web answerer | 时序：PC 后 join | MVP-B |
| 媒体轨 vs DataChannel | RTP 画面 + `control` DC | MVP-B |
| offer 重试 / recvonly | 丢包恢复 | MVP-B |
| ICE/PC 状态 UI | 诊断区 | MVP-B |
| ICE restart / TURN 必填策略 | 跨 NAT | v0.2 |

### L4 画面与控制（MVP-B.3–B.4）

| 能力 | 说明 | 版本 |
| :--- | :--- | :--- |
| Electron 桌面采集 | `setDisplayMediaRequestHandler` | MVP-B |
| `<video>` 出画 | 控制端渲染 | MVP-B |
| 相对坐标 0..1 | 控制 DC | MVP-B |
| backgroundThrottling 关闭 | 后台仍渲染 | v0.3 |
| WebRTC-BWE / ABR | 码率/分辨率自适应 | v0.3 |
| DPI 物理像素换算 | C++/Rust 插件 | v0.3 |
| 键鼠注入 Daemon | 高优先级子进程 | v0.3 |

### L4.5 多显示器（v0.4 MD 系列）

> 详规：[spec/multi-display-spec.md](./spec/multi-display-spec.md) · 迭代：[plan/multi-display-iteration-roadmap.md](./plan/multi-display-iteration-roadmap.md)

| 能力 | 说明 | 版本 |
| :--- | :--- | :--- |
| **单屏默认** | 主显示器自动采集；单 track | **MVP-B**（当前） |
| **选屏 Picker** | 连接前用户选择要控制的屏（向日葵） | MD-1 / v0.4 |
| **单屏热切换** | On-Demand：仅编码当前观看屏 | MD-2 / v0.5 |
| **多窗口多流** | 每屏独立 Stream；`displayId` 映射点击 | MD-3 / v0.6 |
| **原生 + Dirty Rect** | 每屏采集线程；差分编码；热插拔 | MD-4 + R1 |
| **监控墙** | Admin 1–4 路缩略（SFU） | ENT / FR-ENT-20 |

### L5 控制传输优化（v0.2–v0.3）

| 能力 | 说明 | 版本 |
| :--- | :--- | :--- |
| DataChannel 优先 | 已用 `control` 通道 | MVP-B |
| 指令合并 / 优先级 | 鼠标 move 合批 | v0.2 |
| 可靠模式 / 重传 | 关键点击 | v0.2 |

### L6 可观测与韧性（MVP-B + v0.2）

| 能力 | 说明 | 版本 |
| :--- | :--- | :--- |
| 会话诊断 UI | 房间人数、信令日志 | MVP-B |
| 一键重连 / 重配 | 会话页按钮 | MVP-B |
| 分级错误 + 建议 | 轻微重试/中等降级/严重重连 | v0.2 |
| 信令 E2E 自检 | `mvp-signaling-e2e.mjs` | MVP-B |

---

## 当前冲刺（2026-W21）

| 必交付 | 状态 |
| :--- | :--- |
| 修复信令扇出（Redis 降级） | 本轮 |
| 会话诊断 + 重连 | 本轮 |
| `mvp-core-flow-spec` + ROADMAP 对齐 | 本轮 |
| 打包 Agent + 跑通文档 | 本轮 |

| 不做什么 | 原因 |
| :--- | :--- |
| SFU 多观众、服务端录制 | MVP-B 后 |
| 多屏并行编码 / TeamViewer 多窗 | MD-1 前（MVP 仅单屏） |
| 系统级 SendInput | v0.3 |
| 生产支付 | M4 前 |

---

## 相关文档

- [spec/mvp-core-flow-spec.md](./spec/mvp-core-flow-spec.md)
- [spec/multi-display-spec.md](./spec/multi-display-spec.md)
- [plan/multi-display-iteration-roadmap.md](./plan/multi-display-iteration-roadmap.md)
- [spec/implementation-status.md](./spec/implementation-status.md)
- [docs/guide/mvp-getting-started.md](./docs/guide/mvp-getting-started.md)
