@echo off
color 0A

echo ==========================================
echo   CorpTesla Energy - Instalador
echo ==========================================
echo.

REM Copiar archivo a Inicio de Windows
copy "C:\Users\iacor\Documents\proyecto\has\Miapp\start-energy-services.bat" "C:\Users\iacor\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\" /Y

if %errorlevel%==0 (
    echo.
    echo [OK] Servicio instalado exitosamente!
    echo [OK] CorpTesla Energy iniciara automaticamente
    echo       cuando Windows arranque.
    echo.
    echo Presiona cualquier tecla para probar ahora...
    pause >nul

    REM Ejecutar el servicio
    call "C:\Users\iacor\Documents\proyecto\has\Miapp\start-energy-services.bat"
) else (
    echo.
    echo [ERROR] No se pudo instalar el servicio.
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
)