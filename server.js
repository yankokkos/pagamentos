const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const asaasService = require('./services/asaasService');
const efiService = require('./services/efiService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://api.asaas.com", "https://cobrancas-h.api.efipay.com.br"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
    },
  },
}));
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP por janela
});
app.use(limiter);

// Middleware para parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static('public'));

// Rotas da API
app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await asaasService.getClientes();
    res.json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/cobrancas', async (req, res) => {
  try {
    const cobrancas = await asaasService.getCobrancas();
    res.json(cobrancas);
  } catch (error) {
    console.error('Erro ao buscar cobranças:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar dados históricos do Asaas
app.get('/api/asaas-historico', async (req, res) => {
    try {
        const { meses = 6, status } = req.query;
        
        let cobrancas;
        if (status) {
            cobrancas = await asaasService.getCobrancasPorStatus(status, { limit: 1000 });
        } else {
            cobrancas = await asaasService.getCobrancasHistoricas({ limit: 1000 });
        }
        
        res.json(cobrancas);
    } catch (error) {
        console.error('Erro ao buscar dados históricos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para buscar detalhes de um cliente específico
app.get('/api/cliente-detalhes/:clienteId', async (req, res) => {
    try {
        const { clienteId } = req.params;
        
        // Buscar cobranças do cliente dos últimos 6 meses
        const seisMesesAtras = new Date();
        seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
        
        const cobrancas = await asaasService.getCobrancasPorCliente(clienteId, {
            limit: 1000,
            'dateCreated[ge]': seisMesesAtras.toISOString().split('T')[0]
        });
        
        res.json({
            clienteId,
            cobrancas: cobrancas.data || []
        });
    } catch (error) {
        console.error('Erro ao buscar detalhes do cliente:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.get('/api/efi-cobrancas', async (req, res) => {
  try {
    if (!process.env.EFI_CLIENT_ID || !process.env.EFI_CLIENT_SECRET) {
      return res.json({ data: [], message: 'Credenciais da Efí não configuradas' });
    }
    const cobrancas = await efiService.getBoletos();
    res.json(cobrancas);
  } catch (error) {
    console.error('Erro ao buscar cobranças Efí:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/efi-carnes', async (req, res) => {
  try {
    if (!process.env.EFI_CLIENT_ID || !process.env.EFI_CLIENT_SECRET) {
      return res.json({ data: [], message: 'Credenciais da Efí não configuradas' });
    }
    const carnês = await efiService.getCarnes();
    res.json(carnês);
  } catch (error) {
    console.error('Erro ao buscar carnês Efí:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/efi-assinaturas', async (req, res) => {
  try {
    if (!process.env.EFI_CLIENT_ID || !process.env.EFI_CLIENT_SECRET) {
      return res.json({ data: [], message: 'Credenciais da Efí não configuradas' });
    }
    const assinaturas = await efiService.getAssinaturas();
    res.json(assinaturas);
  } catch (error) {
    console.error('Erro ao buscar assinaturas Efí:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/efi-links', async (req, res) => {
  try {
    if (!process.env.EFI_CLIENT_ID || !process.env.EFI_CLIENT_SECRET) {
      return res.json({ data: [], message: 'Credenciais da Efí não configuradas' });
    }
    const links = await efiService.getLinksPagamento();
    res.json(links);
  } catch (error) {
    console.error('Erro ao buscar links Efí:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/status-clientes', async (req, res) => {
  try {
    // Buscar dados do Asaas com limite maior e dados históricos
    const [clientes, cobrancas, cobrancasHistoricas] = await Promise.all([
      asaasService.getClientes({ limit: 1000 }),
      asaasService.getCobrancas({ limit: 1000 }),
      asaasService.getCobrancasHistoricas({ limit: 2000 })
    ]);

    let efiCobrancas = { data: [] };
    
    // Tentar buscar dados da Efí se as credenciais estiverem configuradas
    if (process.env.EFI_CLIENT_ID && process.env.EFI_CLIENT_SECRET) {
      try {
        efiCobrancas = await efiService.getBoletos();
      } catch (efiError) {
        console.warn('Aviso: Não foi possível conectar com a Efí:', efiError.message);
        // Continuar sem os dados da Efí
      }
    } else {
      console.log('Aviso: Credenciais da Efí não configuradas. Usando apenas dados do Asaas.');
    }

    // Combinar cobranças atuais com históricas (removendo duplicatas)
    const todasCobrancas = [...cobrancas.data, ...cobrancasHistoricas.data];
    const cobrancasUnicas = todasCobrancas.filter((cobranca, index, self) => 
      index === self.findIndex(c => c.id === cobranca.id)
    );

    // Processar dados para criar status consolidado
    const statusClientes = processarStatusClientes(clientes, { data: cobrancasUnicas }, efiCobrancas);
    
    res.json(statusClientes);
  } catch (error) {
    console.error('Erro ao processar status dos clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para processar e consolidar status dos clientes
function processarStatusClientes(clientes, cobrancas, efiCobrancas) {
  const statusMap = new Map();

  // Processar clientes do Asaas
  clientes.data?.forEach(cliente => {
    const status = {
      id: cliente.id,
      nome: cliente.name,
      email: cliente.email,
      cpfCnpj: cliente.cpfCnpj,
      telefone: cliente.phone,
      status: 'regular', // padrão
      inadimplencia: 0,
      cobrancasVencidas: 0,
      valorDevido: 0,
      valorPago: 0,
      ultimoPagamento: null,
      ultimoVencimento: null,
      statusUltimoBoleto: null,
      ultimaAtividade: null, // última atividade do cliente
      ativo: !cliente.deleted, // cliente ativo se não estiver deletado
      fonte: 'asaas'
    };
    statusMap.set(cliente.id, status);
  });

  // Processar cobranças do Asaas
  cobrancas.data?.forEach(cobranca => {
    const clienteId = cobranca.customer;
    if (statusMap.has(clienteId)) {
      const status = statusMap.get(clienteId);
      
      if (cobranca.status === 'OVERDUE') {
        status.inadimplencia++;
        status.cobrancasVencidas++;
        status.valorDevido += cobranca.value;
        status.status = 'inadimplente';
      } else if (cobranca.status === 'PENDING') {
        status.status = 'a_cobrar';
        status.valorDevido += cobranca.value;
      } else if (cobranca.status === 'RECEIVED') {
        status.valorPago += cobranca.value;
        status.status = 'regular';
      }
      
      // Atualizar último pagamento se houver
      if (cobranca.paymentDate) {
        if (!status.ultimoPagamento || new Date(cobranca.paymentDate) > new Date(status.ultimoPagamento)) {
          status.ultimoPagamento = cobranca.paymentDate;
        }
        // Atualizar última atividade
        if (!status.ultimaAtividade || new Date(cobranca.paymentDate) > new Date(status.ultimaAtividade)) {
          status.ultimaAtividade = cobranca.paymentDate;
        }
      }
      
      // Atualizar data de vencimento do último boleto
      if (cobranca.dueDate) {
        if (!status.ultimoVencimento || new Date(cobranca.dueDate) > new Date(status.ultimoVencimento)) {
          status.ultimoVencimento = cobranca.dueDate;
          status.statusUltimoBoleto = cobranca.status;
        }
        // Atualizar última atividade (cobrança criada)
        if (!status.ultimaAtividade || new Date(cobranca.dueDate) > new Date(status.ultimaAtividade)) {
          status.ultimaAtividade = cobranca.dueDate;
        }
      }
      
      // Atualizar última atividade com data de criação da cobrança
      if (cobranca.dateCreated) {
        if (!status.ultimaAtividade || new Date(cobranca.dateCreated) > new Date(status.ultimaAtividade)) {
          status.ultimaAtividade = cobranca.dateCreated;
        }
      }
    }
  });

  // Processar cobranças da Efí (boletos)
  efiCobrancas.data?.forEach(cobranca => {
    const clienteId = cobranca.cliente?.id || cobranca.id;
    if (!statusMap.has(clienteId)) {
      // Criar entrada para cliente da Efí se não existir
      const status = {
        id: clienteId,
        nome: cobranca.cliente?.nome || cobranca.pagador?.nome || 'Cliente Efí',
        email: cobranca.cliente?.email || cobranca.pagador?.email || '',
        cpfCnpj: cobranca.cliente?.cpfCnpj || cobranca.pagador?.cpfCnpj || '',
        telefone: cobranca.cliente?.telefone || cobranca.pagador?.telefone || '',
        status: 'regular',
        inadimplencia: 0,
        cobrancasVencidas: 0,
        valorDevido: 0,
        ultimoPagamento: null,
        fonte: 'efi'
      };
      statusMap.set(clienteId, status);
    }

    const status = statusMap.get(clienteId);
    
    if (cobranca.status === 'VENCIDO') {
      status.inadimplencia++;
      status.cobrancasVencidas++;
      status.valorDevido += cobranca.valor || 0;
      status.status = 'inadimplente';
    } else if (cobranca.status === 'PENDENTE') {
      status.status = 'a_cobrar';
    } else if (cobranca.status === 'PAGO' && cobranca.dataPagamento) {
      status.ultimoPagamento = cobranca.dataPagamento;
    }
  });

  // Verificar clientes inativos (sem atividade há mais de 3 meses)
  const tresMesesAtras = new Date();
  tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
  
  statusMap.forEach((status, clienteId) => {
    // Se não há última atividade ou é muito antiga, marcar como inativo
    if (!status.ultimaAtividade || new Date(status.ultimaAtividade) < tresMesesAtras) {
      status.ativo = false;
    }
  });

  return Array.from(statusMap.values());
}

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
