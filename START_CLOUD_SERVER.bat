@echo off
chcp 65001 >nul
title Quantum Care - Cloudflare Live Deployment Server
cd /d "%~dp0"

echo ====================================================================
echo          QUANTUM CARE - LIVE CLOUDFLARE DEPLOYMENT LAUNCHER         
echo ====================================================================
echo [INFO] Preparing unified server and Cloudflare tunnel...
echo [INFO] Working Directory: %CD%
echo.

node scripts/start-cloud-tunnel.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] The server or Cloudflare tunnel encountered an error (Code: %ERRORLEVEL%).
    echo Please verify that Node.js is installed and cloudflared.exe exists.
    pause
)
