# 订单、订阅与支付 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-BILL-001` |
| **版本** | 1.0.0 |
| **关联** | [commercial-tier-spec.md](./commercial-tier-spec.md) · [licensing-spec.md](./licensing-spec.md) · [web-admin-spec.md](./web-admin-spec.md) |

---

## 1. 付费形态

| 形态 | 代码 | 说明 |
| :--- | :--- | :--- |
| **订阅** | `subscription` | 按月/年续费；`planExpiresAt` 到期失效 |
| **买断** | `perpetual` | 一次付费，对应套餐永久有效（大版本升级可另售） |

连续订阅优惠（Normative）：

| SKU | 说明 |
| :--- | :--- |
| `pro_monthly` / `enterprise_monthly` | 月付标价 |
| `pro_yearly` / `enterprise_yearly` | 年付，相对月付约 **84–85 折**（`discountRate` 在 catalog） |
| `pro_perpetual` / `enterprise_perpetual` | 买断价 |

商品目录 SSOT：`shared/src/billing/catalog.ts`。

---

## 2. 试用与功能拦截

与 [commercial-tier-spec](./commercial-tier-spec.md) 一致：

| 功能 | 试用 | 试用后 Free | 付费 |
| :--- | :---: | :---: | :--- |
| SFU | ✓ | ✗ | Pro+ 且订阅有效或买断 |
| AI 降云 | ✓ | ✗ | Enterprise 且有效 |

**各端拦截**：

| 端 | 实现 |
| :--- | :--- |
| **server** | `EntitlementService`；信令 SFU、队列 `cloud_infer` |
| **web client** | `GET /billing/entitlements` + `FeatureGate` |
| **desktop** | `assertCloudInferAllowed` 降云前 |
| **mobile** | `fetchEntitlements` / `canUseSfu` |

SSOT：`shared/src/billing/entitlements.ts`。

---

## 3. 支付渠道

| 渠道 | 代码 | 阶段 |
| :--- | :--- | :--- |
| 微信支付 | `wechat` | P1 对接 |
| 支付宝 | `alipay` | P1 |
| PayPal | `paypal` | P1 |
| Wise | `wise` | P1 |
| 银行卡 | `bank_card` | **后续**（占位，默认不可用） |

`isPaymentProviderActive()` 控制创建订单；回调统一 `POST /api/internal/billing/webhook/:provider`（P1）。

---

## 4. Admin 模块

| 模块 | 路径（示意） | 职责 |
| :--- | :--- | :--- |
| **用户管理** | `/users` | 列表、套餐、试用/到期 |
| **订单管理** | `/orders` | 订单状态、模拟支付（dev） |
| **权限管理** | `/permissions` | 平台/组织 RBAC 字表；非订单权限 |

API（dev）：

| Method | Path |
| :--- | :--- |
| `GET` | `/api/v1/billing/entitlements` |
| `GET` | `/api/v1/billing/catalog` |
| `POST` | `/api/v1/billing/orders` |
| `GET` | `/api/v1/admin/orders` |
| `GET` | `/api/v1/admin/users` |
| `POST` | `/api/v1/admin/users/:id/plan` |

---

## 5. 数据模型（目标 MySQL）

| 表 | 字段摘要 |
| :--- | :--- |
| `user` | `plan`, `billing_kind`, `trial_ends_at`, `plan_expires_at` |
| `order` | `user_id`, `sku`, `provider`, `status`, `amount_cents`, `paid_at` |
| `payment_webhook_log` | 回调审计 |

当前 dev：`server/src/billing/user-subscription.store.ts` 内存实现。

---

## 6. 功能需求

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-BILL-01 | 创建订单校验 SKU 与支付渠道 | |
| FR-BILL-02 | 支付成功更新用户 `plan` + `billing_kind` + 到期 | |
| FR-BILL-03 | 订阅过期后 `hasActivePaidPlan` 为 false | |
| FR-BILL-04 | 各端未付费展示拦截文案 | `featureGateMessage` |
| FR-BILL-05 | 第二路观众无 SFU 权益拒绝信令 | `TRIAL_EXPIRED_REQUIRES_PRO` |

---

## 7. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 买断/订阅；支付渠道；Admin 三模块；多端拦截 |
