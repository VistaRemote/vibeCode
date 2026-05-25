# ADR-0003: 性能热点用 Rust，不用 C++

| Metadata | Value |
| :--- | :--- |
| **状态** | Accepted |
| **日期** | 2026-05-24 |

## 背景

Desktop 捕获、编码、零帧 IPC 等路径需原生优化；需控制内存安全与跨平台构建复杂度。

## 决策

- 原生性能模块放在 `desktop/native/`（及未来必要 crates）
- **语言**：Rust（napi-rs / FFI 至 Electron）
- **禁止**：新增 C++ 业务模块；遗留 C++ 仅通过 Rust 封装或淘汰
- **节奏**：按 [performance-roadmap-spec.md](../spec/performance-roadmap-spec.md) ROI 立项（R1–R6），**不对用户文档承诺时间表**

## 理由

- 内存安全、现代工具链（cargo）、与 TS 通过 N-API 衔接
- 避免 C++ 与 Electron/Node ABI 长期纠缠
- 团队可渐进引入，不阻塞 MVP TS 交付

## 后果

- `desktop/native/README.md` 为占位直至 R1 立项
- PR 引入 `.cpp` 业务代码 → CI/Review 拒绝（除非维护者 ADR 修订）

## 关联

- [desktop-performance-spec.md](../spec/desktop-performance-spec.md)
- [spec/docs-spec.md](../spec/docs-spec.md) FR-DOC-06（用户文档不写 Rust 排期）
