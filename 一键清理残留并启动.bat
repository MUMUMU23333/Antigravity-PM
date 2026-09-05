@echo off
chcp 65001 >nul
title 一键清理残留进程并启动 Antigravity-PM
echo 正在清理所有后台残留进程与互斥锁...
taskkill /F /IM Antigravity-PM.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo 正在秒级拉起 Antigravity-PM...
start "" "%~dp0Antigravity-PM.exe"
echo 启动完成！
