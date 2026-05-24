# VistaRemote one-shot local bootstrap (Windows)
# Usage: .\dev.ps1
#        .\dev.ps1 -SkipDocker
#        .\dev.ps1 -Env dev

param(
  [switch]$SkipDocker,
  [switch]$WithAi,
  [string]$Env = "local"
)

$args = @("tooling/scripts/dev-up.mjs", "--env=$Env")
if ($SkipDocker) { $args += "--skip-docker" }
if ($WithAi) { $args += "--with-ai" }

node @args
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
