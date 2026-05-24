# AI 与洞察平台 Spec（L1）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-AI-001` |
| **版本** | 0.5.0 |
| **建议仓库** | **`ai/`（独立子项目）** + **`ai/python-worker/`（可选微服务）** |
| **关联** | [ai-behavior-architecture-spec](./ai-behavior-architecture-spec.md) · [commercial-tier-spec](./commercial-tier-spec.md) · [licensing-spec](./licensing-spec.md) · [ai-finetune-spec](./ai-finetune-spec.md) · [enterprise-security-spec](./enterprise-security-spec.md) |

---

## 1. 核心卖点（产品定位）

### 1.1 私有化部署 · 运维简单 · 数据安全

| 原则 | Normative |
| :--- | :--- |
| **默认不出网** | 生产环境 **禁止** 将行为数据、录制、窗口标题等默认发往 OpenAI / Azure OpenAI 等第三方 SaaS |
| **自托管 AI 栈** | LLM：**Ollama / vLLM / 本地兼容 API**；向量库：**Qdrant** 或 **pgvector**（与 MySQL 同 VPC） |
| **密钥不出 Server** | LLM / 向量库凭证仅 `ai`（及 python-worker）持有；`server` 只投递队列与读结果 |
| **可运维** | 全栈 Docker Compose / K8s；无 GPU 时可 CPU 推理小模型；与 VistaRemote 其余服务同版本策略发版 |

第三方 API（OpenAI 等）仅允许在 **组织显式开启** 且合规评审通过时作为 **可选连接器**，**不是** 默认路径。

### 1.2 行为洞察 · 流程优化 · AI 替代（长期）

| 阶段 | 能力 | 技术路径 |
| :--- | :--- | :--- |
| **现在** | 端侧监控告警、结构化事件入库、效率/安全报告 | 多模型 + 规则 + 统计（见 behavior-architecture） |
| **近期** | 会话/周期 **LLM 摘要**、异常解释、部门效率对比 | Node Worker + 私有化 LLM + RAG（向量库） |
| **未来** | **流程优化建议**、重复操作 **AI 替代** 候选、岗位自动化路线图 | LangGraph 编排 + 行为序列挖掘 + 人在回路审批 |

数据闭环：`端侧检测 → Server 入库 → 聚合/向量索引 → AI Worker → Admin 报告与建议`。

---

## 2. 是否独立 `ai` 仓库？

**是**（Meta-Repo 第 8 子项目）。理由不变：与信令隔离、独立扩缩容、模型与规则独立发版、可部署独立 VPC。

| 仓库 | 职责 |
| :--- | :--- |
| **`server`** | 鉴权、元数据、审计、入队 BullMQ、对外查询 API |
| **`ai`（Node/TS）** | 队列消费、LLM 编排、RAG、规则复核、回调 server |
| **`ai/python-worker`** | **仅** Node 难以胜任的重 ML（基线训练、Isolation Forest、深度时序） |
| **`desktop`** | 端侧多模型 + 遥测；**不做** LLM |
| **`shared`** | Job 类型、报告 DTO、策略枚举 |

---

## 3. 技术路线：TypeScript 为主，Python 补强

**禁止** 将整个 AI 平台重写为 Python 单体——团队主栈为 **TypeScript**，`server` / `web` / `shared` 契约一致。

### 3.1 分工矩阵

| 能力 | 运行时 | 框架/库 | 说明 |
| :--- | :--- | :--- | :--- |
| BullMQ 消费、回调 server | **Node** | NestJS 风格模块 / 现有 `ai` Worker | 与 server 同语言 |
| LLM 调用、Prompt、摘要/报告 | **Node** | **LangChain.js**、**LangGraph.js**（编排多步 Agent） | 对接 Ollama OpenAI-compatible API |
| RAG（窗口标题、SOP、历史报告） | **Node** | LangChain + 自托管 **Qdrant/pgvector** | 嵌入模型可 Ollama `nomic-embed-text` 等 |
| 规则引擎、关键词、轻量聚合 | **Node** | 纯 TS / SQL 经 server API | 零 GPU |
| 基线训练、Isolation Forest、重时序 | **Python 微服务** | FastAPI + scikit-learn / pandas | `ai` HTTP 内网调用 |
| 可选 CV 训练（非端侧） | **Python** | 同上 | P2+ |

### 3.2 调用关系

```text
┌─────────────┐     BullMQ      ┌──────────────────────────────────────┐
│   server    │ ──────────────► │  ai (Node/TS) — 主 Worker             │
│  NestJS     │                 │  · LangChain / LangGraph              │
└─────────────┘                 │  · LlmClient → Ollama/vLLM            │
       ▲                        │  · VectorStore → Qdrant              │
       │ callback               │  · Rules / summarize processors       │
       └────────────────────────│         │ HTTP (内网)                  │
                                │         ▼                              │
                                │  python-worker (FastAPI) — 仅重 ML     │
                                └──────────────────────────────────────┘
```

| 规则 | 说明 |
| :--- | :--- |
| **NestJS 不直接跑 Python** | `server` 只入队；由 **`ai` Node Worker** 调用 `python-worker` |
| **python-worker 无公网** | 仅 `ai` 与运维网络可达；mTLS 或 HMAC（P2） |
| **新能力默认 Node** | 仅当 Node 生态明显不足（训练/科学计算）才加 Python 端点 |

---

## 4. 逻辑架构（私有化）

```text
 desktop Agent
      │  telemetry (HTTPS): 结构化事件，非默认录屏上云
      ▼
┌─────────────┐     BullMQ/Redis      ┌──────────────────────┐
│   server    │ ──── job enqueue ───► │   ai (Node workers)   │
│  MySQL      │ ◄── callback REST ─── │  LangChain/LangGraph  │
└──────┬──────┘                       └──────────┬───────────┘
       │                                         │
       │ 录制分片                                   ├──► Ollama / vLLM (LLM)
       ▼                                         ├──► Qdrant / pgvector (RAG)
┌─────────────┐                                  └──► python-worker (ML)
│ MinIO / S3  │
└─────────────┘
```

---

## 5. AI 能力与技术选型

### 5.1 能力清单

| 能力 | 套餐 | 实现 |
| :--- | :--- | :--- |
| 会话录制后摘要 | Pro+ | Node LLM + 可选 RAG |
| 非工作网站识别 | Enterprise | 端侧规则 + 域名表；语义匹配用 **本地嵌入 + 向量库** |
| 操作基线 & 异常 | Enterprise | **Python**：滚动基线、Isolation Forest；Node 负责调度 |
| 敏感外发 / 批量删除 | Enterprise | 端侧 + Node 规则复核 |
| 效率报告 | Enterprise | MySQL 聚合 + Node LLM 润色 |
| 流程优化 / AI 替代建议 | Enterprise（路线图） | LangGraph 多步 + 向量检索历史模式 + 审批流（Admin） |
| 关键词触发录制 | Enterprise | Node 规则，零 GPU |

### 5.2 LLM（私有化强制默认）

| 项目 | 选型 |
| :--- | :--- |
| 协议 | OpenAI-compatible HTTP（**指向自托管**） |
| 运行时 | **Node**：`@langchain/core`、`@langchain/langgraph`（或 `@langchain/ollama`） |
| 默认推理 | **Ollama**（开发）/ **vLLM**（生产 GPU） |
| 模型示例 | `llama3.2`、`qwen2.5`（按组织策略配置） |
| 脱敏 | 入模前剥离 PII（路径、账号、证件号正则） |

### 5.3 向量数据库（自托管）

| 选项 | 场景 |
| :--- | :--- |
| **Qdrant** | 默认推荐；Docker 单节点即可；LangChain `@langchain/qdrant` |
| **pgvector** | 已重度使用 PostgreSQL 的客户（本项目主库为 MySQL，向量库可独立 PG 实例） |

用途：窗口标题/SOP/历史报告片段检索，支撑 RAG 摘要与流程优化建议。**禁止** 默认使用 Pinecone 等仅 SaaS 向量库。

### 5.4 异常检测

| 阶段 | 技术 | 运行时 |
| :--- | :--- | :--- |
| MVP | 固定阈值 | Node / 端侧 |
| V1 | 14 天滚动基线 3σ | **Python** `POST /v1/ml/baseline` |
| V2 | 序列模型（可选） | **Python** |

---

## 6. `ai` 仓库结构（Normative）

```text
ai/
├── src/                          # Node/TS 主 Worker（默认开发入口）
│   ├── main.ts
│   ├── config/
│   ├── queue/                    # BullMQ processors
│   ├── llm/                      # LlmClient + LangChain 适配（P1）
│   ├── agents/                   # LangGraph 流程优化/报告编排（P2）
│   ├── vector/                   # Qdrant 客户端
│   ├── python/                   # PythonMlClient → python-worker
│   └── rules/
├── python-worker/                # FastAPI 微服务（仅重 ML）
│   ├── app/main.py
│   ├── Dockerfile
│   └── requirements.txt
├── .env.example
└── spec/SPEC.md
```

---

## 7. 任务类型（队列 Job）

| JobType | 触发 | 运行时 |
| :--- | :--- | :--- |
| `recording.summarize` | 录制完成 | Node LLM (+RAG) |
| `behavior.baseline_train` | 每日 cron | **Python** |
| `behavior.anomaly_scan` | 定时 | **Python** + Node 写库 |
| `behavior.cloud_infer` | 端侧降云 | Node 或 Python（按任务） |
| `report.efficiency_weekly` | 每周 | Node LLM |
| `report.process_optimization` | 每月 / 按需 | Node LangGraph |
| `security.rule_eval` | 安全事件 | Node 规则 |

Payload：`shared/src/ai/`。

---

## 8. API 边界

（与 0.4 版相同，略）

### 8.1 `server` 对外

| Method | Path | 说明 |
| :--- | :--- | :--- |
| `GET` | `/api/v1/ai/summaries/:sessionId` | 会话摘要 |
| `GET` | `/api/v1/ai/reports/efficiency` | 效率报告 |
| `GET` | `/api/v1/ai/reports/process-optimization` | 流程优化建议（Enterprise，P2） |
| `GET` | `/api/v1/security/incidents` | 安全事件 |

### 8.2 内网

| 调用方 | 被调方 | 协议 |
| :--- | :--- | :--- |
| `server` → `ai` | `POST /internal/jobs` | HTTP + HMAC |
| `ai` → `server` | `POST /api/internal/ai/job-result` | 回调 |
| `ai` → `python-worker` | `POST /v1/ml/*` | HTTP 内网 |
| `ai` → Ollama | `/v1/chat/completions` | OpenAI-compatible |
| `ai` → Qdrant | REST/gRPC | 向量读写 |

---

## 9. 功能需求

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-AI-01 | Pro 录制结束后 5min 内异步摘要 | 重试 3 次 |
| FR-AI-02 | Enterprise 异常 1min 内入库 | |
| FR-AI-03 | 记录 token/算力用量到 `ai_usage_log` | |
| FR-AI-04 | **`AI_BASE_URL` 默认指向自托管**；无配置时开发用 Ollama | 文档与 compose 一致 |
| FR-AI-05 | free 调用 AI 返回 `PLAN_FORBIDDEN` | |
| FR-AI-09 | `behavior.cloud_infer` 校验试用/Enterprise | 见 commercial-tier FR-TIER-21 |
| FR-AI-06 | 生产构建 **不依赖** 公网 LLM API Key | CI 无 `OPENAI_API_KEY` 亦可测规则路径 |
| FR-AI-07 | 向量检索仅连自托管 `VECTOR_DB_URL` | |
| FR-AI-08 | 重 ML Job 失败时 Python 超时降级为统计阈值 | 告警可见 |

---

## 10. 隐私与合规

| ID | 需求 |
| :--- | :--- |
| SEC-AI-01 | Enterprise 策略同意后方可分析 |
| SEC-AI-02 | 数据驻留：LLM、向量库、MinIO 同区域 |
| SEC-AI-03 | 用户删除录制时级联删除向量与 `ai_result` |
| SEC-AI-04 | 第三方 LLM 须组织开关 + 审计 |

---

## 11. 里程碑

| 阶段 | 交付 |
| :--- | :--- |
| **A0** | `ai` Node 脚手架 + Ollama + Qdrant compose |
| **A0b** | `python-worker` 健康检查 + baseline 占位 API |
| **B0** | 端侧规则 + server 行为入库 |
| **A1** | Pro：`recording.summarize`（Node LLM） |
| **A2** | Enterprise 规则 + 向量 RAG |
| **A3** | Python 基线/异常 + 效率周报 |
| **A4** | LangGraph 流程优化报告（人在回路） |

---

## 12. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.3.0-draft | 独立 `ai` 仓库 |
| 2026-05-24 | 0.5.0 | 核心卖点：私有化+向量库；Node 主栈+LangChain/LangGraph；Python 微服务；禁默认第三方 LLM |
