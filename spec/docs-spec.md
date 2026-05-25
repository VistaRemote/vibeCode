# Docs 文档站 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-DOC-001` |
| **仓库** | `docs/` |
| **技术栈** | Rspress, MDX, TypeScript |
| **版本** | 0.3.0 |

---

## 1. 职责

VistaRemote **对外技术文档引擎**：架构说明、API 参考、部署指南、贡献者文档；与 Meta-Repo 中 `spec/` **互补**——`spec/` 面向实现与 AI，`docs/` 面向人与社区。

| 内容类型 | 位置 |
| :--- | :--- |
| 规格与合规边界 | Meta-Repo `spec/`（源） |
| 教程、部署、API 详情 | `docs/` 仓库 |
| 白皮书 | Meta-Repo `docs/whitepaper.md`（同步至 Rspress） |

---

## 2. 信息架构（目标）

```text
docs/
├── docs/
│   ├── index.mdx
│   ├── guide/
│   │   ├── quick-start.mdx
│   │   ├── developer-handbook.mdx
│   │   ├── spec-driven-development.mdx
│   │   ├── feature-development.mdx
│   │   ├── pairing.mdx
│   │   └── admin-getting-started.mdx
│   ├── user/                    # 终端用户（非开发）
│   │   ├── remote-control.mdx
│   │   ├── plans-and-billing.mdx
│   │   ├── admin-console.mdx
│   │   └── faq.mdx
│   ├── architecture/
│   │   ├── positioning.mdx
│   │   ├── desktop-performance.mdx
│   │   ├── overview.mdx
│   │   ├── tech-advantages.mdx    # 技术选型产品优势（决策者/运维/开发）
│   │   ├── job-queue.mdx          # BullMQ 选型（源自 job-queue-spec）
│   │   ├── ai-platform.mdx
│   │   ├── messaging-transport.mdx
│   │   ├── webrtc-topology.mdx
│   │   ├── meta-repo.mdx
│   │   └── positioning.mdx        # 源自 positioning-and-advantages.md
│   ├── engineering/
│   │   ├── implementation-status.mdx
│   │   └── git-workflow.mdx
│   ├── api/
│   │   └── server-rest.mdx
│   ├── deploy/
│   │   └── docker.mdx
│   └── whitepaper/
│       └── index.mdx          # 从 whitepaper.md 同步或引用
├── rspress.config.ts
└── package.json
```

---

## 3. 功能需求

| ID | 需求 | 验收标准 |
| :--- | :--- | :--- |
| FR-DOC-01 | 中英双语导航（至少首页与快速开始） | `zh` / `en` locale |
| FR-DOC-02 | 代码块支持 TS/Bash/JSON 高亮 | |
| FR-DOC-03 | 搜索（Rspress 内置） | 可搜到 WebRTC、配对 |
| FR-DOC-04 | 每个公共 REST/WS 消息链接到 shared 类型说明 | 无重复定义字段 |
| FR-DOC-05 | CI 构建静态站并部署（GitHub Pages / 自有 CDN） | PR 预览 |
| FR-DOC-06 | 不写内部性能路线图（Rust/R1–R6） | 工程细节在 `spec/` |

---

## 4. 与 Spec 同步规则

1. **API 变更**：先改 `shared` + `server-spec`，再改 `docs/api/*`。
2. **架构变更**：先改 `system-overview.md`，再摘抄至 `docs/architecture/*`。
3. 白皮书重大版本发布时，更新 `docs/whitepaper/index.mdx` 的「版本」页眉。
4. **性能/Rust 路线图**：仅维护于 Meta-Repo `spec/performance-roadmap-spec.md`；**禁止**在 `docs/` 用户向页面写 R1–R6、Rust 排期或未交付承诺（FR-DOC-06）。

---

## 5. 非功能需求

| ID | 需求 | 目标 |
| :--- | :--- | :--- |
| NFR-DOC-01 | 生产构建 | Rspack 冷构建 < 90s |
| NFR-DOC-02 | Lighthouse 可访问性 | ≥ 90 |

---

## 6. Out of Scope

- 自动从 OpenAPI 生成（P1 可选）
- 视频课程托管

---

## 7. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.1.0-draft | 初稿 |
| 2026-05-24 | 0.2.0-draft | 管理端入门文档 IA |
| 2026-05-24 | 0.3.0 | Rspress 2 站点落地；zh/en；CI build |
| 2026-05-24 | 0.3.1 | 工程规范文档：Biome、Git/PR、contributing-workflow |
| 2026-05-24 | 0.4.0 | user/* 用户指南；guide 开发者手册与 SDD；implementation-status |
| 2026-05-24 | 0.5.0 | positioning 二开/选型；desktop-performance；customization |
| 2026-05-24 | 0.5.1 | **性能路线图仅 spec/**；docs 不写 Rust/R1–R6 排期 |
