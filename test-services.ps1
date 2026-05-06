try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/api/nodered/data" -TimeoutSec 5
    Write-Host "Backend: OK"
    $j = $r.Content | ConvertFrom-Json
    Write-Host "  Solar:" $j.data.solarPower "W"
    Write-Host "  Consumo:" $j.data.potencia "W"
} catch {
    Write-Host "Backend: ERROR" $_.Exception.Message
}

try {
    $r2 = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
    Write-Host "Frontend: OK"
} catch {
    Write-Host "Frontend: ERROR" $_.Exception.Message
}