const axios = require('axios');

class EfiService {
  constructor() {
    this.clientId = process.env.EFI_CLIENT_ID;
    this.clientSecret = process.env.EFI_CLIENT_SECRET;
    this.baseURL = process.env.EFI_BASE_URL || 'https://cobrancas-h.api.efipay.com.br';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Obter token de autorização OAuth2
  async getAccessToken() {
    try {
      // Verificar se o token ainda é válido
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.accessToken;
      }

      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(
        `${this.baseURL}/v1/authorize`,
        {
          grant_type: 'client_credentials'
        },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      return this.accessToken;
    } catch (error) {
      console.error('Erro ao obter token de acesso:', error.response?.data || error.message);
      throw error;
    }
  }

  // Configurar cliente autenticado
  async getAuthenticatedClient() {
    const token = await this.getAccessToken();
    
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Buscar boletos
  async getBoletos(params = {}) {
    try {
      const client = await this.getAuthenticatedClient();
      const response = await client.get('/v1/boletos', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar boletos:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar boleto específico por ID
  async getBoletoById(id) {
    try {
      const client = await this.getAuthenticatedClient();
      const response = await client.get(`/v1/boletos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar boleto específico:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar cobranças por cartão
  async getCobrancasCartao(params = {}) {
    try {
      const client = await this.getAuthenticatedClient();
      const response = await client.get('/v1/cobrancas/cartao', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cobranças por cartão:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar carnês
  async getCarnes(params = {}) {
    try {
      const client = await this.getAuthenticatedClient();
      const response = await client.get('/v1/carnes', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar carnês:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar carnê específico por ID
  async getCarneById(id) {
    try {
      const client = await this.getAuthenticatedClient();
      const response = await client.get(`/v1/carnes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar carnê específico:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar assinaturas
  async getAssinaturas(params = {}) {
    try {
      const client = await this.getAuthenticatedClient();
      const response = await client.get('/v1/assinaturas', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar assinatura específica por ID
  async getAssinaturaById(id) {
    try {
      const client = await this.getAuthenticatedClient();
      const response = await client.get(`/v1/assinaturas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar assinatura específica:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar links de pagamento
  async getLinksPagamento(params = {}) {
    try {
      const client = await this.getAuthenticatedClient();
      const response = await client.get('/v1/links', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar links de pagamento:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar link de pagamento específico por ID
  async getLinkPagamentoById(id) {
    try {
      const client = await this.getAuthenticatedClient();
      const response = await client.get(`/v1/links/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar link de pagamento específico:', error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar cobranças vencidas
  async getCobrancasVencidas(params = {}) {
    try {
      const client = await this.getAuthenticatedClient();
      const response = await client.get('/v1/boletos', { 
        params: { 
          ...params, 
          status: 'VENCIDO' 
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
      const client = await this.getAuthenticatedClient();
      const response = await client.get('/v1/boletos', { 
        params: { 
          ...params, 
          status: 'PENDENTE' 
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
      const client = await this.getAuthenticatedClient();
      const response = await client.get('/v1/boletos', { 
        params: { 
          ...params, 
          status: 'PAGO' 
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
      const client = await this.getAuthenticatedClient();
      const response = await client.get('/v1/boletos', { 
        params: { 
          ...params,
          dataInicio: dataInicio,
          dataFim: dataFim
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cobranças por período:', error.response?.data || error.message);
      throw error;
    }
  }

  // Gerar relatório consolidado de cobranças
  async getRelatorioCobrancas() {
    try {
      const [boletos, carnês, assinaturas, links] = await Promise.all([
        this.getBoletos(),
        this.getCarnes(),
        this.getAssinaturas(),
        this.getLinksPagamento()
      ]);

      const relatorio = {
        totalBoletos: boletos.data?.length || 0,
        totalCarnês: carnês.data?.length || 0,
        totalAssinaturas: assinaturas.data?.length || 0,
        totalLinks: links.data?.length || 0,
        boletosVencidos: boletos.data?.filter(boleto => boleto.status === 'VENCIDO').length || 0,
        boletosPendentes: boletos.data?.filter(boleto => boleto.status === 'PENDENTE').length || 0,
        boletosPagos: boletos.data?.filter(boleto => boleto.status === 'PAGO').length || 0,
        valorTotalVencido: boletos.data?.filter(boleto => boleto.status === 'VENCIDO')
          .reduce((total, boleto) => total + (boleto.valor || 0), 0) || 0,
        valorTotalPendente: boletos.data?.filter(boleto => boleto.status === 'PENDENTE')
          .reduce((total, boleto) => total + (boleto.valor || 0), 0) || 0,
        resumo: {
          boletos: boletos.data?.length || 0,
          carnês: carnês.data?.length || 0,
          assinaturas: assinaturas.data?.length || 0,
          links: links.data?.length || 0
        }
      };

      return relatorio;
    } catch (error) {
      console.error('Erro ao gerar relatório de cobranças:', error);
      throw error;
    }
  }
}

module.exports = new EfiService();
