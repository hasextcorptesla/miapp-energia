@echo off
title CorpTesla Energy - DETENER TODO
color 0C
mode con: cols=70 lines=20

echo ============================================================
echo           DETENER TODO - CorpTesla Energy
echo ============================================================
echo.
echo  Deteniendo servicios...
echo.

:: Matar Backend
echo  [1/3] Deteniendo Backend...
taskkill /FI "WindowTitle eq CorpTesla-Backend" /T /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo       [OK]

:: Matar Frontend
echo  [2/3] Deteniendo Frontend...
taskkill /FI "WindowTitle eq CorpTesla-Frontend" /T /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo       [OK]

:: Matar Ngrok
echo  [3/3] Deteniendo Ngrok...
taskkill /IM ngrok.exe /F >nul 2>&1
taskkill /IM cloudflared.exe /F >nul 2>&1
echo       [OK]

echo.
echo ============================================================
echo.
echo  Todos los servicios detenidos.
echo.
echo ============================================================
timeout /t 3 /nobreak >nul
