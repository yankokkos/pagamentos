# Medup Pagamentos - Documentação

## Visão Geral

O Medup Pagamentos é um aplicativo web para visualizar e monitorar o status dos seus clientes através das APIs do Asaas e Efí. O sistema permite apenas operações de **leitura** para garantir a segurança dos dados.

## Funcionalidades

### 📊 Dashboard Principal
- **Estatísticas em tempo real**: Total de clientes, inadimplentes, valores devidos
- **Filtros avançados**: Por nome, status, fonte de dados
- **Interface responsiva**: Funciona em desktop e mobile

### 👥 Gestão de Clientes
- Visualização completa dos dados dos clientes
- Status financeiro detalhado (regular, inadimplente, a cobrar, vencido)
- Histórico de pagamentos
- Detalhes de inadimplência

### 🔗 Integrações
- **Asaas**: Clientes, cobranças, assinaturas
- **Efí**: Cobranças PIX, transações, saldo

## Instalação e Configuração

### 1. Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Asaas com API habilitada
- Conta na Efí com certificado P12

### 2. Instalação Automática
```bash
# Dar permissão de execução
chmod +x setup.sh

# Executar configuração
./setup.sh
```

### 3. Instalação Manual
```bash
# Instalar dependências
npm install

# Copiar arquivo de configuração
cp env.example .env

# Criar diretório para certificados
mkdir certificados
```

### 4. Configuração das Credenciais

Edite o arquivo `.env` com suas credenciais:

```env
# Asaas
ASAAS_API_KEY=sua_chave_api_asaas
ASAAS_BASE_URL=https://www.asaas.com/api/v3

# Efí
EFI_CLIENT_ID=seu_client_id_efi
EFI_CLIENT_SECRET=seu_client_secret_efi
EFI_CERT_PATH=./certificados/certificado.p12
EFI_BASE_URL=https://pix.api.efipay.com.br

# Servidor
PORT=3000
NODE_ENV=development
```

### 5. Configuração do Certificado Efí

1. Baixe seu certificado P12 da conta Efí
2. Coloque o arquivo no diretório `certificados/`
3. Atualize o caminho no arquivo `.env` se necessário

## Como Usar

### 1. Iniciar o Servidor
```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

### 2. Acessar o Aplicativo
Abra seu navegador e acesse: `http://localhost:3000`

### 3. Navegar pela Interface

#### Dashboard Principal
- Visualize estatísticas gerais no topo da página
- Use os filtros para encontrar clientes específicos
- Clique em "Atualizar" para sincronizar dados

#### Tabela de Clientes
- Veja todos os clientes em uma tabela organizada
- Use os filtros para encontrar informações específicas
- Clique no ícone de olho para ver detalhes completos

#### Modal de Detalhes
- Visualize informações completas do cliente
- Veja status financeiro detalhado
- Identifique a fonte dos dados (Asaas ou Efí)

## APIs Disponíveis

### Endpoints do Servidor

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/clientes` | GET | Lista todos os clientes do Asaas |
| `/api/cobrancas` | GET | Lista todas as cobranças do Asaas |
| `/api/pix-cobrancas` | GET | Lista cobranças PIX da Efí |
| `/api/status-clientes` | GET | Status consolidado de todos os clientes |

### Exemplos de Uso

```javascript
// Buscar clientes
fetch('/api/clientes')
  .then(response => response.json())
  .then(data => console.log(data));

// Buscar status consolidado
fetch('/api/status-clientes')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Estrutura do Projeto

```
medup-pagamentos/
├── public/
│   └── index.html          # Interface web
├── services/
│   ├── asaasService.js     # Integração com Asaas
│   └── efiService.js       # Integração com Efí
├── certificados/           # Certificados P12
├── server.js              # Servidor principal
├── package.json           # Dependências
├── .env                   # Configurações (não versionado)
└── README.md              # Documentação
```

## Segurança

### 🔒 Medidas Implementadas
- **Rate Limiting**: Máximo 100 requests por IP a cada 15 minutos
- **CORS**: Configurado para segurança
- **Helmet**: Headers de segurança HTTP
- **Apenas Leitura**: Nenhuma operação de escrita implementada

### ⚠️ Boas Práticas
- Mantenha suas credenciais seguras
- Não compartilhe o arquivo `.env`
- Use HTTPS em produção
- Monitore logs de acesso

## Troubleshooting

### Problemas Comuns

#### 1. Erro de Certificado Efí
```
Erro: Certificado não encontrado ou inválido
```
**Solução**: Verifique se o certificado P12 está no local correto e se o caminho no `.env` está correto.

#### 2. Erro de Autenticação Asaas
```
Erro: 401 Unauthorized
```
**Solução**: Verifique se a chave API do Asaas está correta no arquivo `.env`.

#### 3. Servidor não inicia
```
Error: listen EADDRINUSE :::3000
```
**Solução**: A porta 3000 está em uso. Altere a porta no arquivo `.env` ou pare o processo que está usando a porta.

### Logs e Debug

Para ativar logs detalhados:
```bash
NODE_ENV=development npm run dev
```

## Suporte

Para dúvidas ou problemas:
1. Verifique a documentação das APIs:
   - [Asaas API](https://docs.asaas.com/)
   - [Efí API](https://dev.efipay.com.br/docs/api-pix/)

2. Consulte os logs do servidor para erros específicos

3. Verifique se todas as credenciais estão configuradas corretamente

## Licença

MIT License - Veja o arquivo LICENSE para detalhes.
