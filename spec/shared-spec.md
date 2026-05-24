# Shared 协议层 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-SHR-001` |
| **仓库** | `shared/` |
| **版本** | 0.1.0-draft |
| **地位** | **全生态唯一契约源（SSOT）** |

---

## 1. 职责

`shared` 仓库仅包含 **纯 TypeScript 类型、常量、枚举与轻量校验器**（如 Zod schema），**禁止**引入 Node/Electron/RN 运行时依赖。

所有子项目通过 `file:` / `pnpm link` / 发布到私有 npm `@vistaremote/shared` 消费本仓库。

---

## 2. 目录结构（目标）

```text
shared/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # 公共导出入口
│   ├── constants/
│   │   ├── error-codes.ts       # 统一错误码
│   │   └── channels.ts          # DataChannel 名称
│   ├── signaling/               # WebSocket 信令 Payload（已实现）
│   │   ├── messages.ts
│   │   └── session-mode.ts
│   ├── webrtc/                  # ICE、传输策略、播放调优（已实现）
│   │   ├── ice-config.ts
│   │   ├── transport-policy.ts
│   │   ├── rtc-tuning.ts
│   │   └── codec-preference.ts
│   ├── control/                 # 远程控制指令
│   │   ├── mouse.ts
│   │   ├── keyboard.ts
│   │   └── touch.ts
│   ├── device/
│   │   └── device-info.ts
│   ├── auth/                    # 角色、Permission、JWT、evaluatePolicy（已实现）
│   │   ├── roles.ts
│   │   ├── permissions.ts
│   │   ├── jwt-claims.ts
│   │   └── policy.ts
│   ├── billing/
│   │   └── plan.ts              # free | pro | enterprise
│   ├── telemetry/               # Agent → server
│   │   └── events.ts
│   ├── recording/
│   │   └── recording.dto.ts
│   ├── ai/
│   │   ├── jobs.ts
│   │   ├── summary.ts
│   │   └── efficiency-report.ts
│   └── api/                     # REST DTO（与 server 对齐）
│       ├── auth.ts
│       ├── room.ts
│       └── admin/               # 管理端 API DTO
│           ├── user.ts
│           ├── device.ts
│           ├── audit-log.ts
│           └── system-config.ts
└── spec/                        # 可选：从 Meta-Repo 同步的副本链接说明
```

---

## 3. 信令消息（最小契约）

### 3.1 信封

```typescript
interface SignalingEnvelope<T = unknown> {
  v: 1;                          // 协议版本
  type: SignalingMessageType;
  sessionId: string;
  deviceId: string;
  ts: number;                    // Unix ms
  payload: T;
}
```

### 3.2 消息类型枚举

| `SignalingMessageType` | 方向 | 说明 |
| :--- | :--- | :--- |
| `join` | C→S | 加入 Room |
| `joined` | S→C | 加入成功，携带 peers 列表 |
| `offer` | C↔S↔C | SDP Offer |
| `answer` | C↔S↔C | SDP Answer |
| `ice-candidate` | C↔S↔C | ICE Candidate |
| `session-mode` | S→C | `p2p` \| `sfu` + SFU 连接参数 |
| `leave` | C→S | 离开 |
| `error` | S→C | 错误 |

### 3.3 Session Mode

```typescript
type SessionMode = 'p2p' | 'sfu';

interface SessionModePayload {
  mode: SessionMode;
  sfu?: {
    url: string;           // WSS/WebRTC-HTTP 依 SFU 实现而定
    roomId: string;
    publishToken?: string;
    subscribeToken?: string;
  };
}
```

---

## 4. 控制指令（DataChannel）

### 4.1 统一信封

```typescript
interface ControlEnvelope {
  v: 1;
  kind: ControlKind;
  seq: number;              // 单调递增，用于乱序检测
}

type ControlKind =
  | 'mouse-move'
  | 'mouse-down'
  | 'mouse-up'
  | 'wheel'
  | 'key-down'
  | 'key-up'
  | 'touch-start'
  | 'touch-move'
  | 'touch-end';
```

### 4.2 坐标

```typescript
interface NormalizedPoint {
  x: number;  // 0..1
  y: number;  // 0..1
  displayIndex: number;
}
```

### 4.3 功能需求

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-SHR-01 | 所有 Payload 导出 TypeScript 类型 + `as const` 枚举 | `tsc --noEmit` 零错误 |
| FR-SHR-02 | 提供 Zod schema 供 server 校验 WS 入站消息 | 非法消息拒绝且不崩溃 |
| FR-SHR-03 | 破坏性变更升 **Major** SemVer | CHANGELOG 记录迁移指南 |

---

## 5. 错误码

| 代码 | HTTP | 说明 |
| :--- | :--- | :--- |
| `PAIRING_INVALID` | 400 | 配对码无效或过期 |
| `ROOM_FULL` | 403 | 房间人数上限 |
| `UNAUTHORIZED` | 401 | Token 无效 |
| `DEVICE_OFFLINE` | 404 | 被控不在线 |
| `SESSION_MODE_CONFLICT` | 409 | 模式切换冲突 |
| `PLAN_FORBIDDEN` | 403 | 当前套餐不可用此功能 |

---

## 6. 套餐枚举

```typescript
type UserPlan = 'free' | 'pro' | 'enterprise';
```

---

## 6.1 发布与版本

- 包名建议：`@vistaremote/shared`
- 发布渠道：GitHub Packages 或私有 npm
- **任何** 字段增删改须先更新本 Spec 与 [system-overview.md](./system-overview.md)

---

## 7. 认证与授权（`shared/src/auth/`）

SSOT：[authorization-spec.md](./authorization-spec.md)。

| 导出 | 说明 |
| :--- | :--- |
| `PlatformAdminRole` / `OrgRole` | 平台 Admin 与企业 User 岗位 |
| `Permission` | 权限字；`permissionsForOrgRole` 等 |
| `*JwtClaimsSchema` | Controller / Admin / Signaling / Device |
| `evaluatePolicy` | ABAC + RBAC 纯函数求值 |

---

## 8. Admin API DTO（摘要）

与 [web-admin-spec.md](./web-admin-spec.md)、[server-spec.md](./server-spec.md) 对齐。

```typescript
type AdminRole = 'super_admin' | 'admin' | 'viewer'; // 同 PlatformAdminRole

interface AdminUserDto {
  id: string;
  email: string;
  role: AdminRole;
  status: 'active' | 'disabled';
  createdAt: string;
}

interface DeviceListItemDto {
  id: string;
  deviceId: string;
  name: string;
  platform: 'win32' | 'darwin' | 'linux';
  online: boolean;
  lastSeenAt: string | null;
}

interface AuditLogDto {
  id: string;
  action: string;
  actorId: string | null;
  targetType: string;
  targetId: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
}
```

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-SHR-04 | Admin DTO 与 Entity 字段一一映射 | server e2e 类型检查 |
| FR-SHR-05 | 分页列表统一 `Paginated<T>` | `{ items, total, page, pageSize }` |

---

## 9. Out of Scope

- 业务逻辑、HTTP Client、WebRTC 封装
- 国际化文案

---

## 10. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.1.0-draft | 初稿：信令与控制最小契约 |
| 2026-05-24 | 0.2.0-draft | Admin API DTO、Paginated |
| 2026-05-24 | 0.3.0-draft | plan、telemetry、recording、ai jobs DTO |
