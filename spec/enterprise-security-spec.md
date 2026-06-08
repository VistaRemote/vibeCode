# 企业安全监控 Spec（L1）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-ENT-SEC-001` |
| **版本** | 0.3.0-draft |
| **套餐** | **Enterprise** |
| **关联** | [ai-platform-spec](./ai-platform-spec.md) · [recording-playback-spec](./recording-playback-spec.md) · [authorization-spec](./authorization-spec.md) |

---

## 1. 目标

为企业客户提供 **可审计、可回放、可告警** 的安全与效率洞察能力，包括：

1. 基于 **关键词** 与 **窗口标题** 的自动录制策略
2. **多屏同步监控**
3. **敏感文件外发**、**大量删除** 等行为识别
4. **屏幕录像回放** 与安全事件时间轴对齐
5. **AI** 学习正常操作模式并标记异常（如长时间非工作网站）
6. **效率报告**：高效 / 低效时段统计

---

## 2. 遥测通道（Agent → Server）

在 WebRTC `DataChannel control` 之外，增加 **`telemetry` 通道**（或独立 HTTPS 批量上报）：

| 事件类型 | 字段 | 频率 |
| :--- | :--- | :--- |
| `window.focus` | `title`, `processName`, `displayIndex`, `ts` | 前台变化时 |
| `file.exfiltration_risk` | `action`, `path`, `destinationHint`, `ts` | 检测时 |
| `file.bulk_delete` | `count`, `pathsSample`, `ts` | 超阈值时 |
| `display.topology` | `displays[]` | 会话开始 + 热插拔 |

类型定义：`shared/src/telemetry/`。

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-ENT-01 | Enterprise 组织可配置策略 JSON 下发到 Agent | 60s 内生效 |
| FR-ENT-02 | 遥测不含键盘具体内容（默认），仅窗口标题与文件元数据 | 隐私评审 |

---

## 3. 策略配置（Organization Policy）

```typescript
interface EnterprisePolicy {
  recording: {
    keywords: string[];           // 窗口标题包含即触发
    windowTitleRegex?: string[];
    multiDisplay: boolean;
    preRollSec: number;           // 触发前环形缓冲
  };
  security: {
    blocklistedProcesses?: string[];
    exfiltrationPatterns: string[];  // 路径/扩展名启发式
    bulkDeleteThreshold: number;     // 如 50 文件/5min
  };
  ai: {
    nonWorkDomains: string[];
    anomalySensitivity: 'low' | 'medium' | 'high';
    weeklyReportEnabled: boolean;
  };
}
```

存储：`organization.policy` JSON（MySQL），Admin 可视化编辑。

**谁可改策略**：`org_owner` / `org_admin`（Client 或 Admin 代管）；`it_support` 只读策略；`security_auditor` 可读策略与事件，不可改。见 [authorization-spec.md](./authorization-spec.md) 组织 RBAC 与 ABAC。

---

## 4. 安全检测（端侧多模型 + 云端 LLM/ML）

执行位置见 [ai-behavior-architecture-spec.md](./ai-behavior-architecture-spec.md)。

| 场景 | 端侧（默认） | 云端（高端/降云） |
| :--- | :--- | :--- |
| 敏感文件外发 | 规则 + 路径启发式 | 规则复核 + 告警关联 |
| 大量删除 | 计数阈值 | 基线偏离 |
| 非工作网站 | 小模型/域名规则 + 时序 | 基线 + LLM 解释 |
| 异常行为 | 滑动窗口统计 | 3σ 基线（ai Job）+ LLM 周报 |

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-ENT-10 | 触发安全事件后自动关联最近录制并置顶 Admin | |
| FR-ENT-11 | 事件 severity：`low`/`medium`/`high`/`critical` | |
| FR-ENT-12 | 支持 Webhook 推送企业 SIEM（P2） | |

---

## 5. 多屏同步监控

```text
Admin 会话页
├── 主控预览（可选）
└── Agent 多屏网格（display 0..N 缩略流）
```

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-ENT-20 | ≤4 屏同时预览 @720p15（可配置） | **mediasoup SFU** 订阅（禁止 N 路 P2P 压满 TURN） |
| FR-ENT-21 | 每屏独立录制轨，回放可切换 | |

---

## 6. 效率报告（Enterprise）

| 指标 | 计算方式 |
| :--- | :--- |
| 高效时长 | 前台窗口 ∈ 工作类域名/应用 |
| 低效时长 | 非工作域名连续 > 阈值 |
| 空闲 | 无输入 + 无前台变化 |

输出：`EfficiencyReport`（JSON + Admin 图表 + 可选 LLM 周报 PDF）。

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-ENT-30 | 周报每周一 08:00 组织时区生成 | `ai` cron |
| FR-ENT-31 | Admin 可按部门/用户筛选 | |

---

## 7. Admin 功能映射

| 菜单 | 功能 |
| :--- | :--- |
| 安全事件 | incident 列表、筛选、跳转回放 |
| 录制中心 | 策略触发录制、手动录制 |
| AI 洞察 | 异常时间线、效率报告 |
| 组织策略 | 关键词、域名、阈值配置 |

---

## 8. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.3.0-draft | 企业安全与效率 Spec |
