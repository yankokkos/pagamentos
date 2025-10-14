# MedUp Pagamentos

Aplicativo para visualizar status de clientes usando APIs do Asaas e Efí.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente no arquivo `.env`:
```env
# Asaas
ASAAS_API_KEY=your_asaas_api_key
ASAAS_BASE_URL=https://www.asaas.com/api/v3

# Efí - API Cobranças
EFI_CLIENT_ID=your_efi_client_id
EFI_CLIENT_SECRET=your_efi_client_secret
EFI_BASE_URL=https://cobrancas-h.api.efipay.com.br

# Servidor
PORT=3000
NODE_ENV=development
```

3. Execute o servidor:
```bash
npm run dev
```

## Funcionalidades

- Visualização de clientes do Asaas
- Visualização de cobranças da Efí (boletos, carnês, assinaturas, links)
- Status de pagamentos (regular, inadimplente, vencido, etc.)
- Interface web responsiva

## Segurança

- Rate limiting
- CORS configurado
- Helmet para headers de segurança
- Apenas operações de leitura implementadas
