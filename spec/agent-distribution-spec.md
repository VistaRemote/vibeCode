# Agent 分发与接入 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-AGENT-DIST-001` |
| **版本** | 1.0.0 |
| **关联** | [desktop-spec.md](./desktop-spec.md) · [server-spec.md](./server-spec.md) · [enterprise-security-spec.md](./enterprise-security-spec.md) · [authorization-spec.md](./authorization-spec.md) |

---

## 1. 目标

定义 **被控端（Desktop Agent）** 如何安装、如何被主控 **直连监控**，以及 **企业场景** 下「员工自带 / 主动安装」与「公司电脑 / 强制预装」的差异与 **分包发布** 策略。

---

## 2. 主控接入方式（Normative）

主控端（Web / Mobile / Desktop Controller）可通过以下 **等价入口** 绑定同一会话 Room：

| 方式 | ID | 说明 | 优先级 |
| :--- | :--- | :--- | :--- |
| **数字配对码** | `code` | 6–8 位，TTL 可配置（默认 300s） | P0 |
| **二维码** | `qr` | 编码 `PairingQrPayload`（含 `linkUrl` 或 `linkToken`） | P0 |
| **会话链接** | `link` | HTTPS `/join/{token}` 或 `vistaremote://join?token=` | P0 |

```text
被控 Agent 创建 PairingSession
        │
        ├─ numericCode ──► 主控手动输入
        ├─ qrPayload   ──► 主控扫码（解析为 linkToken 或完整 URL）
        └─ linkToken   ──► 主控打开链接（Web 路由 / 深链）
        │
        ▼
POST /api/v1/auth/pairing  { method, code? | linkToken? }
        │
        ▼
返回 roomId + signalingTicket → WSS join
```

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-DIST-01 | 三种 `PairingEntryMethod` 解析到同一 `roomId` | 单测 + 手测任一路径可连 |
| FR-DIST-02 | 二维码内容为 **签名或短期 token**，禁止长期明文 device 密钥 | 安全评审 |
| FR-DIST-03 | 链接 token 与数字码 **可同源**（同一次 PairingSession） | Agent UI 三态同步刷新 |
| FR-DIST-04 | 消费后码/链 **一次性**（可配置企业策略允许多主控则走 SFU） | `PAIRING_CONSUMED` |
| FR-DIST-05 | 审计记录 `entryMethod` | Admin 审计可查 |

契约：`shared/src/pairing/*`、`shared/src/api/pairing.ts`。

---

## 3. 安装包变体（Normative）

**同一 codebase**，通过 **构建常量 + 安装器元数据 + 首次启动逻辑** 区分，发布 **独立安装包**（不得仅靠运行时隐藏开关绕过合规）。

| 变体 ID | 目标用户 | 安装场景 | 默认 `AgentInstallChannel` | 默认 `AgentDeploymentMode` |
| :--- | :--- | :--- | :--- | :--- |
| **PKG-CONSUMER** | 个人 / 小规模 | 用户自行下载安装 | `consumer` | `interactive` |
| **PKG-ENT-BYOD** | 企业员工自带设备 | 员工扫码/链接 **主动安装** 并登录企业 | `enterprise_byod` | `enrolled_auto` |
| **PKG-ENT-MANAGED** | 公司配发电脑 | IT **GPO/MDM/镜像预装**，开机即受管 | `enterprise_managed` | `managed_silent` |

### 3.1 行为矩阵

| 能力 | Consumer | Enterprise BYOD | Enterprise Managed |
| :--- | :--- | :--- | :--- |
| 配对码/二维码/链接 | ✅ 用户发起共享时展示 | ✅ | ⚠️ 仅 IT 远程协助时展示（可策略关闭 UI） |
| 安装后自动注册组织 | ❌ | ✅ enrollment token | ✅ 预置 org + device claim |
| 安装后自动监控（策略允许时） | ❌ | ✅ 需 **员工同意** 记录 | ✅ 受企业策略约束 |
| 每次会话授权弹窗 | ✅ 默认开 | 可配置 | 可配置（默认可关） |
| 卸载 | 用户任意 | 用户可卸（企业可告警） | 需管理员密码/MDM |

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-DIST-10 | CI 产出 **3 类** 安装包 artifact（见 §5） | Release 页可见 |
| FR-DIST-11 | 包内 `install-channel.json` 或编译时常量只读 | 运行时不可伪造为 managed |
| FR-DIST-12 | Managed 包 **必须** 带企业法律告知页（首次启动） | 截图 + 文案 Spec |
| FR-DIST-13 | BYOD 包 enrollment 须员工账号/OAuth + 勾选同意 | 审计 `consentAt` |

---

## 4. 企业自动监控

| ID | 需求 | 说明 |
| :--- | :--- | :--- |
| FR-DIST-20 | `AgentProvisioningProfile.autoMonitor` 由 Admin 下发 | `off` \| `on_idle` \| `on_login` |
| FR-DIST-21 | BYOD：`enrolled_auto` 仅在 `consentRecord` 存在后生效 | 合规 |
| FR-DIST-22 | Managed：`managed_silent` 服从 `EnterprisePolicy.monitoring` | 与 [enterprise-security-spec](./enterprise-security-spec.md) 一致 |
| FR-DIST-23 | 自动监控 **不** 绕过套餐与 ABAC | `it_support` 仅能看授权设备 |

**禁止**：未披露的无 UI 投屏；Out of Scope 见 desktop-spec，Managed 包仍须 **告知 + 企业合同**。

---

## 5. 安装包命名与构建

| 平台 | Consumer | Enterprise BYOD | Enterprise Managed |
| :--- | :--- | :--- | :--- |
| Windows x64 | `VistaRemote-Agent-Consumer-{ver}-win-x64.exe` | `VistaRemote-Agent-EntBYOD-{ver}-win-x64.exe` | `VistaRemote-Agent-EntManaged-{ver}-win-x64.exe` |
| macOS | `...-mac-universal.dmg` | 同左 | 同左 |
| Linux | `...-linux-x64.AppImage` | P2 | P2 |

Meta-Repo 脚本：`tooling/scripts/build-agent-packages.mjs`（调用各 channel 的 `pnpm build:agent:*`）。

环境变量（构建时注入 desktop）：

| 变量 | 值示例 |
| :--- | :--- |
| `VISTAREMOTE_INSTALL_CHANNEL` | `consumer` \| `enterprise_byod` \| `enterprise_managed` |
| `VISTAREMOTE_DEPLOYMENT_MODE` | `interactive` \| `enrolled_auto` \| `managed_silent` |

---

## 6. API 扩展（Server）

| Method | Path | 说明 |
| :--- | :--- | :--- |
| `POST` | `/api/v1/devices/register` | 含 `installChannel`、`deploymentMode` |
| `POST` | `/api/v1/devices/pairing-session` | Agent 创建配对会话（码+链+QR） |
| `GET` | `/api/v1/pairing/:code` | 主控校验码（公开元数据） |
| `GET` | `/api/v1/pairing/link/:token` | 解析链接 token |
| `POST` | `/api/v1/auth/pairing` | 主控加入，`method` + `code` \| `linkToken` |

---

## 7. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 三态接入、三包体、企业自动监控 |
