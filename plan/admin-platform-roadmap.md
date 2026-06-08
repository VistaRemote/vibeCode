# 后台管理能力路线图（Admin Platform）

与 [spec/web-admin-spec.md](../spec/web-admin-spec.md)、[spec/authorization-spec.md](../spec/authorization-spec.md)、[spec/recording-playback-spec.md](../spec/recording-playback-spec.md)、[ROADMAP.md](../ROADMAP.md) 对齐。

---

## 1. 现状（2026-06）

| 维度 | 状态 | 说明 |
| :--- | :--- | :--- |
| **Client 远程闭环** | 🟢 MVP-B `b10` | 配对、信令、WebRTC、多屏、控制 |
| **Admin 前端** | 🟢 ADM-0 | 登录、路由守卫、用户/订单/权限/会话/录制/审计页 |
| **Admin API** | 🟢 ADM-0 | JWT + RBAC 守卫；users/orders/rooms/recordings/audit |
| **权限模型** | ✅ Spec + shared | RBAC + ABAC + Plan；`Permission` SSOT |
| **录制** | 🟡 契约 | `shared/recording/*`；**Server 元数据 API 未落地** |
| **持久化** | 🟡 P1 | User/Device/Recording/Audit 仍为内存；TypeORM/PG compose 已接，实体待 ADM-1 |

**结论**：客户端演示链路已够；下一主线是 **M1 管理面** — 先「能登录、能管、能审计」，再 MySQL/MinIO 生产化。

---

## 2. 目标架构

```text
┌─────────────────────────────────────────────────────────────────┐
│ web/apps/admin（ProLayout + React Query）                          │
│  登录 │ 用户 │ 权限 │ 设备 │ 会话 │ 录制 │ 安全 │ 组织 │ 系统    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS  Admin JWT
┌────────────────────────────▼────────────────────────────────────┐
│ server/src/admin + auth                                          │
│  AdminAuthGuard / RolesGuard → PolicyService                     │
│  users │ devices │ rooms │ recordings │ audit │ organizations    │
└─────┬──────────────────┬──────────────────┬───────────────────────┘
      │                  │                  │
      ▼                  ▼                  ▼
  PostgreSQL        MinIO/S3           Redis/BullMQ
  (M1)              (录制分片)          (AI 摘要/告警)
```

**鉴权顺序**（Normative）：`Admin JWT` → **Platform RBAC** →（资源 API）**ABAC orgId** → 写 **AuditLog**。

---

## 3. 版本分期

| 阶段 | 代号 | 交付 | 依赖 | 状态 |
| :--- | :--- | :--- | :--- | :--- |
| **ADM-0** | Scaffold | Admin 登录、JWT 守卫、用户/订单 API 鉴权、录制列表桩 | 现有 billing store | 🟢 |
| **ADM-1** | Identity | Controller 用户注册/登录、PostgreSQL `User`、密码哈希 | TypeORM | ⬜ |
| **ADM-2** | RBAC 实装 | `RolesGuard` 全覆盖；权限页可编辑角色绑定（P1） | ADM-1 | ⬜ |
| **ADM-3** | Recording | 录制 start/heartbeat/complete、MinIO 预签名、Admin 回放 URL | MinIO compose | ⬜ |
| **ADM-4** | Sessions | 活跃 Room 列表、强制断开、信令审计 | SignalingRoomService | ⬜ |
| **ADM-5** | Enterprise | 组织/策略、安全事件、监控墙（只读多路） | SFU + MD-4 | ⬜ |

与 ROADMAP 对齐：**M1 MVP-A**（MySQL + JWT）与 **M4 MVP-D**（录制 + MinIO）可并行子轨道，本路线图 **ADM-0～2** 属 M1 子集。

---

## 4. 模块任务板

### 4.1 权限管理（ADM-0 → ADM-2）

| 任务 | FR | 说明 |
| :--- | :--- | :--- |
| [x] shared `Permission` + 平台/组织角色映射 | FR-WAD-41 | 已存在 |
| [x] Admin JWT 签发/校验 | FR-WAD-01 | `POST /admin/auth/login` |
| [x] `AdminAuthGuard` + `@RequirePermissions()` | FR-WAD-02 | 覆盖 `/admin/*` |
| [ ] 拒绝写操作写审计 | POL + §7 authorization | `auth.denied` |
| [ ] 权限页：角色说明 + 当前管理员角色 | FR-WAD-40 | 已只读展示 |
| [ ] P1：组织 `orgRole` 代管、SupportGrant | POL-02 | Enterprise |

### 4.2 用户管理（ADM-0 → ADM-1）

| 任务 | FR | 说明 |
| :--- | :--- | :--- |
| [x] 内存用户列表 + 改套餐 | FR-WAD-20/21 | `UserSubscriptionStore` |
| [x] 登录后 Admin 拉用户列表 | FR-WAD-10 | Bearer Token |
| [ ] 创建/禁用用户、重置密码 | FR-WAD-11 | 需 MySQL `User` |
| [ ] 用户详情 Tab（设备/会话/录制） | FR-WAD-12 | ADM-3/4 |
| [ ] 套餐变更审计 | FR-WAD-13 | `AuditLog` 表 |

### 4.3 WebRTC / 会话录制管理（ADM-3）

| 任务 | FR | 说明 |
| :--- | :--- | :--- |
| [ ] `POST /api/v1/recordings/start` | FR-REC-01 | 权益 `RECORDING` |
| [ ] heartbeat / complete | FR-REC-02/03 | 断点续传元数据 |
| [x] `GET /admin/recordings` 列表 | FR-WAD-60 | 演示数据 + 桩回放 URL |
| [x] `GET /admin/recordings/:id/playback-url` | FR-WAD-61 | 签名 URL 桩；P1 MinIO |
| [ ] 播放审计 | FR-WAD-62 | 谁何时播放 |
| [ ] Desktop Agent 上传调度 | FR-REC-01～06 | desktop 仓 |
| [ ] SFU 录制（可选） | FR-REC-SFU-* | Enterprise P2 |

**原则**：默认 **端侧录制 + 元数据上云**；Server **不**代理 RTP（见 recording-playback-spec）。

### 4.4 会话与设备（ADM-4）

| 任务 | FR | 说明 |
| :--- | :--- | :--- |
| [x] `GET /admin/rooms` 活跃会话 | FR-WAD-30 | SignalingRoomService |
| [x] `DELETE /admin/rooms/:id` 强制断开 | FR-WAD-31 | 清空内存房间（P1 关 WS） |
| [ ] `GET /admin/devices` + revoke | FR-WAD-20～21 | Device Token 吊销 |
| [ ] `GET /admin/audit-logs` | FR-WAD-40/41 | 登录/配对/控台/套餐变更 |

### 4.5 企业安全与 AI（ADM-5）

| 任务 | FR | 说明 |
| :--- | :--- | :--- |
| [ ] 安全事件列表 | FR-WAD-70 | telemetry → 入库 |
| [ ] 跳转录制时间点 | FR-WAD-71 | recordingId + offset |
| [ ] AI 摘要/效率报告 | FR-WAD-90～92 | BullMQ + ai 仓 |

---

## 5. 契约与仓库分工

| 变更类型 | 顺序 |
| :--- | :--- |
| Admin DTO / 权限扩展 | **shared** 先行 |
| Guards、API、Entity | **server** |
| 页面、ProLayout、React Query | **web/admin** |
| 端侧上传 | **desktop** |
| 对象存储 | **deploy** compose MinIO |

新增/扩展 shared：

- `shared/src/api/admin.ts` — login、用户列表、录制列表、审计查询
- （P1）`shared/src/api/admin-recordings.ts` — 与 `recording/*` 对齐

---

## 6. 建议迭代顺序（8～10 周参考）

| 周 | 目标 | 验收 |
| :--- | :--- | :--- |
| W1 | ADM-0 合入 | Admin 登录；带 Token 访问 users；`pnpm dev` 三端 |
| W2 | ADM-1 MySQL User + Controller 登录 | 配对绑定真实 userId |
| W3 | ADM-3 录制 API + MinIO dev | Agent 模拟 complete；Admin 列表可见 |
| W4 | ADM-4 会话/设备/审计 | 强制断开 Room；审计 CSV 导出 P2 |
| W5+ | ADM-5 组织/安全/AI | Enterprise 演示包 |

---

## 7. 本地验证（ADM-0）

```powershell
.\dev-mvp.ps1
# Admin UI（若已配置）
cd web/apps/admin; pnpm dev

# 登录
curl -X POST http://127.0.0.1:3000/api/v1/admin/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password":"admin"}'

# 带 token 拉用户
curl http://127.0.0.1:3000/api/v1/admin/users `
  -H "Authorization: Bearer <accessToken>"
```

默认开发账号：`admin` / `admin`（环境变量 `VISTAREMOTE_ADMIN_USER` / `VISTAREMOTE_ADMIN_PASSWORD`）。

---

## 8. 文档同步

| 文档 | 更新 |
| :--- | :--- |
| [spec/implementation-status.md](../spec/implementation-status.md) | Admin / Recording 行 |
| [ROADMAP.md](../ROADMAP.md) | M1 管理面子里程碑 |
| [plan/implementation-plan.md](./implementation-plan.md) | 下一迭代 FR-ADM-* |
| [spec/server-spec.md](../spec/server-spec.md) | §5.2 Admin API 实现状态 |

---

## 9. Changelog

| 日期 | 变更 |
| :--- | :--- |
| 2026-06-04 | 初版：ADM-0～5 分期；权限/用户/录制/会话任务板 |
| 2026-06-04 | ADM-0 合入：server/admin 模块 + web/admin 登录与六页 |
