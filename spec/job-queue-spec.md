# 异步任务队列 Spec（BullMQ / Redis）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-JQ-001` |
| **版本** | 1.0.0 |
| **关联** | [ai-platform-spec.md](./ai-platform-spec.md) · [messaging-transport-spec.md](./messaging-transport-spec.md) · [server-spec.md](./server-spec.md) · [deploy-spec.md](./deploy-spec.md) · [ADR-0006](../adr/0006-bullmq-async-jobs.md) |

---

## 1. 结论（先读）

VistaRemote **异步后台任务**（AI 审计、录制摘要、行为分析、定时报告等）统一采用：

| 组件 | 选型 |
| :--- | :--- |
| **队列** | [**BullMQ**](https://docs.bullmq.io/)（基于 **Redis**） |
| **Server 生产者** | `@nestjs/bullmq`（NestJS 官方生态） |
| **AI 消费者** | `ai` 仓库独立 Worker 进程（同契约、同 Redis） |

**不采用** RabbitMQ、Kafka 作为本项目的主任务队列。

> **与实时传输区分**：信令 WSS、SSE、DataChannel 见 [messaging-transport-spec.md](./messaging-transport-spec.md)；BullMQ **仅** 负责「可延迟、可重试、可观测」的后台 Job，不是日志总线。

---

## 2. 选型性质：工程型、敏捷型

| 维度 | 说明 |
| :--- | :--- |
| **目标** | 百万级以内会话/审计任务，**非** 千万级日志汇聚（Log Aggregation） |
| **团队** | TypeScript 全栈 + NestJS；优先 **开发效率、可维护性、与现有 Redis 复用** |
| **路由** | 远程桌面 AI 路径简单：`Agent 上报 → server 入队 → ai 消费`，无需 RabbitMQ Exchange/Binding 级复杂路由 |
| **数据量** | 端侧帧差过滤 + 本地 OCR 脱敏后，上报到云端的敏感行为 **已降噪**，非海量原始截帧流 |

---

## 3. 选择 BullMQ 的理由

### 3.1 Node.js / TypeScript / NestJS 生态（首要）

| ID | 要点 |
| :--- | :--- |
| FR-JQ-01 | BullMQ 是 Node/TS 生态中功能最强、维护最活跃的**分布式任务队列**之一 |
| FR-JQ-02 | **原生** NestJS 集成：`@nestjs/bullmq`，生产者/消费者使用依赖注入、`@Processor`、`@InjectQueue` 等，**纯正 NestJS 风格** |
| FR-JQ-03 | `server` 入队与 `ai` 消费共享 `shared` 中 Job 类型与 payload 契约 |

**对比**：

| 方案 | NestJS 融合 | 说明 |
| :--- | :--- | :--- |
| **BullMQ** | ✅ 官方模块级支持 | 连接、重连、Worker 生命周期由库与模块管理 |
| **RabbitMQ** | ⚠️ `amqplib` 等需自建封装 | 连接管理、断线重连、流控、Channel 泄漏需自行兜底 |
| **Kafka** | ⚠️ `kafkajs` 同理 | 偏流式日志，非任务队列心智 |

### 3.2 AI 审计任务：高延迟、高波动、要强状态

AI 审计与普通日志搜集 **不同**：

| 特征 | 说明 |
| :--- | :--- |
| 延迟 | 单次 LLM 推理 **数百毫秒～数秒** |
| 波动 | 并发、Rate Limit、模型排队导致耗时方差大 |
| 可观测 | 管理台需查看任务 **Waiting / Active / Completed / Failed / Delayed** |
| 重试 | 遇 429/5xx 需 **延迟重试**、**指数退避（Exponential Backoff）** |

| ID | BullMQ 能力 | 验收 |
| :--- | :--- | :--- |
| FR-JQ-10 | 任务生命周期状态在 Redis 中可查询 | Admin/内部 API 可展示 Job 状态（P1+） |
| FR-JQ-11 | 支持 `delay`、`attempts`、`backoff`（指数退避） | 处理器配置与 Spec 一致 |
| FR-JQ-12 | 失败任务进入 Failed 并可人工/自动重试 | `removeOnComplete` / DLQ 策略文档化 |

**对比 Kafka / RabbitMQ（任务语义）**：

| 能力 | BullMQ | Kafka | RabbitMQ |
| :--- | :--- | :--- | :--- |
| 单任务延迟执行 | ✅ 内置 | ❌ 需自研 | ⚠️ 延迟插件/死信 |
| 单任务失败退避重试 | ✅ 内置 | ❌ 多 Topic + 自研 | ⚠️ DLQ + 自研 |
| 单任务进度/状态 | ✅ Job 对象 | ❌ offset 非任务态 | ⚠️ 需自建 |

Kafka 是 **Log Stream 发布/订阅**，擅长海量日志管道；**不** 作为本项目的「AI Job 调度器」。

### 3.3 运维与算力：复用 Redis

| ID | 要点 |
| :--- | :--- |
| FR-JQ-20 | 系统 **已必选 Redis**（会话、配对、WSS 多实例 Pub/Sub、SSE 广播，见 messaging-transport） |
| FR-JQ-21 | BullMQ **复用同一 Redis 实例**（逻辑 DB 分库或 key 前缀隔离），**不新增**消息中间件集群 |
| FR-JQ-22 | 小规模部署（如 1 核 2G）可支撑 **万级/秒** 队列操作（视 payload 而定） |

**对比 Kafka**：

| 维度 | BullMQ + Redis | Kafka |
| :--- | :--- | :--- |
| 额外进程 | 无（已有 Redis） | Broker + KRaft/ZK |
| 资源 | 内存型，轻量 | 磁盘 I/O、内存要求高 |
| 运维 | 与现有 Redis 备份/监控一致 | 独立集群、「重型武器」 |
| 适用规模 | 本项目百万级并发以内 | 千万级日志流（非本场景） |

### 3.4 非日志汇聚场景

| 说明 |
| :--- |
| 远程桌面有大量截帧，但 **Desktop Agent** 侧已做帧差过滤与 PaddleOCR 本地脱敏 |
| 实际上报的是 **结构化行为事件 / 文本 / 少量关键图**，不是原始海量日志流 |
| **不需要** Kafka 作为中央日志管道 |

### 3.5 路由模型简单

```text
Agent ──HTTPS──► server ──addJob──► Redis (BullMQ)
                                      │
                                      ▼
                                   ai Worker
                                   (@Processor)
```

**不需要** RabbitMQ 的 Exchange、Binding Key、多消费者复杂拓扑；队列名与 Job 类型由 `shared` 枚举约束即可。

---

## 4. 架构边界（Normative）

| ID | 规则 |
| :--- | :--- |
| FR-JQ-30 | **禁止** 在 `server` 进程内执行 LLM 推理；仅 **Producer** |
| FR-JQ-31 | **禁止** 在 `web`/`desktop` 直连 Redis 队列；仅 HTTP/WSS 与 server 交互 |
| FR-JQ-32 | Job 类型与 payload **仅** 定义于 `shared`（如 `shared/src/ai/jobs.ts`） |
| FR-JQ-33 | 新 Job 类型须更新本 Spec §5 与 [ai-platform-spec](./ai-platform-spec.md) §7 |
| FR-JQ-34 | 套餐门禁在 **入队前** 由 `server` `EntitlementService` 校验（见 commercial-resources-spec） |

---

## 5. 队列与 Job 清单（与 ai-platform 对齐）

| Queue / JobType | 生产者 | 消费者 | 备注 |
| :--- | :--- | :--- | :--- |
| `recording.summarize` | server | ai (Node) | Pro+；可 RAG |
| `behavior.cloud_infer` | server | ai | 端侧降云补算 |
| `behavior.anomaly_scan` | server/cron | ai / python-worker | Enterprise |
| `report.efficiency_weekly` | cron | ai | Enterprise |
| `security.rule_eval` | server | ai | 规则为主 |

完整表见 [ai-platform-spec.md](./ai-platform-spec.md) §7。

---

## 6. 实现约定

### 6.1 Server（NestJS）

```typescript
// 目标形态（示例）
@Injectable()
export class AiQueueService {
  constructor(@InjectQueue('ai') private readonly queue: Queue) {}
  async enqueueSummarize(payload: SummarizeJobPayload) {
    await this.queue.add('recording.summarize', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
    });
  }
}
```

| ID | 规则 |
| :--- | :--- |
| FR-JQ-40 | 使用 `@nestjs/bullmq` 注册 `BullModule` |
| FR-JQ-41 | 默认指数退避：初始 delay **3s**（可配置），遇 Rate Limit 可加大 |
| FR-JQ-42 | Redis 连接与 `REDIS_URL` 与信令/会话共用配置源（逻辑隔离 key 前缀 `bull:`） |

### 6.2 AI Worker

| ID | 规则 |
| :--- | :--- |
| FR-JQ-50 | `ai` 仓以 **Worker 进程** 消费（可与 HTTP 健康检查同进程或独立 deployment） |
| FR-JQ-51 | Processor 内调用 LangChain / python-worker，完成后回调 `server` 内网 API |

### 6.3 可观测（P1+）

| ID | 需求 |
| :--- | :--- |
| FR-JQ-60 | Admin 可查询近期 Job 状态（按 org/session/jobId） |
| FR-JQ-61 | 指标：队列深度、失败率、平均处理时长（Prometheus 可选） |

---

## 7. 明确不采用

| 方案 | 原因 |
| :--- | :--- |
| **Kafka** | 运维重、任务延迟/退避/状态非原生；非日志管道场景 |
| **RabbitMQ** | NestJS 融合与任务状态追踪弱于 BullMQ；路由过于复杂 |
| **Redis List 手写队列** | 无 Job 状态、重试、延迟语义，禁止重复造轮子 |
| **数据库轮询** | 仅作 P3 备选；主路径必须是 BullMQ |

若未来出现 **千万级/秒** 跨地域日志汇聚需求，应 **新 ADR** 评估独立数据管道，**不** 替换当前 AI Job 队列。

---

## 8. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 初版：BullMQ 工程选型、AI 任务、Redis 复用、对比 RabbitMQ/Kafka |
