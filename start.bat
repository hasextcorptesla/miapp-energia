@echo off
cd /d C:\Users\iacor\Documents\proyecto\has\Miapp\backend
start "Backend" cmd /c node src\index.js
cd /d C:\Users\iacor\Documents\proyecto\has\Miapp\frontend
start "Frontend" cmd /c npx vite --host --port 5173
echo Servidores iniciados
pause