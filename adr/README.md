# Architecture Decision Records (ADR)

VistaRemote 用 ADR 记录 **不可轻易推翻** 的架构决策；实现与 Spec 冲突时，以 ADR + L1 Spec 为准，并开 `RF-xxx` 重构任务。

## 格式

- 文件：`adr/NNNN-short-title.md`
- 状态：`Accepted` | `Superseded` | `Deprecated`
- 新决策：复制 [template.md](./template.md)

## 索引

| ADR | 标题 | 状态 |
| :--- | :--- | :--- |
| [0001](./0001-typescript-full-stack.md) | TypeScript 全栈主语言 | Accepted |
| [0002](./0002-webrtc-media-stack.md) | WebRTC + mediasoup 媒体栈 | Accepted |
| [0003](./0003-rust-not-cpp-for-native.md) | 性能优化用 Rust，不用 C++ | Accepted |
| [0004](./0004-plugin-core-extension-model.md) | 核心 + 插件扩展模型 | Accepted |

## 何时写 ADR

- 换语言/框架/数据库
- 安全模型变更
- 插件 Host API 破坏性版本

**不必** 为每个小功能写 ADR；用 Spec FR 即可。
