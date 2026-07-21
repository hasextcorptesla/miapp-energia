$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjZjk0YzliNDQ5YWI0MDU4OTYyNjY0MzBiOGY1NTQ1ZCIsImlhdCI6MTc2MTI0ODE4NSwiZXhwIjoyMDc2NjA4MTg1fQ.td4gYVW3qHq2zvHXBRu1Kusgep36Ff1UFEHbQwFu1fE"
$url = "http://192.168.90.243:8123/api/states"
$r = Invoke-WebRequest -Uri $url -Headers @{"Authorization"="Bearer $token"} -TimeoutSec 10
$states = $r.Content | ConvertFrom-Json

Write-Host "=== SWITCHES (aires) ===" -ForegroundColor Yellow
$states | Where-Object { $_.entity_id -like "switch.aire*" -or $_.entity_id -like "switch.luz*" } | Select-Object entity_id, state | Format-Table -AutoSize

Write-Host "`n=== SENSORES POTENCIA AC ===" -ForegroundColor Yellow
$states | Where-Object { $_.entity_id -like "*aasalon*" -or $_.entity_id -like "*aarecepcion*" -or $_.entity_id -like "*aadiseno*" -or $_.entity_id -like "*aa*" } | Where-Object { $_.entity_id -notlike "*consumo*" -and $_.entity_id -notlike "*energia*" -and $_.entity_id -notlike "*costo*" } | Select-Object entity_id, state | Format-Table -AutoSize