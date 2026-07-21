@echo off
echo ===========================================
echo        AMDAL App - Connection Test
echo ===========================================
echo.

echo [1/4] Testing Backend Database Connection...
cd backend
php artisan db:show
if %errorlevel% neq 0 (
    echo ❌ Database connection failed!
    goto :error
)
echo ✅ Database connection successful!
echo.

echo [2/4] Starting Backend Server...
start /B php artisan serve
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo [3/4] Testing Health Check API...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:8000/api/health-check' -Method GET; Write-Host '✅ API Health Check successful!'; Write-Host 'Status:' $response.status; Write-Host 'Database:' $response.database.status; } catch { Write-Host '❌ API Health Check failed:' $_.Exception.Message; exit 1 }"

if %errorlevel% neq 0 (
    echo ❌ API test failed!
    goto :error
)

echo.
echo [4/4] Testing Frontend Configuration...
cd ../frontend
if exist .env (
    echo ✅ Frontend environment file exists
) else (
    echo ❌ Frontend .env file missing
    goto :error
)

if exist node_modules (
    echo ✅ Frontend dependencies installed
) else (
    echo ⚠️  Frontend dependencies not installed, run 'npm install'
)

echo.
echo ===========================================
echo         🎉 ALL TESTS PASSED! 🎉
echo ===========================================
echo.
echo Your AMDAL application is ready to use!
echo.
echo 📊 Database Status: Connected (amdal_id)
echo 🚀 Backend Server: http://localhost:8000
echo ⚛️  Frontend Setup: Ready
echo 🔍 Health Check: http://localhost:8000/api/health-check
echo.
echo To start development:
echo 1. Run: start-dev.bat
echo 2. Or manually start both servers
echo.
goto :end

:error
echo.
echo ===========================================
echo           ❌ CONNECTION TEST FAILED
echo ===========================================
echo.
echo Please check:
echo 1. Is Laragon/MySQL running?
echo 2. Is the database 'amdal_id' created?
echo 3. Are environment variables correct?
echo 4. Run setup-all.bat to fix configuration
echo.

:end
echo Press any key to exit...
pause >nul