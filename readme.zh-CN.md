# VibeCode | VistaRemote 🚀

[English](./README.md) | [简体中文](./README.zh-CN.md)

> 跨平台的实时远程桌面控制系统

立足中国，面向全球开源社区的国际化项目。VistaRemote 是 VibeCode 的核心项目之一：以 **WebRTC** 实现低延迟远程控制（相对传统录屏监控的「事后回看」），以 **可私有化部署的 AI** 提供录制、审计与行为洞察。**全栈 TypeScript + MySQL**，方便国内团队招聘、二开与 Docker 部署。

**核心优势**：[WebRTC · 开源可自建 · AI 数据可控 · TS 全栈 · 二开快 · 非千万并发场景优选](./docs/docs/zh/architecture/positioning.mdx)

- **二开/交付**：全栈 TypeScript + Spec 驱动，Meta-Repo 避免 Monorepo 构建黑洞，Rsbuild 冷启动数百毫秒级。
- **性能**：Web WebCodecs · Mobile JSI · Desktop GPU 编码与零帧 IPC（详见文档站「Desktop 性能架构」）。
- **跨端 UI**：**React + RN**（非 Flutter）；截屏/编码/Hook 由 **Rust**（N-API）— 见 [ADR-0007](./adr/0007-no-flutter-cross-platform-ui.md)。

为确保跨端环境（Node.js, React Native, Electron）的构建稳定性与灵活性，本项目采用 **Multi-repo** 架构进行解耦管理。本仓库是 VistaRemote 的 **Meta-Repo（元仓库）**，用于快速初始化开发环境、统筹全局文档以及进行跨端联调。

**新成员**：`./init.sh` 与 `./dev.sh`（Windows：`.\init.ps1`、`.\dev.ps1`）。开发入口见 **[DEVELOPMENT.md](./DEVELOPMENT.md)**。切换 Dev/SIT/UAT API：`pnpm env:dev` 后重启各端。仅在 `desktop`/`mobile` 仓库时在仓内执行 `pnpm setup`。详见 [开发者手册](./docs/docs/zh/guide/developer-handbook.mdx) 与 [本地开发指南](./docs/docs/zh/guide/local-development.mdx)。

---

## 🏗 架构全览

VistaRemote 生态系统由以下 **8** 个独立的代码仓库组成（运行 `./init.sh` 拉取）：

| 模块 | 仓库名 | 技术栈 | 职责描述 |
| :--- | :--- | :--- | :--- |
| **服务端** | `server` | NestJS, TypeORM, **MySQL** | 信令、**全用户管理台 API**、套餐、录制元数据、审计 |
| **AI 分析** | `ai` | NestJS, BullMQ, LLM | 摘要、异常检测、效率报告（与 server 解耦） |
| **桌面端** | `desktop` | Electron, Rsbuild, Ant Design | 被控 Agent；渲染进程与 Web 同构（antd + Sass） |
| **移动端** | `mobile` | React Native, antd-mobile | 移动端主控，Metro 打包 |
| **网页端** | `web` | Rsbuild, Ant Design, Sass | **用户端** `apps/client` + **管理端** `apps/admin` 双应用 |
| **协议层** | `shared` | TypeScript | 核心的类型定义、WebRTC SDP 结构、远程控制指令规范 |
| **文档站** | `docs` | Rspress, MDX | 架构、API、部署与产品定位文档 |
| **部署** | `deploy` | Docker Compose | **MySQL**、Redis、MinIO、server、ai、双 Web 一键模板 |

---

## 🚀 快速开始

### 1. 环境准备

确保你的本地开发环境已安装以下工具：

- **Git**
- **Node.js** ≥ 24.0.0（推荐 **24.11 LTS**，见 .nvmrc；Rspack/Rstest 工具链要求）
- **pnpm** ≥ 9（与 packageManager 锁定版本一致）

### 2. 一键初始化

克隆本仓库后，在根目录下运行初始化脚本，自动拉取所有子项目代码：

```bash
# 赋予脚本执行权限
chmod +x init.sh

# 执行克隆脚本
./init.sh
```

## 🔀 Git 协作规范 (必读)

VistaRemote 采用平铺式的 Meta-Repo 架构。**我们绝不使用 `git submodule` 或 `git subtree`**。
所有的子项目（`server`, `desktop`, `shared` 等）都拥有自己独立的 `.git` 目录。

- **提交原则**：你必须在具体的子目录中进行 `git commit` 与 `git push`。
- **IDE 推荐**：强烈建议使用 **Cursor / VS Code 的多根工作区 (Multi-Root Workspace)** 或 **IntelliJ 的目录映射 (Directory Mappings)** 功能，在统一的界面中同时管理 6 个仓库的变更。
- IDE、Biome、Git/PR、CI/CD：[CONTRIBUTING.md](./CONTRIBUTING.md) · 文档站 `/engineering/cicd-release` · [Spec: CI/CD 与发布](./spec/cicd-release-spec.md) · [Spec: 工程规范](./spec/engineering-standards-spec.md) · [Spec: Git 协作](./spec/git-collaboration-spec.md)

---

## 📋 Spec 与白皮书

本项目采用 **Spec-Driven Development**，实现前请先阅读规格说明：

| 文档 | 说明 |
| :--- | :--- |
| **[DEVELOPMENT.md](./DEVELOPMENT.md)** | **开发入口**（命令、Spec 阅读顺序） |
| [Spec 索引](./spec/README.md) | SDD 流程与各模块 Spec 目录 |
| [SDD 规范](./spec/spec-driven-development-spec.md) | FR/US、实现顺序、PR 义务 |
| [实现状态](./spec/implementation-status.md) | 可开发范围 vs 待办 |
| [系统总览 Spec](./spec/system-overview.md) | WebRTC P2P/SFU、信令、安全与里程碑 |
| [前端工具链 Spec](./spec/frontend-toolchain-spec.md) | Rsbuild、Ant Design、Sass；非 Flutter |
| [Web 用户端 / 管理端](./spec/web-client-spec.md) | 双应用职责与验收 |
| [套餐与试用](./spec/commercial-tier-spec.md) | SFU/降云试用后付费；Pro/Enterprise |
| [开源与商业授权](./spec/licensing-spec.md) | 个人非盈利免费；商业一律收费 |
| [大模型微调（闭源）](./spec/ai-finetune-spec.md) | 独立私有仓建设 |
| [AI 平台架构](./spec/ai-platform-spec.md) | 是否独立 `ai` 仓库、技术选型 |
| [文档站（Rspress）](./docs/README.md) | `cd docs && pnpm dev` → 开发者手册 `/guide/developer-handbook`、用户指南 `/user/remote-control` |
| [白皮书源文件](./docs/docs/zh/whitepaper/index.mdx) | Rspress 内容目录 |
| [产品定位源文件](./docs/docs/zh/architecture/positioning.mdx) | Rspress 内容目录 |
| [技术选型优势](./docs/docs/zh/architecture/tech-advantages.mdx) | 决策者 / 运维 / 开发者 |
| [跨端技术栈](./docs/docs/zh/architecture/cross-platform-stack.mdx) | 为何不用 Flutter |

## 开源协议

- **个人、非盈利使用**：免费，见根目录 [LICENSE](./LICENSE)。
- **商业使用**：须签署 [商业许可](./COMMERCIAL-LICENSE.md)（任何商业使用均收费）。
- **试用**：默认 14 天可体验 **SFU** 与 **AI 降云**；结束后续 Pro/Enterprise，见 `spec/commercial-tier-spec.md`。
- **大模型微调**：闭源独立项目，见 `spec/ai-finetune-spec.md`。
