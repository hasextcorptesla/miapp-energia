@echo off
title CorpTesla Energy - INICIO TOTAL
color 0A
mode con: cols=70 lines=35

echo ============================================================
echo           INICIO TOTAL - CorpTesla Energy
echo ============================================================
echo.
echo  Servicios:
echo    [1] Backend Node.js (puerto 3000)
echo    [2] Frontend Vite (puerto 5173)
echo    [3] Ngrok Tunnel (puerto 3000 -> publico)
echo    [4] Cloudflared Tunnel (backup)
echo.
echo ============================================================
echo.

cd /d C:\Users\iacor\Documents\proyecto\has\Miapp

:: ============================================================
:: PASO 1: Matar procesos viejos en los puertos
:: ============================================================
echo [1/6] Limpiando procesos anteriores...

:: Matar processos en puerto 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Matar processos en puerto 5173
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Matar ngrok viejo
taskkill /IM ngrok.exe /F >nul 2>&1

:: Matar cloudflared viejo
taskkill /IM cloudflared.exe /F >nul 2>&1

timeout /t 2 /nobreak >nul
echo    [OK] Procesos limpiados
echo.

:: ============================================================
:: PASO 2: Verificar Node.js
:: ============================================================
echo [2/6] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    [ERROR] Node.js no encontrado. Instala desde https://nodejs.org
    pause
    exit /b 1
)
echo    [OK] Node.js encontrado
echo.

:: ============================================================
:: PASO 3: Instalar dependencias si es necesario
:: ============================================================
echo [3/6] Verificando dependencias...
if not exist "backend\node_modules" (
    echo    Instalando dependencias del backend...
    cd /d C:\Users\iacor\Documents\proyecto\has\Miapp\backend
    call npm install
)
if not exist "frontend\node_modules" (
    echo    Instalando dependencias del frontend...
    cd /d C:\Users\iacor\Documents\proyecto\has\Miapp\frontend
    call npm install
)
echo    [OK] Dependencias listas
echo.

:: ============================================================
:: PASO 4: Iniciar Backend
:: ============================================================
echo [4/6] Iniciando Backend (Node.js)...
cd /d C:\Users\iacor\Documents\proyecto\has\Miapp\backend
start /MIN "CorpTesla-Backend" cmd /k "node src/index.js"
timeout /t 5 /nobreak >nul
echo    [OK] Backend iniciado en puerto 3000
echo.

:: ============================================================
:: PASO 5: Iniciar Frontend
:: ============================================================
echo [5/6] Iniciando Frontend (Vite)...
cd /d C:\Users\iacor\Documents\proyecto\has\Miapp\frontend
start /MIN "CorpTesla-Frontend" cmd /k "npx vite --host --port 5173"
timeout /t 3 /nobreak >nul
echo    [OK] Frontend iniciado en puerto 5173
echo.

:: ============================================================
:: PASO 6: Iniciar Tunnel Ngrok
:: ============================================================
echo [6/6] Iniciando Tunnel...
start "CorpTesla-Ngrok" cmd /k "C:\Users\iacor\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe http 3000"
timeout /t 5 /nobreak >nul
echo    [OK] Ngrok tunnel iniciado
echo.

:: ============================================================
:: RESUMEN
:: ============================================================
echo ============================================================
echo.
echo  TODOS LOS SERVICIOS INICIADOS
echo.
echo  URLs:
echo    Local:    http://localhost:5173
echo    Backend:  http://localhost:3000
echo    Ngrok:    Ver ventana de Ngrok (http://localhost:4040)
echo    Vercel:   https://corptesla-energy.vercel.app
echo.
echo  NOTA: La URL de Ngrok cambia cada vez que se reinicia.
echo        Actualiza VITE_API_URL si usas Vercel.
echo.
echo ============================================================
echo.
echo  Ventanas abiertas:
echo    - CorpTesla-Backend (minimizado)
echo    - CorpTesla-Frontend (minimizado)
echo    - CorpTesla-Ngrok (ventana con URL publica)
echo.
echo  Para detener todo: cierra las ventanas o ejecuta STOP.bat
echo.
pause
