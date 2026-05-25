# Deploy 部署 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-DPL-001` |
| **仓库** | `deploy/` |
| **技术栈** | Docker, Docker Compose,（可选）Kubernetes |
| **版本** | 0.4.0-draft |
| **关联** | [ai-platform-spec.md](./ai-platform-spec.md) · [ai-behavior-architecture-spec.md](./ai-behavior-architecture-spec.md) |

---

## 1. 职责

提供 **可复现的一键/分步部署** 模板，覆盖：

- **MySQL 8**（必选，utf8mb4）
- **Redis**（必选，会话、信令 Pub/Sub、SSE 广播 + **BullMQ 任务队列**；见 [job-queue-spec.md](./job-queue-spec.md)）
- **MinIO / S3**（Pro+ 录制）
- **Ollama**（或兼容 OpenAI API 的私有化 LLM，**非**默认公网 OpenAI）
- **Qdrant**（AI **向量数据库**，RAG / 行为模式检索）
- **`ai/python-worker`**（重 ML 微服务，Compose profile `ai`）
- NestJS **server**
- NestJS **`ai`** Worker（Enterprise / Pro 摘要、向量索引）
- **coturn**（STUN/TURN，P2P 穿透；非默认媒体中继中心）
- **mediasoup-worker** SFU 侧车（1:N、TURN 减压；**不部署 SRS**）
- **web-client** / **web-admin** 静态资源

**数据库规范**：仅 **MySQL**；文档中出现 PostgreSQL 视为历史笔误。

**不包含**：Desktop Agent 安装包构建（见 desktop-spec CI）。

---

## 2. 目录结构（目标）

```text
deploy/
├── docker/
│   ├── server.Dockerfile       # 基础镜像 node:24-alpine（或 22-bookworm-slim）
│   └── web.Dockerfile
├── compose/
│   ├── docker-compose.yml          # 开发/小规模
│   ├── docker-compose.dev.yml      # 本地：MySQL + Redis + Ollama + MinIO；profile ai → Qdrant + python-worker
│   ├── README.md
│   └── .env.example
├── k8s/                            # P1
│   ├── server-deployment.yaml
│   └── ingress.yaml
└── README.md
```

---

## 3. Compose 服务定义

### 3.1 核心栈（默认 `docker compose up`）

| 服务 | 镜像 | 端口 | 依赖 |
| :--- | :--- | :--- | :--- |
| `mysql` | mysql:8 | 3306 | 持久卷 |
| `redis` | redis:7 | 6379 | — |
| `minio` | minio/minio | 9000, 9001 | 录制对象存储（可选启） |
| `ollama` | ollama/ollama | 11434 | 持久卷 `ollama_data`；LLM |
| `server` | 自建 | 3000 | mysql, redis, minio |
| `ai` | 自建 | 4000 | redis, **ollama**, **qdrant**（RAG 时） |
| `web-client` | nginx 静态 | 80 | — |
| `web-admin` | nginx 静态 | 81 或子路径 | — |

### 3.2 Profile `ai`（私有化 AI + 向量库）

```bash
docker compose -f compose/docker-compose.dev.yml --profile ai up -d
```

| 服务 | 镜像 | 端口 | 说明 |
| :--- | :--- | :--- | :--- |
| **`qdrant`** | qdrant/qdrant | **6333**（HTTP）、6334（gRPC 可选） | **向量数据库**；LangChain RAG；按 `orgId` 分 collection |
| **`python-worker`** | 自建 `ai/python-worker` | **4100** | PaddleOCR / 异常检测等重 ML；`ai` 通过 HTTP 调用 |

> `ollama` 在 dev compose 中 **默认已启动**；`qdrant` 与 `python-worker` 需 `--profile ai`。  
> 实现见 `deploy/compose/docker-compose.dev.yml`、`deploy/compose/README.md`。

### 3.3 Profile `webrtc`

| 服务 | 镜像 | 端口 | 依赖 |
| :--- | :--- | :--- | :--- |
| `coturn` | coturn/coturn | 3478, 5349 | — |
| `mediasoup-controller` | `deploy/mediasoup-controller` 镜像 | 4444 + UDP 40000-40100 | server `MEDIASOUP_CONTROLLER_URL` |

### 3.4 AI 相关环境变量（Normative）

| 变量 | 消费者 | 示例 |
| :--- | :--- | :--- |
| `AI_BASE_URL` | `ai` | `http://ollama:11434/v1` |
| `AI_MODEL` | `ai` | `llama3.2` |
| **`VECTOR_DB_URL`** | **`ai`** | **`http://qdrant:6333`** |
| `PYTHON_ML_URL` | `ai` | `http://python-worker:4100` |
| `REDIS_URL` | `server`, `ai` | `redis://redis:6379` |

向量库 **默认 Qdrant**（自托管）；**禁止** 生产默认依赖 Pinecone 等仅 SaaS 向量库（见 ai-platform-spec §5.3）。  
可选 **pgvector** 为独立 PG 实例（主业务库仍为 MySQL）。

### 3.5 向量库部署要点

| 项 | 说明 |
| :--- | :--- |
| **数据卷** | `qdrant_data` 持久化 `/qdrant/storage` |
| **网络** | `ai` 与 `qdrant` 同 Compose 网络或同 VPC |
| **安全** | 生产不对公网暴露 6333；内网 + 可选 API Key |
| **合规** | 用户删除录制/组织注销时，`ai` 级联删除对应 collection 片段（SEC-AI-03） |
| **规模** | 单节点 Qdrant 满足企业内网 RAG；集群为 P2 |

---

## 4. 功能需求

| ID | 需求 | 验收标准 |
| :--- | :--- | :--- |
| FR-DPL-01 | `docker compose up` 启动最小可用信令 + TURN | web 能完成 1:1 配对（需 Agent） |
| FR-DPL-02 | 所有密钥经 `.env`，提供 `.env.example` | 无密钥进 Git |
| FR-DPL-03 | 健康检查 `/health` on server | Compose `healthcheck` 通过 |
| FR-DPL-04 | 文档说明防火墙需开放端口 | UDP 3478、TURN relay 范围 |
| FR-DPL-05 | 生产 Compose 使用非 root 用户 | |
| FR-DPL-06 | dev compose 含 **Qdrant**；`--profile ai` 启向量库 + python-worker | `curl http://localhost:6333/` 可达 |
| FR-DPL-07 | `.env.example` 含 `VECTOR_DB_URL`、`PYTHON_ML_URL` | 与 `ai/.env.example` 一致 |
| FR-DPL-08 | 文档说明 Ollama 拉模型与 Qdrant 启停 | `deploy/compose/README.md` |

---

## 5. 网络与 WebRTC 部署要点

| 项 | 说明 |
| :--- | :--- |
| **TURN** | 公网部署 coturn，`external-ip` 正确配置 |
| **mediasoup SFU** | 与 Server 同 VPC；UDP 端口段文档化；面向低并发（非 SRS 级直播） |
| **TURN 容量** | 监控 relay 带宽；超阈时 Server 引导新会话走 SFU |
| **HTTPS** | Web 与 WSS 必须 TLS；可用 Traefik/Caddy 终止 |

---

## 6. Out of Scope

- Desktop Agent 的 MSI/dmg 打包流水线（在 `desktop` 仓库）
- 多云 Terraform（P2）

---

## 7. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.1.0-draft | 初稿 |
| 2026-05-24 | 0.2.0-draft | web-client / web-admin 双静态服务 |
| 2026-05-24 | 0.3.0-draft | MySQL、MinIO、ai worker |
| 2026-05-24 | 0.3.1 | 明确废除 PostgreSQL；对齐国内 MySQL 运维 |
| 2026-05-24 | 0.4.0-draft | 补充 Ollama、**Qdrant 向量库**、python-worker；profile `ai`；环境变量 |
