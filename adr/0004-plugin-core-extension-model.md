# ADR-0004: 核心 + 插件扩展模型

| Metadata | Value |
| :--- | :--- |
| **状态** | Accepted |
| **日期** | 2026-05-24 |

## 背景

封闭单体远程工具无法覆盖垂直场景；VistaRemote 需社区生态且 **主仓不被污染**（Meta-Repo 多子仓）。

## 决策

- 产品形态：**官方核心（流控 + 安全 AI）+ 独立生命周期插件**
- 插件：**独立仓库** + `shared` Manifest 契约
- 分发：**GitHub-Driven 插件索引**（零运维市场），CLI `@vistaremote/vt-cli`
- 各端：NestJS Dynamic Module、Electron 双层 Host、Web 动态 import、RN JS 沙盒

## 理由

- 与 VS Code / Chrome 扩展心智一致
- 商业插件与 Enterprise 授权可扩展
- 保持主仓 CI 简洁、安全边界清晰

## 后果

- 新业务能力默认评估「核心 vs 插件」
- 插件 API 版本化；破坏性变更走 ADR + major bump

## 关联

- [plugin-architecture-spec.md](../spec/plugin-architecture-spec.md)
- [commercial-resources-spec.md](../spec/commercial-resources-spec.md)
