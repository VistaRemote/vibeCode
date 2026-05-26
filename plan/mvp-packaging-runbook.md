# MVP 安装包体验指南

在 [mvp-e2e-runbook.md](./mvp-e2e-runbook.md) 开发模式之外，本指南用于 **打包后的桌面端 + Android APK** 体验监控效果。

## 前置

- Node.js >= 24，`corepack enable` 后可用 `pnpm`
- `shared` 已构建：`cd shared && pnpm install && pnpm build`
- **信令服务** 已启动：`cd server && pnpm install && pnpm start:dev`
- Windows 打包桌面端；Android 需 JDK 17 + Android SDK（`ANDROID_HOME`）

## 白屏排查（已修复）

打包版原先 HTML 使用 `/static/...` 绝对路径，在 `file://` 下无法加载。现已改为相对路径 `./static/...`，并用 `app.isPackaged` 区分开发/生产加载方式。

若仍异常，在 exe 同目录设 `VISTAREMOTE_DEBUG=1` 可打开开发者工具。

## 1. 桌面 Agent（被控端）

```powershell
cd desktop
pnpm install
pnpm setup
pnpm pack:agent
```

产物：`desktop/release/agent/VistaRemote-Agent-0.1.0-win.exe`（portable）

运行后窗口显示 **配对码**（需 **先启动 server**，否则显示红色错误提示）。

可将 `desktop/.env.example` 复制为 exe 同目录的 `.env`，设置 `VISTAREMOTE_API_URL` / `VISTAREMOTE_SIGNALING_URL`。

## 2. 桌面 Viewer（监控查看端）

```powershell
cd desktop
pnpm pack:viewer
```

产物：`desktop/release/viewer/VistaRemote-Viewer-0.1.0-win.exe`

打开后默认进入 **配对页**（Hash 路由 `#/pairing`），输入 Agent 配对码即可查看画面。

环境变量（打包前可设，写入 Web 构建）：

- `PUBLIC_API_BASE=http://localhost:3000`
- `PUBLIC_SIGNALING_URL=ws://localhost:3000/signaling`

## 3. Android 主控

```powershell
cd mobile
pnpm install
# 真机：复制 .env.example 为 .env，API 改为电脑局域网 IP，例如 http://192.168.1.10:3000
pnpm android
# 或仅打 debug APK：
pnpm android:apk
```

APK 路径：`mobile/android/app/build/outputs/apk/debug/app-debug.apk`

- **模拟器** 默认 `10.0.2.2` 指向本机 `localhost`
- **真机** 必须与电脑同一局域网，且 server 监听 `0.0.0.0`（Nest 默认即可）

## 体验步骤

1. 启动 `server`（:3000）
2. 运行 **VistaRemote Agent**，记下配对码
3. 运行 **Viewer**（或 Android），输入配对码连接
4. 应看到桌面画面；移动鼠标/点击画面会发送控制事件（Agent 侧显示）

## 已知限制

- 控制通道为 MVP 验证，无系统级键鼠注入
- Android release 签名与商店分发未配置（仅 debug APK）
- 跨网段需自行配置 TURN/STUN（当前用 server 返回的 ICE）
