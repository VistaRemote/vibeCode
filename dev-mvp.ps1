# VistaRemote MVP 本地调试
# Usage: .\dev-mvp.ps1
#        .\dev-mvp.ps1 -WithDesktop

param([switch]$WithDesktop)

$ErrorActionPreference = "Continue"
$Root = $PSScriptRoot

Write-Host "== VistaRemote MVP ==" -ForegroundColor Cyan
Write-Host "API :3000  |  Web :5173`n"

# 构建 shared
$env:NODE_ENV = "development"
Push-Location (Join-Path $Root "shared")
Write-Host "[1] build shared ..." -ForegroundColor Yellow
corepack enable 2>$null | Out-Null
pnpm build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

# 预编译 server（避免新窗口里 nest 找不到）
Push-Location (Join-Path $Root "server")
Write-Host "[2] server install + build ..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
pnpm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

Push-Location (Join-Path $Root "web")
Write-Host "[3] web install ..." -ForegroundColor Yellow
pnpm install
Pop-Location

$runServer = Join-Path $Root "server\scripts\run-dev.ps1"
$runWeb = Join-Path $Root "web\scripts\run-client-dev.ps1"
$stopPort = Join-Path $Root "tooling\scripts\stop-listener.ps1"

Write-Host "[3b] 释放端口 3000（避免旧 Server 占用导致 404/信令失效）..." -ForegroundColor Yellow
if (Test-Path $stopPort) {
  & $stopPort -Port 3000
}

# MVP 本地勿配 REDIS_URL（未起 Redis 会导致信令扇出失败）
$serverEnv = @"
`$env:NODE_ENV='development'
Remove-Item Env:REDIS_URL -ErrorAction SilentlyContinue
"@
Write-Host "[4] 启动 Server（新窗口）-> $runServer" -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-Command",
  "$serverEnv; & '$runServer'"
)

Write-Host "      等待 http://localhost:3000/health ..." -ForegroundColor DarkGray
$ready = $false
$h = $null
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Seconds 1
  try {
    $h = Invoke-RestMethod -Uri "http://127.0.0.1:3000/health" -TimeoutSec 2
    if ($h.status -eq "ok" -and $h.mvpBuild) { $ready = $true; break }
  } catch { }
}
if (-not $ready) {
  Write-Host ""
  Write-Host "错误: 60 秒内 API 未就绪，或仍是旧 Server（health 无 mvpBuild 字段）。" -ForegroundColor Red
  Write-Host "请关闭所有 Server 窗口后重试；或执行: .\tooling\scripts\stop-listener.ps1 -Port 3000" -ForegroundColor Yellow
  Write-Host "请查看标题为 VistaRemote Server 的窗口中的红色报错。" -ForegroundColor Red
  Write-Host "也可手动执行:" -ForegroundColor Yellow
  Write-Host "  cd server" -ForegroundColor Yellow
  Write-Host "  .\scripts\run-dev.ps1" -ForegroundColor Yellow
  exit 1
}
Write-Host "      Server OK: $($h | ConvertTo-Json -Compress)" -ForegroundColor Green

Write-Host "[5] 启动 Web Client（新窗口）..." -ForegroundColor Yellow
if (-not (Test-Path $runWeb)) {
  $webInline = @"
Set-Location '$Root\web'
`$env:NODE_ENV='development'
corepack enable 2>`$null
Write-Host 'Web -> http://localhost:5173/pairing' -ForegroundColor Green
pnpm dev:client
"@
  Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $webInline
} else {
  Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", $runWeb
  )
}

if ($WithDesktop) {
  $desk = Join-Path $Root "desktop\scripts\run-dev.ps1"
  if (Test-Path $desk) {
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $desk
  }
}

Write-Host "[6] 信令自检 ..." -ForegroundColor Yellow
$e2e = Join-Path $Root "tooling\scripts\mvp-signaling-e2e.mjs"
if (Test-Path $e2e) {
  node $e2e
  if ($LASTEXITCODE -ne 0) {
    Write-Host "信令自检失败：请确认 Server 窗口已用最新代码编译运行。" -ForegroundColor Red
  }
}

Write-Host @"

════════════════════════════════════════════════════════════
  API 健康检查   http://localhost:3000/health
  Web 配对页     http://localhost:5173/pairing

  测试顺序：新 Agent exe → 允许选屏 → 配对页输入码 → /session
  Agent 状态 sent-offer；网页 answered/streaming
  sess 后 8 位需与 Agent 窗口「会话 ID」一致

  若 health 打不开：先保持 Server 窗口不要关，看里面是否有报错。
  单独启动 API：  cd server  然后  .\scripts\run-dev.ps1
════════════════════════════════════════════════════════════

"@ -ForegroundColor Cyan
