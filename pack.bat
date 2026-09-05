@echo off
chcp 65001 >nul
title Antigravity-PM 打包程序
echo ========================================================
echo 📦 正在编译与打包 Antigravity-PM 为 Windows 安装包 / 便携版
echo ========================================================
echo.

call npm run build
call npm run electron:pack
echo.
echo ✅ 打包完成！输出文件位于 release 目录下。
pause
