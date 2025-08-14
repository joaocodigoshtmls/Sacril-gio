@echo off
title FaceRec - Stop Script

echo Encerrando servicos do FaceRec...
echo.

REM Mata todos os processos Node.js
taskkill /F /IM node.exe >nul 2>&1

echo Servicos encerrados.
timeout /t 2 >nul
