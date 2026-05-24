# AI 行为洞察架构 Spec（L1）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-AI-ARCH-001` |
| **版本** | 0.5.1 |
| **商业化** | [commercial-tier-spec.md](./commercial-tier-spec.md) — 降云试用后须 Enterprise |
| **状态** | Draft |
| **关联** | [ai-platform-spec.md](./ai-platform-spec.md) · [enterprise-security-spec.md](./enterprise-security-spec.md) · [desktop-spec.md](./desktop-spec.md) |

---

## 1. 产品目标

面向 **企业服务场景（远程桌面 + AI 行为分析）**，在合规前提下实现：

| 能力层 | 用户价值 |
| :--- | :--- |
| **监控告警** | 非工作行为、敏感外发、批量删除、异常活跃等实时/准实时告警 |
| **行为报告** | 日/周效率报告、部门对比（Enterprise Admin） |
| **长期洞察** | 行为数据入库，支撑 **流程优化**、**AI 替代建议**、岗位效率分析 |

**原则：多模型协作；数据默认留在客户基础设施内；禁止单一大模型包打天下。**

---

## 2. 多模型分工（强制）

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        Desktop Agent（端侧优先）                          │
│  规则引擎 · PaddleOCR-slim · Qwen2.5-VL(量化) · 时序特征 · 隐私本地策略      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ 结构化事件（非原始录屏）
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Server（汇聚 · 策略 · 入库 · 队列）                                      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ai — Node/TS 主 Worker                                                  │
│  · LangChain / LangGraph：摘要、报告、流程优化编排                          │
│  · Ollama / vLLM + Qdrant（私有化，不出网）                                │
│  · HTTP → python-worker：基线训练、Isolation Forest 等重 ML               │
└─────────────────────────────────────────────────────────────────────────┘
```

| 场景 | 模型类型 | 默认执行位置 | 上云条件 |
| :--- | :--- | :--- | :--- |
| 窗口/App 分类、关键词命中 | 小模型 + 规则 | **端侧** | CPU 压力 / 超时 → `behavior.cloud_infer` |
| 非工作站点时长 | 时序统计 | **端侧** | 复杂基线 → **Python worker** |
| 敏感 UI（可选） | CV（ONNX） | **端侧** | 仅上传标签+置信度 |
| 隐私敏感 | 规则 + 本地 CV | **端侧 only** | 禁止默认上云 |
| 会话/录制摘要 | LLM + RAG | **ai (Node)** | 自托管 LLM + 向量库 |
| 效率报告、流程优化、AI 替代建议 | **LangGraph + LLM** | **ai (Node)** | 人在 Admin 审批后展示 |
| 14 天基线、3σ 异常 | ML | **python-worker** | ai 调度 |

---

## 3. 推理调度（Edge ↔ Cloud）

### 3.1 设备能力画像

Agent 每 5min 上报 `device.capability`（`shared`）：

| 字段 | 用途 |
| :--- | :--- |
| `cpuCores`, `ramMb` | 能力分档 |
| `hasGpu`, `onnxProviders` | 是否启用端侧 CV |
| `cpuPressure` | `normal` / `high` → 触发降云 |

### 3.2 组织策略 `inferenceMode`

| 值 | 行为 |
| :--- | :--- |
| `edge_preferred` | 默认；超时或高压时升云 |
| `edge_only` | 禁止上云（仅规则/统计） |
| `cloud_preferred` | 复杂任务直接入队 `behavior.cloud_infer` |

### 3.3 降云路径

端侧 SLA 内未完成 → Server 写入 `behavior.cloud_infer` → **ai (Node)** 决定本地规则补算或转发 **python-worker**（重 ML）。

### 3.4 试用与付费（降云）

| 状态 | `behavior.cloud_infer` |
| :--- | :--- |
| **试用期内**（`trialEndsAt` 未过期） | 允许（含 `free` 用户体验） |
| **试用结束 + free** | **拒绝**入队；端侧仅规则/本地 |
| **Enterprise**（或试用中） | 允许 |

校验：`ProductFeature.AI_CLOUD_INFER`（`shared/src/billing/entitlements.ts`）。拒绝码：`TRIAL_EXPIRED_REQUIRES_ENTERPRISE`。

---

## 4. 数据模型（Server / MySQL）

| 表（概念） | 内容 |
| :--- | :--- |
| `behavior_event` | 结构化事件流 |
| `behavior_aggregate_hourly` | 预聚合 |
| `ai_result` | LLM/ML 输出 JSON |
| `efficiency_report` | 周报 |
| `process_optimization_report` | 流程优化与 AI 替代候选（P2） |
| `security_incident` | 告警 |

向量索引（Qdrant）：按 `orgId` 分 collection，存窗口标题片段、SOP、历史结论 embedding。

---

## 5. 本地开发（Docker 私有化栈）

见 `deploy/compose/docker-compose.dev.yml`：

| 服务 | 端口 | 说明 |
| :--- | :--- | :--- |
| `mysql` | 3306 | 业务库 |
| `redis` | 6379 | 队列 |
| `ollama` | 11434 | **自托管 LLM** |
| `qdrant` | 6333 | **自托管向量库**（profile `ai`） |
| `python-worker` | 4100 | 重 ML 微服务（profile `ai`） |
| `ai` | 4000 | Node Worker |
| `minio` | 9000 | 录制（可选） |

**不需要** OpenAI API Key。首次：`ollama pull llama3.2`（及可选 `nomic-embed-text`）。

---

## 6. 里程碑

| 阶段 | 交付 |
| :--- | :--- |
| **B0** | Spec + shared DTO + compose 私有化栈 |
| **B1** | 端侧时序 + server 入库 + 规则告警 |
| **B2** | 端侧 ONNX + 降云 |
| **B3** | Node LLM 摘要 + Qdrant RAG |
| **B4** | Python 基线/异常 |
| **B5** | LangGraph 流程优化 / AI 替代报告 |

---

## 7. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.4.0-draft | 多模型；端侧优先；Ollama |
| 2026-05-24 | 0.5.0 | 私有化向量库；Node 主栈；Python 微服务；流程优化路线图 |
