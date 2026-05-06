$r = Invoke-WebRequest -Uri "http://127.0.0.1:3000/api/nodered/data" -TimeoutSec 5
$d = $r.Content | ConvertFrom-Json
Write-Host "Solar:" $d.data.solarPower "W"
Write-Host "Consumo:" $d.data.potencia "W"

$r2 = Invoke-WebRequest -Uri "http://127.0.0.1:3000/api/nodered/lights" -TimeoutSec 5
$l = $r2.Content | ConvertFrom-Json
Write-Host "Luces:" ($l.lights | Measure-Object).Count "encontradas"

$r3 = Invoke-WebRequest -Uri "http://127.0.0.1:3000/api/nodered/air-conditioners" -TimeoutSec 5
$a = $r3.Content | ConvertFrom-Json
Write-Host "Aires:" ($a.airConditioners | Measure-Object).Count "encontrados"