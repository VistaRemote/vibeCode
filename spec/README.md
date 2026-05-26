# VistaRemote Spec 规范索引

| Metadata | Value |
| :--- | :--- |
| **版本** | 0.4.0-draft |
| **最后更新** | 2026-05-24 |

---

## Spec 驱动开发（必读）

| 文档 | 说明 |
| :--- | :--- |
| [spec-driven-development-spec.md](./spec-driven-development-spec.md) | SDD 工作流、FR/US ID、PR 义务 |
| [release-planning-spec.md](./release-planning-spec.md) | ROADMAP、迭代 plan、自检、技术债务 |
| [team-collaboration-spec.md](./team-collaboration-spec.md) | 团队上下文指引与同步节奏 |
| [implementation-status.md](./implementation-status.md) | **实现 vs Spec** 矩阵（开发前查） |
| [mvp-core-flow-spec.md](./mvp-core-flow-spec.md) | **MVP 核心链路** FR/验收/测试 |
| [architecture-foundation-spec.md](./architecture-foundation-spec.md) | 基础架构 F-01～F-13 就绪清单 |
| [quality-gates-spec.md](./quality-gates-spec.md) | CI、AI Code Review、Branch Protection |
| [plugin-architecture-spec.md](./plugin-architecture-spec.md) | 核心 + 插件生态 |
| [DEVELOPMENT.md](../DEVELOPMENT.md) | 人类开发者入口 |
| [ROADMAP.md](../ROADMAP.md) · [plan/implementation-plan.md](../plan/implementation-plan.md) | 里程碑与当前迭代 |
| [adr/README.md](../adr/README.md) | 架构决策记录 ADR |
| [prompts/README.md](../prompts/README.md) | 版本化 AI Prompt |

---

## 模块 Spec 清单

| 模块 | Meta-Repo Spec | 子仓库 `spec/` |
| :--- | :--- | :--- |
| **L0 系统** | [system-overview.md](./system-overview.md) | — |
| WebRTC 媒体 | [webrtc-architecture-spec.md](./webrtc-architecture-spec.md) | P2P/TURN、mediasoup、播放优化 |
| 消息传输 | [messaging-transport-spec.md](./messaging-transport-spec.md) | WS 信令、SSE 通知、DataChannel |
| **异步任务队列** | [job-queue-spec.md](./job-queue-spec.md) | **BullMQ/Redis**；AI Job；非 RabbitMQ/Kafka |
| 认证与授权 | [authorization-spec.md](./authorization-spec.md) | RBAC + ABAC + Plan；JWT/信令票 |
| 前端工具链 | [frontend-toolchain-spec.md](./frontend-toolchain-spec.md) | React/Rsbuild/RN；**非 Flutter**（ADR-0007） |
| 套餐商业化 | [commercial-tier-spec.md](./commercial-tier-spec.md) | 试用；SFU/降云试用后付费 |
| 订单与支付 | [billing-commerce-spec.md](./billing-commerce-spec.md) | 买断/订阅；微信/支付宝等；Admin 三模块 |
| 开源与商业授权 | [licensing-spec.md](./licensing-spec.md) | 个人非盈利免费；商业一律收费 |
| 大模型微调（闭源） | [ai-finetune-spec.md](./ai-finetune-spec.md) | 独立私有仓，与公开 `ai` 分离 |
| AI 平台（架构） | [ai-platform-spec.md](./ai-platform-spec.md) | 私有化 LLM+向量库；Node 主栈 + Python ML |
| AI 行为洞察架构 | [ai-behavior-architecture-spec.md](./ai-behavior-architecture-spec.md) | — |
| AI 仓库 | [ai-spec.md](./ai-spec.md) | `ai/spec/SPEC.md` |
| 录制回放 | [recording-playback-spec.md](./recording-playback-spec.md) | 端侧默认；SFU 录制 Enterprise |
| 商业化资源点 | [commercial-resources-spec.md](./commercial-resources-spec.md) | 重资源 Feature 切割 |
| 企业安全 | [enterprise-security-spec.md](./enterprise-security-spec.md) | — |
| shared | [shared-spec.md](./shared-spec.md) | `shared/spec/` |
| server | [server-spec.md](./server-spec.md) | `server/spec/` |
| web | [web-spec.md](./web-spec.md) | `web/spec/` |
| web 用户端 | [web-client-spec.md](./web-client-spec.md) | `web/spec/client-spec.md` |
| web 管理台 | [web-admin-spec.md](./web-admin-spec.md) | `web/spec/admin-spec.md` |
| desktop | [desktop-spec.md](./desktop-spec.md) | `desktop/spec/` |
| mobile | [mobile-spec.md](./mobile-spec.md) | `mobile/spec/` |
| docs | [docs-spec.md](./docs-spec.md) | `docs/spec/` |
| deploy | [deploy-spec.md](./deploy-spec.md) | `deploy/spec/` |
| Git / 协作 | [git-collaboration-spec.md](./git-collaboration-spec.md) | — |
| CI/CD 与发布 | [cicd-release-spec.md](./cicd-release-spec.md) | shared 发布、下游同步、分仓 tag |
| 工程规范 | [engineering-standards-spec.md](./engineering-standards-spec.md) | — |
| 子仓脚手架 | [subrepo-scaffold-spec.md](./subrepo-scaffold-spec.md) | README/LICENSE 完备性 |
| Meta 开发/发布 | [meta-repo-development-spec.md](./meta-repo-development-spec.md) | Biome 分层、单独发版 |
| 开发者体验 | [developer-experience-spec.md](./developer-experience-spec.md) | dev-up、env 切换、单仓 setup |
| Agent 分发/接入 | [agent-distribution-spec.md](./agent-distribution-spec.md) | 数字码/QR/链接；三包体；企业自动监控 |
| **性能路线图（内部）** | [performance-roadmap-spec.md](./performance-roadmap-spec.md) | 先上线 → 按 ROI Rust；不对 docs 用户承诺 |
| Desktop 性能 | [desktop-performance-spec.md](./desktop-performance-spec.md) | 阶段 A/B；R1–R6 ROI |
| 产品定位/选型 | [product-positioning-spec.md](./product-positioning-spec.md) | 二开、成本、非千万并发场景 |

---

## 技术栈速查（0.3）

| 层级 | 选型 |
| :--- | :--- |
| 数据库 | **MySQL 8 only**（不用 PostgreSQL，见 [positioning doc](../docs/positioning-and-advantages.md)） |
| 后端 | NestJS + Redis + BullMQ |
| AI | **多模型**：端侧（desktop）+ 云端 Worker（`ai`）+ Ollama 本地调试 |
| 录制存储 | MinIO / S3 |
| 套餐 | free / pro / enterprise |
| 前端 | Rsbuild + antd + Sass；Web Client + **Admin 管理台** |

---

## 实现顺序建议

1. `shared`：plan、telemetry、behavior、inference、ai DTO
2. `server`：MySQL 实体、Admin 全用户、PlanGuard
3. `web/admin`：用户与套餐管理
4. `ai`：队列 + 摘要 Job
5. Pro：录制上传与回放
6. Enterprise：策略、遥测、安全与效率报告

---

## 相关文档

- [白皮书](../docs/whitepaper.md)
- [架构背景](../docs/architecture-and-background.md)
- 文档站（用户/开发者）：`docs/` → [开发者手册](https://github.com/VistaRemote/vista-remote/tree/main/docs/docs/zh/guide/developer-handbook.mdx)
