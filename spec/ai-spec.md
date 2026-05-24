# AI 子项目 Spec（`ai/` 仓库）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-AI-REPO-001` |
| **仓库** | `ai/` |
| **版本** | 0.5.0 |
| **详设** | [ai-platform-spec.md](./ai-platform-spec.md) · [ai-behavior-architecture-spec.md](./ai-behavior-architecture-spec.md) |

---

## 1. 仓库职责

**私有化 AI Worker**：Node/TS 主栈 + Python 微服务（仅重 ML）。详见 [ai-platform-spec.md](./ai-platform-spec.md) §1–3。

---

## 2. 目录结构

见 `ai/spec/SPEC.md`。

---

## 3. 技术栈

| 组件 | 选型 |
| :--- | :--- |
| 主运行时 | Node.js 22+、TypeScript |
| 队列 | BullMQ + Redis |
| LLM | LangChain.js / LangGraph.js → **Ollama / vLLM**（自托管） |
| 向量库 | **Qdrant**（自托管） |
| 重 ML | **`ai/python-worker`**（FastAPI），由 Node Worker HTTP 调用 |
| 契约 | `@vistaremote/shared` |

**不** 将整个 AI 平台改为 Python 单体；**不** 默认依赖 OpenAI API。

---

## 4. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.3.0-draft | 新建 ai 仓库 Spec |
| 2026-05-24 | 0.5.0 | 私有化卖点；Node+LangChain；python-worker；Qdrant |
