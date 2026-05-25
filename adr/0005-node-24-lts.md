# ADR-0005: Node.js 24 LTS 为最低运行时

| Metadata | Value |
| :--- | :--- |
| **状态** | Accepted |
| **日期** | 2026-05-24 |
| **取代** | 以 22.12 为推荐线的临时约定 |

## 背景

VistaRemote 为新项目（2026），全栈依赖 Rspack/Rsbuild/Rstest、NestJS 10、Electron。Node 24 于 2025-10 进入 **LTS**；Rspack/Rsbuild 上游已将开发/发布环境迁至 Node 24。

## 决策

- **最低版本**：`engines.node` = **`>=24.0.0`**
- **团队固定版本**：`.nvmrc` = **`24.11.0`**（24.x LTS 线）
- **CI / Docker**：`node-version: 24.11`，镜像 `node:24-alpine`
- **不再支持** Node 22 / 20 作为开发或 CI 基线

## 理由

- Rspack v2 要求 20.19+ **或** 24.11+；Node 24 满足且为当前 LTS 主线
- V8 13.x、npm 11、与上游工具链对齐，降低安全与兼容滞后
- 新项目无历史部署约束，直接采用 LTS 可减少未来再迁移成本

## 后果

- 开发者须 `nvm install 24` / `nvm use`
- 若本地仅装 Node 22，`pnpm install` / CI 将不符合 `engines`
- React Native / Electron 须在其支持矩阵内验证 Node 24（当前团队主开发环境按 24.11 验收）

## 关联

- [meta-repo-development-spec.md](../spec/meta-repo-development-spec.md) §7
- [engineering-standards-spec.md](../spec/engineering-standards-spec.md)
