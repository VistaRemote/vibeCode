# 全项目性能演进路线图 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-PERF-ROAD-001` |
| **版本** | 1.0.0 |
| **受众** | **内部实现 / Spec 驱动开发**（不对外开源营销文档） |
| **关联** | [desktop-performance-spec.md](./desktop-performance-spec.md) · [webrtc-architecture-spec.md](./webrtc-architecture-spec.md) · [implementation-status.md](./implementation-status.md) |

---

## 1. 总策略（Normative）

```text
阶段 A — 先上线（TS/Chromium/现有栈，投入小）
    → 产品验证、商业化、Spec 契约稳定

阶段 B — 赚钱后（按 ROI 用 Rust/原生替换瓶颈）
    → 仅替换「测量证明是瓶颈」的模块；禁止大爆炸重写

阶段 C — 极致（GPU 零拷贝等，依赖 A/B 数据）
    → 平台相关、维护成本高，最后做
```

| 规则 | 说明 |
| :--- | :--- |
| **Rust 定位** | 替换 **CPU/延迟敏感** 路径的 **原生扩展**（N-API / 独立进程），非全栈重写 |
| **契约不变** | `shared` 信令/控制/录制 DTO 不因实现语言改变 |
| **零帧 IPC** | 任何阶段禁止 `ipcRenderer` 传视频帧（见 desktop-performance-spec） |
| **文档** | 路线图 **仅存在于 `spec/`**；`docs/` 用户向文档 **不** 宣传 Rust 排期 |

---

## 2. 阶段 A — 先上线（全项目）

| 域 | 交付 | 目标 | Spec |
| :--- | :--- | :--- | :--- |
| **Server** | WSS 信令、权益门、内存配对 | MVP 闭环 | server-spec |
| **Web 主控** | WebCodecs + Worker + JitterBuffer | 可播不卡 | webrtc-architecture §5 |
| **Mobile** | RN + react-native-webrtc + JSI 新架构 | 触控可用 | mobile-spec FR-MOB-PERF |
| **Desktop** | MediaStream → WebRTC；端侧录制缓冲上传 | 能卖 Pro 录制 | recording-playback-spec |
| **Desktop** | Chromium **NVENC/QSV** 构建开关 | 软编回退 | desktop-performance P1 |
| **Desktop** | 独立 Agent 服务壳 + iohook 规划 | 解耦 Electron | desktop-performance P2 |
| **AI** | Ollama + Qdrant + Node Worker | 私有化卖点 | ai-platform-spec |
| **SFU** | mediasoup 低并发 | 非千万并发定位 | webrtc-architecture |

**退出标准**：付费客户可完成 1:1 远程 + Pro 云录制 +（可选）SFU 观摩。

---

## 3. 阶段 B — Desktop 原生 / Rust（按投入产出比）

> 详细 FR 见 [desktop-performance-spec.md](./desktop-performance-spec.md) §4。

| 优先级 | 主题 | 实现方向 | 触发条件（满足其一再立项） |
| :---: | :--- | :--- | :--- |
| **R1** | **屏幕捕获原生化** | Rust：`dxgi` / macOS `ScreenCaptureKit`；共享内存出帧 | P0 采集 CPU>15% 或延迟不达标 |
| **R2** | **硬件编码** | Rust/NVENC/QSV/VAAPI 绑定；或强化 Chromium HW 路径 | 软编占比 >30% 会话 |
| **R3** | **Video + Overlay 架构** | 独立合成层（光标/水印/隐私遮罩）；GPU 合成优先 | 多图层/Enterprise 多屏 |
| **R4** | **键鼠 Hook 原生化** | Rust `windows` / macOS CGEvent；替代 iohook | 注入延迟 P95>50ms |
| **R5** | **SharedArrayBuffer** | 环区与上传线程共享；减少拷贝 | R1/R2 后仍有拷贝热点 |
| **R6** | **GPU 零拷贝** | 纹理 → 编码器 Opaque；平台强相关 | R1–R5 完成且仍有 GPU 瓶颈 |

**仓库规划**：`desktop/native/`（Rust crate + napi-rs）或独立 `vistaremote-agent-native` 二进制，由 Agent Service 加载。

---

## 4. 阶段 B — 其他端（摘要）

| 域 | 优先级 | 方向 | 阶段 |
| :--- | :---: | :--- | :--- |
| **Web 播放** | 高 | WebCodecs 硬解、OffscreenCanvas、统计上报 | A（已 Spec） |
| **Web 播放** | 中 | WebGPU 渲染路径（实验） | C |
| **Mobile** | 高 | JSI 热路径、原生 Video 视图 | A |
| **Mobile** | 低 | 原生解码模块（仅当 RN 不足） | B |
| **Server SFU** | 中 | mediasoup 调优、端口/Worker 数 | A |
| **Server SFU** | 低 | Rust 媒体处理（仅 SFU 录制 FFmpeg 仍用 C++ 生态） | C |
| **AI** | 中 | python-worker 扩缩；非 Rust 优先 | A |
| **AI** | 低 | Rust 推理服务（ONNX Runtime） | C |

---

## 5. 阶段 C — 极致与平台化

| 项 | 说明 |
| :--- | :--- |
| 全链路 GPU 零拷贝（R6） | Win/mac 分支维护 |
| 多屏并行采集 + SFU Simulcast | Enterprise |
| 边缘 QoS 与弱网前向纠错 | 研究项 |

---

## 6. 测量与立项门槛

| 指标 | 工具 | 立项参考 |
| :--- | :--- | :--- |
| 端到端延迟 P95 | webrtc-internals、自建 stats | >200ms LAN |
| 采集 CPU | ETW/Instruments、Agent 上报 | >15% 单核 |
| 编码方式占比 | RTC outbound-rtp | software >30% |
| 主控 Jank | Long Task、framesDropped | 持续超标 |

无数据 **不得** 提前启动 R5/R6。

---

## 7. 与对外文档的边界

| 位置 | 是否写 Rust/排期 |
| :--- | :--- |
| `spec/*` | **写**（本文 + desktop-performance-spec） |
| `docs/` 用户指南、定位、白皮书 | **不写**实现语言路线图 |
| `docs/` 工程/架构（若存在） | 仅写已交付能力，不写 R1–R6 承诺 |
| README 开源仓库 | 不写 Rust 排期 |

---

## 8. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 阶段 A/B/C；Desktop R1–R6 ROI 序 |
