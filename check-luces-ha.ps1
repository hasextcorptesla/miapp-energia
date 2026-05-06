$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjZjk0YzliNDQ5YWI0MDU4OTYyNjY0MzBiOGY1NTQ1ZCIsImlhdCI6MTc2MTI0ODE4NSwiZXhwIjoyMDc2NjA4MTg1fQ.td4gYVW3qHq2zvHXBRu1Kusgep36Ff1UFEHbQwFu1fE"
$url = "http://192.168.90.243:8123/api/states"
$r = Invoke-WebRequest -Uri $url -Headers @{"Authorization"="Bearer $token"} -TimeoutSec 10
$states = $r.Content | ConvertFrom-Json

$entities = @(
    "switch.sonoff_10006944a0",
    "switch.sonoff_1000689d99", 
    "switch.sonoff_1000d10979",
    "switch.sonoff_10014560db",
    "switch.luces_interruptor_1",
    "switch.luces_interruptor_2",
    "switch.luces_interruptor_3"
)

Write-Host "=== LUCES DE HOME ASSISTANT ===" -ForegroundColor Cyan
foreach ($e in $entities) {
    $found = $states | Where-Object { $_.entity_id -eq $e }
    if ($found) {
        Write-Host "$($e): $($found.state)" -ForegroundColor Green
    } else {
        Write-Host "$($e): NO ENCONTRADO" -ForegroundColor Red
    }
}

Write-Host "`n=== SCRIPTS LUCES ===" -ForegroundColor Yellow
$states | Where-Object { $_.entity_id -like "script.encender*" -or $_.entity_id -like "script.apagar*" } | Select-Object entity_id, state | Format-Table