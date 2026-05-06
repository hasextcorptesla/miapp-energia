@echo off
cd /d "%~dp0backend"
start /b node src/index.js > backend.log 2>&1
echo Backend iniciado