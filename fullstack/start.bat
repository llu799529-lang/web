@echo off
chcp 65001 >nul
title luo-fullstack-409  (Luo Yabo / ID 409)
cd /d "%~dp0"

echo ==========================================================
echo   Luo Yabo . ID 409 . Full Stack Project
echo   Node.js + Express + MySQL + LLM
echo ==========================================================
echo.

rem ---- 1. node ----
where node >nul 2>nul
if errorlevel 1 goto NO_NODE

rem ---- 2. env ----
if not exist "backend\.env" goto NO_ENV

rem ---- 3. port 409 ----
netstat -ano | findstr ":409" | findstr "LISTENING" >nul
if not errorlevel 1 goto ALREADY

rem ---- 4. deps + start ----
cd backend
if not exist "node_modules" (
    echo [1/2] installing dependencies, please wait ...
    call npm i --no-audit --no-fund
    if errorlevel 1 goto NPM_FAIL
)

echo [2/2] server is starting on port 409
echo.
echo   open these in your browser:
echo     http://localhost:409/                home / navigation
echo     http://localhost:409/news.html       news list   (MySQL luo_news)
echo     http://localhost:409/gallery.html    gallery     (MySQL luo_gallery)
echo     http://localhost:409/chat.html       AI chat     (press F12 for logs)
echo     http://localhost:409/database.html   db connection test
echo.
echo   keep this window open; press Ctrl+C to stop the server.
echo.

node app.js
goto END

:ALREADY
echo [i] port 409 is already listening - the project seems to be running.
echo     just open http://localhost:409 in your browser.
goto END

:NO_NODE
echo [ERROR] Node.js not found in PATH. Install Node.js 20+ first.
goto END

:NO_ENV
echo [ERROR] backend\.env not found. Create it with:
echo           DB_USER=root
echo           DB_PASSWORD=your_password
echo           DB_HOST=127.0.0.1
echo           DB_PORT=3306
echo           DB_NAME=luo_fullstack
echo           LLM_API_KEY=sk-xxxxxxxx
echo           LLM_BASE_URL=https://api.siliconflow.cn/v1/chat/completions
echo           LLM_MODEL=deepseek-ai/DeepSeek-V4-Flash
goto END

:NPM_FAIL
echo [ERROR] npm install failed. Check your network and run again.
goto END

:END
echo.
pause
