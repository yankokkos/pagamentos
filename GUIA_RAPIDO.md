# 🚀 Medup Pagamentos - Guia Rápido

## ⚡ Início Rápido

### 1. Instalar e Configurar
```bash
# Instalar dependências
npm install

# Configurar credenciais
cp env.example .env
# Edite o arquivo .env com suas credenciais
```

### 2. Configurar Credenciais

**Asaas:**
- Acesse sua conta Asaas
- Vá em "Integrações" > "API"
- Copie sua chave API para `ASAAS_API_KEY` no arquivo `.env`

**Efí:**
- Acesse sua conta Efí
- Vá em "API" > "Aplicações"
- Habilite a "API de Emissões" (API Cobranças)
- Copie `Client ID` e `Client Secret` para o arquivo `.env`

### 3. Executar
```bash
npm run dev
```

### 4. Acessar
Abra: http://localhost:3000

## 📋 Checklist de Configuração

- [ ] Node.js instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Chave API do Asaas configurada
- [ ] Credenciais da Efí configuradas
- [ ] API de Emissões da Efí habilitada
- [ ] Servidor executando (`npm run dev`)

## 🎯 Funcionalidades

✅ **Visualizar clientes** do Asaas e Efí
✅ **Status financeiro** (regular, inadimplente, a cobrar, vencido)
✅ **Filtros** por nome, status, fonte
✅ **Estatísticas** em tempo real
✅ **Detalhes** completos de cada cliente
✅ **Apenas leitura** - sem risco de alterar dados

## 🔧 Resolução de Problemas

### Erro de Autorização Efí
```
401 Unauthorized
```
**Solução:** Verifique se as credenciais da Efí estão corretas e se a API de Emissões está habilitada

### Erro 401 (Asaas)
```
401 Unauthorized
```
**Solução:** Verifique se a chave API do Asaas está correta no `.env`

### Porta em Uso
```
Error: listen EADDRINUSE :::3000
```
**Solução:** Altere a porta no `.env` ou pare o processo que está usando a porta 3000

## 📞 Suporte

- Documentação completa: `DOCUMENTACAO.md`
- APIs: [Asaas](https://docs.asaas.com/) | [Efí](https://dev.efipay.com.br/docs/api-pix/)

---
**⚠️ Importante:** Este aplicativo faz apenas leitura dos dados. Nenhuma operação de escrita está implementada para garantir a segurança.
