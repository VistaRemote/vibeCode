# 认证与授权规范 Spec（RBAC + ABAC + 套餐权益）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-AUTH-001` |
| **版本** | 1.0.0 |
| **关联** | [commercial-tier-spec.md](./commercial-tier-spec.md) · [messaging-transport-spec.md](./messaging-transport-spec.md) · [enterprise-security-spec.md](./enterprise-security-spec.md) |

---

## 1. 结论：用什么模型？

| 问题 | 答案 |
| :--- | :--- |
| 纯 RBAC？ | **否**。仅靠角色无法表达「只能控本部门设备」「只能看本公司录制」等资源边界。 |
| 纯 ABAC？ | **否**。管理台与组织岗位需要稳定的**角色菜单**（IT、老板、审计员），全 ABAC 难运维。 |
| **VistaRemote 选型** | **混合：RBAC（岗位角色）+ ABAC（资源属性）+ Plan 权益（商业化功能）** |

```text
请求 → 身份认证（JWT）→ Plan 权益（能否用录制/AI）
                    → RBAC（岗位是否含某权限）
                    → ABAC（orgId/ownerId/room 是否匹配）
                    → 允许 / 拒绝（审计）
```

---

## 2. 三个平面

### 2.1 身份平面（Authentication）

| 凭证 | 主体 | 用途 |
| :--- | :--- | :--- |
| **Controller JWT** | 注册用户 `userId` | Web/Mobile Client API、换取信令票 |
| **Device Token** | 被控 Agent `deviceId` | 注册、心跳、上报遥测 |
| **Admin JWT** | 后台账号 `adminId` | Admin API、Admin SSE |
| **Signaling Ticket** | 短期 JWT | **仅** WSS `/signaling` 升级 |
| **SSE Session** | Cookie 或 `Authorization` + `userId` 绑定 | `/api/v1/events/stream` |

生产：**HTTPS/WSS 强制 TLS**；密钥分离 `JWT_SECRET` / `ADMIN_JWT_SECRET` / `DEVICE_TOKEN_SECRET`。

### 2.2 RBAC 平面（岗位角色）

#### A. 平台管理台（`web/apps/admin`）

| 角色 | 代码 | 典型岗位 | 能力摘要 |
| :--- | :--- | :--- | :--- |
| 超级管理员 | `super_admin` | 平台运维负责人 | 全平台用户/套餐/系统配置 |
| 管理员 | `admin` | 平台运营 | 用户/设备/会话/录制/安全（无改系统密钥） |
| 只读审计 | `viewer` | 合规只读 | 列表与详情只读，无写操作 |

#### B. 企业组织（Enterprise，`Organization`）

绑定在 **User** 上的 `orgRole`（可与平台 Admin 账号分离）：

| 角色 | 代码 | 业务称呼 | 能力摘要 |
| :--- | :--- | :--- | :--- |
| 组织所有者 | `org_owner` | 老板 / 高管 | 本组织策略、成员、全部监控与报告 |
| 组织管理员 | `org_admin` | IT 负责人 | 成员与设备管理、策略、强制断开 |
| IT 支持 | `it_support` | IT Support | 对本组织设备远程协助（须审计 + 被控授权策略） |
| 安全审计 | `security_auditor` | 安全合规 | 本组织录制/安全事件/报告只读 |
| 普通成员 | `member` | 普通员工 | 仅本人设备与受邀会话 |

> **平台 Admin** 与 **企业 User** 是两套账号体系：前者管「全平台」，后者在 Client 端远程桌面。企业 IT 可同时拥有 User（`it_support`）与可选 Admin 子账号（P2 SSO）。

#### C. 被控端

| 角色 | 说明 |
| :--- | :--- |
| **Controlled Agent** | Device Token，无 RBAC 菜单，能力由 Agent 版本与组织策略下发 |

### 2.3 ABAC 平面（资源属性）

策略引擎输入 **Subject + Action + Resource**：

| 属性 | 来源 | 示例 |
| :--- | :--- | :--- |
| `subject.userId` | JWT | `u-123` |
| `subject.orgId` | User / JWT | `org-acme` |
| `subject.orgRole` | User | `it_support` |
| `subject.adminRole` | Admin JWT | `admin` |
| `resource.orgId` | Device/Room/Recording | 必须匹配（企业域） |
| `resource.ownerId` | Device.ownerId | 设备归属 |
| `resource.roomId` | Room | 会话成员关系 |
| `action` | API/WS | `remote.control` |

**示例策略（Normative）**

| ID | 规则 |
| :--- | :--- |
| POL-01 | `member` 仅 `remote.control` **自己拥有**的 Device 或 Pairing 授权的 Room |
| POL-02 | `it_support` 可 `remote.control` **同 org** 且 Device 标记 `allowOrgSupport=true` 或存在有效 SupportGrant |
| POL-03 | `org_owner` / `org_admin` 可 `session.observe` 本 org 任意活跃 Room（SFU 订阅） |
| POL-04 | `security_auditor` 可 `recording.read` / `security.read`，不可 `remote.control` |
| POL-05 | `viewer`（平台）可 `admin.read`，不可 `admin.write` |
| POL-06 | 跨 `orgId` 访问一律拒绝（除非 `super_admin`） |

### 2.4 Plan 权益平面（商业化）

来自 [commercial-tier-spec.md](./commercial-tier-spec.md)：`free` | `pro` | `enterprise`。

| 能力 | 校验点 |
| :--- | :--- |
| 录制/回放 | API + `PlanGuard`；与角色正交 |
| 多屏监控 / 安全遥测 | `enterprise` + `orgRole` 含监控权限 |
| AI 摘要 | `pro`+ |

**顺序**：先认证 → 再 Plan → 再 RBAC → 再 ABAC。

---

## 3. 权限字表（`shared` SSOT）

见 `shared/src/auth/permissions.ts`。分类：

- `remote.*` — Client 远程
- `recording.*`
- `security.*`
- `admin.*` — 管理台
- `org.*` — 组织策略与成员

---

## 4. JWT 载荷（摘要）

### 4.1 Controller Access Token

```typescript
interface ControllerJwtClaims {
  typ: 'controller';
  sub: string;           // userId
  orgId?: string;
  orgRole?: OrgRole;
  plan: UserPlan;
  permissions: Permission[]; // RBAC 展开结果（缓存）
  iat: number;
  exp: number;           // 建议 15–60min
}
```

### 4.2 Signaling Ticket（短效）

```typescript
interface SignalingTicketClaims {
  typ: 'signaling';
  sub: string;           // userId
  deviceId: string;      // 主控端设备实例
  sessionId: string;     // roomId
  permissions: Permission[];
  exp: number;           // 建议 5–15min
}
```

WSS 握手：`Authorization: Bearer <signaling-ticket>` 或 query `?ticket=`（仅开发）。

### 4.3 Admin JWT

```typescript
interface AdminJwtClaims {
  typ: 'admin';
  sub: string;           // adminId
  role: PlatformAdminRole;
  permissions: Permission[];
  exp: number;
}
```

### 4.4 Device Token

长期或滚动刷新；仅用于 Agent API，**不能**用于信令或远程控制主控。

---

## 5. 通道鉴权矩阵

| 通道 | 认证方式 | 授权 |
| :--- | :--- | :--- |
| REST `/api/v1/*`（Client） | Controller JWT | RBAC+ABAC+Plan |
| REST `/api/v1/admin/*` | Admin JWT | Platform RBAC |
| WSS `/signaling` | Signaling Ticket | 须含 `signaling.join`；Room 成员 ABAC |
| SSE `/events/stream` | Controller 或 Admin JWT | `userId` 绑定 + `audience` 过滤 |
| DataChannel `control` | DTLS + 会话内已授权 | 建立会话时已判定 `remote.control` |
| Agent API | Device Token | 设备归属 |

---

## 6. 实现映射（代码）

| 仓库 | 路径 |
| :--- | :--- |
| shared | `src/auth/` 角色、权限、JWT、策略求值 |
| server | `src/auth/` Guards、`PolicyService`、`SignalingTicketService` |
| web/client | 登录存 Token；`SignalingClient` 带 ticket |
| web/admin | 路由守卫按 `PlatformAdminRole` |
| docs | `/architecture/authorization` |

---

## 7. 审计

凡 **拒绝** 敏感动作（跨 org、强制控台、导出录制）写 `AuditLog`：`auth.denied` + action + resource meta。

---

## 8. 与常见岗位对照

| 业务说法 | 推荐配置 |
| :--- | :--- |
| 普通员工 | User `orgRole=member`，Client 登录 |
| 老板 | User `orgRole=org_owner`，Enterprise |
| IT Support | User `orgRole=it_support` + 设备 `allowOrgSupport` |
| 平台管理员 | Admin 账号 `admin` / `super_admin` |
| 合规只读 | Admin `viewer` 或 User `security_auditor` |

---

## 9. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 混合 RBAC+ABAC+Plan；JWT/信令/SSE；组织角色与策略字表 |
