@echo off
echo 🚀 Configurando Medup Pagamentos...

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js primeiro.
    echo    Download: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se o npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado. Por favor, instale o npm primeiro.
    pause
    exit /b 1
)

echo ✅ Node.js e npm encontrados

REM Instalar dependências
echo 📦 Instalando dependências...
npm install

if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)

echo ✅ Dependências instaladas com sucesso

REM Criar arquivo .env se não existir
if not exist .env (
    echo 📝 Criando arquivo .env...
    copy env.example .env
    echo ✅ Arquivo .env criado
    echo ⚠️  IMPORTANTE: Configure suas credenciais no arquivo .env antes de executar o servidor
) else (
    echo ✅ Arquivo .env já existe
)

REM Criar diretório para certificados se não existir
if not exist certificados (
    mkdir certificados
    echo 📁 Diretório 'certificados' criado
    echo ⚠️  IMPORTANTE: Coloque seu certificado .p12 da Efí no diretório 'certificados'
)

echo.
echo 🎉 Configuração concluída!
echo.
echo 📋 Próximos passos:
echo 1. Configure suas credenciais no arquivo .env
echo 2. Coloque seu certificado .p12 da Efí no diretório 'certificados'
echo 3. Execute: npm run dev
echo.
echo 🌐 O aplicativo estará disponível em: http://localhost:3000
echo.
pause
