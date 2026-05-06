[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjZjk0YzliNDQ5YWI0MDU4OTYyNjY0MzBiOGY1NTQ1ZCIsImlhdCI6MTc2MTI0ODE4NSwiZXhwIjoyMDc2NjA4MTg1fQ.td4gYVW3qHq2zvHXBRu1Kusgep36Ff1UFEHbQwFu1fE"
$url = "http://192.168.90.243:8123/api/states"
try {
    $r = Invoke-WebRequest -Uri $url -Headers @{"Authorization"="Bearer $token"} -TimeoutSec 10
    Write-Host "OK - Length:" $r.Content.Length
} catch {
    Write-Host "Error:" $_.Exception.Message
}