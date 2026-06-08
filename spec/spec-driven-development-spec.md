# Spec-Driven Development（SDD）规范

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-SDD-001` |
| **版本** | 1.0.0 |
| **关联** | [engineering-standards-spec.md](./engineering-standards-spec.md) · [implementation-status.md](./implementation-status.md) |

---

## 1. 原则

VistaRemote 采用 **Spec 先行、代码跟随**：

```text
需求/用户故事 → 更新 Spec（FR-/US-）→ shared 契约 → 实现 → 测试验收 → 文档站（用户向）
```

| 规则 | 说明 |
| :--- | :--- |
| **Spec 是边界** | 未写入 Spec 的行为视为 **未承诺**；实现不得超出 Spec 静默扩展 |
| **契约在 shared** | 跨端类型、错误码、Job、权限字 **只** 在 `shared` 定义 |
| **可追溯** | PR 必须引用 `FR-xxx` / `US-xxx` 或说明「仅重构无需求变更」 |
| **状态诚实** | 实现进度维护 [implementation-status.md](./implementation-status.md) |

---

## 2. 文档层级

| 层级 | 路径 | 读者 |
| :--- | :--- | :--- |
| **L0** | [system-overview.md](./system-overview.md) | 全员 |
| **L1 领域** | `*-spec.md`（server、webrtc、auth…） | 实现者 |
| **L2 子仓** | `server/spec/SPEC.md` 等 | 单仓开发 |
| **用户文档** | `docs/docs/zh|en/` | 终端用户、实施顾问 |
| **开发手册** | `docs/.../guide/developer-handbook.mdx` | 新开发者 |

**索引入口**：[spec/README.md](./README.md)

---

## 3. 新增功能工作流（Normative）

### 3.1 开始前

1. 在 [implementation-status.md](./implementation-status.md) 确认依赖模块是否 **Ready**
2. 阅读 L0 + 相关 L1 Spec
3. `./dev.sh` 或 `pnpm dev:up` 拉起本地环境

### 3.2 改 Spec（先于代码）

1. 在对应 L1 Spec 增加 **FR-xxx**（需求）与验收标准
2. 若跨端：更新 [shared-spec.md](./shared-spec.md) 与 `shared/src/`
3. 若用户可见：补充 `docs/docs/zh`（及 `en`）用户或指南章节
4. Spec PR 可与实现 PR 同仓，但 **必须先有可读的 Spec diff**

### 3.3 实现顺序（强制）

```text
shared → server / ai → web | desktop | mobile → docs
```

### 3.4 验收

| 类型 | 要求 |
| :--- | :--- |
| 单元测试 | 核心逻辑、权限、策略函数（如 `evaluatePolicy`） |
| 手动 | 按 Spec 验收表操作 |
| 跨端 | 至少覆盖 Spec 声明的端 |

### 3.5 完成

1. 更新 [implementation-status.md](./implementation-status.md) 状态
2. PR 描述含：Spec 链接、FR 列表、测试说明

---

## 4. 需求 ID 约定

| 前缀 | 含义 | 示例 |
| :--- | :--- | :--- |
| `US-xx` | 用户故事（L0） | US-01 浏览器配对控台 |
| `FR-xxx` | 功能需求（模块 Spec） | FR-SRV-08 Admin JWT |
| `SEC-xxx` | 安全 | SEC-03 审计删除链 |
| `FR-ENG-xxx` | 工程 | FR-ENG-04 提交前 lint |

模块前缀见各 Spec Metadata（如 `FR-WRTC`、`FR-TIER`）。

---

## 5. Spec 变更类型

| 类型 | 流程 |
| :--- | :--- |
| **Additive** | 新 FR，旧行为不变 |
| **Breaking** | 主版本 bump `shared`；消费者同步 PR |
| **Clarification** | 仅文字澄清，无代码 |
| **Deferred** | 标为 P2/P3，写入 implementation-status |

---

## 6. AI / Agent 协作

见根目录 [AGENTS.md](../AGENTS.md)：

- 先读 Spec 再写代码
- 输出影响的 FR 与 `shared` 变更
- 不跳过 implementation-status 中的 **Blocked** 依赖

---

## 7. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | SDD 工作流、文档层级、需求 ID |
