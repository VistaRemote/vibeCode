# 多显示器远程桌面 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-MDISP-001` |
| **版本** | 0.1.0-draft |
| **状态** | Active（规划） |
| **关联** | [desktop-spec.md](./desktop-spec.md) · [desktop-performance-spec.md](./desktop-performance-spec.md) · [webrtc-architecture-spec.md](./webrtc-architecture-spec.md) · [shared-spec.md](./shared-spec.md) · [enterprise-security-spec.md](./enterprise-security-spec.md) · [plan/multi-display-iteration-roadmap.md](../plan/multi-display-iteration-roadmap.md) |

---

## 1. 目标与原则

### 1.1 产品目标

| 阶段 | 用户画像 | 体验对标 |
| :--- | :--- | :--- |
| **初期（单屏）** | 笔记本 / 单显示器办公 | 先跑通 1:1 闭环，默认主屏 |
| **中期（选屏）** | 多显示器办公，但一次只看一块 | **向日葵**：连接前/连接中由用户**选择要控制的显示器** |
| **远期（多屏专家）** | 交易员、运维、设计多屏 | **TeamViewer**：按需编码、多路流、多窗口绑定 `DisplayID`、热插拔 |

### 1.2 架构原则（Normative）

1. **物理屏 = 采集单元**：有几个活跃 `Display`，被控端就维护几个**独立采集上下文**（线程或队列），显示器断开则对应采集上下文**立即释放**（与 TeamViewer 一致）。
2. **编码与网络解耦**：采集可以并行；**编码与发送**按「观看模式」按需开启，避免为未观看的屏浪费 CPU/GPU/带宽。
3. **交互与画面解耦**：控制原语必须携带 **`displayId` + 坐标**；单屏模式下主控端只做坐标映射，不改变协议形状。
4. **MVP 不阻断**：多屏能力分版本交付；**MVP-B 仅承诺单屏主显示器**，不在 MVP 发布门槛内要求多屏。

### 1.3 当前实现基线（2026-05）

| 项 | 现状 | 缺口 |
| :--- | :--- | :--- |
| 采集 | Electron 选屏 + MD-2 `replaceTrack` 热切换 | MD-3 多路并行采集待做 |
| 信令/WebRTC | 单路 `video` track，1:1 P2P | 无 `streamId` / 多 track 协商 |
| 控制 | `NormalizedPoint` 含 `displayIndex`，MVP 多为 `0` | 无按屏映射、无多窗口命中测试 |
| 企业 | Admin 多屏网格 Spec（SFU） | 未实现 |

---

## 2. 三层架构（远期目标态）

参考 TeamViewer 类产品的分层，VistaRemote 目标架构如下。

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ 交互逻辑层（Controller）                                                  │
│  · 单屏切换模式：虚拟桌面 → 当前 display 归一化坐标                        │
│  · 多窗口模式：每窗口绑定 displayId；点击 → (displayId, x, y, button)    │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ DataChannel control + 会话信令
┌───────────────────────────────▼─────────────────────────────────────────┐
│ 编解码与流媒体层（Agent）                                                  │
│  · Dirty Rectangle：帧间差分，仅编码变化区域（R2+ 硬编 / R4 区域编码）      │
│  · On-Demand：单屏模式仅编码「当前观看 displayId」；其余屏心跳/低频缩略图   │
│  · Multi-Stream：合屏/分窗模式每 display 独立 Video Stream（track/streamId）│
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ 帧队列 / 纹理
┌───────────────────────────────▼─────────────────────────────────────────┐
│ 屏幕捕获层（Agent Service / Native）                                     │
│  · Display 0..N：每屏独立采集线程或异步队列（DXGI / ScreenCaptureKit）     │
│  · display.topology 热插拔 → 释放/重建采集上下文                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1 屏幕捕获层

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-MDISP-C01 | 枚举所有活跃显示器：`displayId`、`bounds`、`scaleFactor`、`isPrimary`、`name` | Agent UI 与 API 列表一致 |
| FR-MDISP-C02 | 每物理屏独立采集上下文；并行 grab，互不阻塞 | N 屏时 CPU 线性可控（有上限配置） |
| FR-MDISP-C03 | 显示器断开：停止该屏采集线程、释放 GPU/句柄；信令 `display.removed` | 拔 HDMI 后 2s 内状态更新 |
| FR-MDISP-C04 | 显示器新增：`display.added` + 可选缩略图 | 热插拔手工测试 |
| FR-MDISP-C05 | P0 过渡：Electron `desktopCapturer` 按 `sourceId` 选屏；P1+：Rust R1 原生采集 | desktop-performance R1 |

### 2.2 编解码与流媒体层

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-MDISP-E01 | **Dirty Rectangle**：对比前后帧，仅对变化区域编码（可与全帧混合） | 静态桌面码率下降 ≥40%（实验环境） |
| FR-MDISP-E02 | **On-Demand 单屏模式**：仅当前 `activeDisplayId` 全帧率编码；其他屏暂停编码或 1fps 缩略图心跳 | 切换屏后 500ms 内主路恢复 |
| FR-MDISP-E03 | **Multi-Stream 模式**：每 `displayId` 独立 `MediaStreamTrack` 或 SFU producer | 主控端可同时订阅 2+ 路 |
| FR-MDISP-E04 | 模式切换由 Controller 发起 `session-display-mode` 信令；Agent 调整编码器池 | 切换不重建整会话 |
| FR-MDISP-E05 | 1:1 P2P 默认单路；多路并行时码率总和受 BWE 约束 | 弱网自动降为 On-Demand |

### 2.3 交互逻辑层

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-MDISP-I01 | 控制原语：`{ displayId, x, y, ... }`；`x/y` 为**该 display 逻辑坐标** 0..1 或物理像素（模式配置） | shared schema 校验 |
| FR-MDISP-I02 | **单屏切换模式**：主控只显示一块屏；鼠标事件映射到 `activeDisplayId` 的 bounds | 跨屏移动无越界 |
| FR-MDISP-I03 | **多窗口模式**：每窗口绑定 `displayId`；焦点窗口决定事件目标 | 两窗口交替点击正确 |
| FR-MDISP-I04 | **合屏模式（可选）**：多屏拼接为一张虚拟桌面；`displayId` 由虚拟坐标反查 | 拼接布局与 `topology` 一致 |
| FR-MDISP-I05 | DPI / 缩放：注入前按 `scaleFactor` 换算物理像素 | desktop-performance v0.3+ |

---

## 3. 观看模式（Controller 侧）

| 模式 | 说明 | 编码策略 | 对标 |
| :--- | :--- | :--- | :--- |
| `single` | 只看一块屏，可切换 | On-Demand，仅 active 全码率 | TeamViewer 单屏切换 |
| `picker` | 连接前选择一块屏 | 仅所选屏采集+编码 | 向日葵选屏 |
| `multi-window` | 每屏独立窗口 | Multi-Stream，按需订阅 | TeamViewer 多窗口 |
| `grid` | 同屏网格预览（Enterprise） | 多路低帧率 + 选中屏提码率 | Admin 监控墙 |
| `stitched` | 虚拟大桌面（P2） | 合成后单路或分区 Dirty Rect | 进阶 |

默认：**MVP = `single`（主屏）** → **MD-1 = `picker`** → **MD-2 = `single` 可热切换** → **MD-3 = `multi-window`**。

---

## 4. 数据契约（shared 扩展规划）

```typescript
/** 显示器拓扑（会话开始 + 热插拔推送） */
interface DisplayInfo {
  displayId: string;       // 稳定 ID（非数组下标）
  index: number;           // 0..N-1，展示用
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  scaleFactor: number;
  isPrimary: boolean;
}

interface DisplayTopologyEvent {
  type: 'display.topology';
  displays: DisplayInfo[];
  ts: number;
}

/** 主控请求观看模式 */
type SessionDisplayMode =
  | { kind: 'single'; activeDisplayId: string }
  | { kind: 'picker'; displayId: string }
  | { kind: 'multi-window'; displayIds: string[] }
  | { kind: 'grid'; maxTiles: number };

/** 控制事件（扩展现有 ControlEnvelope） */
interface DisplayPointer {
  displayId: string;
  x: number;  // 0..1 归一化（MVP）或物理像素（v0.3+）
  y: number;
}
```

> **注意**：`displayIndex`（number）在 MVP 保留；`displayId`（string）为 MD-1+ 主键，二者在 Agent 内维护映射表。

---

## 5. 版本映射（摘要）

| 版本 | 代号 | 捕获 | 编码/流 | 交互 | 详见 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MVP-B** | 单屏 | 主屏自动 | 单 track | `displayIndex:0` | [mvp-core-flow-spec](./mvp-core-flow-spec.md) |
| **MD-1** | Picker | 枚举 + 用户选屏 | 单 track | 选定 displayId | [plan/multi-display-iteration-roadmap](../plan/multi-display-iteration-roadmap.md) |
| **MD-2** | Switch | 多上下文，按需抓 | On-Demand 单路 | 单屏热切换 | 同上 |
| **MD-3** | Multi-Win | 并行采集 | Multi-Stream | 多窗口绑定 | 同上 |
| **MD-4** | Native+ | Rust DXGI 等 | Dirty Rect + 心跳 | 合屏可选 | desktop-performance R1–R3 |
| **ENT** | Grid | Agent 多路缩略 | SFU 订阅 | Admin 只读 | enterprise-security FR-ENT-20 |

---

## 6. 非功能

| 项 | 单屏 (MVP) | 选屏 (MD-1) | 多路 (MD-3) |
| :--- | :--- | :--- | :--- |
| 采集 CPU | 单路 ≤15%（目标） | 单路 | N 路并行可配置上限 |
| 首帧 | LAN &lt;3s | 选屏后 &lt;3s | 每窗 &lt;5s |
| 带宽 | 1×1080p30 | 1×1080p30 | Σ 受 BWE 限制，自动降档 |
| 安全 | 用户确认选屏 | 每次切换可二次确认（企业策略） | 多窗仅已授权 display |

---

## 7. 测试策略

| 级别 | 内容 |
| :--- | :--- |
| 单测 | `displayId` 映射、归一化坐标边界、topology 合并 |
| 集成 | 双屏 VM：选屏 2 → 控制仅作用于屏 2 |
| E2E | 切换 activeDisplayId 后 5s 内主控画面切换 |
| 性能 | 静态壁纸 Dirty Rect 码率；On-Demand 切换前后 CPU 曲线 |
| 回归 | 单屏用户（仅 1 display）路径与 MVP 一致 |

---

## 8. 不在范围（明确排除）

- MVP-B 内实现多路并行编码、Admin 四宫格监控（归 ENT / MD-3+）
- 手机端多屏（mobile-spec P2）
- 跨 OS 虚拟显示驱动（如 Indirect Display）— 仅识别系统已有显示器

---

## 9. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-26 | 0.1.0-draft | 初版：单屏→选屏→TeamViewer 分层架构与 FR 规划 |
