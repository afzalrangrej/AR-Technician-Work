@echo off
title AR Technician Work - Admin Portal Server (Port 4000)
echo =====================================================
echo   Starting AR Technician Work ADMIN PORTAL
echo   URL: http://localhost:4000
echo   Customer Site: http://localhost:3000
echo =====================================================
cd /d "%~dp0admin-portal"
node admin-server.js
pause
