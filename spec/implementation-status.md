# 实现状态矩阵（与 Spec 对照）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-STATUS-001` |
| **版本** | 1.0.0 |
| **更新** | 2026-05-24 |
| **说明** | 新功能开发前请查此表；✅ 可开发 · 🟡 部分 · ⬜ 未开始 · 🔗 依赖项 |

---

## 1. 基础架构就绪度（总结）

| 维度 | 状态 | 说明 |
| :--- | :--- | :--- |
| **Spec 体系** | ✅ | L0/L1 齐全；SDD 见 [spec-driven-development-spec.md](./spec-driven-development-spec.md) |
| **shared 契约** | ✅ | 信令、控制、WebRTC、auth、billing、telemetry、ai jobs |
| **本地开发体验** | ✅ | `dev.sh`、`pnpm env:*`、单仓 `pnpm setup` |
| **CI/CD 规范** | ✅ | Spec + 各仓 workflow 模板 |
| **协作/迭代** | ✅ | ROADMAP、plan、ADR、prompts、quality-gates |
| **插件体系** | 🟡 | Spec + shared Manifest；Host 加载 PLUGIN-α |
| **Server 业务持久化** | 🟡 | 内存 store；TypeORM/PostgreSQL 骨架已接，ADM-1 落库 |
| **端到端远程闭环** | 🟡 | **MVP-B** `20260604-b10`：MD-2 热切换、多屏选屏、v0.2 韧性；见 multi-display-spec |
| **Agent 三包体** | 🟡 | Agent/Viewer portable 已可打包；`file://` 资源路径与 `app.isPackaged` 已修复 |
| **Admin 完整 CRUD** | 🟡 | ADM-0：JWT 登录、用户/订单/录制/会话/审计；见 plan/admin-platform-roadmap.md |
| **支付回调** | ⬜ | 订单内存 + simulate-paid；微信/支付宝 P1 |

**结论**：适合在 **既有契约与模块边界内** 做功能开发；涉及「全量用户 MySQL」「真实支付」「生产 JWT」须先认领 P1 基建项或拆子任务。

---

## 2. 仓库级状态

| 仓库 | 状态 | 已具备 | 待办（P1+） |
| :--- | :--- | :--- | :--- |
| **shared** | ✅ | 导出、单测、发布流程 | 更多 Admin DTO |
| **server** | 🟡 | 信令 WSS、SSE、ICE、SFU 调度、计费/权益、行为内存 | TypeORM、JWT 守卫、BullMQ 实连、审计表 |
| **web/client** | 🟡 | Rsbuild、信令/SSE 客户端、WebRTC 播放、FeatureGate | 配对/会话 UI、登录 |
| **web/admin** | 🟡 | 登录守卫、六页、Bearer API | ProLayout、MySQL 用户 CRUD |
| **desktop** | 🟡 | Agent MVP+Viewer 打包、WebRTC 采集应答、配对 UI | 系统级键鼠注入、三包体签名分发 |
| **mobile** | 🟡 | RN 骨架、peer-session、env | webrtc 完整 UI、配对 |
| **ai** | 🟡 | Worker、LLM client、python-worker 占位 | LangChain、BullMQ、RAG |
| **deploy** | ✅ | compose、mediasoup-controller、coturn profile | 生产 compose |
| **docs** | ✅ | Rspress 中英、架构/工程/指南 | 用户向章节扩充 |

---

## 3. 领域功能矩阵

| 领域 | Spec | 实现 | 可开发任务示例 |
| :--- | :--- | :--- | :--- |
| 配对接入 | agent-distribution | 🟡 | Server 内存配对；Web `/pairing`；Desktop 展示 P1 |
| Desktop 性能 A（先上线） | desktop-performance §A | 🟡 | MediaStream、GPU 构建、recording、Agent 壳 |
| Desktop 性能 B（Rust） | desktop-performance §R1–R6 | ⬜ | 按 ROI；`desktop/native/` 占位；需测量后立项 |
| 全项目性能路线图 | performance-roadmap | ✅ | Spec only；不对外 docs |
| P2P 1:1 信令 | webrtc、messaging | 🟡 | 完善 join/auth、ICE 合并 |
| SFU 多观众 | webrtc、commercial | 🟡 | mediasoup-client 接线、权益已接 |
| 远程控制 DataChannel | shared control、desktop | 🟡 | DC + Win32 注入（b7）；Daemon 完整注入 v0.3 |
| **多显示器** | multi-display-spec | 🟡 | MVP 单屏主显示器；选屏 MD-1、多流 MD-3 未开始 |
| 套餐/试用/权益 | commercial、billing | 🟡 | 接 TypeORM、支付 webhook |
| RBAC/ABAC | authorization | 🟡 | Admin JWT+RolesGuard；Client JWT P1 |
| 录制回放 | recording | 🟡 | Admin 元数据列表+回放桩；端侧上传 P1 |
| SFU 服务端录制 | recording.sfu_server | ⬜ | PlainTransport+FFmpeg P2 |
| AI 摘要 | ai-platform | 🟡 | summarize processor |
| 企业安全遥测 | enterprise-security | 🟡 | 规则入库、Admin 列表 |
| 订单支付 | billing-commerce | 🟡 | 微信/支付宝适配器 |
| 插件 Host | plugin-architecture | 🟡 | Manifest 契约；Dynamic Module / vt-cli P1 |

---

## 4. 建议迭代顺序（维护者）

与 [spec/README.md](./README.md) 一致，并细化：

| 阶段 | 目标 | 解锁 |
| :--- | :--- | :--- |
| **MVP-A** | MySQL User/Session + JWT 登录 | 真实配对与鉴权 |
| **MVP-B** | Client 配对页 + 1:1 视频 + 控制 DC + 诊断/重试 | [mvp-core-flow-spec.md](./mvp-core-flow-spec.md) · plan/mvp-e2e-runbook.md |
| **MVP-C** | BullMQ + ai summarize | US-07 部分 |
| **MVP-D** | 录制 MinIO | Pro 套餐 |
| **ENT-1** | 遥测入库 + 规则告警 | Enterprise |
| **MD-1** | 多屏选屏（向日葵式） | 🟢 `b9` |
| **MD-2** | 会话内热切换 + On-Demand 单路 | 🟢 `b10` |
| **MD-3** | 多窗口多路 Stream | SFU 或双 track P2P |

---

## 5. 更新义务

合并影响用户可见行为或 FR 的 PR 时，作者 **应** 更新本表相关行。

---

## 6. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 初版矩阵 |
| 2026-05-26 | 1.0.1 | 多显示器规划行（multi-display-spec） |
