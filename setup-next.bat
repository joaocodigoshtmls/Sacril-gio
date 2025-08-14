@echo off
echo ========================================
echo    FaceRec Next.js Setup Script
echo ========================================

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Instale em https://nodejs.org
    exit /b 1
)

:: Criar projeto Next.js
echo 📦 Criando projeto Next.js...
npx create-next-app@latest facerec-next --typescript --tailwind --app --src-dir --import-alias "@/*"

cd facerec-next

:: Instalar dependências
echo 📦 Instalando dependências...
npm install @prisma/client prisma next-auth @tanstack/react-query zustand
npm install -D @types/node vitest @testing-library/react playwright

:: Setup Prisma
echo 🗄️ Configurando Prisma...
npx prisma init

:: Criar estrutura de pastas
echo 📁 Criando estrutura de diretórios...
mkdir src\app\api\auth
mkdir src\app\api\cam
mkdir src\components\ui
mkdir src\components\features
mkdir src\hooks
mkdir src\lib
mkdir src\stores
mkdir src\types

:: Docker Compose
echo 🐳 Configurando Docker...
copy ..\docker-compose.yml .

echo ✅ Setup concluído!
echo Execute 'npm run dev' para iniciar o desenvolvimento
