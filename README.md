# MedUp Pagamentos - Sistema de Gestão de Cobranças

Sistema web para gestão de cobranças integrado com Asaas e Efí, desenvolvido para controle de clientes e pagamentos.

## 🚀 Funcionalidades

- **Dashboard de Clientes**: Visualização completa dos clientes com status e informações financeiras
- **Integração Asaas**: Sincronização automática de dados de clientes e cobranças
- **Integração Efí**: Suporte opcional para boletos da Efí
- **Sistema de Login**: Autenticação segura com JWT
- **Filtros Avançados**: Por status, ativo/inativo, nome, CPF/CNPJ e fonte
- **Modal de Detalhes**: Histórico completo de cobranças dos últimos 6 meses
- **Design Responsivo**: Interface otimizada para desktop e mobile
- **Tema Escuro**: Interface moderna com tema escuro

## 🔐 Credenciais de Acesso

- **Usuário**: Tiago
- **Senha**: medup1302@

## 🛠️ Tecnologias

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Bootstrap 5
- **Autenticação**: JWT (JSON Web Tokens)
- **APIs**: Asaas, Efí
- **Deploy**: Docker

## 📦 Instalação

### Desenvolvimento Local

1. Clone o repositório:
```bash
git clone https://github.com/yankokkos/pagamentos.git
cd pagamentos
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
# Edite o arquivo .env com suas credenciais
```

4. Execute o servidor:
```bash
npm start
```

5. Acesse: http://localhost:3000

### Deploy com Docker

1. Construa a imagem:
```bash
docker build -t medup-pagamentos .
```

2. Execute o container:
```bash
docker run -p 3000:3000 --env-file .env medup-pagamentos
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Servidor
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=sua-chave-secreta-aqui

# Asaas API
ASAAS_API_KEY=sua-chave-api-asaas

# Efí API (opcional)
EFI_CLIENT_ID=seu-client-id-efi
EFI_CLIENT_SECRET=seu-client-secret-efi
```

**⚠️ Importante:** No Coolify, marque a opção **"Is Literal?"** para variáveis que contêm caracteres especiais como `$`.

## 📱 Interface

### Desktop
- Dashboard com estatísticas em cards
- Tabela responsiva com filtros
- Modal de detalhes em tela cheia
- Navegação intuitiva

### Mobile
- Cards responsivos para visualização móvel
- Modal otimizado para telas pequenas
- Filtros adaptados para touch

## 🔒 Segurança

- Autenticação JWT com expiração de 24h
- Rate limiting (100 requests/15min por IP)
- Headers de segurança com Helmet.js
- CORS configurado
- Validação de entrada

## 📊 APIs Integradas

### Asaas
- Listagem de clientes
- Histórico de cobranças
- Status de pagamentos
- Dados financeiros

### Efí (Opcional)
- Geração de boletos
- Links de pagamento
- Status de transações

## 🚀 Deploy

### Hospedagem com Docker

1. Configure suas variáveis de ambiente
2. Construa a imagem Docker
3. Execute o container na sua hospedagem
4. Configure proxy reverso (nginx/apache) se necessário

### Exemplo de docker-compose.yml

```yaml
version: '3.8'
services:
  medup-pagamentos:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env
    restart: unless-stopped
```

## 📝 Licença

Este projeto é propriedade da MedUp e destinado ao uso interno.

## 👨‍💻 Desenvolvido por

Sistema desenvolvido para MedUp - Gestão de Pagamentos