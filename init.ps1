# Clone all VistaRemote sub-repositories (Windows)
$ErrorActionPreference = "Stop"
$repos = @(
  "server", "desktop", "mobile", "web", "docs", "shared", "deploy", "ai"
)

Write-Host "🚀 Cloning VistaRemote subprojects..." -ForegroundColor Cyan

foreach ($name in $repos) {
  if (Test-Path $name) {
    Write-Host "�?$name already exists" -ForegroundColor Green
  } else {
    git clone "git@github.com:VistaRemote/$name.git"
  }
}

Write-Host ""
Write-Host "🎉 Done. Next:" -ForegroundColor Green
Write-Host "  nvm use   # Node 24.11+"
Write-Host "  .\dev.ps1 # one-shot local setup"
Write-Host "  pnpm setup:subrepo-docs   # LICENSE / SECURITY / CHANGELOG"
Write-Host "  Open vista-remote.code-workspace in Cursor/VS Code"
