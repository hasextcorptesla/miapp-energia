@echo off
title CorpTesla Energy Services
color 0A

REM Navegar al proyecto
cd /d C:\Users\iacor\Documents\proyecto\has\Miapp

REM Iniciar Backend en nueva ventana (minimizado)
echo [*] Iniciando Backend (Node.js)...
start /MIN "CorpTesla-Backend" cmd /k "cd /d C:\Users\iacor\Documents\proyecto\has\Miapp\backend && node src/index.js"

REM Esperar 3 segundos
timeout /t 3 /nobreak >nul

REM Iniciar cloudflared tunnel en nueva ventana (minimizado)
echo [*] Iniciando Cloudflared tunnel...
start /MIN "CorpTesla-tunnel" cmd /k "C:\Users\iacor\AppData\Roaming\npm\node_modules\cloudflared\bin\cloudflared.exe tunnel --url http://localhost:3000"

echo [*] Servicios iniciados correctamente!
echo [*] Accede a tu app: https://corptesla-energy.vercel.app
exit