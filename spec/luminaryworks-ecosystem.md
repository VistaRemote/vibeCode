# VistaRemote 与 LuminaryWorks 生态

> **组织**：[VistaRemote](https://github.com/VistaRemote) · **本仓**：vibeCode MetaRepo — WebRTC 远程桌面与 AI 录制洞察

## 独立价值

VistaRemote 可**单独交付**：企业远程运维、录制审计、自托管 AI 摘要，适配工控、IT 运维、客服场景，无需 IoT 平台。

## 在 AI 生态中的角色

| 维度 | 说明 |
|------|------|
| **控** | 触达现场：设备桌面、边缘网关、工控机 |
| **AI 洞察** | 录制 → 摘要/异常检测，结果可进 DataLuminary 报表 |
| **运维闭环** | LuminaryIoTChain 控制台一键发起远程会话 |

```text
告警/人工 ──► VistaRemote WebRTC ──► 录制 ──► AI 分析 ──► DataLuminary（可选）
```

## 兄弟产品

| 产品 | 集成场景 |
|------|----------|
| [LuminaryIoTChain](https://github.com/LuminaryIoTChain/LuminaryIoTChain) | 设备远程维护入口 |
| [DataLuminary](https://github.com/DataLuminary/DataLuminary-Platform) | 运维报表与审计大屏 |
| [VibeEdu](https://github.com/BlockyEdu/VibeEdu) | 远程运维培训课程 |
| [VibeAgent](https://github.com/AgentSkillMesh/VibeAgent) | Worker 端调试与任务 |

## 生态文档

- [LuminaryWorks 叙事](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/docs/ecosystem-narrative.md)
- [总体架构](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/docs/architecture-overview.md)

## 原则

- 信令与媒体在 VistaRemote 域内；跨产品仅配对/会话 REST + OIDC  
- Admin SSO：`@luminary/auth-core`（`IDP_ISSUER` 配置时）
