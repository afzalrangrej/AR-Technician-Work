@echo off
title AR Technician Work - Launch Both Servers
color 0A
echo.
echo  ================================================
echo   AR TECHNICIAN WORK - STARTING BOTH SERVERS
echo  ================================================
echo.

:: Start Customer Website in a new window
start "Customer Website - Port 3000" cmd /k "cd /d %~dp0 && echo CUSTOMER WEBSITE RUNNING... && node server.js"

:: Wait 2 seconds then start Admin Portal in another new window
timeout /t 2 /nobreak >nul
start "Admin Portal - Port 4000" cmd /k "cd /d %~dp0admin-portal && echo ADMIN PORTAL RUNNING... && node admin-server.js"

timeout /t 3 /nobreak >nul

echo.
echo  ================================================
echo   BOTH SERVERS ARE NOW RUNNING!
echo  ================================================
echo.
echo   Customer Website  :  http://localhost:3000
echo   Admin Portal      :  http://localhost:4000
echo.
echo  Open the links above in your browser.
echo  DO NOT close the other two black windows!
echo  ================================================
echo.
pause
