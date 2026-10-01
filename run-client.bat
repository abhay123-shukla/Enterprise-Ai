@echo off
set PATH=C:\Users\ARP INFOTECH\nodejs;%PATH%
echo [OpsPilot] Starting Frontend Client on http://localhost:5173 ...
cd /d "%~dp0opspilot\client"
npm run dev
