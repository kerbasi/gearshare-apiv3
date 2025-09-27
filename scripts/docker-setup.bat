@echo off
REM Auto Parts API - Docker Setup Script for Windows
REM This script sets up the entire application using Docker

echo 🐳 Auto Parts API - Docker Setup
echo =================================

REM Check if Docker is installed
echo 🔍 Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed
    echo Please install Docker Desktop first:
    echo   Download from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)
echo ✅ Docker is installed

REM Check if Docker is running
echo 🔍 Checking Docker daemon...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker daemon is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)
echo ✅ Docker daemon is running

REM Check if docker-compose is available
echo 🔍 Checking Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not available
    echo Please install Docker Compose
    pause
    exit /b 1
)
echo ✅ Docker Compose is available

REM Check if .env file exists
echo 🔍 Checking environment configuration...
if not exist .env (
    echo ⚠️  .env file not found, creating from template...
    copy .env.example .env >nul
    echo ✅ .env file created from template
) else (
    echo ✅ .env file exists
)

REM Stop any existing containers
echo 🛑 Stopping any existing containers...
docker-compose down >nul 2>&1
echo ✅ Existing containers stopped

REM Start database services first
echo 🗄️ Starting database services...
docker-compose up -d postgres redis pgadmin
if %errorlevel% neq 0 (
    echo ❌ Failed to start database services
    pause
    exit /b 1
)
echo ✅ Database services started

REM Wait for PostgreSQL to be ready
echo ⏳ Waiting for PostgreSQL to be ready...
for /l %%i in (1,1,30) do (
    docker-compose exec postgres pg_isready -U autoparts_user -d autoparts_api >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ PostgreSQL is ready
        goto :postgres_ready
    )
    echo|set /p="."
    timeout /t 1 /nobreak >nul
)
echo ❌ PostgreSQL failed to start after 30 seconds
pause
exit /b 1

:postgres_ready

REM Run database migrations
echo 📊 Running database migrations...
docker-compose exec api npm run migration:run >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Database migrations completed
) else (
    echo ⚠️  Migration command not available in container yet
    echo ℹ️  You can run migrations manually later with:
    echo    docker-compose exec api npm run migration:run
)

REM Start the API service
echo 🚀 Starting API service...
docker-compose up -d api
if %errorlevel% neq 0 (
    echo ❌ Failed to start API service
    pause
    exit /b 1
)
echo ✅ API service started

REM Wait for API to be ready
echo ⏳ Waiting for API to be ready...
for /l %%i in (1,1,30) do (
    curl -s http://localhost:3000/health >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ API is ready
        goto :api_ready
    )
    echo|set /p="."
    timeout /t 1 /nobreak >nul
)
echo ❌ API failed to start after 30 seconds
echo ℹ️  Check logs with: docker-compose logs api
pause
exit /b 1

:api_ready

REM Display service status
echo.
echo 📊 Service Status:
echo ==================
docker-compose ps

echo.
echo 🎉 Docker setup completed successfully!
echo ======================================
echo.
echo 🌐 Access Points:
echo   API: http://localhost:3000
echo   Swagger Docs: http://localhost:3000/api/docs
echo   Health Check: http://localhost:3000/health
echo   pgAdmin: http://localhost:5050
echo.
echo 📝 pgAdmin Credentials:
echo   Email: admin@example.com
echo   Password: admin123
echo.
echo 🔧 Useful Commands:
echo   View logs: docker-compose logs -f api
echo   Stop services: docker-compose down
echo   Restart API: docker-compose restart api
echo   Run migrations: docker-compose exec api npm run migration:run
echo.
echo 🧪 Quick Test:
echo   curl http://localhost:3000/health
echo.
echo ✅ Setup complete! Happy coding! 🚀
pause
