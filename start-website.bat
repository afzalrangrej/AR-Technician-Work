@echo off
echo Starting ElectroHome Website & SQL Database Server...
cd /d "%~dp0"
start "" http://localhost:3000
node server.js
pause
