@echo off
REM Auto Parts API - Database Setup Script for Windows
REM This script helps set up the PostgreSQL database for local testing

echo 🚀 Auto Parts API - Database Setup
echo ==================================

REM Check if PostgreSQL is installed
echo 🔍 Checking PostgreSQL installation...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL first:
    echo   Download from: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)
echo ✅ PostgreSQL is installed

REM Get database credentials
echo.
echo 📝 Database Configuration
echo =========================
set /p SUPERUSER="Enter PostgreSQL superuser name [postgres]: "
if "%SUPERUSER%"=="" set SUPERUSER=postgres

set /p DB_NAME="Enter database name [autoparts_api]: "
if "%DB_NAME%"=="" set DB_NAME=autoparts_api

set /p DB_USER="Enter database user [autoparts_user]: "
if "%DB_USER%"=="" set DB_USER=autoparts_user

set /p DB_PASSWORD="Enter database password [secure_password]: "
if "%DB_PASSWORD%"=="" set DB_PASSWORD=secure_password

set /p DB_HOST="Enter database host [localhost]: "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_PORT="Enter database port [5432]: "
if "%DB_PORT%"=="" set DB_PORT=5432

echo.
echo 🔧 Creating database and user...

REM Create database
echo Creating database '%DB_NAME'...
psql -h %DB_HOST% -p %DB_PORT% -U %SUPERUSER% -lqt | findstr /C:"%DB_NAME%" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Database '%DB_NAME%' already exists
    set /p RECREATE="Do you want to drop and recreate it? (y/N): "
    if /i "%RECREATE%"=="y" (
        echo Dropping database '%DB_NAME'...
        psql -h %DB_HOST% -p %DB_PORT% -U %SUPERUSER% -c "DROP DATABASE IF EXISTS %DB_NAME%;"
        psql -h %DB_HOST% -p %DB_PORT% -U %SUPERUSER% -c "CREATE DATABASE %DB_NAME%;"
        echo ✅ Database recreated
    )
) else (
    psql -h %DB_HOST% -p %DB_PORT% -U %SUPERUSER% -c "CREATE DATABASE %DB_NAME%;"
    echo ✅ Database created
)

REM Create user
echo Creating user '%DB_USER%'...
psql -h %DB_HOST% -p %DB_PORT% -U %SUPERUSER% -tAc "SELECT 1 FROM pg_roles WHERE rolname='%DB_USER%'" | findstr "1" >nul
if %errorlevel% equ 0 (
    echo ⚠️  User '%DB_USER%' already exists
    set /p RECREATE_USER="Do you want to recreate the user? (y/N): "
    if /i "%RECREATE_USER%"=="y" (
        psql -h %DB_HOST% -p %DB_PORT% -U %SUPERUSER% -c "DROP USER IF EXISTS %DB_USER%;"
        psql -h %DB_HOST% -p %DB_PORT% -U %SUPERUSER% -c "CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%';"
        echo ✅ User recreated
    )
) else (
    psql -h %DB_HOST% -p %DB_PORT% -U %SUPERUSER% -c "CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%';"
    echo ✅ User created
)

REM Grant privileges
echo Granting privileges...
psql -h %DB_HOST% -p %DB_PORT% -U %SUPERUSER% -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;"
psql -h %DB_HOST% -p %DB_PORT% -U %SUPERUSER% -d %DB_NAME% -c "GRANT ALL ON SCHEMA public TO %DB_USER%;"
psql -h %DB_HOST% -p %DB_PORT% -U %SUPERUSER% -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO %DB_USER%;"
psql -h %DB_HOST% -p %DB_PORT% -U %SUPERUSER% -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO %DB_USER%;"
psql -h %DB_HOST% -p %DB_PORT% -U %SUPERUSER% -d %DB_NAME% -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO %DB_USER%;"
psql -h %DB_HOST% -p %DB_PORT% -U %SUPERUSER% -d %DB_NAME% -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO %DB_USER%;"
echo ✅ Privileges granted

REM Test connection
echo Testing connection...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Connection test failed
    pause
    exit /b 1
)
echo ✅ Connection test successful

REM Generate .env file
echo.
echo 📄 Generating .env file...
(
echo # Database Configuration
echo DB_HOST=%DB_HOST%
echo DB_PORT=%DB_PORT%
echo DB_NAME=%DB_NAME%
echo DB_USER=%DB_USER%
echo DB_PASSWORD=%DB_PASSWORD%
echo DB_SSL=false
echo.
echo # Application Configuration
echo NODE_ENV=development
echo PORT=3000
echo API_PREFIX=api/v1
echo.
echo # JWT Configuration
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
echo JWT_EXPIRES_IN=24h
echo.
echo # CORS Configuration
echo CORS_ORIGIN=http://localhost:3000
echo.
echo # Logging Configuration
echo LOG_LEVEL=debug
) > .env
echo ✅ .env file created

echo.
echo 🎉 Database setup completed!
echo ==========================
echo.
echo Next steps:
echo 1. Run database migrations: npm run migration:run
echo 2. Start the application: npm run start:dev
echo 3. Access Swagger docs: http://localhost:3000/api/docs
echo 4. Test health endpoint: http://localhost:3000/health
echo.
echo Database connection details:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo.
echo ✅ Setup complete! Happy coding! 🚀
pause
