# MedUp Pagamentos - Configuração de Produção

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Asaas
ASAAS_API_KEY=sua_chave_api_asaas_aqui
ASAAS_BASE_URL=https://www.asaas.com/api/v3

# Efí - API Cobranças (opcional)
EFI_CLIENT_ID=seu_client_id_efi_aqui
EFI_CLIENT_SECRET=seu_client_secret_efi_aqui
EFI_BASE_URL=https://cobrancas-h.api.efipay.com.br

# Servidor
PORT=3000
NODE_ENV=production
```

## Instalação e Execução

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   - Copie o arquivo `env.example` para `.env`
   - Configure suas chaves de API

3. **Executar em produção:**
   ```bash
   npm start
   ```

4. **Executar em desenvolvimento:**
   ```bash
   npm run dev
   ```

## Credenciais de Login

- **Usuário:** Tiago
- **Senha:** medup1302@

## Funcionalidades

- ✅ Visualização de status de clientes
- ✅ Integração com Asaas API
- ✅ Integração com Efí API (opcional)
- ✅ Filtros avançados
- ✅ Paginação
- ✅ Modal de detalhes do cliente
- ✅ Sistema de login
- ✅ Tema escuro responsivo
- ✅ Layout 2x2 até 1x4 no modal

## Estrutura do Projeto

```
medup-pagamentos/
├── public/
│   ├── index.html          # Página principal
│   ├── login.html          # Página de login
│   ├── js/
│   │   └── app.js          # JavaScript principal
│   └── favicon.svg         # Ícone do site
├── services/
│   ├── asaasService.js     # Serviço Asaas
│   └── efiService.js       # Serviço Efí
├── server.js               # Servidor Express
├── package.json            # Dependências
└── .env                    # Variáveis de ambiente
```

## Deploy

Para fazer deploy em produção:

1. Configure as variáveis de ambiente
2. Execute `npm install`
3. Execute `npm start`
4. Acesse `http://localhost:3000`

O sistema estará rodando na porta 3000 (ou na porta definida na variável PORT).
