# 当前迭代实施计划（Implementation Plan）

| Metadata | Value |
| :--- | :--- |
| **迭代 ID** | `2026-W21` |
| **里程碑** | M0 → M1 准备 |
| **负责人** | @maintainers（维护者填写） |
| **Spec 契约** | [spec/release-planning-spec.md](../spec/release-planning-spec.md) |

> **规则**：本文件是「本迭代需求契约」的执行清单；迭代结束必须 **自检** 并更新 [implementation-status.md](../spec/implementation-status.md)。

---

## 1. 迭代目标（一句话）

完成团队协作基础设施（路线图、质量门禁、插件架构 Spec、ADR），为 M1（MySQL + JWT）与 PLUGIN-α 立项扫清流程障碍。

---

## 2. 需求契约（本迭代 FR）

| FR ID | 描述 | 验收 | 状态 |
| :--- | :--- | :--- | :--- |
| FR-PLAN-01 | ROADMAP + CHANGELOG + 本 plan 可维护 | 文档合并 Meta | ✅ |
| FR-PLAN-02 | 迭代自检脚本 `pnpm plan:check` | 输出未勾选项 | ✅ |
| FR-PLUGIN-01 | 插件架构 L1 Spec 发布 | plugin-architecture-spec.md | ✅ |
| FR-QUAL-01 | 质量门禁 Spec + AI Review 流程 | quality-gates-spec.md | ✅ |
| FR-ADR-01 | ADR 0001–0004 初版 | adr/ 目录 | ✅ |
| FR-ENG-10 | 前端 Zustand / 禁 Redux / BEM | engineering + frontend spec | ✅ |
| FR-ENG-11 | 后端 UUIDv7 + Controller/Service 分层 | engineering + server spec | ✅ |

---

## 3. 实施清单（执行人勾选）

### 3.1 Meta / 流程

- [x] `ROADMAP.md`、`CHANGELOG.md`
- [x] `spec/release-planning-spec.md`
- [x] `spec/team-collaboration-spec.md`
- [x] `prompts/` 与 README
- [x] `.github` Issue 模板（plugin、tech-debt）

### 3.2 架构与插件

- [x] `spec/plugin-architecture-spec.md`
- [x] `adr/0001`～`0004`
- [ ] `shared` 插件 Manifest 类型（PLUGIN-α，下一迭代）
- [ ] Server `PluginModule` 动态加载桩（下一迭代）

### 3.3 质量

- [x] `spec/quality-gates-spec.md`
- [x] `tooling/scripts/check-implementation-plan.mjs`
- [ ] 各子仓启用 branch protection + 必填 Reviewer（组织设置）

---

## 4. 迭代结束自检（必须执行）

```bash
# Meta-Repo 根目录
pnpm plan:check
```

| 检查项 | 命令/动作 | 通过 |
| :--- | :--- | :--- |
| Plan 未勾选项 | `pnpm plan:check` 无 `[ ]` 或已转入债务 | ☐ |
| Spec 矩阵 | 对照 [implementation-status.md](../spec/implementation-status.md) 更新状态列 | ☐ |
| 架构偏离 | 对照 [architecture-foundation-spec.md](../spec/architecture-foundation-spec.md) F-xx | ☐ |
| CHANGELOG | [CHANGELOG.md](../CHANGELOG.md) Unreleased 已整理 | ☐ |
| 技术债务 | 第 5 节已登记未交付 FR | ☐ |

### 4.1 未按计划实现 → 技术债务

凡 **计划内未完成** 且未延期到下一迭代正式 FR 的项，必须写入下表（不得静默烂尾）：

| 债务 ID | 关联 FR | 说明 | 目标迭代 |
| :--- | :--- | :--- | :--- |
| TD-001 | （示例） | （示例：JWT 守卫未合入） | M1 |

### 4.2 代码偏离架构契约 → 重构任务

| 重构 ID | 偏离描述 | ADR/Spec | 优先级 |
| :--- | :--- | :--- | :--- |
| RF-001 | （示例）Controller 内写 SQL | server-spec §分层 | P1 |

---

## 5. 下一迭代预览（M1 MVP-A）

| 优先级 | 项 |
| :--- | :--- |
| P0 | TypeORM User/Session + UUIDv7 |
| P0 | JWT 签发 + WSS ticket |
| P1 | Web 登录 + 配对鉴权接线 |
| P2 | PLUGIN-α shared manifest 草案 |

---

## 6. RFC / Changelog

| 日期 | 变更 |
| :--- | :--- |
| 2026-05-24 | 初版（M0 协作与插件规划迭代） |
