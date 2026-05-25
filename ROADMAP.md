# VistaRemote 产品路线图（ROADMAP）

| Metadata | Value |
| :--- | :--- |
| **当前里程碑** | **M0 — 基础架构就绪**（→ 进入 **M1 MVP-A**） |
| **规范** | [spec/release-planning-spec.md](./spec/release-planning-spec.md) |
| **迭代计划** | [plan/implementation-plan.md](./plan/implementation-plan.md) |
| **变更记录** | [CHANGELOG.md](./CHANGELOG.md) |

---

## 愿景（一句话）

**TypeScript 全栈 + 开放插件生态** 的远程桌面平台：官方克制做好 **音视频流控（WebRTC/SFU）** 与 **安全脱敏（AI）**，其余垂直场景由社区与企业插件扩展。

---

## 里程碑总览

| 里程碑 | 目标 | 状态 | 解锁能力 |
| :--- | :--- | :--- | :--- |
| **M0** | Spec/工具链/本地 dev/契约骨架 | 🟢 进行中 | 团队可并行开发各仓 |
| **M1 MVP-A** | MySQL + JWT + 真实鉴权 | ⬜ | 配对、登录、审计可追溯 |
| **M2 MVP-B** | 1:1 远程闭环（Web 主控） | ⬜ | US-01 端到端演示 |
| **M3 MVP-C** | AI 摘要队列 + BullMQ | ⬜ | Pro 智能能力雏形 |
| **M4 MVP-D** | 端侧录制 + MinIO | ⬜ | Pro 录制套餐 |
| **M5 ENT-1** | 企业遥测 + 规则告警 | ⬜ | Enterprise |
| **M6 PLUGIN-α** | 插件 Schema + 官方样例 + CLI 脚手架 | ⬜ | 第三方可开发不污染主仓 |
| **M7 PLUGIN-β** | 插件市场（GitHub-Driven）+ 签名/沙箱加固 | ⬜ | 社区分发与商业插件 |

详细 FR 与自检见 [plan/implementation-plan.md](./plan/implementation-plan.md)。

---

## 当前冲刺（Sprint）焦点

> 维护者每迭代更新本节；PR 合并前应同步 `plan/implementation-plan.md`。

| 字段 | 内容 |
| :--- | :--- |
| **迭代 ID** | `2026-W21` |
| **主题** | M0 收尾 → M1 立项准备 |
| **必交付** | `release-planning-spec`、插件架构 Spec、质量门禁、ADR 初版 |
| **不做什么** | 生产级支付、SFU 服务端录制、Rust R1（见 performance-roadmap **内部**） |

---

## 插件生态路线（摘要）

| 阶段 | 交付 |
| :--- | :--- |
| PLUGIN-α | `shared` 插件 Manifest/权限；Server Dynamic Module；Desktop/RN 注入 API |
| PLUGIN-β | `@vistaremote/vt-cli`；GitHub 插件索引；官方 2～3 个基建插件 |
| PLUGIN-γ | 市场 UI、企业授权、插件内购协议（Spec 见 plugin-architecture-spec） |

---

## 如何参与规划

1. 新能力：先开 Issue（`feature_request` / `plugin_proposal`），再更新 L1 Spec 的 FR。
2. 迭代结束：维护者运行 `pnpm plan:check`（见 `tooling/scripts/check-implementation-plan.mjs`），更新 [implementation-status.md](./spec/implementation-status.md) 与 [CHANGELOG.md](./CHANGELOG.md)。
3. 未按计划完成 → 记入 `plan/implementation-plan.md` 的 **技术债务** 表。

---

## 相关文档

- [spec/plugin-architecture-spec.md](./spec/plugin-architecture-spec.md)
- [spec/implementation-status.md](./spec/implementation-status.md)
- [adr/README.md](./adr/README.md)
