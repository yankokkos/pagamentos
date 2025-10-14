#!/bin/bash

echo "🚀 Configurando Medup Pagamentos..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    echo "   Download: https://nodejs.org/"
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale o npm primeiro."
    exit 1
fi

echo "✅ Node.js e npm encontrados"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependências instaladas com sucesso"
else
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp env.example .env
    echo "✅ Arquivo .env criado"
    echo "⚠️  IMPORTANTE: Configure suas credenciais no arquivo .env antes de executar o servidor"
else
    echo "✅ Arquivo .env já existe"
fi

# Criar diretório para certificados se não existir
if [ ! -d "certificados" ]; then
    mkdir certificados
    echo "📁 Diretório 'certificados' criado"
    echo "⚠️  IMPORTANTE: Coloque seu certificado .p12 da Efí no diretório 'certificados'"
fi

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure suas credenciais no arquivo .env"
echo "2. Coloque seu certificado .p12 da Efí no diretório 'certificados'"
echo "3. Execute: npm run dev"
echo ""
echo "🌐 O aplicativo estará disponível em: http://localhost:3000"
