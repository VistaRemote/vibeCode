# VistaRemote — Plugin Review Prompt

审查 **插件仓库** 或核心仓中的插件 Host/Manifest 变更。

## 清单

- [ ] `id` 全局唯一，反向域名格式
- [ ] `apiVersion` 与 Host 一致
- [ ] `permissions` 最小化
- [ ] 无直接访问核心 DB / 信令内部类
- [ ] 未 bundle 进 Meta 主仓业务目录
- [ ] `commercial.license` 与 FeatureGate 一致
- [ ] 崩溃隔离：超时、disable 路径存在

## 参考

[plugin-architecture-spec.md](../spec/plugin-architecture-spec.md)
