$source = "C:\Users\iacor\Documents\proyecto\has\Miapp\start-energy-services.bat"
$dest = "C:\Users\iacor\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\CorpTesla-Energy.bat"

Write-Host "=========================================="
Write-Host "  CorpTesla Energy - Instalador"
Write-Host "=========================================="
Write-Host ""

try {
    Copy-Item -Path $source -Destination $dest -Force
    Write-Host "[OK] Servicio instalado exitosamente!" -ForegroundColor Green
    Write-Host "[OK] CorpTesla Energy iniciara automaticamente" -ForegroundColor Green
    Write-Host "     cuando Windows arranque." -ForegroundColor Green
    Write-Host ""
    Write-Host "Archivos creados:" -ForegroundColor Cyan
    Write-Host "  - $source" -ForegroundColor Gray
    Write-Host "  - $dest" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "[ERROR] No se pudo instalar el servicio." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}