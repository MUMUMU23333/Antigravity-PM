@echo off
chcp 65001 >nul
title Antigravity-PM 启动选择器
echo ========================================================
echo 🚀 欢迎使用 Antigravity-PM (多智能体协同与项目管理总线)
echo ========================================================
echo.
echo 请选择要启动的版本：
echo   [1] 启动 纯净版 (Pure Clean Edition - 零预装空白母版)
echo   [2] 启动 完整版 (Full Content Edition - 9大专家团+18技能)
echo   [3] 退出
echo.
set /p choice=请输入选项 [1-3]: 

if "%choice%"=="1" (
    cd /d "%~dp0Pure"
    call run.bat
) else if "%choice%"=="2" (
    cd /d "%~dp0Full"
    call run.bat
) else (
    exit
)
