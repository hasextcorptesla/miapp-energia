@echo off
cd /d "%~dp0frontend"
start /b npm.cmd run dev > frontend.log 2>&1
echo Frontend iniciado