# ADR-0006: 异步任务队列使用 BullMQ（Redis）

| Metadata | Value |
| :--- | :--- |
| **状态** | Accepted |
| **日期** | 2026-05-24 |

## 背景

VistaRemote 需要将 AI 审计、录制摘要、行为分析等 **异步、可重试、可观测** 的工作从 `server` 解耦到 `ai` Worker。候选包括 BullMQ（Redis）、RabbitMQ、Kafka。

项目定位为 **TypeScript 全栈 + NestJS**、百万级并发以内、已有 Redis（会话/信令/SSE），非千万级日志汇聚。

## 决策

- **采用 BullMQ** 作为唯一标准异步任务队列
- **基于现有 Redis**，不新增 Kafka/RabbitMQ 集群
- **Server**：`@nestjs/bullmq` 生产 Job
- **AI**：独立 Worker 消费，共享 `shared` Job 契约

## 理由（摘要）

1. **生态**：Node/TS 最成熟的任务队列之一；与 NestJS 依赖注入、`@Processor` 无缝融合
2. **AI 任务形态**：高延迟、高波动；需要 per-job 延迟、指数退避、状态（Waiting/Active/Failed…）
3. **运维**：复用 Redis；Kafka 对轻量 VPS 过重；RabbitMQ 路由与 Nest 集成成本高
4. **场景**：端侧降噪后的行为事件，非 Kafka 式海量日志流；路由为简单 `server → ai`

## 后果

- `deploy` 必须提供 Redis；BullMQ 与 Pub/Sub 可同实例不同 logical DB
- 文档与 Spec：`spec/job-queue-spec.md` 为 Normative 来源
- 禁止引入第二套消息中间件除非新 ADR

## 备选方案

| 方案 | 未采纳原因 |
| :--- | :--- |
| RabbitMQ | NestJS 融合弱；复杂 Exchange 路由用不上；任务状态/退避需大量自研 |
| Kafka | 运维重；无原生单任务 delay/backoff；适合日志管道非 AI Job |
| DB 轮询 | 延迟与可观测差；仅作极端降级 |

## 关联

- [spec/job-queue-spec.md](../spec/job-queue-spec.md)
- [spec/ai-platform-spec.md](../spec/ai-platform-spec.md)
- [spec/messaging-transport-spec.md](../spec/messaging-transport-spec.md)
