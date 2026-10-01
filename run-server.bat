@echo off
set PATH=C:\Users\ARP INFOTECH\nodejs;%PATH%
echo [OpsPilot] Starting Backend Server on http://localhost:5000 ...
cd /d "%~dp0opspilot\server"
npm run dev
