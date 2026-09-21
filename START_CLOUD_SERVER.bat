@echo off
title Quantum Care - Online Cloud Server
cd /d "%~dp0"

echo ========================================================
echo   QUANTUM CARE - LAUNCHING LOCAL CLOUD SERVER
echo ========================================================
echo.

node scripts/start-cloud-tunnel.js

pause
