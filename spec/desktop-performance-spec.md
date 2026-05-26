# Desktop 性能与架构演进 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-DKT-PERF-001` |
| **版本** | 2.0.0 |
| **关联** | [performance-roadmap-spec.md](./performance-roadmap-spec.md) · [desktop-spec.md](./desktop-spec.md) |

---

## 1. 设计原则

| 原则 | 说明 |
| :--- | :--- |
| **先上线后原生** | 阶段 A 用 TS/Chromium 快速交付；阶段 B 按 ROI 引入 **Rust/原生** |
| **零帧 IPC** | 视频帧禁止 `ipcRenderer` 大块传输 |
| **Electron = 控制台** | UI、配对、WebRTC 控制面；重活下沉 **Agent Service** |
| **Rust 替换瓶颈** | 非全量重写；N-API 或独立进程 + 共享内存 |
| **Meta-Repo 隔离** | `desktop/native/` 独立构建，不与 RN hoist |

---

## 2. 双轨路线图

### 2.1 阶段 A — 先上线（不依赖 Rust）

| 代号 | 内容 | 状态 |
| :--- | :--- | :--- |
| A0 | `desktopCapturer` + MediaStream → WebRTC | 规划/骨架 |
| A1 | Chromium `--enable-nvenc` / `--enable-libvpl` | `encode/gpu-policy.ts` |
| A2 | 端侧录制 BufferZone + 分片上传 | `electron/recording/` |
| A3 | 独立 Agent Service 进程 + 控制协议 | `agent-service/` 占位 |
| A4 | iohook（TS 生态）键鼠 | `input/input-bridge.ts` |

### 2.2 阶段 B — Rust / 原生（投入产出比排序）

| 优先级 | ID | 主题 | 技术要点 | 依赖 |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **R1** | **屏幕捕获原生化** | Rust：Win DXGI Desktop Duplication / macOS ScreenCaptureKit；帧入共享内存或硬件纹理 | A0 可并行测量 |
| **2** | **R2** | **硬件编码** | NVENC / QSV / VAAPI；Rust 绑定或加固 Chromium HW 路径 | R1 出帧格式 |
| **3** | **R3** | **Video + Overlay 架构** | 独立合成：光标、水印、隐私块、多屏拼接；GPU compositor | R1/R2 |
| **4** | **R4** | **键鼠 Hook 原生化** | Rust 低级 Hook；替代 iohook；仅会话注入 | A4 可先做 TS 版 |
| **5** | **R5** | **SharedArrayBuffer** | 环区/上传线程零拷贝视图；录制分片读 | R1–R2 稳定 |
| **6** | **R6** | **GPU 零拷贝** | 纹理 → 编码器 Opaque；D3D11/Metal 互操作 | R2/R3，**最后** |

```text
收益/成本比：  R1 ≈ R2 > R3 > R4 >> R5 ≈ R6（维护成本）
```

**立项门槛**：见 [performance-roadmap-spec.md](./performance-roadmap-spec.md) §6。

---

## 3. 目标架构（阶段 B 稳态）

```text
┌──────────────────────────────────────────────────────────────────┐
│  agent-native (Rust) — 可选独立二进制或 .node                      │
│  R1 捕获 → R3 合成(Overlay) → R2 硬编 → 共享内存/句柄             │
│  R4 键鼠 Hook                                                     │
└────────────────────────────┬─────────────────────────────────────┘
                             │ 无原始帧 JSON/IPC；仅句柄+元数据
┌────────────────────────────▼─────────────────────────────────────┐
│  Agent Service (Node) — 会话、上传调度、WebRTC 信令对接              │
│  R5 SAB 环区（若仍需要 CPU 路径缓冲）                              │
└────────────────────────────┬─────────────────────────────────────┘
┌────────────────────────────▼─────────────────────────────────────┐
│  Electron — 控制台 UI · 托盘 · 策略                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. 分模块说明

### 4.1 R1 屏幕捕获原生化

| FR | 需求 |
| :--- | :--- |
| FR-DKT-R1-01 | Win10+ DXGI；macOS 12+ ScreenCaptureKit |
| FR-DKT-R1-02 | 输出 NV12 或 GPU 纹理句柄，供 R2/R6 |
| FR-DKT-R1-03 | 热插拔显示器、DPI 变更事件 |
| FR-DKT-R1-04 | 回退：A0 MediaStream 仍可启用 |

### 4.2 R2 硬件编码

| FR | 需求 |
| :--- | :--- |
| FR-DKT-R2-01 | 会话默认硬编；软编仅 `capability-monitor` 降级 |
| FR-DKT-R2-02 | 与 WebRTC 对接：Encoded Transform 或外环 RTP（设计评审） |

### 4.3 R3 Video + Overlay

| FR | 需求 |
| :--- | :--- |
| FR-DKT-R3-01 | 光标层、可选水印（Enterprise） |
| FR-DKT-R3-02 | 隐私遮罩区域（黑名单窗口） |
| FR-DKT-R3-03 | 多 `displayIndex` 合成（Enterprise 多屏） |

多屏产品阶段与 FR 见 [multi-display-spec.md](./multi-display-spec.md)、[plan/multi-display-iteration-roadmap.md](../plan/multi-display-iteration-roadmap.md)。

### 4.4 R4 键鼠 Hook 原生化

| FR | 需求 |
| :--- | :--- |
| FR-DKT-R4-01 | 延迟 P95 < 30ms（LAN 对照） |
| FR-DKT-R4-02 | 仅 `session=connected` 且已授权时注入 |

### 4.5 R5 SharedArrayBuffer

| FR | 需求 |
| :--- | :--- |
| FR-DKT-R5-01 | 录制环区与上传线程共享；避免 Node Buffer 拷贝 |
| FR-DKT-R5-02 | 遵守跨域隔离；仅 Agent Service 进程内 |

### 4.6 R6 GPU 零拷贝

| FR | 需求 |
| :--- | :--- |
| FR-DKT-R6-01 | R1→R2 纹理路径无 CPU readback |
| FR-DKT-R6-02 | 平台矩阵文档化（Win 优先） |

---

## 5. 阶段 A 功能需求（保留）

| ID | 方案 |
| :--- | :--- |
| FR-DKT-P0-01 | MediaStream → RTCPeerConnection |
| FR-DKT-P1-01 | NVENC/QSV Chromium 构建标志 |
| FR-DKT-P2-01 | iohook 过渡方案 |
| FR-DKT-P2-02 | 独立 Agent Service |

---

## 6. 代码布局（规划）

```text
desktop/
├── electron/           # 阶段 A
├── native/             # 阶段 B：Rust workspace（占位）
│   ├── capture/        # R1
│   ├── encode/         # R2
│   ├── compositor/     # R3
│   ├── input/          # R4
│   └── Cargo.toml
└── agent-service/
```

`desktop/native/README.md`：占位说明，**无对外承诺日期**。

---

## 7. 资源占用与守护

见 v1.0 §5（FR-DKT-PG-*），无变更。

---

## 8. 对外文档

**不在** `docs/` 用户向页面描述 R1–R6 或 Rust 排期。已交付能力仅写「低延迟」「硬件编码」等产品语言。

---

## 9. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 初版 |
| 2026-05-24 | 2.0.0 | 阶段 A/B；Desktop R1–R6 ROI；Rust 模块化 |
