$ErrorActionPreference = "Stop"

$RootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $RootDir

$PreviousStateFile = Join-Path $RootDir ".release-state.previous"

if (-not (Test-Path $PreviousStateFile)) {
  throw "No previous release tag found"
}

$RollbackTag = (Get-Content $PreviousStateFile -Raw).Trim()

if ([string]::IsNullOrWhiteSpace($RollbackTag) -or $RollbackTag -eq "none") {
  throw "Rollback tag is not available"
}

Write-Host "Rolling back to $RollbackTag"
$env:APP_IMAGE_TAG = $RollbackTag
docker compose up -d
powershell -ExecutionPolicy Bypass -File .\scripts\healthcheck.ps1
Set-Content -Path (Join-Path $RootDir ".release-state") -Value $RollbackTag -NoNewline
Write-Host "Rollback completed"

