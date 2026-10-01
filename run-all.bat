@echo off
set PATH=C:\Users\ARP INFOTECH\nodejs;%PATH%
echo ========================================================
echo        🚀 Starting OpsPilot Enterprise AI System
echo ========================================================
start "OpsPilot Server (Port 5000)" cmd /k "set PATH=C:\Users\ARP INFOTECH\nodejs;%%PATH%% && cd /d %~dp0opspilot\server && npm run dev"
start "OpsPilot Client (Port 5173)" cmd /k "set PATH=C:\Users\ARP INFOTECH\nodejs;%%PATH%% && cd /d %~dp0opspilot\client && npm run dev"
echo Backend running at:  http://localhost:5000
echo Frontend running at: http://localhost:5173
echo.
pause
