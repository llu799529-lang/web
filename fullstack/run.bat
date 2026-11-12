@echo off
chcp 65001 >nul
rem keep the old entry name working - it just forwards to start.bat
cd /d "%~dp0"
call "start.bat"
