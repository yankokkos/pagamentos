const axios = require('axios');

class AsaasService {
  constructor() {
    this.apiKey = process.env.ASAAS_API_KEY;
    this.baseURL = process.env.ASAAS_BASE_URL || 'https://www.asaas.com/api/v3';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'access_token': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  // Buscar todos os clientes com paginação
  async getClientes(params = {}) {
    try {
      const limit = params.limit || 100;
      const allData = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore && allData.length < limit) {
        const response = await this.client.get('/customers', { 
          params: { 
            ...params, 
            limit: Math.min(100, limit - allData.length), // Asaas limita a 100 por requisição
            offset 
          } 
        });
        
        if (response.data.data && response.data.data.length > 0) {
          allData.push(...response.data.data);
          offset += response.data.data.length;
          hasMore = response.data.hasMore || false;
        } else {
          hasMore = false;
        }
      }

      return {
        data: allData.slice(0, limit),
        hasMore: allData.length >= limit,
        totalCount: allData.length
      };
    } catch (error) {
      console.error('Erro ao buscar clientes do Asaas:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar cliente específico por ID
  async getClienteById(id) {
    try {
      const response = await this.client.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cliente específico:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar todas as cobranças com paginação
  async getCobrancas(params = {}) {
    try {
      const limit = params.limit || 100;
      const allData = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore && allData.length < limit) {
        const response = await this.client.get('/payments', { 
          params: { 
            ...params, 
            limit: Math.min(100, limit - allData.length), // Asaas limita a 100 por requisição
            offset 
          } 
        });
        
        if (response.data.data && response.data.data.length > 0) {
          allData.push(...response.data.data);
          offset += response.data.data.length;
          hasMore = response.data.hasMore || false;
        } else {
          hasMore = false;
        }
      }

      return {
        data: allData.slice(0, limit),
        hasMore: allData.length >= limit,
        totalCount: allData.length
      };
    } catch (error) {
      console.error('Erro ao buscar cobranças do Asaas:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar cobranças de um cliente específico
  async getCobrancasByCliente(clienteId, params = {}) {
    try {
      const response = await this.client.get(`/customers/${clienteId}/payments`, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cobranças do cliente:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar cobranças vencidas
  async getCobrancasVencidas(params = {}) {
    try {
      const response = await this.client.get('/payments', { 
        params: { 
          ...params, 
          status: 'OVERDUE' 
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cobranças vencidas:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar cobranças pendentes
  async getCobrancasPendentes(params = {}) {
    try {
      const response = await this.client.get('/payments', { 
        params: { 
          ...params, 
          status: 'PENDING' 
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cobranças pendentes:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar cobranças pagas
  async getCobrancasPagas(params = {}) {
    try {
      const response = await this.client.get('/payments', { 
        params: { 
          ...params, 
          status: 'RECEIVED' 
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cobranças pagas:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar cobranças por período
  async getCobrancasPorPeriodo(dataInicio, dataFim, params = {}) {
    try {
      const response = await this.client.get('/payments', { 
        params: { 
          ...params,
          'dateCreated[ge]': dataInicio,
          'dateCreated[le]': dataFim
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cobranças por período:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar cobranças dos últimos 6 meses (para dados históricos)
  async getCobrancasHistoricas(params = {}) {
    try {
      const seisMesesAtras = new Date();
      seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
      
      const response = await this.client.get('/payments', { 
        params: { 
          ...params,
          'dateCreated[ge]': seisMesesAtras.toISOString().split('T')[0],
          limit: 1000 // Aumentar limite para pegar mais dados históricos
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cobranças históricas:', error.response?.data || error.message);
      throw error;
    }
  }

    // Buscar cobranças por status específico
    async getCobrancasPorStatus(status, params = {}) {
        try {
            const response = await this.client.get('/payments', { 
                params: { 
                    ...params,
                    status: status
                } 
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar cobranças com status ${status}:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Buscar cobranças por cliente específico
    async getCobrancasPorCliente(customerId, params = {}) {
        try {
            const response = await this.client.get('/payments', { 
                params: { 
                    ...params,
                    customer: customerId
                } 
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar cobranças do cliente ${customerId}:`, error.response?.data || error.message);
            throw error;
        }
    }

  // Buscar assinaturas
  async getAssinaturas(params = {}) {
    try {
      const response = await this.client.get('/subscriptions', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar relatório de inadimplência
  async getRelatorioInadimplencia() {
    try {
      const [cobrancasVencidas, clientes] = await Promise.all([
        this.getCobrancasVencidas(),
        this.getClientes()
      ]);

      const relatorio = {
        totalClientes: clientes.data?.length || 0,
        totalCobrancasVencidas: cobrancasVencidas.data?.length || 0,
        valorTotalDevido: cobrancasVencidas.data?.reduce((total, cobranca) => total + cobranca.value, 0) || 0,
        clientesInadimplentes: new Set(cobrancasVencidas.data?.map(c => c.customer)).size,
        detalhes: cobrancasVencidas.data?.map(cobranca => ({
          id: cobranca.id,
          cliente: cobranca.customer,
          valor: cobranca.value,
          vencimento: cobranca.dueDate,
          diasAtraso: this.calcularDiasAtraso(cobranca.dueDate)
        })) || []
      };

      return relatorio;
    } catch (error) {
      console.error('Erro ao gerar relatório de inadimplência:', error);
      throw error;
    }
  }

  // Calcular dias de atraso
  calcularDiasAtraso(dataVencimento) {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffTime = hoje - vencimento;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

module.exports = new AsaasService();
