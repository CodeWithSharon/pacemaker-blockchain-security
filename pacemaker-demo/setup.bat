@echo off
REM Setup script for Pacemaker Blockchain Demo
echo ========================================
echo Pacemaker Blockchain Access Control Demo
echo Setup Script
echo ========================================
echo.

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.7 or higher
    pause
    exit /b 1
)

echo [OK] Python is installed
echo.

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed successfully!
echo.

REM Check if Hardhat node is running
echo Checking blockchain connection...
curl -s -X POST -H "Content-Type: application/json" --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}" http://127.0.0.1:8545 >nul 2>&1

if errorlevel 1 (
    echo.
    echo [WARNING] Hardhat node is not running
    echo.
    echo To use BLOCKCHAIN MODE, you need to:
    echo   1. Open a new terminal
    echo   2. Navigate to: access-control directory
    echo   3. Run: npx hardhat node
    echo.
    echo You can still use SIMULATION MODE without the blockchain.
    echo.
) else (
    echo [OK] Blockchain node is running!
    echo.
)

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To run the demo:
echo   python main.py
echo.
pause
