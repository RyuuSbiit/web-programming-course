$TargetUrl = if ($args.Count -gt 0) { $args[0] } else { "http://127.0.0.1:3000/health" }

Write-Host "Checking $TargetUrl"
$response = Invoke-WebRequest -Uri $TargetUrl -UseBasicParsing

if ($response.StatusCode -ne 200) {
  throw "Healthcheck failed with status $($response.StatusCode)"
}

Write-Host "Healthcheck passed"

