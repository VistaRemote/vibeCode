# VistaRemote 系统总览 Spec（L0）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-SYS-001` |
| **版本** | 0.3.0-draft |
| **状态** | Draft |
| **依赖** | `shared` 契约（运行时 SSOT） |

---

## 1. 产品定义

**VistaRemote** 是 VibeCode 生态下的企业级远程桌面控制系统：通过 **WebRTC** 实现低延迟屏幕采集、传输与远程键鼠/触控控制；支持 **Web / 桌面 / 移动** 多端作为主控端，**Electron 桌面 Agent** 作为被控端。

### 1.1 核心用户故事

| ID | 角色 | 故事 | 优先级 |
| :--- | :--- | :--- | :--- |
| US-01 | 运维人员 | 在浏览器中输入配对码，实时查看并控制远程 Windows/macOS 桌面 | P0 |
| US-02 | 技术支持 | 在手机上查看客户桌面并执行点击、滑动与键盘输入 | P0 |
| US-03 | 被控用户 | 安装桌面 Agent，授权后仅向已认证主控端推流 | P0 |
| US-04 | 管理员 | 一对多观摩（培训/巡检）时，延迟可接受地观看同一桌面 | P1 |
| US-05 | 企业 IT | 自建信令与 TURN，媒体尽量 P2P，降低云端带宽与隐私风险 | P0 |
| US-06 | 系统管理员 | 在管理台管理**全部用户**、套餐与审计 | P0 |
| US-07 | Pro 用户 | 远程会话录制、回放与 AI 会话摘要 | P1 |
| US-08 | 企业安全员 | 关键词/窗口触发录制、外发与删文件告警、录像回放 | P2 |
| US-09 | 企业管理者 | 多屏监控、AI 异常标记、效率周报 | P2 |
| US-10 | 主控用户 | 通过 **数字码、二维码或链接** 直连监控被控桌面 | P0 |
| US-11 | 企业 IT | 分发 **BYOD / Managed** 不同安装包；员工安装后按策略自动监控 | P0 |

---

## 2. 技术栈总览（Normative）

| 层级 | 选型 | Spec |
| :--- | :--- | :--- |
| 前端构建 | **Rsbuild / Rspack**（**非 Flutter**；见 ADR-0007） | [frontend-toolchain-spec.md](./frontend-toolchain-spec.md) |
| 原生性能 | **Rust**（DXGI/NVENC/Hook，N-API） | [desktop-performance-spec.md](./desktop-performance-spec.md) · ADR-0003 |
| 前端 UI | **Ant Design 5** + Sass Modules | 同上 |
| Web | Client + **Admin 管理台** | [web-spec.md](./web-spec.md) |
| 后端 | **NestJS + TypeORM + MySQL 8** | [server-spec.md](./server-spec.md) |
| AI 分析 | **独立 `ai` 仓库** + BullMQ + LLM | [ai-platform-spec.md](./ai-platform-spec.md) · [job-queue-spec.md](./job-queue-spec.md) |
| 套餐 | free / pro / enterprise | [commercial-tier-spec.md](./commercial-tier-spec.md) |
| 录制 | S3/MinIO + 回放 | [recording-playback-spec.md](./recording-playback-spec.md) |
| 企业安全 | 遥测 + 规则 + AI 洞察 | [enterprise-security-spec.md](./enterprise-security-spec.md) |
| 文档 | Rspress | [docs-spec.md](./docs-spec.md) |
| 契约 | `shared` TypeScript | [shared-spec.md](./shared-spec.md) |

---

## 3. 逻辑架构

```text
  web/admin ───────────── REST ─────────────┐
  web/client ─── WSS / REST ─────────────┤
  mobile / desktop ──────────────────────┤
                                         ▼
                              ┌─────────────────────┐
                              │ server (NestJS)      │
                              │ MySQL · Redis/BullMQ │
                              │ 用户/套餐/录制元数据   │
                              └──────────┬──────────┘
                    jobs               │ telemetry/recordings
                     ▼                 ▼
              ┌────────────┐    ┌─────────────┐
              │ ai workers │    │ MinIO / S3  │
              │ LLM·规则·ML │    │ 录像分片     │
              └────────────┘    └─────────────┘

  desktop Agent ── WebRTC P2P/SFU + DataChannel(control, telemetry)
                  ── 多屏采集 · 窗口标题 · 文件事件 · 录制上传

  shared/ ── 信令 · 控制 · 套餐 · 遥测 · AI DTO
```

---

## 4. WebRTC 拓扑策略（强制）

> **详细规范**：[webrtc-architecture-spec.md](./webrtc-architecture-spec.md)（P2P/TURN、mediasoup SFU、TURN 负载切换、WebCodecs/抖动、不采用 SRS）。

### 4.1 模式选择

| 场景 | 拓扑 | 媒体路径 | 信令 |
| :--- | :--- | :--- | :--- |
| **1 主控 : 1 被控** | **P2P + STUN/TURN** | 端到端直连（优先 host/srflx，失败走 **coturn** relay） | Server 交换 SDP/ICE |
| **1 被控 : N 主控（观摩）** | **mediasoup SFU** | 被控单路上行；各主控 Subscribe | Server `session-mode: sfu` |
| **P2P 穿透差 / coturn 过载** | **SFU（回退/减压）** | 避免长期占用 TURN 中继带宽 | `TransportPolicyService` |
| **多被控** | 每对被控独立 Session | 各 Session 独立应用上表规则 | Room 内多 Peer |

### 4.2 功能需求

| ID | 需求 | 验收标准 |
| :--- | :--- | :--- |
| FR-WRTC-01 | 1:1 默认建立 P2P `RTCPeerConnection` | 无 SFU 参与时，Server 日志无 SFU allocate；Chrome `webrtc-internals` 显示直连或 TURN |
| FR-WRTC-02 | 第二路主控加入或 TURN 负载超阈时切换 **mediasoup SFU** | 被控上行仅 1 路；各订阅端独立下行 |
| FR-WRTC-03 | 控制指令走 **SCTP DataChannel**（`ordered: true` 或按指令类型配置） | 键鼠事件不占用视频 RTP；延迟 < 100ms（LAN 基线） |
| FR-WRTC-04 | 视频编码优先 **H.264 / VP8**（按平台能力协商） | 1080p@30fps 为 P0 目标；弱网可降分辨率/帧率 |
| FR-WRTC-05 | ICE 配置由 Server 下发（STUN/TURN 列表） | 客户端不得硬编码生产 TURN 凭证 |
| FR-WRTC-06 | 主控播放：WebCodecs 硬解优先 + Worker/独立 canvas，减轻主线程抖动 | 见 webrtc-architecture-spec §5 |

### 4.3 非功能需求

| ID | 需求 | 目标值 |
| :--- | :--- | :--- |
| NFR-WRTC-01 | 端到端延迟（P2P, LAN） | ≤ 150ms（P95） |
| NFR-WRTC-02 | 首帧时间 | ≤ 3s（含信令与 ICE） |
| NFR-WRTC-03 | 断线重连 | 30s 内自动重试 ≤ 3 次，UI 可见状态 |

---

## 5. 信令与会话模型

### 4.1 实体

| 实体 | 说明 |
| :--- | :--- |
| **Device** | 被控 Agent 或主控客户端实例，全局唯一 `deviceId` |
| **Room** | 一次远程会话容器，含被控与若干主控 |
| **Session** | Room 内 WebRTC 协商上下文，`sessionId` |
| **PairingCode** | 短时可读码，用于主控绑定被控（TTL 可配置） |

### 4.2 信令通道

- 传输：**WebSocket (WSS)**，JSON 载荷，结构定义于 `shared`（见 [shared-spec.md](./shared-spec.md)）。
- 消息类型（最小集）：`join` · `offer` · `answer` · `ice-candidate` · `leave` · `session-mode`（`p2p` \| `sfu`）· `error`。

### 4.3 功能需求

| ID | 需求 | 验收标准 |
| :--- | :--- | :--- |
| FR-SIG-01 | 主控通过 PairingCode 或 OAuth Token 加入 Room | 非法码返回统一错误码 `PAIRING_INVALID` |
| FR-SIG-02 | 被控 Agent 启动后向 Server 注册并心跳 | 90s 无心跳标记 offline |
| FR-SIG-03 | Server 不转发媒体，仅信令与 SFU 调度 | 媒体带宽不经过 NestJS 进程（除 SFU 侧车） |

---

## 6. 远程控制协议（摘要）

详细字段见 `shared` Spec。

| 通道 | 内容 |
| :--- | :--- |
| **DataChannel `control`** | 鼠标移动/点击、滚轮、键盘、剪贴板（可选 P1） |
| **DataChannel `meta`**（可选） | 光标样式、多显示器索引、分辨率变更 |
| **DataChannel `telemetry`**（Enterprise） | 窗口标题、文件安全事件、见 enterprise-security-spec |

**坐标系**：归一化 `[0,1]` 相对当前捕获显示器，由被控端映射到物理像素。

| ID | 需求 | 验收标准 |
| :--- | :--- | :--- |
| FR-CTL-01 | 主控发送 `MouseMove`，被控光标位置误差 ≤ 2px @1080p | 自动化测试或录屏比对 |
| FR-CTL-02 | 支持 `KeyDown`/`KeyUp`，含修饰键 | 可输入英文与常用快捷键 |
| FR-CTL-03 | 移动端 `Touch` 序列映射为鼠标事件 | 单指拖动 = 拖拽 |

---

## 7. 安全与合规

| ID | 需求 | 说明 |
| :--- | :--- | :--- |
| SEC-01 | 信令 WSS + TLS 1.2+ | 生产强制 |
| SEC-02 | 被控端显式授权弹窗 | 首次配对及会话恢复策略可配置 |
| SEC-03 | 短期 Access Token（JWT 或等价） | 主控 API 与 WS 均需校验 |
| SEC-04 | 可选 E2E 加密（P2） | 企业版；MVP 依赖 DTLS-SRTP |
| SEC-05 | 审计日志 | 连接/断开/主控身份记录至 Server |

---

## 8. 认证与授权

**模型**：**RBAC（岗位角色）+ ABAC（组织/设备/房间属性）+ Plan 权益（商业化）**，非纯 RBAC 或纯 ABAC。Normative：[authorization-spec.md](./authorization-spec.md)。

| 平面 | 角色示例 | 能力摘要 |
| :--- | :--- | :--- |
| **Client（User）** | `member` / `it_support` / `org_owner` | 远程、信令、企业监控（按 ABAC） |
| **Admin（平台）** | `super_admin` / `admin` / `viewer` | 全平台用户与运营（RBAC） |
| **Agent** | Device Token | 注册、心跳、遥测 |
| **通道** | Signaling Ticket / JWT | WSS `/signaling`、SSE、REST 分层校验 |

套餐：**free** · **pro** · **enterprise** — 与角色正交，见 [commercial-tier-spec.md](./commercial-tier-spec.md)。

---

## 9. 跨模块依赖矩阵

| 消费方 → 提供方 | shared | server | ai | desktop | web | mobile |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| shared | — | | | | | |
| server | ✓ | — | | | | |
| ai | ✓ | ✓(callback) | — | | | |
| desktop | ✓ | ✓ | | — | | |
| web | ✓ | ✓ | | | — | |
| mobile | ✓ | ✓ | | | | — |

**规则**：任何跨端字段变更必须先改 `shared`，版本号遵循 SemVer。

---

## 10. 部署拓扑（摘要）

详见 [deploy-spec.md](./deploy-spec.md)。

```text
[Controllers] ──WSS──► [NestJS] ──► [MySQL]
                         │    └──► [Redis] 会话 / BullMQ
                         │    └──► [MinIO] 录制
                         └──jobs──► [ai]
                ICE◄──► [coturn]
                SFU ◄──► [mediasoup-worker]   # 非 SRS；低并发远程桌面
```

---

## 11. 里程碑（与白皮书对齐）

| 阶段 | 范围 | 出口标准 |
| :--- | :--- | :--- |
| **M0** | shared 契约 + 本地 Mock 信令 | 类型发布 `0.1.0` |
| **M1** | 1:1 P2P：desktop Agent + web Client | US-01 端到端演示 |
| **M1.5** | Admin + MySQL 全用户管理 + 套餐字段 | US-06 |
| **M2** | mobile + TURN；**`ai` 仓库**脚手架 | US-02 |
| **M3** | Pro：录制/回放 + AI 摘要 | US-07 |
| **M4** | SFU 一对多 | US-04 |
| **M5** | Enterprise：策略录制/多屏/安全事件/效率报告 | US-08、US-09 |
| **M6** | deploy：MySQL + MinIO + ai + 双 Web | 私有化一键部署 |

---

## 12. Out of Scope（当前版本）

- 文件传输、远程打印、Wake-on-LAN
- 移动端作为 **被控**
- 自动支付与发票（套餐由 Admin 手工开通）
- 在 Agent 端运行本地大模型（推理集中在 `ai` 服务）

---

## 13. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.1.0-draft | 初稿：P2P/SFU 策略、信令模型、控制协议摘要 |
| 2026-05-24 | 0.2.0-draft | Rsbuild、antd、Sass、TypeORM；Web Client/Admin |
| 2026-05-24 | 0.3.0-draft | MySQL；free/pro/enterprise；`ai` 仓库；录制与企业安全 |
