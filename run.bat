@echo off
chcp 65001 >nul
title Antigravity-PM 极速启动器
echo ========================================================
echo 🚀 正在启动 Antigravity-PM (多智能体专家团与技能项目管理面板)
echo ========================================================
echo.

if not exist node_modules (
  echo 正在首次安装必要依赖，请稍候...
  call npm install
)

echo 正在启动桌面端程序...
call npm run electron:dev
pause
