@echo off
title AMDAL App Development Servers

echo ===========================================
echo     Starting AMDAL App Development Servers
echo ===========================================
echo.

echo Starting Backend Server (Laravel)...
start cmd /k "cd /d %~dp0backend && php artisan serve"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server (React + Vite)...
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===========================================
echo         Development Servers Started!
echo ===========================================
echo.
echo Backend Server:  http://localhost:8000
echo Frontend Server: http://localhost:5173
echo API Health:      http://localhost:8000/api/health-check
echo.
echo Press any key to exit this window...
echo (Note: The development servers will continue running in their own windows)
pause >nul