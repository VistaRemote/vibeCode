# 会话录制与回放 Spec（L1）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-REC-001` |
| **版本** | 1.0.0 |
| **套餐** | Pro、Enterprise（见 [commercial-tier-spec](./commercial-tier-spec.md)） |
| **资源切割** | [commercial-resources-spec.md](./commercial-resources-spec.md) |

---

## 1. 设计结论（先读）

| 决策 | 说明 |
| :--- | :--- |
| **默认录制位置** | **Desktop Agent（被控端）**，非 SFU、非 Server 转码 |
| **减轻 SFU 压力** | mediasoup **不承担** 默认录制；无会话级 FFmpeg 常驻 |
| **上传模型** | 本地 **缓冲环区** → 分片 **断点续传** → 定时/阈值触发上传 |
| **服务端录制（可选）** | **Enterprise** + `recording.sfu_server`：PlainTransport + FFmpeg 裸流拷贝 |
| **商业化** | 云录制+回放 = **Pro+**；SFU 侧录制 = **Enterprise 资源点** |

---

## 2. 职责划分

| 组件 | 职责 |
| :--- | :--- |
| **desktop Agent** | 屏幕采集编码、**本地缓冲环区**、分片生成、断点上传调度 |
| **server** | 录制元数据、presigned URL、配额、回放授权、保留策略 |
| **对象存储** | MinIO / S3 存 fMP4/WebM 分片 |
| **mediasoup-controller** | **仅** 在启用 `recording.sfu_server` 时：PlainTransport + FFmpeg |
| **ai** | 录制完成后摘要（`ai.recording_summarize`，Pro+） |
| **web/admin** | 列表、回放、审计 |

---

## 3. 端侧录制管线（默认，Normative）

```text
┌─────────────────────────────────────────────────────────────┐
│ Desktop Main / 未来 Agent Service                            │
│  MediaStream / 编码器 → 封装(fMP4/WebM 分片)                    │
│         ↓                                                    │
│  BufferZone（环区，默认 max 512MB，可配置）                   │
│         ↓ 每 uploadIntervalSec 或 缓冲达 chunkSize            │
│  UploadScheduler → PUT 分片 → Server complete/heartbeat       │
└─────────────────────────────────────────────────────────────┘
         │ 仅元数据与小文件走 HTTPS；**禁止** IPC 传整段视频
         ▼
   Server Recording + S3
```

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-REC-01 | 分片 **5–10MB**；支持 **断点续传**（segment index + etag） | 网络中断后续传 |
| FR-REC-02 | **缓冲环区**：满则滚动丢弃最旧未上传分片或强制 flush | 磁盘不撑爆 |
| FR-REC-03 | **定时上传** 默认 60s；会话结束 **final flush** | |
| FR-REC-04 | 本地暂存路径可配置；崩溃重启可恢复 `uploadId` | P1 |
| FR-REC-05 | 开始/停止受 `ProductFeature.RECORDING` 约束 | 无权益不启上传 |
| FR-REC-06 | 编码在端侧完成；Server **不** 代理媒体流录制 | 架构评审 |

契约：`shared/src/recording/*`；实现：`desktop/electron/recording/*`。

---

## 4. 录制模式

| 模式 | 套餐 | 触发 | 录制位置 |
| :--- | :--- | :--- | :--- |
| **手动** | Pro | 用户点击「录制」 | Desktop |
| **会话全程** | Pro | Session `connected` 自动（可配置） | Desktop |
| **关键词/窗口** | Enterprise | 窗口标题匹配 + 预滚缓冲 | Desktop |
| **安全事件回溯** | Enterprise | 外发/删文件检测；环区 preRoll | Desktop |
| **SFU 中心录制** | Enterprise + `recording.sfu_server` | Admin 策略或无法装 Agent | **mediasoup + FFmpeg** |

---

## 5. SFU 服务端录制（可选，Enterprise）

**禁止** 作为默认路径。仅当：

- 组织启用 `sfu.recordingEnabled` 且用户具备 `recording.sfu_server`；
- 会话已处于 **SFU** 模式。

```text
Producer (video) ──► PlainTransport ──► FFmpeg (-c copy 或轻量转封装)
                         │
                         ▼
                   分片文件 / 管道上传 S3
```

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-REC-SFU-01 | mediasoup `PlainTransport` + RTP 裸流 | 无重新编解码优先（copy） |
| FR-REC-SFU-02 | FFmpeg 进程隔离；单会话结束即退出 | 无全局常驻占 CPU |
| FR-REC-SFU-03 | 与端侧录制 **互斥** 或双轨需 Admin 显式开启 | 避免重复计费存储 |
| FR-REC-SFU-04 | 无权益时 API 返回 `PLAN_FORBIDDEN` | |

实现：P2 `deploy/mediasoup-controller` 扩展；Spec 占位。

---

## 6. 数据模型（server / MySQL）

| Entity | 字段摘要 |
| :--- | :--- |
| `Recording` | id, sessionId, source (`desktop` \| `sfu_server`), status, storageKey, … |
| `RecordingSegment` | recordingId, index, storageKey, byteSize, uploadedAt, checksum |
| `RecordingUploadState` | deviceId, uploadId, nextSegmentIndex, lastAckIndex |
| `PlaybackToken` | 短期 JWT，scoped recordingId |

---

## 7. API 流程（端侧上传）

```text
POST /api/v1/recordings/start     → uploadId, presignedUrls[], policy
PUT  分片                         → S3/MinIO
POST /api/v1/recordings/heartbeat → 续期、上报进度
POST /api/v1/recordings/complete  → 关闭 → enqueue ai.recording_summarize
```

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-REC-10 | 默认保留 90 天（Pro） | S3 lifecycle |
| FR-REC-11 | 回放 HTTPS 签名 URL，TTL ≤ 1h | |
| FR-REC-12 | 审计：播放、下载 | `audit_log` |
| FR-REC-13 | 月上传量超 `recording.monthlyUploadGb` 拒绝新 start | 402/403 |

---

## 8. 回放（Web）

| ID | 需求 | 验收 |
| :--- | :--- | :--- |
| FR-REC-20 | Pro+ `<video>` / MSE | seek、倍速 |
| FR-REC-21 | Enterprise 时间轴 AI 标记 | |
| FR-REC-22 | Enterprise 多屏轨 | |

---

## 9. Out of Scope

- SFU 默认录制（明确禁止）
- 4K60 默认（企业可选）
- 实时协作批注 on 录制

---

## 10. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 0.3.0-draft | 初稿（未区分端/SFU） |
| 2026-05-24 | 1.0.0 | **端侧默认** + 缓冲环区 + 分片上传；SFU FFmpeg 为 Enterprise 增值 |
