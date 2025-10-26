const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const asaasService = require('./services/asaasService');
const efiService = require('./services/efiService');

const app = express();
const PORT = process.env.PORT || 3000;

// Debug: Verificar variáveis de ambiente críticas
console.log('=== DEBUG ENVIRONMENT VARIABLES ===');
console.log('ASAAS_API_KEY:', process.env.ASAAS_API_KEY ? 'SET' : 'NOT SET');
console.log('ASAAS_API_KEY length:', process.env.ASAAS_API_KEY ? process.env.ASAAS_API_KEY.length : 0);
console.log('ASAAS_API_KEY preview:', process.env.ASAAS_API_KEY ? process.env.ASAAS_API_KEY.substring(0, 20) + '...' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('TRUST_PROXY:', process.env.TRUST_PROXY);
console.log('=====================================');

// Configurações para certificados auto-assinados/inválidos
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('⚠️  SSL verification disabled for development');
}

// Trust proxy para Coolify
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', true);
}

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://api.asaas.com", "https://cobrancas-h.api.efipay.com.br"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  hsts: false // Desabilitar HSTS para evitar problemas com SSL inválido
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  trustProxy: false, // Desabilitar trust proxy para rate limiting
  skip: (req) => {
    // Pular rate limiting para health check
    return req.path === '/api/health';
  }
});
app.use(limiter);

// Middleware para parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso necessário' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'medup-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Servir arquivos estáticos
app.use(express.static('public'));

// Rota para página de login
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// Rota de login (sem autenticação)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Credenciais hardcoded conforme solicitado
  if (username === 'Tiago' && password === 'medup1302@') {
    const token = jwt.sign(
      { username: 'Tiago', role: 'admin' },
      process.env.JWT_SECRET || 'medup-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        username: 'Tiago',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

// Rota de logout
app.post('/api/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Middleware para verificar autenticação em rotas protegidas
app.use((req, res, next) => {
  // Permitir acesso à página de login, rota de login da API e arquivos estáticos
  if (req.path === '/login' || req.path === '/api/login' || req.path.startsWith('/css/') || req.path.startsWith('/js/') || req.path.startsWith('/img/')) {
    return next();
  }
  
  // Para outras rotas, verificar se está autenticado
  if (req.path === '/' || req.path.startsWith('/api/')) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({ message: 'Token de acesso necessário' });
      } else {
        return res.redirect('/login');
      }
    }
    
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'medup-secret-key');
      next();
    } catch (error) {
      if (req.path.startsWith('/api/')) {
        return res.status(403).json({ message: 'Token inválido' });
      } else {
        return res.redirect('/login');
      }
    }
  } else {
    next();
  }
});

// Rotas da API (protegidas)
app.get('/api/clientes', authenticateToken, async (req, res) => {
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
app.get('/api/cliente-detalhes/:clienteId', authenticateToken, async (req, res) => {
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

app.get('/api/status-clientes', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Iniciando busca de dados do Asaas...');
    
    // Testar conexão com Asaas primeiro
    try {
      console.log('🧪 Testando conexão com Asaas...');
      const testResponse = await asaasService.getClientes({ limit: 1 });
      console.log('✅ Teste Asaas OK:', testResponse ? 'SUCCESS' : 'FAILED');
    } catch (testError) {
      console.error('❌ Teste Asaas FALHOU:', testError.message);
      throw new Error(`Falha na conexão com Asaas: ${testError.message}`);
    }
    
    // Buscar dados do Asaas com limite maior e dados históricos
    console.log('📡 Buscando dados completos...');
    const [clientes, cobrancas, cobrancasHistoricas] = await Promise.all([
      asaasService.getClientes({ limit: 1000 }),
      asaasService.getCobrancas({ limit: 1000 }),
      asaasService.getCobrancasHistoricas({ limit: 2000 })
    ]);

    console.log('📊 Dados recebidos:');
    console.log('- Clientes:', clientes ? 'OK' : 'ERRO', clientes?.data?.length || 0, 'registros');
    console.log('- Cobranças:', cobrancas ? 'OK' : 'ERRO', cobrancas?.data?.length || 0, 'registros');
    console.log('- Cobranças Históricas:', cobrancasHistoricas ? 'OK' : 'ERRO', cobrancasHistoricas?.data?.length || 0, 'registros');

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

    // Validar se os dados são arrays válidos
    const clientesData = Array.isArray(clientes?.data) ? clientes.data : [];
    const cobrancasData = Array.isArray(cobrancas?.data) ? cobrancas.data : [];
    const cobrancasHistoricasData = Array.isArray(cobrancasHistoricas?.data) ? cobrancasHistoricas.data : [];

    console.log('✅ Dados validados:');
    console.log('- Clientes válidos:', clientesData.length);
    console.log('- Cobranças válidas:', cobrancasData.length);
    console.log('- Cobranças Históricas válidas:', cobrancasHistoricasData.length);

    // Combinar cobranças atuais com históricas (removendo duplicatas)
    const todasCobrancas = [...cobrancasData, ...cobrancasHistoricasData];
    const cobrancasUnicas = todasCobrancas.filter((cobranca, index, self) => 
      index === self.findIndex(c => c.id === cobranca.id)
    );

    console.log('🔄 Cobranças únicas:', cobrancasUnicas.length);

    // Processar dados para criar status consolidado
    const statusClientes = processarStatusClientes({ data: clientesData }, { data: cobrancasUnicas }, efiCobrancas);
    
    console.log('✅ Status processado:', statusClientes.length, 'clientes');
    res.json(statusClientes);
  } catch (error) {
    console.error('❌ Erro ao processar status dos clientes:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // Retornar erro mais específico para debug
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message,
      type: error.name
    });
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
