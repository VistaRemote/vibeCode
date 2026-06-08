# VistaRemote 环境配置

| 文件 | 用途 |
| :--- | :--- |
| `local.env` | 本机 Docker + localhost API |
| `dev.env` | 远程开发环境 |
| `sit.env` | 集成测试 |
| `uat.env` | 用户验收 |

切换后写入各子仓库 `.env`，**重启**对应 dev 进程生效。

```bash
# Meta-Repo 根目录
pnpm env:local    # 或 dev / sit / uat
pnpm dev:up       # 一键本地基础设施 + 安装依赖
```

当前激活环境记录在根目录 `.vista-env`。
