# Security Policy

## Supported Versions

| Version | Supported |
| :--- | :--- |
| latest `main` | ✓ |
| older releases | 仅关键安全修复，视维护者资源而定 |

## Reporting a Vulnerability

**请勿**在公开 GitHub Issue 中讨论可利用的安全漏洞。

请通过以下方式私下报告：

1. GitHub **Private Security Advisory**（推荐，在仓库 Security 标签页）
2. 或邮件联系 VibeCode / VistaRemote 维护者（待公布安全联系邮箱）

请包含：影响版本、复现步骤、影响范围、可能的修复建议。

我们会在 **72 小时内** 确认收到，并在修复发布前避免公开细节。

## Scope

- `server` 鉴权、信令、Admin API
- `desktop` Agent 授权与遥测
- 录制存储与 AI 回调接口
- 默认部署配置（Docker、TURN）

Out of scope：仅影响 fork 自定义部署且未使用官方镜像的第三方配置。
