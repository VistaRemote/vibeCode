# VistaRemote Meta-Repo 配置目录

本目录是 **Meta-Repo 的单一配置源（SSOT）**，描述各子仓库的克隆地址、路径与编排顺序。

## 与「meta」npm 工具的区别

| 方式 | 说明 |
| :--- | :--- |
| **[mateodelnorte/meta](https://github.com/mateodelnorte/meta)** | 使用仓库根目录的 **`.meta` 文件**（JSON），需安装 `meta` CLI |
| **VistaRemote（本仓库）** | 使用 **`.meta/manifest.json`** + `tooling/scripts/init-repos.mjs`，**不强制**安装第三方 meta CLI |

二者理念相同：Meta 仓只跟踪规范与脚本，**子目录各自独立 Git**，并在 Meta 根 `.gitignore` 中忽略。

## 文件

| 文件 | 用途 |
| :--- | :--- |
| `manifest.json` | 子仓库列表、远程 URL、安装顺序、是否必选 |
| `config.json` | 组织名、默认分支、克隆协议等默认值 |

## 常用命令

```bash
# 克隆 manifest 中列出的子仓库（首次）
./init.sh              # Windows: .\init.ps1

# 仅克隆部分仓库
pnpm run init:repos
node tooling/scripts/init-repos.mjs --only shared,server,web

# 全栈依赖安装 + shared 构建
./dev.sh               # Windows: .\dev.ps1
```

详见 [spec/meta-repo-development-spec.md](../spec/meta-repo-development-spec.md)。
