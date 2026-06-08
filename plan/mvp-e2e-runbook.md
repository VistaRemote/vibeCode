# MVP-B 端到端跑通指南

最小闭环：**配对 → 信令 → WebRTC 画面 → Control DataChannel**。

## 一键启动（推荐）

在 **Meta 仓库根目录** `d:\www\VistaRemote`：

```powershell
.\dev-mvp.ps1
# 含 Desktop Agent 开发模式：
.\dev-mvp.ps1 -WithDesktop
```

会打开 **两个 PowerShell 窗口**（Server + Web），并等待 API 就绪。

### 端口（固定，勿混用）

| 用途 | 地址 |
|------|------|
| **API / 健康检查** | http://localhost:3000/health |
| **Web 配对页** | http://localhost:5173/pairing |
| **信令** | ws://127.0.0.1:3000/signaling |

> 以前 Rsbuild 默认也占用 **3000**，浏览器打开 `localhost:3000` 会看到前端而不是 API。现已将 Web 固定为 **5173**。

**不要用** `localhost:3000` 打开配对页。  
**打包版 Agent/Viewer exe** 不会自动启动 server，必须先 `.\dev-mvp.ps1` 或单独 `cd server && pnpm start:dev`。

## 前置

- Node.js >= 24，pnpm >= 9（`corepack enable`）

## 手动启动（分终端）

```bash
# 1. 信令与配对 API
cd shared && pnpm install && pnpm build
cd server && pnpm install && pnpm start:dev

# 2. Desktop Agent（配对码 + 应答 WebRTC）
cd desktop && pnpm install && pnpm setup && pnpm dev

# 3. Web 主控
cd web && pnpm install && pnpm dev:client
```

环境变量（可选）：

- `VISTAREMOTE_API_URL` / `PUBLIC_API_BASE` = `http://localhost:3000`
- `VISTAREMOTE_SIGNALING_URL` / `PUBLIC_SIGNALING_URL` = `ws://localhost:3000/signaling`

## 操作步骤

1. 确认 http://localhost:3000/health 返回 `{ "status": "ok" }`。
2. 打开 Desktop Agent（或 dev 模式），记下 **配对码**（不再长期卡在「等待 server」）。
3. 浏览器打开 `http://localhost:5173/pairing`（或 Viewer exe），输入配对码。
4. 进入远程会话页，应看到桌面画面；移动鼠标应在 Agent 侧看到控制事件。
5. 若无画面：看会话页 **房间内人数**（应为 2）；点 **重新连接**；展开 **连接诊断**。

**sess 后 8 位** 必须与 Agent「会话 ID」后 8 位一致，否则需重新配对。

诊断 API（dev）：`GET http://localhost:3000/api/v1/debug/signaling/room/{sessionId}`

## 已知 MVP 限制

- 配对与信令会话存于 **内存**，重启 server 失效。
- 控制通道 **仅验证 DataChannel**；系统级键鼠注入见 `desktop-performance-spec` P1。
- 无 JWT；`signalingTicket` 未校验。

## 安装包体验

桌面 Agent + Viewer 与 Android APK 见 [mvp-packaging-runbook.md](./mvp-packaging-runbook.md)。

## GitHub Issues

| 仓库 | Issue | 内容 |
| :--- | :--- | :--- |
| shared | #1 | 信令 SDP / peer-joined |
| server | #1 | peer-joined 广播 |
| web | #1, #2 | 会话页 + 控制通道 |
| desktop | #1, #2 | Agent WebRTC + 控制接收 |
