# 商业化与用户套餐 Spec（L1）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-TIER-001` |
| **版本** | 0.7.0 |
| **资源切割** | [commercial-resources-spec.md](./commercial-resources-spec.md) |
| **订单支付** | [billing-commerce-spec.md](./billing-commerce-spec.md) |
| **关联** | [licensing-spec.md](./licensing-spec.md) · [server-spec](./server-spec.md) · [webrtc-architecture-spec](./webrtc-architecture-spec.md) · [ai-platform-spec](./ai-platform-spec.md) |

---

## 1. 套餐定义

| 套餐 | 代码 | 目标用户 | 计费（示意） |
| :--- | :--- | :--- | :--- |
| **免费版** | `free` | 个人、试用结束后未订阅 | ￥0 |
| **专业版** | `pro` | 技术支持、小团队 | 订阅制 |
| **企业版** | `enterprise` | 企业 IT、合规团队 | 合同约定 |

用户字段：`plan`、`billingKind`（`none` | `subscription` | `perpetual`）、`planExpiresAt`（订阅到期）、`trialEndsAt`（试用截止，Unix ms）、`orgId`。

**付费形态**：**订阅**（连续包月/包年，年付享 catalog 折扣）或 **买断**（一次付费，永久享有对应套餐能力）。详见 [billing-commerce-spec.md](./billing-commerce-spec.md)。

**开源授权**（能否部署/改代码）见 [licensing-spec.md](./licensing-spec.md)：**个人非盈利免费；任何商业使用须另签商业许可**。本节仅规定 **SaaS/自建实例上的功能开关**。

---

## 2. 试用期（Trial）

| 项目 | 规则 |
| :--- | :--- |
| 默认时长 | **14 天**（注册或组织创建时写入 `trialEndsAt`，Admin 可调整） |
| 试用期内 | 可使用下文 **「试用含付费能力」** 全部项（在套餐矩阵中标注 Trial 列） |
| 试用结束且仍为 `free` | **SFU**、**AI 端侧降云** 立即关闭；1:1 **P2P** 远程仍可用 |
| 恢复 | 升级 **Pro**（SFU）或 **Enterprise**（含降云）并付费 |

```text
试用中 ──► 可 SFU + 可 behavior.cloud_infer
试用结束 + free ──► 仅 P2P；降云 Job 拒绝；SFU 分配拒绝
试用结束 + pro/enterprise ──► 按套餐矩阵
```

实现 SSOT：`shared/src/billing/entitlements.ts` — `canUseFeature()`、`ProductFeature`。

---

## 3. 能力矩阵

| 能力 | ProductFeature | Trial | Free | Pro | Enterprise |
| :--- | :--- | :---: | :---: | :---: | :---: |
| 远程控制 **P2P 1:1** | — | ✓ | ✓ | ✓ | ✓ |
| 基础审计 | — | ✓ | ✓ | ✓ | ✓ |
| **WebRTC SFU** | `webrtc.sfu` | ✓ | — | ✓ | ✓ |
| **AI 云端推理** | `ai.cloud_infer` | ✓ | — | — | ✓ |
| **端侧录制 + 云上传回放** | `recording` | — | — | ✓ | ✓ |
| **SFU 服务端录制**（PlainTransport+FFmpeg） | `recording.sfu_server` | — | — | — | ✓ |
| **录制 AI 摘要** | `ai.recording_summarize` | — | — | ✓ | ✓ |
| 企业遥测 / 安全 / 效率报告 | `telemetry.enterprise` 等 | — | — | — | ✓ |

> 完整资源说明：[commercial-resources-spec.md](./commercial-resources-spec.md)。  
> **默认不在 SFU 上录制**；录制在 **Desktop 缓冲+分片上传**（减服务端压力）。

### 3.1 录制与存储（产品口径）

| 项目 | 说明 |
| :--- | :--- |
| 默认 | Agent 本地环区 → 定时上传 S3；Server 只存元数据 |
| SFU 录制 | 仅 Enterprise 可选；**额外** CPU/带宽，单独 Feature |
| 试用 | 不含云录制（与现矩阵一致） |

---

## 4. 服务端 enforcement（Normative）

| ID | 场景 | 校验点 | 拒绝码 |
| :--- | :--- | :--- | :--- |
| FR-TIER-20 | 分配 mediasoup / `session-mode: sfu` | `ProductFeature.WEBRTC_SFU` | `TRIAL_EXPIRED_REQUIRES_PRO` 或 `PLAN_FORBIDDEN` |
| FR-TIER-21 | 入队 `behavior.cloud_infer` | `ProductFeature.AI_CLOUD_INFER` | `TRIAL_EXPIRED_REQUIRES_ENTERPRISE` |
| FR-TIER-22 | `TransportPolicyService` 决策 SFU | 同上 | 回退 P2P 或拒绝第二观众 |
| FR-TIER-23 | JWT / 会话元数据携带 `trialEndsAt` | Client 展示「试用剩余」 | — |
| FR-TIER-24 | `POST /recordings/start` 校验 `recording` | free → `PLAN_FORBIDDEN` |
| FR-TIER-25 | SFU 录制 API 校验 `recording.sfu_server` | Pro 亦拒绝 |
| FR-TIER-26 | 月上传量配额 `recording.monthlyUploadGb` | 超额拒绝 |

---

## 5. 其他功能需求

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-TIER-01 | AI/录制 API 校验 `user.plan` | free 返回 `PLAN_FORBIDDEN` |
| FR-TIER-02 | Admin 可改套餐、试用截止、到期日 | 审计 `plan_changed` |
| FR-TIER-03 | Pro 录制配额可配置 | 超额拒绝 |
| FR-TIER-04 | Enterprise 绑定 Organization | |
| FR-TIER-05 | 套餐/试用变更 **60s 内** 生效 | JWT 短 TTL |

---

## 6. Admin 管理台

（与 0.3 版相同：全用户、试用截止列、批量改套餐。）

| FR-TIER-14 | 用户详情展示 `trialEndsAt`、是否可 SFU/降云 | 只读标签 |

---

## 7. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.3.0-draft | Free / Pro / Enterprise 矩阵 |
| 2026-05-24 | 0.5.0 | 试用期；SFU 与 AI 降云试用后付费；entitlements SSOT |
| 2026-05-24 | 0.7.0 | 资源点切割；端侧默认录制；SFU 录制 Enterprise |
