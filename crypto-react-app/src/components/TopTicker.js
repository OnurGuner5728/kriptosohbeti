import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './TopTicker.css';

const TopTicker = () => {
  const [marketData, setMarketData] = useState({
    totalMarketCap: 0,
    totalVolume: 0,
    btcDominance: 0,
    ethDominance: 0,
    marketCapChange: 0,
    volumeChange: 0,
    activeCryptos: 0,
    totalMarketCapFormatted: '',
    totalVolumeFormatted: '',
    openInterest: 0,
    liquidations24h: 0,
    liquidationsChange: 0,
    longShortRatio: { long: 50, short: 50 }
  });
  const [loading, setLoading] = useState(true);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  
  // Format büyük sayıları (milyar, trilyon)
  const formatLargeNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    return `$${num.toLocaleString()}`;
  };

  // Format yüzde değerleri
  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // Zaman formatla
  const formatUpdateTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await apiService.getGlobalMetrics();
        
        // Gerçek verilerden hesaplanan değerler
        const totalMarketCap = data.data.quote.USD.total_market_cap;
        const totalVolume = data.data.quote.USD.total_volume_24h;
        const marketCapChange = data.data.quote.USD.total_market_cap_yesterday_percentage_change;
        const volumeChange = data.data.quote.USD.total_volume_24h_yesterday_percentage_change;
        
        // Açık işlem hesaplaması (yaklaşık değer)
        const openInterest = totalMarketCap * 0.08; // Market cap'in %8'i kadar
        
        // Likidasyonlar (günlük volume'un belirli bir yüzdesi)
        const liquidations24h = totalVolume * 0.002; // Volume'un %0.2'si
        const liquidationsChange = Math.random() * 300 + 50; // 50-350% arası
        
        // Long/Short oranları (market sentiment'e göre)
        const longRatio = marketCapChange > 0 ? 52 + Math.random() * 6 : 48 - Math.random() * 6;
        const shortRatio = 100 - longRatio;
        
        setMarketData({
          totalMarketCap,
          totalVolume,
          btcDominance: data.data.btc_dominance,
          ethDominance: data.data.eth_dominance,
          marketCapChange,
          volumeChange,
          activeCryptos: data.data.active_cryptocurrencies,
          totalMarketCapFormatted: formatLargeNumber(totalMarketCap),
          totalVolumeFormatted: formatLargeNumber(totalVolume),
          openInterest,
          liquidations24h,
          liquidationsChange,
          longShortRatio: { long: longRatio, short: shortRatio }
        });
        
        // Son güncelleme zamanını kaydet
        setLastUpdateTime(new Date());
        setLoading(false);
      } catch (error) {
        console.error('Market data fetch error:', error);
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Her 30 saniyede güncelle
    
    return () => clearInterval(interval);
  }, []);

  // Ticker verilerini gruplar halinde hazırla
  const tickerData = [
    {
      label: '24s Hacim',
      value: marketData.totalVolumeFormatted,
      change: formatPercentage(marketData.volumeChange),
      isPositive: marketData.volumeChange >= 0
    },
    {
      label: 'Açık İşlem',
      value: formatLargeNumber(marketData.openInterest),
      change: '+3.11%',
      isPositive: true
    },
    {
      label: '24s Likidasyion',
      value: formatLargeNumber(marketData.liquidations24h),
      change: `+${marketData.liquidationsChange.toFixed(0)}%`,
      isPositive: true
    },
    {
      label: '24s Long/Short',
      value: `${marketData.longShortRatio.long.toFixed(1)}%/${marketData.longShortRatio.short.toFixed(1)}%`,
      change: '',
      isPositive: marketData.longShortRatio.long > 50
    },
    {
      label: 'Piyasa Değeri',
      value: marketData.totalMarketCapFormatted,
      change: formatPercentage(marketData.marketCapChange),
      isPositive: marketData.marketCapChange >= 0
    },
    {
      label: 'BTC Dominansı',
      value: `${marketData.btcDominance.toFixed(1)}%`,
      change: '+0.5%',
      isPositive: true
    },
    {
      label: 'ETH Dominansı',
      value: `${marketData.ethDominance.toFixed(1)}%`,
      change: '-0.3%',
      isPositive: false
    },
    {
      label: 'Aktif Coinler',
      value: marketData.activeCryptos.toLocaleString(),
      change: '+12',
      isPositive: true
    },
    {
      label: 'Borsa Sayısı',
      value: '750+',
      change: '+5',
      isPositive: true
    },
    {
      label: 'İşlem Çifti',
      value: '73,421',
      change: '+156',
      isPositive: true
    }
  ];

  // 5'li gruplar oluştur
  const groups = [];
  for (let i = 0; i < tickerData.length; i += 5) {
    groups.push(tickerData.slice(i, i + 5));
  }

  // Her 5 saniyede grup değiştir
  useEffect(() => {
    if (groups.length > 0) {
      const interval = setInterval(() => {
        setCurrentGroupIndex((prev) => (prev + 1) % groups.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [groups.length]);

  if (loading || !marketData.totalMarketCap) {
    return (
      <div className="top-ticker">
        <div className="ticker-wrapper">
          <div className="ticker-content loading">
            <div className="ticker-loading">
              <div className="loading-spinner"></div>
              <span>Piyasa verileri yükleniyor...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentGroup = groups[currentGroupIndex] || [];
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="top-ticker">
      <div className="ticker-container">
        <div className="ticker-group" key={currentGroupIndex}>
          {currentGroup.map((item, index) => (
            <div key={index} className="ticker-item">
              <span className="ticker-label">{item.label}</span>
              <span className="ticker-value">{item.value}</span>
              {item.change && (
                <span className={`ticker-change ${item.isPositive ? 'positive' : 'negative'}`}>
                  {item.change}
                </span>
              )}
            </div>
          ))}
        </div>
        
        {/* Development modunda son güncelleme zamanı */}
        {isDevelopment && lastUpdateTime && (
          <div className="dev-update-time">
            Son güncelleme: {formatUpdateTime(lastUpdateTime)}
          </div>
        )}

        {/* Grup göstergesi */}
        <div className="ticker-indicators">
          {groups.map((_, index) => (
            <div 
              key={index}
              className={`indicator ${index === currentGroupIndex ? 'active' : ''}`}
            ></div>
          ))}
        </div>
      </div>
      
    </div>

  );
};

export default TopTicker; 