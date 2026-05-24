# Server 信令与调度 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-SRV-001` |
| **仓库** | `server/` |
| **技术栈** | NestJS 10+, **TypeORM**, **MySQL** 8+, WebSocket, Redis, BullMQ |
| **版本** | 0.3.0-draft |

---

## 1. 职责

| 职责 | 说明 |
| :--- | :--- |
| **信令中继** | WebSocket 交换 SDP/ICE，不转发 RTP |
| **房间与设备** | Room 生命周期、配对码、在线状态 |
| **鉴权** | Controller JWT、Device Token、Admin JWT、Signaling Ticket；**RBAC + ABAC + Plan**（见 [authorization-spec.md](./authorization-spec.md)） |
| **持久化** | **TypeORM** 管理用户、设备、会话、审计 |
| **ICE 配置** | 向客户端下发 STUN/TURN |
| **SFU 调度** | 1:N、ICE 失败回退、**coturn 过载**时分配 mediasoup（见 webrtc-architecture-spec） |
| **传输策略** | `TransportPolicyService` 决定 `p2p` \| `sfu` |
| **Admin API** | 全平台用户/套餐/组织/录制/安全事件管理 |
| **录制元数据** | 分片上传凭证、回放授权、保留策略（Pro+） |
| **任务投递** | 将 AI/分析任务入队 Redis，由 [`ai`](./ai-platform-spec.md) 消费 |
| **企业策略** | Organization Policy 下发 Agent |

**禁止**：在 NestJS 进程内跑 LLM 推理或重 ML；**禁止**在进程内终止 RTP（除 SFU 侧车）。

---

## 2. 技术栈（强制）

| 组件 | 选型 | 说明 |
| :--- | :--- | :--- |
| 框架 | NestJS 10+ | 模块化 |
| ORM | **TypeORM** 0.3+ | `typeorm` + `@nestjs/typeorm` |
| 数据库 | **MySQL** 8.0+（InnoDB, utf8mb4） | **唯一**关系型库；禁用 PostgreSQL |
| 迁移 | TypeORM migrations | `npm run migration:run` |
| 校验 | `class-validator` + Zod（WS，来自 shared） | |
| 缓存/队列 | **Redis** + **BullMQ** | 配对码、AI 任务、WS 多实例 |
| 对象存储 | MinIO / S3 兼容 | 录制分片（见 recording-playback-spec） |
| SFU | **mediasoup** 侧车（M3+） | `SfuProvider` 抽象；**不**采用 SRS |
| TURN | **coturn** | ICE 下发；负载高时 `TransportPolicyService` 引导 SFU |

---

## 3. 模块划分（目标）

```text
server/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/                 # 配置模块 @nestjs/config
│   ├── database/
│   │   ├── database.module.ts
│   │   └── migrations/
│   ├── entities/               # TypeORM Entities
│   │   ├── user.entity.ts
│   │   ├── device.entity.ts
│   │   ├── room.entity.ts
│   │   ├── session.entity.ts
│   │   ├── pairing-code.entity.ts
│   │   ├── audit-log.entity.ts
│   │   ├── organization.entity.ts
│   │   ├── recording.entity.ts
│   │   ├── security-incident.entity.ts
│   │   └── ai-result.entity.ts
│   ├── auth/
│   ├── admin/                  # 全用户、套餐、组织、录制、安全、AI 结果查询
│   ├── billing/                # plan: free | pro | enterprise
│   ├── recording/              # 上传凭证、回放、保留
│   ├── organization/           # 企业策略 CRUD
│   ├── telemetry/              # Agent 事件批量接入
│   ├── behavior/               # 行为事件入库、小时聚合查询
│   ├── internal/               # ai 服务回调
│   ├── queue/                  # BullMQ producers（含 cloud_infer）
│   ├── device/
│   ├── room/
│   ├── signaling/
│   ├── ice/
│   ├── sfu/
│   └── common/
├── test/
└── package.json
```

---

## 4. TypeORM 实体（摘要）

| Entity | 主要字段 | 说明 |
| :--- | :--- | :--- |
| `User` | id, email, passwordHash, `plan`, planExpiresAt, `trialEndsAt`, orgId, status | `trialEndsAt`：SFU/降云试用；见 [commercial-tier-spec](./commercial-tier-spec.md) |
| `Organization` | id, name, policyJson, seatLimit | Enterprise |
| `Device` | id, deviceId, name, platform, ownerId, orgId, tokenHash, lastSeenAt | |
| `Room` | id, code, status, mode, agentDeviceId | |
| `Session` | id, roomId, startedAt, endedAt, recordingEnabled | |
| `PairingCode` | code, roomId, expiresAt, usedAt | |
| `Recording` | id, sessionId, userId, status, storageKey, durationSec | Pro+ |
| `AuditLog` | id, actorId, action, targetType, targetId, meta, createdAt | meta: **JSON** |
| `SecurityIncident` | id, orgId, deviceId, type, severity, recordingId?, meta | Enterprise |
| `AiResult` | id, sessionId, type, payloadJson | 摘要/报告/异常 |

关系见 [commercial-tier-spec.md](./commercial-tier-spec.md)。

### 4.1 TypeORM 约定

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-ORM-01 | 所有 Entity 使用 `uuid` 主键（`PrimaryGeneratedColumn('uuid')`） | |
| FR-ORM-02 | 时间字段 `createdAt`/`updatedAt` 使用 `@CreateDateColumn` / `@UpdateDateColumn` | |
| FR-ORM-03 | 禁止生产 `synchronize: true` | 仅 migrations |
| FR-ORM-04 | Repository 仅通过 Service 暴露，Controller 不直接注入 Repository（除简单 CRUD Admin） | |
| FR-ORM-05 | 软删除敏感数据使用 `deletedAt`（User、Device） | |

---

## 5. API 概要

### 5.1 公开 / Controller API

| Method | Path | 说明 |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/pairing` | 主控加入：`code` \| `link` \| `qr` |
| `POST` | `/api/v1/devices/pairing-session` | Agent 创建码/链/QR |
| `GET` | `/api/v1/pairing/:code` | 校验数字码 |
| `GET` | `/api/v1/pairing/link/:token` | 解析链接 token |
| `POST` | `/api/v1/devices/register` | Agent 注册（含 `installChannel`） |
| `POST` | `/api/v1/devices/heartbeat` | 心跳 |
| `GET` | `/api/v1/ice` | ICE servers |

### 5.2 Admin API（`/api/v1/admin`）

见 [web-admin-spec.md](./web-admin-spec.md)。须 `AdminAuthGuard` + `RolesGuard`。

| Method | Path | 角色 |
| :--- | :--- | :--- |
| `POST` | `/admin/auth/login` | 公开 |
| `GET` | `/admin/users` | admin+ |
| `GET` | `/admin/devices` | admin+ |
| `GET` | `/admin/rooms` | viewer+ |
| `DELETE` | `/admin/rooms/:id` | admin+ |
| `GET` | `/admin/audit-logs` | viewer+ |
| `PATCH` | `/admin/users/:id/plan` | super_admin |
| `GET` | `/admin/recordings` | admin+ |
| `GET` | `/admin/organizations` | admin+ |
| `GET` | `/admin/security/incidents` | admin+ |
| `GET` | `/admin/ai/reports` | admin+ |

### 5.4 录制 / AI（Pro+，鉴权后）

见 [recording-playback-spec.md](./recording-playback-spec.md)、[ai-platform-spec.md](./ai-platform-spec.md)。

### 5.5 Internal（仅内网，`ai` 服务）

| Method | Path | 说明 |
| :--- | :--- | :--- |
| `POST` | `/api/internal/ai/job-result` | AI 回调写入结果 |

DTO 类型 **必须** 引用 `@vistaremote/shared`。

### 5.3 WebSocket 信令

- 路径：`/signaling`（WSS；P1 另提供 `POST /api/v1/signaling/envelope` 便于联调）
- 载荷：`SignalingEnvelope`（shared）
- **禁止**经 WS 传输 `ControlEnvelope`（走 DataChannel）

### 5.4 SSE 业务推送

| Method | Path | 说明 |
| :--- | :--- | :--- |
| `GET` | `/api/v1/events/stream` | SSE：`recording.ready`、`ai.summary.ready`、`security.alert`、`ping` |

见 [messaging-transport-spec.md](./messaging-transport-spec.md)。多实例 P2 用 Redis 转发。

---

## 6. 功能需求

| ID | 需求 | 验收标准 |
| :--- | :--- | :--- |
| FR-SRV-01 | WS 消息 Zod 校验 | 畸形 JSON 返回 `error` |
| FR-SRV-02 | 配对码 6–8 位，TTL 300s，存 MySQL | 过期 `PAIRING_INVALID` |
| FR-SRV-03 | 设备心跳 30s，DB `lastSeenAt` 更新 | 90s 离线 |
| FR-SRV-04 | TURN 环境变量配置 | `.env.example` |
| FR-SRV-05 | `SfuProvider` 可 Mock | |
| FR-SRV-06 | 结构化 JSON 日志 | |
| FR-SRV-07 | 审计：登录、配对、会话起止写入 `AuditLog` | Admin 可查询 |
| FR-SRV-08 | Admin 登录 bcrypt + JWT，`sub` + `role` | |
| FR-SRV-09 | 所有用户 CRUD 与套餐字段（Admin） | 见 FR-TIER-* |
| FR-SRV-10 | 录制 complete 后投递 BullMQ `recording.summarize` | Pro+ |
| FR-SRV-11 | 遥测事件批量写入 + 触发 `security.rule_eval` | Enterprise |
| FR-SRV-12 | `PlanGuard` 装饰器校验 free/pro/enterprise | |

---

## 7. 环境变量

| 变量 | 必填 | 说明 |
| :--- | :---: | :--- |
| `PORT` | | 3000 |
| `DATABASE_URL` | ✓ | MySQL 连接串 |
| `S3_ENDPOINT` | ✓ | 录制存储（Pro+） |
| `S3_BUCKET` | ✓ | |
| `AI_SERVICE_URL` | | `http://ai:4000` 内网 |
| `AI_CALLBACK_HMAC_SECRET` | ✓ | internal 回调验签 |
| `JWT_SECRET` | ✓ | Controller |
| `ADMIN_JWT_SECRET` | ✓ | Admin（可与上相同，建议分离） |
| `TURN_URL` / `TURN_SECRET` | | |
| `CORS_ORIGINS` | ✓ | 含 client + admin 域名 |
| `REDIS_URL` | | P1 |

---

## 8. 性能测试（k6）

| 项 | 说明 |
| :--- | :--- |
| 工具 | [Grafana k6](https://k6.io/) |
| 脚本 | `server/perf/k6/smoke.js`（冒烟）、`load.js`（阶梯负载） |
| 本地 | `pnpm test:perf` / `pnpm test:perf:load`（需先 `pnpm start:prod`） |
| CI | `.github/workflows/perf.yml`（每周 + 手动） |

MVP 压测 `GET /health`；信令/WebSocket 场景在 M2 扩展独立脚本。

---

## 9. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.1.0-draft | 初稿 |
| 2026-05-24 | 0.2.0-draft | TypeORM + Admin API |
| 2026-05-24 | 0.3.0-draft | **MySQL**；套餐/录制/企业策略；AI 队列 |
