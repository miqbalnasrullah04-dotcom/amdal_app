@echo off
echo ===========================================
echo     AMDAL App - Complete Setup Script
echo ===========================================
echo.

echo [1/6] Setting up Backend Environment...
cd backend
echo Copying environment file...
if not exist .env (
    copy .env.example .env
    echo .env file created from .env.example
) else (
    echo .env file already exists
)

echo.
echo [2/6] Installing Backend Dependencies...
composer install --no-dev --optimize-autoloader

echo.
echo [3/6] Generating Laravel Application Key...
php artisan key:generate

echo.
echo [4/6] Setting up Database...
php artisan config:clear
php artisan migrate --force
echo Database migration completed!

echo.
echo [5/6] Setting up Frontend...
cd ../frontend
echo Installing frontend dependencies...
npm install

echo.
echo [6/6] Testing Database Connection...
cd ../backend
php -f database/setup-database.php

echo.
echo ===========================================
echo         SETUP COMPLETED SUCCESSFULLY!
echo ===========================================
echo.
echo Next steps:
echo 1. Start Backend:  cd backend ^&^& php artisan serve
echo 2. Start Frontend: cd frontend ^&^& npm run dev
echo 3. Visit Backend:  http://localhost:8000
echo 4. Visit Frontend: http://localhost:5173
echo 5. API Health:     http://localhost:8000/api/health-check
echo.
echo Press any key to exit...
pause >nul