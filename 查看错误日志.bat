@echo off
chcp 65001 >nul
title Antigravity-PM 错误诊断日志查看器
echo 正在打开 Antigravity-PM 运行与错误诊断日志...
if exist "%~dp0error.log" (
    start notepad.exe "%~dp0error.log"
) else (
    if exist "%APPDATA%\Antigravity-PM\error.log" (
        start notepad.exe "%APPDATA%\Antigravity-PM\error.log"
    ) else (
        echo [提示] 暂未发现严重错误，当前系统运行状态良好！
        if exist "%~dp0app.log" (
            start notepad.exe "%~dp0app.log"
        ) else (
            echo 暂无日志文件生成。
            pause
        )
    )
)
