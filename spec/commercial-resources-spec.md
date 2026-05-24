# 商业化资源点与功能切割 Spec

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-TIER-RES-001` |
| **版本** | 1.0.0 |
| **关联** | [commercial-tier-spec.md](./commercial-tier-spec.md) · [recording-playback-spec.md](./recording-playback-spec.md) · [webrtc-architecture-spec.md](./webrtc-architecture-spec.md) |

---

## 1. 原则

| 原则 | 说明 |
| :--- | :--- |
| **默认轻服务端** | 媒体、编码、磁盘缓冲优先在 **端侧**；Server/SFU 只做信令、元数据、对象存储签名 |
| **重资源 = 付费点** | 消耗 CPU/带宽/存储/LLM 的能力映射 `ProductFeature`，SSOT：`shared/src/billing/entitlements.ts` |
| **可观测** | Admin 展示套餐与资源型开关；审计 `plan_changed`、录制配额 |

---

## 2. 资源型能力目录

| ProductFeature | 资源消耗点 | 默认实现位置 | Trial | Free | Pro | Ent |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `webrtc.sfu` | mediasoup CPU/UDP、机房带宽 | SFU 侧车 | ✓ | — | ✓ | ✓ |
| `recording` | 端侧编码磁盘；**上传**占用出口与 S3 | **Desktop 缓冲+分片上传** | — | — | ✓ | ✓ |
| `recording.sfu_server` | SFU **PlainTransport + FFmpeg** 转码/落盘 | mediasoup-controller | — | — | — | ✓ |
| `ai.cloud_infer` | 云端 GPU/LLM | `ai` Worker | ✓ | — | — | ✓ |
| `ai.recording_summarize` | 录制完成后 LLM+RAG | `ai` BullMQ | — | — | ✓ | ✓ |
| `telemetry.enterprise` | 高频事件入库 | server + MySQL | — | — | — | ✓ |
| `storage.recording_quota` | 对象存储容量 | MinIO/S3 生命周期 | — | — | 配额 | 可配 |

> **不在 SFU 上默认录制** — 见 [recording-playback-spec.md](./recording-playback-spec.md)。  
> **服务端录制** 为 Enterprise 增值项，需显式开启且校验 `recording.sfu_server`。

---

## 3. 录制策略（Normative）

```text
默认（Pro+）:
  Desktop 采集 → 本地缓冲环区 → 定时/阈值触发分片上传 → Server 元数据 + S3
  SFU 路径: 不录制（零 mediasoup 磁盘/FFmpeg 负载）

可选（Enterprise + recording.sfu_server）:
  mediasoup Producer → PlainTransport → FFmpeg 裸流拷贝 → 分片落盘/上传
  用于「无法安装 Agent」或合规要求中心侧留痕的场景
```

---

## 4. 配额与策略（Admin 可配）

| 策略键 | 说明 | 默认 |
| :--- | :--- | :--- |
| `recording.retentionDays` | 云存储保留 | Pro 90 / Ent 可延长 |
| `recording.monthlyUploadGb` | 组织月上传上限 | Pro 50 / Ent 合同 |
| `recording.localBufferMaxMb` | Agent 本地环区上限 | 512 |
| `recording.uploadIntervalSec` | 定时上传间隔 | 60 |
| `sfu.recordingEnabled` | 是否允许 SFU 侧录制 | false |

---

## 5. Enforcement 映射

| 场景 | Feature | 组件 |
| :--- | :--- | :--- |
| 第二观众 / SFU 模式 | `webrtc.sfu` | `SignalingService` |
| Desktop 开始云录制上传 | `recording` | `desktop/recording` + server `RecordingService` |
| 请求 SFU PlainTransport 录制 | `recording.sfu_server` | mediasoup-controller + server |
| 入队 cloud_infer | `ai.cloud_infer` | `AiQueueService` |
| 入队 summarize | `ai.recording_summarize` | BullMQ |

---

## 6. SKU 扩展（P1）

可在 `PRODUCT_CATALOG` 增加：

- `addon_sfu_recording` — 单独买断服务端录制（非 Ent 全包客户）

---

## 7. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 资源点目录；端侧默认录制；SFU 录制 Enterprise |
