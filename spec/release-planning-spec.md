# 版本迭代与发布规划 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-RELEASE-001` |
| **版本** | 1.0.0 |
| **关联** | [ROADMAP.md](../ROADMAP.md) · [plan/implementation-plan.md](../plan/implementation-plan.md) · [implementation-status.md](./implementation-status.md) |

---

## 1. 目标

为 **多人协作** 提供可执行的「需求契约 + 迭代规划 + 状态同步」机制，避免口头约定与 Spec/代码脱节。

---

## 2. 文档体系（Normative）

| 文档 | 路径 | 更新者 | 频率 |
| :--- | :--- | :--- | :--- |
| **路线图** | `ROADMAP.md` | 维护者 | 里程碑切换时 |
| **变更记录** | `CHANGELOG.md` | PR 作者（用户可见时） | 每次发布 |
| **当前迭代计划** | `plan/implementation-plan.md` | 迭代负责人 | 每 Sprint 开始/结束 |
| **实现矩阵** | `spec/implementation-status.md` | 合并 PR 者 | 影响 FR 时 |
| **架构就绪** | `spec/architecture-foundation-spec.md` | 基建 PR | F-xx 状态变化时 |

---

## 3. 需求契约（迭代级）

每个迭代在 `plan/implementation-plan.md` **必须** 包含：

| 章节 | 内容 |
| :--- | :--- |
| 迭代 ID | 如 `2026-W21` 或 `M1-S1` |
| 里程碑 | 对应 ROADMAP 的 Mx |
| FR 表 | FR ID、描述、验收、状态（✅/🟡/⬜） |
| 实施清单 | 可勾选 `- [ ]` 任务 |
| 自检表 | 迭代结束强制执行 |
| 技术债务表 | 未完成 FR |
| 重构任务表 | 偏离架构契约的代码 |

**规则**：

| ID | 规则 |
| :--- | :--- |
| FR-PLAN-10 | 无 FR ID 的用户可见能力不得进入 `main`（紧急 hotfix 除外，事后补 Spec） |
| FR-PLAN-11 | FR 必须映射到 L1 Spec 中的 FR-xxx 或新建 FR |
| FR-PLAN-12 | 迭代结束未交付 FR → **技术债务** 表，并指定目标迭代 |

---

## 4. 自检流程（迭代结束）

```text
pnpm plan:check
    → 列出 implementation-plan 未勾选条目
    → 对照 implementation-status 更新矩阵
    → 登记技术债务 / 重构任务
    → 更新 CHANGELOG [Unreleased]
    → ROADMAP 当前冲刺一节
```

| ID | 规则 |
| :--- | :--- |
| FR-PLAN-20 | `pnpm plan:check` 在 Meta-Repo CI 可选执行（`meta-ci.yml`） |
| FR-PLAN-21 | 未按计划实现 → `TD-xxx` 技术债务，禁止从计划中删除而不登记 |
| FR-PLAN-22 | 代码偏离 F-xx / ADR → `RF-xxx` 重构任务，关联 ADR 编号 |

---

## 5. 里程碑定义（与 ROADMAP 同步）

| 里程碑 | 完成标准（摘要） |
| :--- | :--- |
| M0 | F-01～F-10 ✅（见 architecture-foundation） |
| M1 | F-11、F-12 ✅ |
| M2 | F-13 ✅（1:1 远程闭环） |
| M6 | PLUGIN-α：Manifest + 单端样例插件可加载 |
| M7 | PLUGIN-β：市场索引 + 签名验证 |

---

## 6. 与 SDD 的关系

```text
ROADMAP（方向）
  → implementation-plan（本迭代契约）
    → L1 Spec FR（长期边界）
      → shared 契约
        → 代码
          → implementation-status（诚实状态）
```

详见 [spec-driven-development-spec.md](./spec-driven-development-spec.md)。

---

## 7. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 初版：路线图、plan 自检、技术债务/重构登记 |
