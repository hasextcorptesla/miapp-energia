@echo off
title CorpTesla Energy Services
color 0A

cd /d C:\Users\iacor\Documents\proyecto\has\Miapp

echo [*] Iniciando Backend (Node.js)...
start /MIN "CorpTesla-Backend" cmd /k "cd /d C:\Users\iacor\Documents\proyecto\has\Miapp\backend && node src/index.js"

timeout /t 5 /nobreak >nul

echo [*] Iniciando Cloudflared tunnel...
start "CorpTesla-Cloudflared" cmd /k "C:\Users\iacor\AppData\Roaming\npm\node_modules\cloudflared\bin\cloudflared.exe tunnel --url http://localhost:3000"

echo.
echo [*] Servicios iniciados!
echo [*] App: https://corptesla-energy.vercel.app
echo [*] Revisa la ventana de Cloudflared para la URL del tunel
echo.
pause