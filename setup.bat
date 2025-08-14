@echo off
title FaceRec - Setup Script

echo Iniciando setup do FaceRec...
echo.

REM Verifica se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js nao encontrado! Por favor, instale o Node.js 22 ou superior.
    pause
    exit /b 1
)

REM Instala dependências do frontend
echo Instalando dependencias do frontend...
call npm install

REM Instala dependências do backend
echo.
echo Instalando dependencias do backend...
cd mock-cam
call npm install
cd ..

REM Cria arquivo .env.local se não existir
if not exist .env.local (
    echo Criando arquivo .env.local...
    echo VITE_CAM_BASE=http://localhost:3000> .env.local
    echo VITE_API_BASE=>> .env.local
)

REM Cria arquivo .env do backend se não existir
if not exist mock-cam\.env (
    echo Criando arquivo .env do backend...
    echo PORT=3000> mock-cam\.env
    echo ESP32_BASE=http://192.168.0.xxx>> mock-cam\.env
    echo ESP32_STREAM=:81/stream>> mock-cam\.env
    echo ESP32_SNAPSHOT=/capture>> mock-cam\.env
)

echo.
echo Setup concluido!
echo.
echo Para iniciar o projeto:
echo 1. Configure os arquivos .env.local e mock-cam\.env
echo 2. Execute start.bat
echo.
echo Pressione qualquer tecla para sair...
pause >nul
