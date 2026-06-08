# 插件化架构 Spec（核心 + 插件生态）

| Metadata | Value |
| :--- | :--- |
| **文档 ID** | `SPEC-PLUGIN-001` |
| **版本** | 1.0.0 |
| **状态** | Draft → 随 PLUGIN-α 迭代细化 |
| **关联** | [product-positioning-spec.md](./product-positioning-spec.md) · [shared-spec.md](./shared-spec.md) · [enterprise-security-spec.md](./enterprise-security-spec.md) |

---

## 1. 产品定位

主流远程桌面为 **封闭单体**；VistaRemote 采用 **「核心 + 插件」** 开放架构，社区可扩展垂直场景，官方保持克制。

### 1.1 官方核心（永不插件化替代）

| 核心能力 | 说明 | 技术 |
| :--- | :--- | :--- |
| **音视频流控** | 1:1 P2P、SFU 多观众、ICE/TURN 策略 | WebRTC + mediasoup（见 webrtc-architecture-spec） |
| **信令与会话** | 房间、票据、权益校验 | NestJS + `shared` 信令 DTO |
| **安全脱敏（AI）** | 敏感操作审计、脱敏策略、企业合规钩子 | `ai` + enterprise-security |
| **身份与计费** | 登录、Plan、FeatureGate | authorization + billing |

> 注：对外话术可提 LiveKit 类 **SFU 抽象**；实现以当前 mediasoup 栈为准，插件不得替换核心传输安全边界。

### 1.2 插件域（社区 / 企业）

| 类别 | 示例 |
| :--- | :--- |
| IT 运维 | 批量脚本、K8s 一键部署 |
| 教育 | 白板、举手、答题 |
| 企业 | 高级审计、DLP 联动 |
| 游戏/极客 | 虚拟手柄、振动驱动 |
| 创意 | 虚拟摄像头、推流、绿幕 |
| 工具 | 增强文件传输、剪贴板、远程打印 |

**上层业务默认插件化**；官方仅提供 **2～3 个基建插件** 作为样板。

---

## 2. 架构原则（Meta-Repo 解耦）

| ID | 原则 |
| :--- | :--- |
| FR-PLUGIN-01 | 插件 **独立 Git 仓库**，禁止污染主仓 `server/src` 等业务目录 |
| FR-PLUGIN-02 | 契约 **唯一** 在 `@vistaremote/shared`（Manifest、权限、API 版本） |
| FR-PLUGIN-03 | 插件生命周期类似 **Chrome Extension / VS Code Extension**（安装、启用、升级、卸载） |
| FR-PLUGIN-04 | 插件崩溃 **不得** 拖垮核心进程（隔离/超时/禁用） |
| FR-PLUGIN-05 | 插件可 **商业授权**（企业定制、内购）；平台抽成策略见 commercial-resources-spec（P2） |

```text
┌─────────────────────────────────────────────────────────┐
│ VistaRemote Core（各端主仓）                             │
│  WebRTC · 信令 · Auth · Billing · AI 脱敏                │
└───────────────────────────┬─────────────────────────────┘
                            │ Plugin Host API（版本化）
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   @acme/k8s-deploy    @edu/whiteboard    @corp/dlp-audit
   (独立 npm/git)       (独立仓库)          (企业私有仓)
```

---

## 3. 插件 Manifest（shared 契约）

**路径（规划）**：`shared/src/plugin/manifest.ts`

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | string | 全局唯一，反向域名 `com.acme.k8s-deploy` |
| `name` | string | 显示名 |
| `version` | semver | 插件版本 |
| `apiVersion` | string | 宿主 API 版本，如 `vistaremote-host/1` |
| `targets` | enum[] | `server` \| `web` \| `desktop` \| `mobile` |
| `permissions` | string[] | 声明能力，如 `signaling.read`、`files.write` |
| `entry` | object | 各端入口路径（npm 包 export 或 bundle URL） |
| `publisher` | object | 作者、签名公钥指纹（PLUGIN-β） |
| `commercial` | optional | `license`: `free` \| `paid` \| `enterprise-only` |

**规则**：

| ID | 规则 |
| :--- | :--- |
| FR-PLUGIN-10 | 未声明 `permission` 的 API **不可调用**（Host 强制） |
| FR-PLUGIN-11 | `apiVersion` 不匹配 → 拒绝加载并提示升级 |
| FR-PLUGIN-12 | Manifest 变更遵循 SemVer；破坏性变更升 major |

---

## 4. 各端注入机制

### 4.1 Server（NestJS）

| 机制 | 说明 |
| :--- | :--- |
| **Dynamic Module** | `PluginModule.register(manifest)` 动态 `imports` |
| **加载源** | 配置目录 / npm 包名列表（非编译进核心） |
| **隔离** | 插件代码运行在独立 Provider 作用域；异常过滤器兜底 |
| **禁止** | 插件直接 `TypeORM` 连核心库表；须经 **Plugin API Service** |

### 4.2 Desktop（Electron）

| 层 | 机制 |
| :--- | :--- |
| **Main** | `PluginHost` 加载 Node 侧插件（子进程或 utilityProcess 优先） |
| **Renderer** | Rsbuild 动态 `import()` 或 sandbox iframe（UI 插件） |
| **IPC** | 仅允许 `plugin-bridge` 白名单通道 |

### 4.3 Web（Rsbuild）

| 机制 | 说明 |
| :--- | :--- |
| 入口 | `pluginRegistry.load(manifest)` 动态 chunk |
| UI | antd 外壳内嵌；样式须 CSS Modules + **BEM** |
| 状态 | 插件内可用 Zustand，**不可** 污染全局 core store |

### 4.4 Mobile（React Native）

| 机制 | 说明 |
| :--- | :--- |
| JS 沙盒 | Hermes 内动态 bundle（OTA 签名后加载，PLUGIN-β） |
| Native | 禁止插件直接加载任意 `.so`；须经核心审批的原生模块白名单 |

---

## 5. 安全与稳定性

| 维度 | 要求 |
| :--- | :--- |
| **权限** | 最小权限；敏感权限需用户/管理员确认 |
| **签名** | PLUGIN-β：发布包 ed25519 签名 + Host 校验 |
| **性能** | 插件 CPU/内存预算；超阈值自动 throttle |
| **网络** | 插件外连域名白名单（企业策略可收紧） |
| **审计** | 插件 API 调用写入 telemetry（Enterprise） |
| **供应链** | 市场仅索引 **锁定 commit/tag** 的 GitHub Release |

---

## 6. 工具链与生态

### 6.1 CLI：`@vistaremote/vt-cli`（PLUGIN-α 起）

| 命令 | 作用 |
| :--- | :--- |
| `vt create plugin` | 脚手架（Manifest、各端 stub、Biome） |
| `vt validate` | 校验 Manifest + apiVersion |
| `vt pack` | 打包签名产物 |
| `vt publish` | 提交到 GitHub 插件索引 PR |

仓库规划：独立 `vistaremote/vt-cli`（不放入 Meta 子目录）。

### 6.2 插件市场（GitHub-Driven，零运维）

| 项 | 说明 |
| :--- | :--- |
| 索引仓 | `vistaremote/plugin-index`（JSON 清单 + CI 校验） |
| 提交 | 插件作者 PR 增加条目：`id`、`repo`、`version`、`sha256` |
| 客户端 | 拉取 index raw → 展示 → 用户确认安装 |
| 文档 | `docs` 站 `/guide/plugin-development` |

### 6.3 官方基建插件（打样）

| 插件 ID | 用途 |
| :--- | :--- |
| `io.vistaremote.plugin.hello` | 最小 Server+Web 示例 |
| `io.vistaremote.plugin.file-transfer-plus` | 增强文件传输（可选 Pro） |

---

## 7. 商业化与社区

| ID | 规则 |
| :--- | :--- |
| FR-PLUGIN-20 | 插件可声明 `commercial.license`；Host 校验 Plan/Entitlement |
| FR-PLUGIN-21 | 企业定制插件可 **私有索引**（不进入公开 market） |
| FR-PLUGIN-22 | 平台与开发者利益绑定：高级审计类插件可 Enterprise 分成（细则 P2） |

社区要求：插件开发规范文档、示例仓库、行为准则（CODE_OF_CONDUCT 延伸）。

---

## 8. 实施路线图（与 ROADMAP 对齐）

| 阶段 | 交付 |
| :--- | :--- |
| **PLUGIN-α** | shared Manifest 类型；Server Dynamic Module 桩；Desktop/Web 加载 hello 插件 |
| **PLUGIN-β** | vt-cli、index 仓、签名、权限强制 |
| **PLUGIN-γ** | 市场 UI、内购/企业授权、RN OTA |

---

## 9. 与现有模块关系

| 模块 | 关系 |
| :--- | :--- |
| billing | `ProductFeature` 可映射 `plugin:<id>` |
| authorization | 插件 permissions 映射 ABAC |
| recording | 录制为 **核心** Pro 能力；插件仅扩展「回放分析」等 |
| ai | 合规/脱敏为核心；插件可挂 **行业模型** 但须经核心队列 |

---

## 10. RFC / Changelog

| 日期 | 版本 | 变更 |
| :--- | :--- | :--- |
| 2026-05-24 | 1.0.0 | 初版：核心边界、Manifest、各端注入、CLI/市场、安全 |
