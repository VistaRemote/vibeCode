# MVP-B 端到端跑通指南

最小闭环：**配对 → 信令 → WebRTC 画面 → Control DataChannel**。

## 前置

- Node.js >= 24，pnpm >= 9
- 已构建 `shared`：`cd shared && pnpm install && pnpm build`

## 启动顺序

```bash
# 1. 信令与配对 API
cd server && pnpm install && pnpm start:dev

# 2. Desktop Agent（配对码 + 应答 WebRTC）
cd desktop && pnpm install && pnpm setup && pnpm dev

# 3. Web 主控（Rsbuild 默认端口见 web/apps/client）
cd web && pnpm install && pnpm dev:client
```

环境变量（可选）：

- `PUBLIC_API_BASE` / `VISTAREMOTE_API_URL` = `http://localhost:3000`
- `PUBLIC_SIGNALING_URL` / `VISTAREMOTE_SIGNALING_URL` = `ws://localhost:3000/signaling`

## 操作步骤

1. 打开 Desktop Agent 窗口，记下 **配对码**。
2. 浏览器打开 Client（如 `http://localhost:5173/pairing`），输入配对码并连接。
3. 进入 **远程会话** 页，应看到桌面画面；移动鼠标应能在 Agent 侧看到控制事件提示。

## 已知 MVP 限制

- 配对与信令会话存于 **内存**，重启 server 失效。
- 控制通道 **仅验证 DataChannel**；系统级键鼠注入见 `desktop-performance-spec` P1。
- 无 JWT；`signalingTicket` 未校验。

## GitHub Issues

| 仓库 | Issue | 内容 |
| :--- | :--- | :--- |
| shared | #1 | 信令 SDP / peer-joined |
| server | #1 | peer-joined 广播 |
| web | #1, #2 | 会话页 + 控制通道 |
| desktop | #1, #2 | Agent WebRTC + 控制接收 |
