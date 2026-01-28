@echo off
chcp 65001 >nul
echo ========================================
echo 启动后端服务 (FastAPI)
echo ========================================
cd backend
call venv\Scripts\activate.bat
python app\main.py
pause
