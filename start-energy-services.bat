@echo off
title CorpTesla Energy Services
color 0A

cd /d C:\Users\iacor\Documents\proyecto\has\Miapp

echo [*] Iniciando Backend (Node.js)...
start /MIN "CorpTesla-Backend" cmd /k "cd /d C:\Users\iacor\Documents\proyecto\has\Miapp\backend && node src/index.js"

timeout /t 5 /nobreak >nul

echo [*] Iniciando Ngrok tunnel...
start "CorpTesla-Ngrok" cmd /k "C:\Users\iacor\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe http 3000"

echo.
echo [*] Servicios iniciados!
echo [*] App: https://corptesla-energy.vercel.app
echo [*] Revisa la ventana de Ngrok para la URL del tunel
echo [*] Panel ngrok: http://localhost:4040
echo.
pause
