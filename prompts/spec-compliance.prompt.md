# VistaRemote — Spec Compliance Prompt

对照 **Spec-Driven Development** 检查 PR 是否越界或未文档化。

## 步骤

1. 从 PR 描述提取 FR/US ID
2. 打开对应 `spec/*-spec.md` 阅读 FR 验收标准
3. 对照 [implementation-status.md](../spec/implementation-status.md) 状态
4. 若行为变更无 Spec diff → **阻塞**

## 输出

- 已覆盖 FR 列表
- 缺失 Spec 的变更
- 建议更新的 status 矩阵行
