# 多显示器迭代路线图

与 [spec/multi-display-spec.md](../spec/multi-display-spec.md)、[plan/mvp-iteration-roadmap.md](./mvp-iteration-roadmap.md)、[ROADMAP.md](../ROADMAP.md) 对齐。

---

## 1. 迭代总览

```text
MVP-B（单屏闭环） → MD-1（向日葵式选屏） → MD-2（单屏热切换 / On-Demand）
    → MD-3（TeamViewer 多窗口 / 多路流） → MD-4（原生采集 + Dirty Rect） → ENT（监控墙）
```

| 版本 | 代号 | 一句话 | 依赖 | 状态 |
| :--- | :--- | :--- | :--- | :--- |
| **MVP-B.3** | Single | 单显示器用户：默认主屏，1 路视频 + 控制 | 当前 Electron 采集 | 🟡 进行中 |
| **v0.4 / MD-1** | Picker | 多屏用户：连接前选择要控制的显示器 | `desktopCapturer` 枚举 | ⬜ |
| **v0.5 / MD-2** | Switch | 会话中切换显示器；On-Demand 单路采集 | MD-1 + 信令 | 🟢 `b10` |
| **v0.6 / MD-3** | Multi-Win | 多窗口各绑一块屏；多路 Stream 并行 | MD-2 + 可选 SFU | ⬜ |
| **v0.7 / MD-4** | Capture+ | 每屏独立采集线程；Dirty Rect；热插拔 | desktop-performance R1 | ⬜ |
| **ENT-1** | Grid | Admin 1–4 路缩略监控 | mediasoup + MD-4 缩略 | ⬜ |

---

## 2. 初期版本：单屏用户（MVP-B）

**目标**：笔记本、单显示器用户无感使用；不增加选屏负担。

### 2.1 范围

- 自动选择**主显示器**（`isPrimary` 或 `screen:0:0`）
- 单 `RTCPeerConnection`、单 `video` track
- 控制通道 `displayIndex: 0`（与 shared 契约一致）
- 文档明确：**多屏用户当前仅能控制主屏**，后续 MD-1 支持选屏

### 2.2 任务板

| 任务 | 说明 | 优先级 |
| :--- | :--- | :--- |
| [x] `setDisplayMediaRequestHandler` 选主屏 | `display-media.ts` | P0 |
| [ ] 会话诊断展示「当前采集：Display 0 / 主屏」 | Agent + Web 诊断 | P1 |
| [ ] `display.topology` 仅日志（可选） | 为 MD-1 预埋 | P2 |
| [ ] 文档：多屏已知限制 | mvp-getting-started、本 roadmap | P0 |

### 2.3 验收

- 单屏机器：配对 → 出画 → 控制，与现 MVP 一致
- 双屏机器：默认主屏有画面；副屏不可控（已知限制，UI 提示）

---

## 3. 后续版本：多屏用户 — 阶段 MD-1（向日葵式选屏）

**目标**：连接前让用户**自己选择**要远程的屏幕。

### 3.1 交付物

| 端 | 功能 |
| :--- | :--- |
| **Agent** | 启动采集前弹窗 / 托盘：缩略图网格列出所有 `Display` |
| **Web** | 配对成功后、进会话前：「选择要查看的显示器」（若 Agent 上报多屏） |
| **shared** | `DisplayInfo[]`、`SessionDisplayMode.picker` |
| **信令** | `display-topology` 推送；`set-active-display` 请求 |

### 3.2 技术要点

- `desktopCapturer.getSources({ types: ['screen'] })` 返回每块屏的 `id` / `name` / `thumbnail`
- 用户选择后，**仅对该 `sourceId` 调用** `getUserMedia` / handler callback
- 仍 **单路编码、单 track**（不增加 MVP 信令复杂度）

### 3.3 任务拆分（建议 1–2 周）

1. `electron/display-enumeration.ts`：封装枚举 + 主屏检测
2. Agent UI：`DisplayPickerModal`（antd）
3. IPC：`agent:select-display` → 更新 handler 中的 `pick`
4. Web：若 join 响应含 `displays.length > 1`，展示选屏步骤（可选，或由 Agent 预选）
5. 单测：mock 3 sources，选择第 2 个后 `sourceId` 正确

### 3.4 验收

- 双屏：用户选副屏 → 主控仅见副屏内容
- 单屏：不弹选屏，直达会话

---

## 4. 阶段 MD-2：单屏切换 + On-Demand 编码

**目标**：对标 TeamViewer **单屏切换模式** — 节约 CPU/带宽，未观看屏不全力编码。

### 4.1 行为

| 组件 | 行为 |
| :--- | :--- |
| **捕获层** | 多屏**低频**抓帧或挂起（如 1fps 心跳），保持 `displayId` 存活检测 |
| **编码层** | 仅 `activeDisplayId` 全帧率；切换时 300–500ms 内切源 |
| **网络** | 仍 **单 video track**（切换=换轨或关键帧刷新） |
| **主控 UI** | 工具栏「显示器 1 / 2 / 3」切换按钮 |

### 4.2 任务拆分（建议 2–3 周）

1. 信令：`session-display-mode: { kind:'single', activeDisplayId }`
2. Agent：编码器池 idle/active；切换时 `replaceTrack` 或 `removeTrack`+`addTrack`
3. Web：切换按钮 + 状态 `display-switching` → `streaming`
4. 控制：事件始终带当前 `activeDisplayId`
5. 性能：切换前后 CPU 曲线对比（On-Demand vs 全时双采）

### 4.3 验收

- 双屏：默认屏 1 全帧率；切到屏 2 后画面切换，屏 1 编码暂停（CPU 下降可测）
- 弱网：切换不导致会话整体失败

---

## 5. 阶段 MD-3：多窗口 + 多路 Stream（TeamViewer 分窗）

**目标**：主控端可打开多个窗口，每窗绑定远程 `displayId`；点击某窗即向该屏注入事件。

### 5.1 行为

| 模式 | 捕获 | 编码 | 主控 |
| :--- | :--- | :--- | :--- |
| `multi-window` | 每屏并行采集 | 每屏独立 **Stream**（多 track 或 SFU 多 producer） | 每屏一个 `<video>` 窗口 |
| 事件 | — | — | `pointer` 含 `displayId`；窗口 B 内点击 → Display 2 坐标 |

### 5.2 架构注意

- **1:1 P2P**：多 track 在同一 PC（`addTransceiver` × N）— 适合 2–3 屏
- **≥3 屏或 Enterprise**：建议升级 **SFU**（见 webrtc-architecture FR-WRTC-10、enterprise-security FR-ENT-20）
- 虚拟坐标系：每窗口独立 0..1，**禁止**跨窗误映射

### 5.3 任务拆分（建议 3–4 周）

1. shared：多 `streamId` / `displayId` 与 SDP 扩展约定
2. Agent：每 display 一个 `MediaStreamTrack`；信令标注 `displayId`
3. Web：`openDisplayWindow(displayId)`；窗口管理 + 焦点
4. 控制：DataChannel 原语 `displayId` 必填
5. E2E：双窗同时打开，分别点击验证

### 5.4 验收

- 双屏：两个浏览器窗口（或 popout）各显示一路，控制互不串屏
- 关闭其中一窗：Agent 对该路 On-Demand 降码或暂停

---

## 6. 阶段 MD-4：原生采集 + Dirty Rectangle + 热插拔

**目标**：对齐 TeamViewer 级捕获与编码效率；与 [desktop-performance-spec](../spec/desktop-performance-spec.md) R1–R3 合并立项。

| 能力 | 说明 |
| :--- | :--- |
| 每屏独立采集线程 | Win DXGI / macOS ScreenCaptureKit |
| Dirty Rect | 帧差分，仅编码变化区域 |
| 热插拔 | `display.removed` → 释放线程；`display.added` → 可选通知重选 |
| 合屏模式 `stitched` | P2：虚拟桌面坐标（可选） |

**依赖测量门**：P0 Electron 多屏 CPU &gt;30% 或 MD-3 带宽不达标再启动 R1。

---

## 7. Enterprise：监控墙（并行轨道）

与 MD-3 技术复用，但场景为 **只读多路预览**：

- Admin / 主控：`grid` 模式，≤4 路 @720p15
- **必须 SFU**，禁止 N 路 P2P 打满 TURN
- 见 [enterprise-security-spec](../spec/enterprise-security-spec.md) FR-ENT-20/21

---

## 8. 里程碑与 ROADMAP 对齐

| ROADMAP | 本计划 |
| :--- | :--- |
| **M2 MVP-B** | §2 单屏 |
| **M2.5 / v0.4** | MD-1 Picker |
| **v0.5–0.6** | MD-2 / MD-3 |
| **性能 R1** | MD-4 |
| **M5 ENT-1** | Grid |

---

## 9. 风险与决策

| 风险 | 缓解 |
| :--- | :--- |
| Electron 多路 capture CPU 高 | MD-2 On-Demand；MD-4 原生 |
| P2P 多 track 带宽爆炸 | 限制 2 路 P2P；更多走 SFU |
| `displayIndex` 与 `displayId` 混用 | MD-1 起以 `displayId` 为主键，index 仅展示 |
| 热插拔会话中断 | topology 事件 + 自动 pause + UI 提示重选 |

---

## 10. 文档同步清单

| 文档 | 更新内容 |
| :--- | :--- |
| [spec/multi-display-spec.md](../spec/multi-display-spec.md) | 三层架构 FR（主 Spec） |
| [spec/desktop-spec.md](../spec/desktop-spec.md) | §4 分阶段 |
| [spec/mvp-core-flow-spec.md](../spec/mvp-core-flow-spec.md) | 单屏范围 |
| [ROADMAP.md](../ROADMAP.md) | L4.5 多屏 |
| [spec/implementation-status.md](../spec/implementation-status.md) | 矩阵行 |
| [docs/guide/mvp-getting-started.md](../docs/guide/mvp-getting-started.md) | 多屏说明 |

---

## 11. Changelog

| 日期 | 变更 |
| :--- | :--- |
| 2026-05-26 | 初版：MVP 单屏 → MD-1~4 + ENT 迭代规划 |
