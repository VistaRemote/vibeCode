# 统一登录（LuminaryWorks Identity）

VistaRemote Admin Web 与 server 在 `IDP_ISSUER` 配置时接入 LuminaryWorks 中央 Logto。

## 启动

```bash
cd ../../LuminaryWorks/identity
./bootstrap.sh
```

## Admin Web（`web/apps/admin`）

```env
VITE_IDP_ISSUER=http://localhost:3001/oidc
VITE_IDP_CLIENT_ID=<VistaRemote Admin App ID>
VITE_IDP_REDIRECT_URI=http://localhost:5175/auth/callback
```

## Server

```env
IDP_ISSUER=http://localhost:3001/oidc
```

`AdminAuthGuard` 使用 `@luminary/auth-core`（pnpm 安装）。

详见 [LuminaryWorks 统一登录](https://github.com/LuminaryWorks/docs/blob/main/docs/develop/unified-login.md) · [luminaryworks-ecosystem.md](../luminaryworks-ecosystem.md)。
