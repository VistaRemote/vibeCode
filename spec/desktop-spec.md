# Desktop 被控 Agent Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-DKT-001` |
| **仓库** | `desktop/` |
| **技术栈** | Electron, React, **Rsbuild**, **Ant Design 5**, **Sass** |
| **版本** | 0.5.0-draft |
| **性能** | [desktop-performance-spec.md](./desktop-performance-spec.md) |
| **工具链** | [frontend-toolchain-spec.md](./frontend-toolchain-spec.md) |

---

## 1. 职责

Desktop 仓库承担 **双重角色**（同一 codebase，不同启动模式或构建目标）：

| 角色 | 说明 |
| :--- | :--- |
| **Controlled Agent（被控）** | 屏幕采集、编码推流、接收 DataChannel 控制指令并注入 OS 输入 |
| **Controller Dashboard（可选）** | 本地完整主控 UI（与 web 能力对齐，适合 power user） |

MVP 优先交付 **Agent**；Dashboard 与 `web/packages/ui` 对齐（P1）。

渲染进程 **必须** 使用 Rsbuild + antd + Sass，与 Web Client 共用 `frontend-toolchain-spec`。**不** 使用 Flutter；截屏/编码/Hook 由 Rust 原生模块承担（[ADR-0007](../adr/0007-no-flutter-cross-platform-ui.md)、[ADR-0003](../adr/0003-rust-not-cpp-for-native.md)）。

---

## 2. 进程架构

> **性能演进（Normative）**：[desktop-performance-spec.md](./desktop-performance-spec.md) · [performance-roadmap-spec.md](./performance-roadmap-spec.md)（R1–R6 ROI，不对 docs 用户承诺）。

```text
┌─────────────────────────────────────────────────────────────┐
│  Agent Service (P1+) — 采集·GPU 编码·iohook·edge-ai         │
│  与 Electron：仅控制面消息，不传视频帧                          │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│  Electron Main — WebRTC·托盘·Watchdog(Managed)               │
│  P0: MediaStream → RTCPeerConnection（不经 IPC 传帧）          │
└────────────────────────────┬────────────────────────────────┘
                             │ contextBridge（小消息）
┌────────────────────────────▼────────────────────────────────┐
│  Renderer — 配对/授权/控制台 UI                               │
└─────────────────────────────────────────────────────────────┘
```

**安全**：`contextIsolation: true`，`nodeIntegration: false`（渲染进程）。

**仓库内导航**：`desktop/ARCHITECTURE.md`。

---

## 3. 目录结构（目标）

```text
desktop/
├── electron/               # 主进程（无 antd）
│   ├── main.ts
│   ├── preload.ts
│   ├── webrtc/
│   ├── capture/            # MediaStream P0
│   ├── local-agent/      # 服务控制协议 P1
│   ├── encode/             # gpu-policy.ts
│   ├── input/              # iohook 桥 P1
│   ├── watchdog/           # Managed 进程守护 P1
│   ├── recording/          # 缓冲环区 + 分片上传 P0/P1
│   └── edge-ai/            # 端侧多模型推理（见 ai-behavior-architecture-spec）
│       ├── inference-router.ts
│       ├── rules-engine.ts
│       ├── timeseries-features.ts
│       ├── cv-sampler.ts   # ONNX P1
│       └── capability-monitor.ts
├── src/                    # Rsbuild 渲染进程
│   ├── App.tsx
│   ├── pages/
│   └── styles/
│       ├── global.scss
│       └── *.module.scss
├── rsbuild.config.ts       # extends 与 web 同构的 base（可复制或 git submodule theme）
├── resources/
└── package.json
```

---

## 4. 屏幕采集

> **多显示器分阶段**：MVP 仅单屏主显示器；选屏 / 热切换 / 多路流见 [multi-display-spec.md](./multi-display-spec.md) 与 [plan/multi-display-iteration-roadmap.md](../plan/multi-display-iteration-roadmap.md)。

| 阶段 | 能力 | 版本 |
| :--- | :--- | :--- |
| **单屏** | 自动主屏，1 路 track | MVP-B |
| **选屏** | 用户连接前选择显示器（向日葵式） | MD-1 / v0.4 |
| **切换** | 会话中换屏，On-Demand 编码 | MD-2 / v0.5 |
| **多窗** | 每屏独立 Stream + `displayId` 控制 | MD-3 / v0.6 |
| **原生** | 每屏采集线程、Dirty Rect、热插拔 | MD-4 + R1 |

| ID | 需求 | 验收标准 |
| :--- | :--- | :--- |
| FR-DKT-01 | 枚举所有显示器，**MVP 默认主屏**；MD-1+ UI 可切换 `displayId` | MVP：主屏出画；MD-1：选屏正确 |
| FR-DKT-02 | 使用 `desktopCapturer` + `getUserMedia` 或等价原生路径 | 1080p@30fps 可达（硬件允许） |
| FR-DKT-03 | 分辨率/帧率随网络降级（配合 WebRTC stats） | 带宽下降时自动降档 |
| FR-DKT-04 | 采集前须用户授权（系统权限 + 应用内确认） | macOS 屏幕录制权限流程文档化 |
| FR-DKT-01b | 多屏 On-Demand / 多路编码 | 见 FR-MDISP-E02/E03 | MD-2+ |
| FR-DKT-01c | 每物理屏独立采集上下文；显示器断开释放 | 见 FR-MDISP-C02/C03 | MD-4 / R1 |

---

## 5. WebRTC（被控侧）

| ID | 需求 | 验收标准 |
| :--- | :--- | :--- |
| FR-DKT-05 | 1:1 作为 **Offerer 或 Answerer**（由信令约定，默认 Agent 发 Offer） | 与 web 主控互通 |
| FR-DKT-06 | 创建 `control` DataChannel 或由主控创建后绑定 | 控制指令生效 |
| FR-DKT-07 | SFU 模式仅 **上行 Publish** 一路视频 + 数据（若 SFU 支持 DataChannel 中继则按 SFU 能力） | N>1 时 CPU 不随 N 线性涨 |
| FR-DKT-08 | ICE 配置从 Server 拉取 | 无硬编码 TURN |
| FR-DKT-08f | `electron/webrtc/publisher`：SFU 时仅 **单路 Publish** | 见 webrtc-architecture-spec |
| FR-DKT-08g | 发送端 `degradationPreference: maintain-framerate` | `rtc-tuning.ts` |
| FR-DKT-08b | Pro+：**端侧**录制 → 本地缓冲环区 → 定时分片上传 S3（**非 SFU 录制**） | 见 recording-playback-spec |
| FR-DKT-08b2 | `electron/recording/`：BufferZone + UploadScheduler + RecordingSession | 权益门 `recording` |
| FR-DKT-08c | Enterprise：端侧 **edge-ai** 实时检测 + `telemetry` 上报结构化结果 | 不含键入内容；隐私敏感仅端侧 |
| FR-DKT-08e | 低配机：`capability-monitor` 检测 CPU 压力，自动请求云端补算 | 不阻塞办公 |
| FR-DKT-08d | Enterprise：多显示器枚举与并行采集/上传 | 最多 4 屏 |

---

## 6. 输入注入

| ID | 需求 | 验收标准 |
| :--- | :--- | :--- |
| FR-DKT-09 | 解析 `ControlEnvelope`，映射归一化坐标到像素 | 误差见 system-overview FR-CTL-01 |
| FR-DKT-10 | 支持左/右/中键与滚轮 | 人工测试清单 |
| FR-DKT-11 | 键盘映射使用 OS 虚拟键码或 cross-platform 库 | 英文字母与数字 |
| FR-DKT-12 | **安全**：仅当 Session 为 `connected` 且用户已授权时注入 | 断开后立即停止 |

---

## 7. 配对与上线

> 接入方式与三包体：[agent-distribution-spec.md](./agent-distribution-spec.md)

| ID | 需求 | 验收标准 |
| :--- | :--- | :--- |
| FR-DKT-13 | 首次启动生成/绑定 `deviceId`，向 Server 注册（含 `installChannel`） | 重启后 ID 持久化 |
| FR-DKT-14 | UI 同步展示 **数字码 + 二维码 + 会话链接** | 主控三路径均可 join |
| FR-DKT-15 | 托盘菜单：断开所有会话、退出、开机自启（P1） | |
| FR-DKT-16 | `install-profile` 读取构建时常量，运行时不可改 channel | 三包 CI artifact 可区分 |
| FR-DKT-17 | BYOD：enrollment + `consentAt` 后才 `enrolled_auto` | 审计可查 |
| FR-DKT-18 | Managed：`managed_silent` + 首次法律告知页 | FR-DIST-12 |

---

## 8. 非功能需求

| ID | 需求 | 目标 |
| :--- | :--- | :--- |
| NFR-DKT-01 | 空闲 CPU | < 5%（无会话） |
| NFR-DKT-02 | 支持平台 | Windows 10+, macOS 12+（MVP）；Linux P2 |
| NFR-DKT-03 | 安装包 | electron-builder；代码签名 P1 |

---

## 9. 原生依赖注意（Meta-Repo 原因）

- `node-gyp` 原生模块 **锁定在 desktop 仓库独立 `node_modules`**，禁止与 RN 共享 hoist。
- CI 分平台矩阵构建（win/mac）。

---

## 10. Out of Scope

- 无告知、无企业授权的隐蔽投屏
- Consumer 包 **静默安装**（须用户主动安装）
- Managed 包允许 IT 预装，但 **必须** 首次告知 + 企业合同（见 agent-distribution-spec）

---

## 11. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.1.0-draft | 初稿 |
| 2026-05-24 | 0.2.0-draft | Rsbuild + antd + Sass |
| 2026-05-24 | 0.3.0-draft | 录制上传、telemetry、多屏 |
| 2026-05-24 | 0.4.0-draft | 端侧多模型 edge-ai；降云策略 |
| 2026-05-24 | 0.5.0-draft | 性能 Spec；本地服务架构；capture/local-agent 骨架 |
