@echo off
REM TimescaleDB Setup Script for FarmIQ Sensor Streamer Service (Windows)
REM This script sets up TimescaleDB with all necessary configurations

setlocal enabledelayedexpansion

echo 🚀 Setting up TimescaleDB for FarmIQ Sensor Streamer Service...

REM Database connection parameters
if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_PORT%"=="" set DB_PORT=5432
if "%DB_NAME%"=="" set DB_NAME=farmiq_cloud
if "%DB_USER%"=="" set DB_USER=postgres
if "%DB_PASSWORD%"=="" set DB_PASSWORD=password

REM Test database connection
echo ✅ Testing database connection...
set PGPASSWORD=%DB_PASSWORD%
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo ❌ Cannot connect to database. Please check your connection parameters.
    exit /b 1
)

REM Create database if it doesn't exist
echo ✅ Creating database if it doesn't exist...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "CREATE DATABASE %DB_NAME%;" >nul 2>&1
if errorlevel 1 echo ⚠️  Database already exists

REM Run Prisma migrations first
echo ✅ Running Prisma migrations...
cd /d "%~dp0.."
call yarn db:push
if errorlevel 1 (
    echo ❌ Prisma migration failed
    exit /b 1
)

REM Run TimescaleDB setup
echo ✅ Setting up TimescaleDB extensions and hypertables...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f prisma\migrations\001_timescale_setup.sql
if errorlevel 1 (
    echo ❌ TimescaleDB setup failed
    exit /b 1
)

REM Run TimescaleDB functions
echo ✅ Creating TimescaleDB helper functions...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f prisma\migrations\002_timescale_functions.sql
if errorlevel 1 (
    echo ❌ TimescaleDB functions creation failed
    exit /b 1
)

REM Verify TimescaleDB installation
echo ✅ Verifying TimescaleDB installation...
for /f "tokens=*" %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -t -c "SELECT extversion FROM pg_extension WHERE extname = 'timescaledb';"') do set TIMESCALE_VERSION=%%i
if "%TIMESCALE_VERSION%"=="" (
    echo ❌ TimescaleDB installation failed
    exit /b 1
) else (
    echo ✅ TimescaleDB version %TIMESCALE_VERSION% installed successfully
)

REM Check hypertables
echo ✅ Checking hypertables...
for /f "tokens=*" %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -t -c "SELECT count(*) FROM timescaledb_information.hypertables WHERE schema_name = 'sensors';"') do set HYPERTABLES=%%i
echo ✅ Found %HYPERTABLES% hypertables in sensors schema

REM Check continuous aggregates
echo ✅ Checking continuous aggregates...
for /f "tokens=*" %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -t -c "SELECT count(*) FROM timescaledb_information.continuous_aggregates WHERE view_schema = 'sensors';"') do set AGGREGATES=%%i
echo ✅ Found %AGGREGATES% continuous aggregates

echo.
echo 🎉 TimescaleDB setup completed successfully!
echo Database: %DB_NAME%
echo Schema: sensors
echo Hypertables: %HYPERTABLES%
echo Continuous Aggregates: %AGGREGATES%
echo.
echo 📋 Next steps:
echo 1. Update your .env file with the correct DATABASE_URL
echo 2. Run 'yarn start' to start the sensor streamer service
echo 3. Test the API endpoints at http://localhost:7302/api-docs
echo.
echo 🔧 Useful TimescaleDB queries:
echo - View hypertables: SELECT * FROM timescaledb_information.hypertables;
echo - View continuous aggregates: SELECT * FROM timescaledb_information.continuous_aggregates;
echo - Get latest sensor reading: SELECT * FROM sensors.get_latest_sensor_reading('device_id');

