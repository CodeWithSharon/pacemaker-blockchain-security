@echo off
REM Quick run script for Pacemaker Demo
echo.
echo ========================================
echo   Pacemaker Blockchain Demo Launcher
echo ========================================
echo.

REM Check if dependencies are installed
python -c "import web3" 2>nul
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
    echo.
)

REM Run configuration check
echo Running configuration check...
python check_config.py

echo.
echo ========================================
echo.
echo Starting demo application...
echo.
python main.py
