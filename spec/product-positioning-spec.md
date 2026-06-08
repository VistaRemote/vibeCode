# 产品定位与选型 Spec（L0 补充）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-POS-001` |
| **版本** | 1.0.0 |
| **关联** | [system-overview.md](./system-overview.md) · [desktop-performance-spec.md](./desktop-performance-spec.md) |

---

## 1. 适用场景（Normative）

| 适合 | 不适合 |
| :--- | :--- |
| 企业内网远程协助、运维、可审计监控 | 千万级并发直播 / 全球 CDN 分发 |
| 需要 **二开、私有化、合规** 的团队 | 必须用闭源黑盒且不接受自建 |
| 万级以下并发会话、数十路 SFU | 超大规模观众同屏（应用 SRS/专用 CDN） |

**结论**：在 **不需要千万并发** 的场景，VistaRemote 在 **开发成本、交付速度、可改造性** 上为优选方案。

---

## 2. 开发效率与二开

| 维度 | 说明 |
| :--- | :--- |
| **语言** | 主栈 **TypeScript**；AI 重算力侧 **Python**（`ai/python-worker`）— 均为国内团队高熟悉度语言 |
| **契约** | `shared` 单点类型，改协议不「口口相传」 |
| **Spec** | Spec-Driven，需求可追溯 |
| **Meta-Repo** | 按需 clone 子仓；Rsbuild 冷启动快，无 Monorepo 构建黑洞 |
| **招聘** | 前后端统一 TS，降低编制与培训成本 |

---

## 3. 客户端性能策略（摘要）

| 端 | 策略 | Spec |
| :--- | :--- | :--- |
| **Web 主控** | WebCodecs 硬解 + Worker/OffscreenCanvas + JitterBuffer | webrtc-architecture-spec §5 |
| **Mobile** | react-native-webrtc + **JSI** 热路径（新架构） | mobile-spec FR-MOB-PERF |
| **Desktop Agent** | 零帧 IPC、GPU 编码、**端侧录制缓冲上传** | desktop-performance-spec |
| **重资源付费点** | SFU / 云录制 / SFU 录制 / 降云 / 企业遥测 | commercial-resources-spec |

### 3.1 跨端 UI：React 系，不用 Flutter

- **大前端**：Rsbuild/Rspack + React 19（Web/Desktop）+ RN/JSI（Mobile）；构建链路由 **Rust 工具** 加速，**不** 将 Flutter 作为 UI 运行时。
- **大原生**：DXGI、NVENC、键鼠 Hook 等由 **Rust**（N-API / Native Module）实现；**Dart 不承担** 底层压榨。
- 详见 [ADR-0007](../adr/0007-no-flutter-cross-platform-ui.md)、[frontend-toolchain-spec.md](./frontend-toolchain-spec.md) §1.1。

---

## 4. 对外话术（文档站同步）

文档站 **[tech-advantages](https://github.com/VistaRemote/docs)**（`/architecture/tech-advantages`）为 **决策者 / 运维 / 开发者** 分角色叙事，以下为摘要：

| 受众 | 核心信息 |
| :--- | :--- |
| **老板 / 业务** | 不追 Flutter 双栈；React+Rust 分工清晰；交付快、数据在自家机房 |
| **IT / 运维** | MySQL+Redis+Compose 熟栈；无 Kafka 集群；BullMQ 复用 Redis |
| **开发者** | React/RN/NestJS 主流；Rspack 秒级构建；Rust 只做 DXGI/NVENC |

1. **好改**：开源 + TS 全栈 + Spec。  
2. **快**：Meta-Repo + Rsbuild/Rspack，迭代以天计。  
3. **省**：MySQL + Docker 自建，无按席位云绑架。  
4. **够用**：WebRTC + mediasoup 面向企业会话规模，非弹幕亿级。  
5. **AI 可嵌入**：PaddleOCR-slim + 端侧 VL + Ollama 私有化。  
6. **架构可信**：不 Flutter 噱头；Rust 底层可演进 — ADR-0007/0003。

---

## 5. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.2.0 | §4 文档站 tech-advantages 分角色话术 |
| 2026-05-24 | 1.1.0 | §3.1 不采用 Flutter；Rust 底层分工 |
| 2026-05-24 | 1.0.0 | 选型边界、二开、三端性能摘要 |
