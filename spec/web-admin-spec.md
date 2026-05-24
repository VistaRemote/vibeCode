# Web 管理端（Admin）Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-WEB-ADMIN-001` |
| **应用** | `web/apps/admin/` |
| **版本** | 0.3.0-draft |
| **父文档** | [web-spec.md](./web-spec.md) |

---

## 1. 职责

面向 **平台管理员** 与 **企业 IT** 的统一后台：**管理全部注册用户**（free / pro / enterprise）、套餐、组织策略、录制与回放、安全事件、AI 洞察与效率报告。

**不负责**：LLM 推理（由 `ai` 服务）；RTP 媒体转发。

**关联 Spec**：[commercial-tier-spec](./commercial-tier-spec.md) · [recording-playback-spec](./recording-playback-spec.md) · [enterprise-security-spec](./enterprise-security-spec.md) · [authorization-spec](./authorization-spec.md)

---

## 2. 布局

采用 antd **ProLayout**（`@ant-design/pro-components`）：

```text
┌──────────────────────────────────────────────┐
│  Logo │ 用户 │ 套餐 │ 设备 │ 会话 │ 录制 │ 安全 │ AI报告 │ 组织 │ 系统 │
├──────────┬───────────────────────────────────┤
│  Side    │  Content (ProTable / ProForm)      │
│  Menu    │                                    │
└──────────┴───────────────────────────────────┘
```

样式：`Layout.module.scss` + 全局 Sass 变量；暗色主题 P1。

---

## 3. 功能模块

### 3.1 认证与权限（P0）

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-WAD-01 | 管理员账号密码登录（或 SSO P1） | JWT 存 `sessionStorage` |
| FR-WAD-02 | 平台 RBAC：`super_admin` / `admin` / `viewer` | `viewer` 无写操作；与 Client 组织角色分离 |
| FR-WAD-02b | Enterprise 组织页展示 `orgRole`（owner/admin/it_support/…） | 只读或按平台 Admin 权限代管 |
| FR-WAD-03 | 路由守卫：未登录跳转 `/login` | |
| FR-WAD-04 | 401 自动登出并提示 | |

### 3.2 用户管理（P0 — 全量用户）

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-WAD-20 | 用户列表含 `plan`、`billingKind`、`trialEndsAt`、`planExpiresAt` | `GET /api/v1/admin/users` |
| FR-WAD-21 | 可手动调整套餐（审计） | `POST /api/v1/admin/users/:id/plan` |

### 3.2b 订单管理（P1）

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-WAD-30 | 订单列表：SKU、渠道、状态、金额 | `OrdersPage` / Admin API |
| FR-WAD-31 | 支付回调后状态 `paid` 并开通权益 | webhook P1 |

支付渠道：微信、支付宝、PayPal、Wise（银行卡后续）。见 [billing-commerce-spec.md](./billing-commerce-spec.md)。

### 3.2c 权限管理（P0）

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-WAD-40 | 展示平台 RBAC 与组织 `orgRole` 权限字表 | `PermissionsPage` |
| FR-WAD-41 | 与 [authorization-spec.md](./authorization-spec.md) 同步 | shared `Permission` |

### 3.2d 用户管理（原 3.2 明细）

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-WAD-10 | **全部** 注册用户列表：邮箱、套餐、到期日、组织、状态、注册时间 | `ProTable` |
| FR-WAD-11 | 创建/禁用用户、重置密码 | `ModalForm` |
| FR-WAD-12 | 用户详情 Tab：设备、会话、录制、AI 摘要、安全事件 | |
| FR-WAD-13 | 修改套餐 free/pro/enterprise、到期日 | `super_admin`；写审计 |
| FR-WAD-14 | 录制用量统计（本月分钟数） | Pro+ 用户 |

### 3.3 设备管理（P0）

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-WAD-20 | 被控设备列表：在线状态、最后心跳、OS | |
| FR-WAD-21 | 强制下线/吊销 Device Token | 被控 Agent 下次心跳失败 |
| FR-WAD-22 | 按标签/分组筛选（P1） | |

### 3.4 会话监控（P1）

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-WAD-30 | 活跃 Room 列表：参与方、模式 p2p/sfu、开始时间 | |
| FR-WAD-31 | 管理员强制断开 Room | 调用 `DELETE /api/v1/rooms/:id` |

### 3.5 审计日志（P1）

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-WAD-40 | 按时间、用户、设备、事件类型查询 | 导出 CSV P2 |
| FR-WAD-41 | 事件类型：登录、配对、会话开始/结束、强制断开 | |

### 3.6 录制与回放（Pro+）

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-WAD-60 | 录制列表：用户、会话、时长、触发方式（手动/关键词/安全） | |
| FR-WAD-61 | 内嵌播放器：seek、倍速、时间轴 AI 标记 | |
| FR-WAD-62 | 导出审计：谁何时播放哪条录制 | |

### 3.7 企业安全（Enterprise）

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-WAD-70 | 安全事件列表：外发、批量删除、异常行为 | severity 标签 |
| FR-WAD-71 | 点击事件跳转关联录制时间点 | |
| FR-WAD-72 | 多屏监控墙：单会话 1–4 路缩略流 | [enterprise-security-spec](./enterprise-security-spec.md) |

### 3.8 组织与策略（Enterprise）

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-WAD-80 | 组织 CRUD、席位、绑定用户 | |
| FR-WAD-81 | 策略表单：关键词、域名黑名单、删除阈值、AI 灵敏度 | JSON 保存 |

### 3.9 AI 洞察（Enterprise + Pro 摘要）

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-WAD-90 | Pro：会话 AI 摘要只读展示 | Markdown 渲染 |
| FR-WAD-91 | Enterprise：异常行为时间线 | |
| FR-WAD-92 | Enterprise：效率报告图表（高效/低效/空闲） | 周/月切换 |

### 3.10 系统配置（P1）

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-WAD-50 | 查看 TURN/ICE 配置状态（掩码显示密钥） | 只读 MVP |
| FR-WAD-51 | 配对码策略：长度、TTL | `super_admin` 可写 |

---

## 4. API 依赖（Server）

所有 Admin API 前缀：`/api/v1/admin/*`，DTO 来自 `@vistaremote/shared`。

| Method | Path | 说明 |
| :--- | :--- | :--- |
| `POST` | `/admin/auth/login` | 管理员登录 |
| `GET` | `/admin/users` | 用户列表 |
| `POST` | `/admin/users` | 创建用户 |
| `PATCH` | `/admin/users/:id` | 更新状态 |
| `GET` | `/admin/devices` | 设备列表 |
| `POST` | `/admin/devices/:id/revoke` | 吊销设备 |
| `GET` | `/admin/rooms` | 活跃会话 |
| `DELETE` | `/admin/rooms/:id` | 强制结束 |
| `GET` | `/admin/audit-logs` | 审计查询 |
| `PATCH` | `/admin/users/:id/plan` | 套餐 |
| `GET` | `/admin/recordings` | 录制 |
| `GET` | `/admin/recordings/:id/playback-url` | 签名播放 |
| `GET` | `/admin/security/incidents` | 安全事件 |
| `GET` | `/admin/organizations` | 组织 |
| `PUT` | `/admin/organizations/:id/policy` | 策略 |
| `GET` | `/admin/ai/summaries/:sessionId` | AI 摘要 |
| `GET` | `/admin/ai/efficiency-reports` | 效率报告 |

---

## 5. 技术约束

| 类别 | 选型 |
| :--- | :--- |
| 构建 | Rsbuild（同 `rsbuild.config.base.ts`） |
| UI | antd 5 + `@ant-design/pro-components` |
| 样式 | Sass Modules |
| 数据请求 | `@tanstack/react-query` + 统一 `request` 封装 |

---

## 6. 非功能需求

| ID | 需求 | 目标 |
| :--- | :--- | :--- |
| NFR-WAD-01 | 列表页首屏 | < 2s（内网） |
| NFR-WAD-02 | 仅内网或 VPN 部署选项 | 文档说明 |

---

## 7. Out of Scope

- 支付网关对接（P2，仅手工改套餐）
- 在 Admin 内编辑 LLM Prompt 模板（P2）

---

## 8. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.2.0-draft | 管理端 Spec 初稿 |
| 2026-05-24 | 0.3.0-draft | 全用户管理、套餐、录制回放、企业安全、AI 报告 |
