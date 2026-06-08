# VistaRemote 新人上手

> 生态通用：[LuminaryWorks/docs — 新人上手](https://github.com/LuminaryWorks/docs/blob/main/docs/develop/onboarding.md)

## MetaRepo vs 子仓

| 模块 | 目录 | 说明 |
|------|------|------|
| 编排 | 本仓 `vibeCode` | `init.sh` 拉子项目 |
| 后端 | `server/` | NestJS · **PostgreSQL**（ADM-1） |
| 管理端 | `web/apps/admin` | OIDC `admin-idp.ts` |
| 客户端 | `web/apps/client` | WebRTC 控制端 |
| 文档 | `docs/` | RsPress（可独立公开） |

```bash
chmod +x init.sh && ./init.sh
pnpm dev:mvp    # 本地 MVP 联调
```

## 快速步骤

1. `LuminaryWorks/identity` + `shared`
2. `cd server` → `@luminaryworks/auth-core` + `IDP_*`
3. Admin Web：`VITE_IDP_*` → `http://localhost:5175` 等（见 server `.env.example`）

## 数据存储

**PostgreSQL**（`deploy/compose/docker-compose.dev.yml` → 宿主机 **:5436**）。`server` 已接 TypeORM + `pg`；ADM-1 将把配对/计费/录制等内存 store 落库。

```powershell
cd deploy/compose
docker compose -f docker-compose.dev.yml up -d postgres
cd ../../server
copy .env.example .env
pnpm start:dev
```

## 身份对接

Admin 路径已接 OIDC；终端用户/房间权限与 Logto 关系见 [identity-roadmap](https://github.com/LuminaryWorks/docs/blob/main/docs/develop/identity-roadmap.md) P2。

详细：[DEVELOPMENT.md](./DEVELOPMENT.md) · [readme.md](./readme.md)
