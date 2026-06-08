# VistaRemote MVP 最小跑通（必读）

## 1. 一键启动

```powershell
cd d:\www\VistaRemote
.\dev-mvp.ps1
```

- 自动开 **Server**、**Web** 两个窗口  
- 末尾应出现：`OK: signaling e2e passed`  
- 脚本会 **自动释放 3000 端口**，避免旧 Server 占用（否则诊断 HTTP 404、收不到 offer）  
- 健康检查须含 **`mvpBuild`**（如 `20260525-b3`），否则会提示旧 Server  
- **不要**在 `server\.env` 里保留未注释的 `REDIS_URL`（没有 Redis 时信令会丢包）

若已有 `server\.env` 且含 `REDIS_URL=`，请注释掉该行后 **关掉 Server 窗口再重新** `.\dev-mvp.ps1`。

## 2. Agent

```powershell
cd d:\www\VistaRemote\desktop
.\scripts\pack-agent.ps1
```

运行：`desktop\release\agent\VistaRemote-Agent-0.1.0-win.exe` → **允许选屏**。

## 3. 浏览器

1. 打开 http://localhost:5173/pairing  
2. 输入 **当前** Agent 配对码（不要用旧书签 `/session`）  
3. 进入会话页，确认 **sess 后 8 位** 与 Agent「会话 ID」一致  
4. 应看到：**房间内已有 2 人** → Agent `sent-offer` → 页面 `streaming` 有画面  

## 4. 仍黑屏？

| 现象 | 处理 |
|------|------|
| 诊断「房间内 0/1 人」 | Agent 重启过 → **重新配对** |
| 只有 `join sent`、无 `offer from` | **重启 Server**（见上 REDIS_URL） |
| 房间只有 `ctrl_*`、1 人 | **重装/重启 Agent**；Agent 应显示「信令房间：2 人」 |
| 诊断 HTTP 403/404 | 关 Server 窗口 → `.\dev-mvp.ps1` |

## 5. 文档

- [ROADMAP.md](./ROADMAP.md) — 全项目迭代  
- [spec/mvp-core-flow-spec.md](./spec/mvp-core-flow-spec.md) — 验收表  
- [plan/mvp-e2e-runbook.md](./plan/mvp-e2e-runbook.md) — 详细步骤  
