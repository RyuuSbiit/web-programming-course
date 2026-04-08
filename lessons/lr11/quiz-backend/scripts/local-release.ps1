$ErrorActionPreference = "Stop"

$RootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $RootDir

$Tag = if ($args.Count -gt 0) { $args[0] } else { "local-$((Get-Date).ToString('yyyyMMddHHmmss'))" }
$StateFile = Join-Path $RootDir ".release-state"
$PreviousStateFile = Join-Path $RootDir ".release-state.previous"
$PreviousTag = "none"

if (Test-Path $StateFile) {
  $PreviousTag = (Get-Content $StateFile -Raw).Trim()
}

Write-Host "Previous tag: $PreviousTag"
Write-Host "Building image tag: $Tag"

$env:APP_IMAGE_TAG = $Tag
docker build -t "quiz-backend:$Tag" .
docker compose up -d
powershell -ExecutionPolicy Bypass -File .\scripts\healthcheck.ps1

Set-Content -Path $PreviousStateFile -Value $PreviousTag -NoNewline
Set-Content -Path $StateFile -Value $Tag -NoNewline

Write-Host "Release completed with tag $Tag"

