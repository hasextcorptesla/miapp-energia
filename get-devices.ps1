$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjZjk0YzliNDQ5YWI0MDU4OTYyNjY0MzBiOGY1NTQ1ZCIsImlhdCI6MTc2MTI0ODE4NSwiZXhwIjoyMDc2NjA4MTg1fQ.td4gYVW3qHq2zvHXBRu1Kusgep36Ff1UFEHbQwFu1fE"
$url = "http://192.168.90.243:8123/api/states"
$r = Invoke-WebRequest -Uri $url -Headers @{"Authorization"="Bearer $token"} -TimeoutSec 10
$states = $r.Content | ConvertFrom-Json

Write-Host "=== LUCES (light) ===" -ForegroundColor Yellow
$states | Where-Object { $_.entity_id -like "light.*" } | Select-Object entity_id, state, attributes.friendly_name | Format-Table -AutoSize

Write-Host "`n=== AIRES ACONDICIONADOS ===" -ForegroundColor Yellow
$states | Where-Object { $_.entity_id -like "*climate*" -or $_.entity_id -like "*aa*" -or $_.entity_id -like "*aire*" -or $_.entity_id -like "*ac*" } | Select-Object entity_id, state, attributes.friendly_name | Format-Table -AutoSize