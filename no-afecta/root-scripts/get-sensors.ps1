$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjZjk0YzliNDQ5YWI0MDU4OTYyNjY0MzBiOGY1NTQ1ZCIsImlhdCI6MTc2MTI0ODE4NSwiZXhwIjoyMDc2NjA4MTg1fQ.td4gYVW3qHq2zvHXBRu1Kusgep36Ff1UFEHbQwFu1fE"
$url = "http://192.168.90.243:8123/api/states"
$r = Invoke-WebRequest -Uri $url -Headers @{"Authorization"="Bearer $token"} -TimeoutSec 10
$states = $r.Content | ConvertFrom-Json
$states | Where-Object { $_.entity_id -like "*importado*" -or $_.entity_id -like "*exportado*" -or $_.entity_id -like "*consumo*" -or $_.entity_id -like "*solar*" -or $_.entity_id -like "*inverter*" -or $_.entity_id -like "*power*" -or $_.entity_id -like "*grid*" } | Select-Object entity_id, state, attributes.friendly_name | Format-Table -AutoSize