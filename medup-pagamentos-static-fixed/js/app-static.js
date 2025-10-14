// MedUp Pagamentos - JavaScript para hospedagem estática 
// Simulação de dados para demonstração 
let dadosClientes = [ 
  { 
    id: '1', 
    nome: 'João Silva', 
    cpfCnpj: '123.456.789-00', 
    status: 'Regular', 
    inadimplencia: 0, 
    valorDevido: 0, 
    valorPago: 1500, 
    ultimoPagamento: '2024-01-15', 
    ultimoVencimento: '2024-02-15', 
    ultimaAtividade: '2024-01-15', 
    ativo: true, 
    fonte: 'Asaas' 
  }, 
  { 
    id: '2', 
    nome: 'Maria Santos', 
    cpfCnpj: '987.654.321-00', 
    status: 'Inadimplente', 
    inadimplencia: 30, 
    valorDevido: 500, 
    valorPago: 0, 
    ultimoPagamento: '2023-12-15', 
    ultimoVencimento: '2024-01-15', 
    ultimaAtividade: '2024-01-15', 
    ativo: true, 
    fonte: 'Efí' 
  } 
]; 
let dadosClientes = [];
let clientesFiltrados = [];
let paginaAtual = 1;
const itensPorPagina = 20;
let ordenacaoAtual = { campo: null, direcao: 'asc' };

// Carregar dados iniciais
document.addEventListener('DOMContentLoaded', function() {
    carregarDados();
    configurarFiltros();
});

// Carregar dados dos clientes
async function carregarDados() {
    const loading = document.getElementById('loading');
    loading.classList.add('show');

    try {
        const response = await fetch('/api/status-clientes');
        dadosClientes = await response.json();
        
        atualizarEstatisticas();
        atualizarTabela();
        
        // Verificar se há mensagem sobre Efí não configurada
        if (dadosClientes.length === 0) {
            mostrarMensagemInfo('Apenas dados do Asaas estão sendo exibidos. Configure as credenciais da Efí para ver dados completos.');
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados dos clientes');
    } finally {
        loading.classList.remove('show');
    }
}

// Mostrar mensagem informativa
function mostrarMensagemInfo(mensagem) {
    // Criar ou atualizar mensagem de aviso
    let alertDiv = document.getElementById('alert-info');
    if (!alertDiv) {
        alertDiv = document.createElement('div');
        alertDiv.id = 'alert-info';
        alertDiv.className = 'alert alert-info alert-dismissible fade show';
        alertDiv.innerHTML = `
            <i class="fas fa-info-circle me-2"></i>
            <span id="alert-message">${mensagem}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Inserir após o navbar
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
    } else {
        document.getElementById('alert-message').textContent = mensagem;
    }
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    // Aplicar os mesmos filtros da tabela
    const filtroNome = document.getElementById('filtroNome').value.toLowerCase();
    const filtroStatus = document.getElementById('filtroStatus').value;
    const filtroAtivo = document.getElementById('filtroAtivo').value;
    const filtroFonte = document.getElementById('filtroFonte').value;

    let clientesFiltrados = dadosClientes.filter(cliente => {
        const nomeMatch = cliente.nome.toLowerCase().includes(filtroNome);
        const statusMatch = !filtroStatus || cliente.status === filtroStatus;
        const ativoMatch = filtroAtivo === '' || cliente.ativo.toString() === filtroAtivo;
        const fonteMatch = !filtroFonte || cliente.fonte === filtroFonte;
        
        return nomeMatch && statusMatch && ativoMatch && fonteMatch;
    });

    const totalClientes = clientesFiltrados.length;
    const totalInadimplentes = clientesFiltrados.filter(c => c.status === 'inadimplente').length;
    const totalACobrar = clientesFiltrados.filter(c => c.status === 'a_cobrar').length;
    const valorDevido = clientesFiltrados.reduce((total, c) => total + (c.valorDevido || 0), 0);

    document.getElementById('totalClientes').textContent = totalClientes;
    document.getElementById('totalInadimplentes').textContent = totalInadimplentes;
    document.getElementById('totalACobrar').textContent = totalACobrar;
    document.getElementById('valorDevido').textContent = 
        new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        }).format(valorDevido);
}

// Atualizar tabela
function atualizarTabela() {
    const tbody = document.getElementById('tabelaClientes');
    
    // Filtros principais
    const filtroNome = document.getElementById('filtroNome').value.toLowerCase();
    const filtroStatus = document.getElementById('filtroStatus').value;
    const filtroAtivo = document.getElementById('filtroAtivo').value;
    const filtroFonte = document.getElementById('filtroFonte').value;
    
    // Filtros por coluna
    const filtroNomeColuna = document.getElementById('filtroNomeColuna')?.value.toLowerCase() || '';
    const filtroCpfCnpjColuna = document.getElementById('filtroCpfCnpjColuna')?.value.toLowerCase() || '';
    const filtroStatusColuna = document.getElementById('filtroStatusColuna')?.value || '';
    const filtroAtivoColuna = document.getElementById('filtroAtivoColuna')?.value || '';
    const filtroFonteColuna = document.getElementById('filtroFonteColuna')?.value || '';
    const filtroInadimplenciaMin = parseFloat(document.getElementById('filtroInadimplenciaMin')?.value) || 0;
    const filtroValorDevidoMin = parseFloat(document.getElementById('filtroValorDevidoMin')?.value) || 0;
    const filtroValorPagoMin = parseFloat(document.getElementById('filtroValorPagoMin')?.value) || 0;
    const filtroUltimoPagamentoMin = document.getElementById('filtroUltimoPagamentoMin')?.value || '';
    const filtroUltimoVencimentoMin = document.getElementById('filtroUltimoVencimentoMin')?.value || '';
    const filtroUltimaAtividadeMin = document.getElementById('filtroUltimaAtividadeMin')?.value || '';

    clientesFiltrados = dadosClientes.filter(cliente => {
        // Filtros principais
        const nomeMatch = cliente.nome.toLowerCase().includes(filtroNome);
        const statusMatch = !filtroStatus || cliente.status === filtroStatus;
        const ativoMatch = filtroAtivo === '' || cliente.ativo.toString() === filtroAtivo;
        const fonteMatch = !filtroFonte || cliente.fonte === filtroFonte;
        
        // Filtros por coluna
        const nomeColunaMatch = !filtroNomeColuna || cliente.nome.toLowerCase().includes(filtroNomeColuna);
        const cpfCnpjMatch = !filtroCpfCnpjColuna || (cliente.cpfCnpj && cliente.cpfCnpj.toLowerCase().includes(filtroCpfCnpjColuna));
        const statusColunaMatch = !filtroStatusColuna || cliente.status === filtroStatusColuna;
        const ativoColunaMatch = !filtroAtivoColuna || cliente.ativo.toString() === filtroAtivoColuna;
        const fonteColunaMatch = !filtroFonteColuna || cliente.fonte === filtroFonteColuna;
        
        // Filtros numéricos
        const inadimplenciaMatch = filtroInadimplenciaMin === 0 || (cliente.inadimplencia && cliente.inadimplencia >= filtroInadimplenciaMin);
        const valorDevidoMatch = filtroValorDevidoMin === 0 || (cliente.valorDevido && cliente.valorDevido >= filtroValorDevidoMin);
        const valorPagoMatch = filtroValorPagoMin === 0 || (cliente.valorPago && cliente.valorPago >= filtroValorPagoMin);
        
        // Filtros de data
        const ultimoPagamentoMatch = !filtroUltimoPagamentoMin || (cliente.ultimoPagamento && new Date(cliente.ultimoPagamento) >= new Date(filtroUltimoPagamentoMin));
        const ultimoVencimentoMatch = !filtroUltimoVencimentoMin || (cliente.ultimoVencimento && new Date(cliente.ultimoVencimento) >= new Date(filtroUltimoVencimentoMin));
        const ultimaAtividadeMatch = !filtroUltimaAtividadeMin || (cliente.ultimaAtividade && new Date(cliente.ultimaAtividade) >= new Date(filtroUltimaAtividadeMin));
        
        return nomeMatch && statusMatch && ativoMatch && fonteMatch &&
               nomeColunaMatch && cpfCnpjMatch && statusColunaMatch && ativoColunaMatch && fonteColunaMatch &&
               inadimplenciaMatch && valorDevidoMatch && valorPagoMatch &&
               ultimoPagamentoMatch && ultimoVencimentoMatch && ultimaAtividadeMatch;
    });

    // Aplicar ordenação
    aplicarOrdenacao();

    // Resetar para primeira página quando aplicar filtros
    paginaAtual = 1;

    // Atualizar contador de registros
    document.getElementById('totalRegistros').textContent = `${clientesFiltrados.length} registros`;

    if (clientesFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center text-muted">
                    Nenhum cliente encontrado com os filtros aplicados
                </td>
            </tr>
        `;
        atualizarPaginacao();
        return;
    }

    // Atualizar conteúdo da tabela
    atualizarConteudoTabela();

    // Atualizar paginação e estatísticas
    atualizarPaginacao();
    atualizarEstatisticas();
}

// Atualizar apenas o conteúdo da tabela (sem refiltrar)
function atualizarConteudoTabela() {
    const tbody = document.getElementById('tabelaClientes');
    const cardsContainer = document.getElementById('cardsClientes');
    
    if (clientesFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center text-muted">
                    Nenhum cliente encontrado com os filtros aplicados
                </td>
            </tr>
        `;
        
        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="text-center text-muted p-4">
                    Nenhum cliente encontrado com os filtros aplicados
                </div>
            `;
        }
        return;
    }

    // Calcular paginação
    const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina);
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const clientesPagina = clientesFiltrados.slice(inicio, fim);

    // Atualizar tabela desktop
    tbody.innerHTML = clientesPagina.map(cliente => `
        <tr class="cliente-row" data-cliente-id="${cliente.id}" style="cursor: pointer;">
            <td>${cliente.nome || '-'}</td>
            <td>${cliente.cpfCnpj || '-'}</td>
            <td>
                <span class="badge badge-status ${getStatusClass(cliente.status)}">
                    ${getStatusText(cliente.status)}
                </span>
            </td>
            <td>${cliente.inadimplencia}</td>
            <td>${formatarMoeda(cliente.valorDevido || 0)}</td>
            <td>${formatarMoeda(cliente.valorPago || 0)}</td>
            <td>${formatarData(cliente.ultimoPagamento)}</td>
            <td>${formatarVencimento(cliente.ultimoVencimento, cliente.statusUltimoBoleto)}</td>
            <td>${formatarUltimaAtividade(cliente.ultimaAtividade)}</td>
            <td>
                <span class="badge ${cliente.ativo ? 'bg-success' : 'bg-danger'}">
                    ${cliente.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>
                <span class="badge bg-info">${cliente.fonte.toUpperCase()}</span>
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-primary" onclick="verDetalhes('${cliente.id}')" title="Ver Detalhes">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Atualizar cards mobile
    if (cardsContainer) {
        cardsContainer.innerHTML = clientesPagina.map(cliente => `
            <div class="card bg-dark border-secondary mb-3 mx-3 cliente-card" data-cliente-id="${cliente.id}" style="cursor: pointer;" onclick="verDetalhes('${cliente.id}')">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="card-title mb-0 text-truncate" style="max-width: 70%;">${cliente.nome || '-'}</h6>
                        <span class="badge badge-status ${getStatusClass(cliente.status)}">
                            ${getStatusText(cliente.status)}
                        </span>
                    </div>
                    
                    <div class="row g-2 mb-2">
                        <div class="col-6">
                            <small class="text-muted">CPF/CNPJ:</small>
                            <div class="fw-bold">${cliente.cpfCnpj || '-'}</div>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">Fonte:</small>
                            <div>
                                <span class="badge bg-info">${cliente.fonte.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row g-2 mb-2">
                        <div class="col-6">
                            <small class="text-muted">Valor Devido:</small>
                            <div class="fw-bold text-danger">${formatarMoeda(cliente.valorDevido || 0)}</div>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">Valor Pago:</small>
                            <div class="fw-bold text-success">${formatarMoeda(cliente.valorPago || 0)}</div>
                        </div>
                    </div>
                    
                    <div class="row g-2 mb-2">
                        <div class="col-6">
                            <small class="text-muted">Último Pagamento:</small>
                            <div>${formatarData(cliente.ultimoPagamento)}</div>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">Status:</small>
                            <div>
                                <span class="badge ${cliente.ativo ? 'bg-success' : 'bg-danger'}">
                                    ${cliente.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">Última Atividade: ${formatarUltimaAtividade(cliente.ultimaAtividade)}</small>
                        <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); verDetalhes('${cliente.id}')" title="Ver Detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Configurar filtros
function configurarFiltros() {
    document.getElementById('filtroNome').addEventListener('input', atualizarTabela);
    document.getElementById('filtroStatus').addEventListener('change', atualizarTabela);
    document.getElementById('filtroAtivo').addEventListener('change', atualizarTabela);
    document.getElementById('filtroFonte').addEventListener('change', atualizarTabela);
    
    // Botão de atualizar
    document.getElementById('btn-atualizar').addEventListener('click', function(e) {
        e.preventDefault();
        carregarDados();
    });
    
    // Configurar filtros por coluna
    configurarFiltrosColuna();
}

// Configurar filtros por coluna
function configurarFiltrosColuna() {
    // Filtros de texto
    const filtrosTexto = ['filtroNomeColuna', 'filtroCpfCnpjColuna'];
    filtrosTexto.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('input', atualizarTabela);
        }
    });
    
    // Filtros de select
    const filtrosSelect = ['filtroStatusColuna', 'filtroAtivoColuna', 'filtroFonteColuna'];
    filtrosSelect.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('change', atualizarTabela);
        }
    });
    
    // Filtros numéricos
    const filtrosNumericos = ['filtroInadimplenciaMin', 'filtroValorDevidoMin', 'filtroValorPagoMin'];
    filtrosNumericos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('input', atualizarTabela);
        }
    });
    
    // Filtros de data
    const filtrosData = ['filtroUltimoPagamentoMin', 'filtroUltimoVencimentoMin', 'filtroUltimaAtividadeMin'];
    filtrosData.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('change', atualizarTabela);
        }
    });
}

// Função de ordenação
function ordenarPor(campo) {
    if (ordenacaoAtual.campo === campo) {
        ordenacaoAtual.direcao = ordenacaoAtual.direcao === 'asc' ? 'desc' : 'asc';
    } else {
        ordenacaoAtual.campo = campo;
        ordenacaoAtual.direcao = 'asc';
    }
    
    aplicarOrdenacao();
    atualizarTabela();
}

// Aplicar ordenação
function aplicarOrdenacao() {
    if (!ordenacaoAtual.campo) return;
    
    clientesFiltrados.sort((a, b) => {
        let valorA = a[ordenacaoAtual.campo];
        let valorB = b[ordenacaoAtual.campo];
        
        // Tratar valores nulos/undefined
        if (valorA === null || valorA === undefined) valorA = '';
        if (valorB === null || valorB === undefined) valorB = '';
        
        // Tratar datas
        if (ordenacaoAtual.campo.includes('Data') || ordenacaoAtual.campo.includes('Pagamento') || ordenacaoAtual.campo.includes('Vencimento') || ordenacaoAtual.campo.includes('Atividade')) {
            valorA = valorA ? new Date(valorA) : new Date(0);
            valorB = valorB ? new Date(valorB) : new Date(0);
        }
        
        // Tratar valores numéricos
        if (ordenacaoAtual.campo.includes('Valor') || ordenacaoAtual.campo.includes('inadimplencia')) {
            valorA = parseFloat(valorA) || 0;
            valorB = parseFloat(valorB) || 0;
        }
        
        // Tratar booleanos
        if (ordenacaoAtual.campo === 'ativo') {
            valorA = valorA ? 1 : 0;
            valorB = valorB ? 1 : 0;
        }
        
        // Comparar valores
        if (valorA < valorB) return ordenacaoAtual.direcao === 'asc' ? -1 : 1;
        if (valorA > valorB) return ordenacaoAtual.direcao === 'asc' ? 1 : -1;
        return 0;
    });
}

// Obter classe CSS do status da cobrança
function getStatusCobrancaClass(status) {
    const classes = {
        'PENDING': 'bg-warning',
        'RECEIVED': 'bg-success',
        'OVERDUE': 'bg-danger',
        'CANCELLED': 'bg-secondary',
        'REFUNDED': 'bg-info'
    };
    return classes[status] || 'bg-secondary';
}

// Obter texto do status da cobrança
function getStatusCobrancaText(status) {
    const textos = {
        'PENDING': 'Pendente',
        'RECEIVED': 'Pago',
        'OVERDUE': 'Vencido',
        'CANCELLED': 'Cancelado',
        'REFUNDED': 'Estornado'
    };
    return textos[status] || status;
}

// Obter texto do status
function getStatusText(status) {
    const textos = {
        'regular': 'Regular',
        'inadimplente': 'Inadimplente',
        'a_cobrar': 'A Cobrar',
        'vencido': 'Vencido'
    };
    return textos[status] || status;
}

// Obter classe CSS do status
function getStatusClass(status) {
    const classes = {
        'regular': 'bg-success',
        'inadimplente': 'bg-danger',
        'a_cobrar': 'bg-warning',
        'vencido': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
}

// Formatar moeda
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    }).format(valor);
}

// Formatar data
function formatarData(data) {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
}

// Formatar vencimento com status visual
function formatarVencimento(dataVencimento, statusBoleto) {
    if (!dataVencimento) return '-';
    
    const dataVenc = new Date(dataVencimento);
    const hoje = new Date();
    const diffTime = dataVenc - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let classe = '';
    let texto = dataVenc.toLocaleDateString('pt-BR');
    
    if (statusBoleto === 'RECEIVED') {
        classe = 'text-success';
        texto += ' ✓';
    } else if (statusBoleto === 'OVERDUE' || diffDays < 0) {
        classe = 'text-danger fw-bold';
        texto += ' ⚠';
    } else if (diffDays <= 3) {
        classe = 'text-warning fw-bold';
        texto += ' ⚡';
    } else {
        classe = 'text-light';
    }
    
    return `<span class="${classe}">${texto}</span>`;
}

// Formatar última atividade com cores baseadas na idade
function formatarUltimaAtividade(dataAtividade) {
    if (!dataAtividade) return '<span class="text-muted">-</span>';
    
    const dataAtiv = new Date(dataAtividade);
    const hoje = new Date();
    const diffTime = hoje - dataAtiv;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let classe = '';
    let texto = dataAtiv.toLocaleDateString('pt-BR');
    
    if (diffDays > 90) { // Mais de 3 meses
        classe = 'text-danger fw-bold';
        texto += ' ⚠';
    } else if (diffDays > 30) { // Mais de 1 mês
        classe = 'text-warning fw-bold';
        texto += ' ⚡';
    } else if (diffDays > 7) { // Mais de 1 semana
        classe = 'text-info';
    } else {
        classe = 'text-success';
        texto += ' ✓';
    }
    
    return `<span class="${classe}">${texto}</span>`;
}

// Atualizar paginação
function atualizarPaginacao() {
    const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina);
    const inicio = (paginaAtual - 1) * itensPorPagina + 1;
    const fim = Math.min(paginaAtual * itensPorPagina, clientesFiltrados.length);
    
    // Atualizar informação de paginação
    document.getElementById('info-paginacao').textContent = 
        `Mostrando ${inicio} a ${fim} de ${clientesFiltrados.length} registros`;
    
    // Gerar botões de paginação
    const paginacao = document.getElementById('paginacao');
    paginacao.innerHTML = '';
    
    if (totalPaginas <= 1) return;
    
    // Botão Anterior
    const liAnterior = document.createElement('li');
    liAnterior.className = `page-item ${paginaAtual === 1 ? 'disabled' : ''}`;
    liAnterior.innerHTML = `<a class="page-link" href="#" data-pagina="${paginaAtual - 1}">Anterior</a>`;
    paginacao.appendChild(liAnterior);
    
    // Botões de página
    const inicioPagina = Math.max(1, paginaAtual - 2);
    const fimPagina = Math.min(totalPaginas, paginaAtual + 2);
    
    for (let i = inicioPagina; i <= fimPagina; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === paginaAtual ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" data-pagina="${i}">${i}</a>`;
        paginacao.appendChild(li);
    }
    
    // Botão Próximo
    const liProximo = document.createElement('li');
    liProximo.className = `page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}`;
    liProximo.innerHTML = `<a class="page-link" href="#" data-pagina="${paginaAtual + 1}">Próximo</a>`;
    paginacao.appendChild(liProximo);
    
    // Adicionar event listeners
    paginacao.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const novaPagina = parseInt(this.getAttribute('data-pagina'));
            if (novaPagina >= 1 && novaPagina <= totalPaginas && novaPagina !== paginaAtual) {
                paginaAtual = novaPagina;
                atualizarConteudoTabela();
                atualizarPaginacao();
            }
        });
    });
}

// Ver detalhes do cliente
// Ver detalhes do cliente
async function verDetalhes(clienteId) {
    const cliente = dadosClientes.find(c => c.id === clienteId);
    if (!cliente) return;

    // Mostrar loading
    const modalBody = document.getElementById('modalDetalhesBody');
    modalBody.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="mt-2">Carregando detalhes do cliente...</p>
        </div>
    `;

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('modalDetalhes'));
    modal.show();

    try {
        // Buscar histórico de cobranças dos últimos 6 meses
        const response = await fetch(`/api/cliente-detalhes/${clienteId}`);
        const dadosDetalhes = await response.json();

        // Atualizar título do modal
        document.querySelector('#modalDetalhes .modal-title').innerHTML = `
            <i class="fas fa-user me-2"></i>${cliente.nome || 'Cliente sem nome'}
        `;

              // Renderizar conteúdo do modal
              modalBody.innerHTML = `
                  <div class="row g-3 mb-4">
                      <!-- Informações Básicas -->
                      <div class="col-12 col-sm-6 col-lg-3">
                          <div class="card h-100">
                              <div class="card-header">
                                  <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Informações Básicas</h6>
                              </div>
                              <div class="card-body">
                                  <div class="d-flex justify-content-between align-items-start mb-2">
                                      <strong>Nome:</strong>
                                      <span class="text-end small" style="max-width: 65%; word-wrap: break-word;">${cliente.nome || '-'}</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>CPF/CNPJ:</strong>
                                      <span class="font-monospace small">${cliente.cpfCnpj || '-'}</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-start mb-2">
                                      <strong>Email:</strong>
                                      <span class="text-end small" style="max-width: 65%; word-wrap: break-word;">${cliente.email || '-'}</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Telefone:</strong>
                                      <span class="font-monospace small">${cliente.telefone || '-'}</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Status:</strong>
                                      <span class="badge ${getStatusClass(cliente.status)}">
                                          ${getStatusText(cliente.status)}
                                      </span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Ativo:</strong>
                                      <span class="badge ${cliente.ativo ? 'bg-success' : 'bg-danger'}">
                                          ${cliente.ativo ? 'Sim' : 'Não'}
                                      </span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center">
                                      <strong>Fonte:</strong>
                                      <span class="badge bg-info">${cliente.fonte.toUpperCase()}</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <!-- Resumo Financeiro -->
                      <div class="col-12 col-sm-6 col-lg-3">
                          <div class="card h-100">
                              <div class="card-header">
                                  <h6 class="mb-0"><i class="fas fa-chart-line me-2"></i>Resumo Financeiro</h6>
                              </div>
                              <div class="card-body">
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Valor Devido:</strong>
                                      <span class="text-danger fw-bold">${formatarMoeda(cliente.valorDevido || 0)}</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Valor Pago:</strong>
                                      <span class="text-success fw-bold">${formatarMoeda(cliente.valorPago || 0)}</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Inadimplência:</strong>
                                      <span class="badge bg-warning">${cliente.inadimplencia || 0} cobrança(s)</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Cobranças Vencidas:</strong>
                                      <span class="badge bg-danger">${cliente.cobrancasVencidas || 0}</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Último Pagamento:</strong>
                                      <span class="font-monospace small">${formatarData(cliente.ultimoPagamento)}</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center">
                                      <strong>Última Atividade:</strong>
                                      <span class="font-monospace small">${formatarUltimaAtividade(cliente.ultimaAtividade)}</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <!-- Análise de Status -->
                      <div class="col-12 col-sm-6 col-lg-3">
                          <div class="card h-100">
                              <div class="card-header">
                                  <h6 class="mb-0"><i class="fas fa-chart-pie me-2"></i>Análise de Status</h6>
                              </div>
                              <div class="card-body">
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Situação:</strong>
                                      <span class="badge ${cliente.valorDevido > cliente.valorPago ? 'bg-danger' : 'bg-success'}">
                                          ${cliente.valorDevido > cliente.valorPago ? 'Em Débito' : 'Em Dia'}
                                      </span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Saldo:</strong>
                                      <span class="fw-bold ${(cliente.valorDevido - cliente.valorPago) > 0 ? 'text-danger' : 'text-success'}">
                                          ${formatarMoeda((cliente.valorDevido || 0) - (cliente.valorPago || 0))}
                                      </span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Taxa Pagamento:</strong>
                                      <span class="fw-bold text-white">
                                          ${cliente.valorDevido > 0 ? Math.round(((cliente.valorPago || 0) / cliente.valorDevido) * 100) : 0}%
                                      </span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Último Vencimento:</strong>
                                      <span class="font-monospace small">${formatarVencimento(cliente.ultimoVencimento, cliente.statusUltimoBoleto)}</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center">
                                      <strong>Dias Inatividade:</strong>
                                      <span class="fw-bold text-white">
                                          ${cliente.ultimaAtividade ? Math.floor((new Date() - new Date(cliente.ultimaAtividade)) / (1000 * 60 * 60 * 24)) : 'N/A'} dias
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <!-- Resumo de Cobranças -->
                      <div class="col-12 col-sm-6 col-lg-3">
                          <div class="card h-100">
                              <div class="card-header">
                                  <h6 class="mb-0"><i class="fas fa-receipt me-2"></i>Resumo de Cobranças</h6>
                              </div>
                              <div class="card-body">
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Total Cobranças:</strong>
                                      <span class="fw-bold text-white">${dadosDetalhes.cobrancas ? dadosDetalhes.cobrancas.length : 0}</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Pendentes:</strong>
                                      <span class="badge bg-warning">${dadosDetalhes.cobrancas ? dadosDetalhes.cobrancas.filter(c => c.status === 'PENDING').length : 0}</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Pagas:</strong>
                                      <span class="badge bg-success">${dadosDetalhes.cobrancas ? dadosDetalhes.cobrancas.filter(c => c.status === 'RECEIVED').length : 0}</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Vencidas:</strong>
                                      <span class="badge bg-danger">${dadosDetalhes.cobrancas ? dadosDetalhes.cobrancas.filter(c => c.status === 'OVERDUE').length : 0}</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center mb-2">
                                      <strong>Canceladas:</strong>
                                      <span class="badge bg-secondary">${dadosDetalhes.cobrancas ? dadosDetalhes.cobrancas.filter(c => c.status === 'CANCELLED').length : 0}</span>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center">
                                      <strong>Valor Total:</strong>
                                      <span class="fw-bold text-primary">
                                          ${formatarMoeda(dadosDetalhes.cobrancas ? dadosDetalhes.cobrancas.reduce((total, c) => total + (c.value || 0), 0) : 0)}
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <!-- Histórico de Cobranças -->
                  <div class="card flex-grow-1">
                      <div class="card-header">
                          <h6 class="mb-0"><i class="fas fa-history me-2"></i>Histórico de Cobranças (Últimos 6 meses)</h6>
                      </div>
                      <div class="card-body p-0 flex-grow-1">
                          ${dadosDetalhes.cobrancas && dadosDetalhes.cobrancas.length > 0 ? `
                              <div class="table-responsive h-100">
                                  <table class="table table-hover mb-0">
                                      <thead class="sticky-top">
                                          <tr>
                                              <th style="min-width: 100px;">Data Criação</th>
                                              <th style="min-width: 100px;">Vencimento</th>
                                              <th style="min-width: 80px;">Valor</th>
                                              <th style="min-width: 80px;">Status</th>
                                              <th style="min-width: 100px;">Data Pagamento</th>
                                              <th style="min-width: 80px;">Valor Pago</th>
                                              <th>Descrição</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          ${dadosDetalhes.cobrancas.map(cobranca => `
                                              <tr>
                                                  <td class="font-monospace small">${formatarData(cobranca.dateCreated)}</td>
                                                  <td class="font-monospace small">${formatarVencimento(cobranca.dueDate, cobranca.status)}</td>
                                                  <td class="fw-bold text-end small">${formatarMoeda(cobranca.value || 0)}</td>
                                                  <td>
                                                      <span class="badge ${getStatusCobrancaClass(cobranca.status)}">
                                                          ${getStatusCobrancaText(cobranca.status)}
                                                      </span>
                                                  </td>
                                                  <td class="font-monospace small">${formatarData(cobranca.paymentDate)}</td>
                                                  <td class="fw-bold text-end small">${formatarMoeda(cobranca.value || 0)}</td>
                                                  <td class="text-truncate small" style="max-width: 200px;" title="${cobranca.description || '-'}">${cobranca.description || '-'}</td>
                                              </tr>
                                          `).join('')}
                                      </tbody>
                                  </table>
                              </div>
                          ` : `
                              <div class="text-center text-muted py-4">
                                  <i class="fas fa-inbox fa-2x mb-2"></i>
                                  <p>Nenhuma cobrança encontrada nos últimos 6 meses.</p>
                              </div>
                          `}
                      </div>
                  </div>
              `;
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        modalBody.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Erro ao carregar detalhes do cliente. Tente novamente.
            </div>
        `;
    }
}
