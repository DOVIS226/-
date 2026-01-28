@echo off
chcp 65001 >nul
echo ========================================
echo 启动前端服务 (React + Vite)
echo ========================================
cd frontend
call npm run dev
pause
