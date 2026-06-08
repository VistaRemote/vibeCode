# VistaRemote — Security & Anti-Hallucination Review Prompt

专注 **安全、权限、商业化边界** 与 **AI 代码常见幻觉**。

## 审查清单

### 安全

- [ ] 无硬编码 secret、token、私钥
- [ ] `.env` 未进库；仅 `.env.example`
- [ ] WSS/HTTP Admin 有鉴权（或明确标注 P1 桩并链 Issue）
- [ ] 插件 permissions 未过度申请
- [ ] 用户输入进 SQL/命令前已参数化（Repository 层）

### 套餐 / 权益

- [ ] `free` 未调用 `recording.sfu_server`、`telemetry.enterprise` 等 Enterprise API
- [ ] FeatureGate / `EntitlementService` 与 `shared/billing` 一致
- [ ] 试用降级逻辑未删除

### 信令 / WebRTC

- [ ] 信令消息形状符合 `shared/signaling`，非自创 JSON
- [ ] ICE 配置来自 server，非客户端硬编码生产 TURN 密码

---

## 已知 AI 幻觉点（维护者持续更新）

> 发现新幻觉后 **在本表追加一行** 并提 PR 更新本文件。

| 领域 | 错误生成模式 | 正确做法 |
| :--- | :--- | :--- |
| NestJS | 在 Controller 注入 `Repository` 并写查询 | Controller 只调 Service；DB 仅 Repository/DAO |
| NestJS | 使用 `uuid` v4 作为主键 | 主键 **UUIDv7**（`uuidv7` 包或 DB 生成） |
| shared | 在子仓重复定义 `ErrorCode` 枚举 | 仅用 `shared/constants/error-codes` |
| WebRTC | 省略 `transportPolicy` / 权益校验 | 合并 server `TransportPolicyService` |
| billing | 前端直接判断 plan 字符串 | 用 `ProductFeature` + entitlements API |
| pairing | 配对码永久有效 | 消费型 pairing + `PAIRING_CONSUMED` |
| Redux | 生成 `createSlice` / `configureStore` | **Zustand** store |
| CSS | 引入 `tailwind.config` / `@apply` | Sass Modules + **BEM** |
| Plugin | 插件 import 核心 `src/` 相对路径 | 仅 `PluginHost` 公开 API |
| mediasoup | 声称已接 PlainTransport 录制 | 查 implementation-status：SFU 录制为 ⬜/P2 |

## 输出格式

```markdown
## 安全结论
通过 | 需修复

## 幻觉/违规项
| 文件 | 问题 | 建议 |

## 必须人工确认
- ...
```
