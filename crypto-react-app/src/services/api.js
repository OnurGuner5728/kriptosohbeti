import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 saniye timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - istekler için
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - cevaplar için
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('Backend API sunucusuna bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.');
    }
    return Promise.reject(error);
  }
);

// API Functions
export const apiService = {
  // Backend durumunu kontrol et
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend API erişilemez durumda');
    }
  },

  // Kripto para verilerini getir
  async getCryptoData(limit = 100) {
    try {
      const response = await api.get(`/crypto-data?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error('Kripto para verileri alınamadı');
    }
  },

  // Long/Short verilerini getir
  async getLongShortData() {
    try {
      const response = await api.get('/long-short');
      return response.data;
    } catch (error) {
      throw new Error('Long/Short verileri alınamadı');
    }
  },

  // Piyasa genel bilgilerini getir
  async getMarketOverview() {
    try {
      const response = await api.get('/crypto-data?limit=10');
      const data = response.data.data;
      
      // Piyasa değeri ve hacim hesaplamaları
      const totalMarketCap = data.reduce((sum, coin) => sum + coin.quote.USD.market_cap, 0);
      const totalVolume = data.reduce((sum, coin) => sum + coin.quote.USD.volume_24h, 0);
      const btcCoin = data.find(coin => coin.symbol === 'BTC');
      const ethCoin = data.find(coin => coin.symbol === 'ETH');
      
      const btcDominance = btcCoin ? (btcCoin.quote.USD.market_cap / totalMarketCap) * 100 : 0;
      const ethDominance = ethCoin ? (ethCoin.quote.USD.market_cap / totalMarketCap) * 100 : 0;
      
      return {
        totalMarketCap,
        totalVolume,
        btcDominance,
        ethDominance,
        marketCapChange: 0, // Bu veri backend'de hesaplanabilir
        volumeChange: 0,
      };
    } catch (error) {
      throw new Error('Piyasa verileri alınamadı');
    }
  },

  // Yükselenler ve düşenleri getir
  async getMovers() {
    try {
      const response = await api.get('/crypto-data?limit=50');
      const data = response.data.data;
      
      const sortedData = [...data].sort((a, b) => 
        (b.quote.USD.percent_change_24h || 0) - (a.quote.USD.percent_change_24h || 0)
      );
      
      return {
        gainers: sortedData.slice(0, 10),
        losers: sortedData.slice(-10).reverse(),
      };
    } catch (error) {
      throw new Error('Yükselenler/düşenler verileri alınamadı');
    }
  },

  // Haberleri getir
  async getNews() {
    try {
      const response = await api.get('/news');
      return response.data;
    } catch (error) {
      throw new Error('Haber verileri alınamadı');
    }
  },

  // Borsaları getir
  async getExchanges() {
    try {
      const response = await api.get('/exchanges');
      return response.data;
    } catch (error) {
      throw new Error('Borsa verileri alınamadı');
    }
  },

  // Etkinlikleri getir
  async getEvents() {
    try {
      const response = await api.get('/events');
      return response.data;
    } catch (error) {
      throw new Error('Etkinlik verileri alınamadı');
    }
  },

  // Global piyasa metriklerini getir
  async getGlobalMetrics() {
    try {
      const response = await api.get('/global-metrics');
      return response.data;
    } catch (error) {
      throw new Error('Global piyasa verileri alınamadı');
    }
  },
};

// Utility Functions
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatLargeNumber = (value) => {
  // Null, undefined veya geçersiz değerler için kontrol
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  const numValue = parseFloat(value);
  
  if (numValue >= 1e12) {
    return (numValue / 1e12).toFixed(2) + 'T';
  } else if (numValue >= 1e9) {
    return (numValue / 1e9).toFixed(2) + 'B';
  } else if (numValue >= 1e6) {
    return (numValue / 1e6).toFixed(2) + 'M';
  } else if (numValue >= 1e3) {
    return (numValue / 1e3).toFixed(2) + 'K';
  }
  return numValue.toFixed(2);
};

export const formatPercentage = (value) => {
  const sign = value >= 0 ? '+' : '';
  const className = value >= 0 ? 'positive' : 'negative';
  return {
    value: `${sign}${value.toFixed(2)}%`,
    className,
  };
};

export default api; 