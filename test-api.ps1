$r = Invoke-WebRequest -Uri "http://127.0.0.1:3000/api/nodered/data" -TimeoutSec 5
Write-Host "Status:" $r.StatusCode
$r.Content