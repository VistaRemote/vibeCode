# @vistaremote/ai

VistaRemote **AI Worker 服务**：消费 **BullMQ** 任务、调用 LLM（Ollama/vLLM）、`python-worker` 重 ML、Qdrant 向量检索。

| Metadata | Value |
| :--- | :--- |
| **包名** | `@vistaremote/ai` |
| **许可证** | [LICENSE](./LICENSE) |

> **微调训练**（LoRA、客户语料）不在本仓 — 见 Meta [ai-finetune-spec](https://github.com/VistaRemote/vibeCode/blob/main/spec/ai-finetune-spec.md)（闭源商业）。

## 环境要求

- Node.js >= 24.0.0（推荐 24.11 LTS，见 `.nvmrc`）
- pnpm >= 9
- Redis（BullMQ）、可选 Ollama / Qdrant（见 `deploy/compose`）
- `@vistaremote/shared`

## 快速开始

```bash
pnpm install
cp .env.example .env
pnpm start:dev
```

Python ML 侧车：

```bash
cd python-worker && pip install -r requirements.txt
```

## 脚本

| 命令 | 说明 |
| :--- | :--- |
| `pnpm start:dev` | tsx 开发运行 |
| `pnpm build` | 编译至 `dist/` |
| `pnpm start` | 生产 `node dist/main.js` |
| `pnpm test` | Rstest |
| `pnpm lint` | Biome |

## 目录

| 路径 | 说明 |
| :--- | :--- |
| `src/queue/` | Job 处理器 |
| `src/llm/` | LLM 客户端 |
| `src/python/` | python-worker HTTP 客户端 |
| `python-worker/` | FastAPI ML |

## Spec

- 本仓：`spec/SPEC.md`
- Meta-Repo：[ai-spec](https://github.com/VistaRemote/vibeCode/blob/main/spec/ai-spec.md) · [ai-platform-spec](https://github.com/VistaRemote/vibeCode/blob/main/spec/ai-platform-spec.md) · [job-queue-spec](https://github.com/VistaRemote/vibeCode/blob/main/spec/job-queue-spec.md)

## Docker

```bash
docker build -t vistaremote/ai:local .
```

## 相关仓库

[shared](https://github.com/VistaRemote/shared) · [server](https://github.com/VistaRemote/server) · [deploy](https://github.com/VistaRemote/deploy)

## 安全 · 贡献

[SECURITY.md](./SECURITY.md) · [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
