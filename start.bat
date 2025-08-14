@echo off
title FaceRec - Start Script

echo Starting FaceRec services...
echo.

REM Verifica se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js nao encontrado! Por favor, instale o Node.js 22 ou superior.
    pause
    exit /b 1
)

REM Inicia o backend mock-cam
echo Iniciando backend mock-cam...
start "Mock-Cam Backend" cmd /c "cd mock-cam && npm start"

REM Aguarda 5 segundos para o backend iniciar
timeout /t 5 /nobreak >nul

REM Inicia o frontend
echo Iniciando frontend...
start "Frontend" cmd /c "npm run dev"

echo.
echo Servicos iniciados!
echo.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3000
echo.
echo Pressione qualquer tecla para encerrar todos os servicos...
pause >nul

REM Mata todos os processos Node.js
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Servicos encerrados.
timeout /t 2 >nul
