@echo off
cd /d "%~dp0"
echo.
echo === Vercel Deploy ===
echo.
echo 1. Iniciando sesion en Vercel...
npx vercel login
echo.
echo 2. Desplegando a produccion...
npx vercel --prod
echo.
echo Deploy completado!
pause