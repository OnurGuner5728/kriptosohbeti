import React, { useState, useEffect } from 'react';
import { apiService, formatCurrency, formatLargeNumber, formatPercentage } from '../services/api';
import CryptoDictionary from '../components/CryptoDictionary';
import './HomePage.css';

const HomePage = () => {
  const [marketData, setMarketData] = useState(null);
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [globalMetrics, setGlobalMetrics] = useState(null);
  const [fearGreedIndex, setFearGreedIndex] = useState(null);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Her 60 saniyede güncelle
    return () => clearInterval(interval);
  }, []);

  // Ana haber carousel için (auto play)
  useEffect(() => {
    if (newsData.length > 0 && isAutoPlay) {
      const carouselInterval = setInterval(() => {
        setCurrentNewsIndex((prevIndex) => (prevIndex + 1) % Math.min(newsData.length, 6));
      }, 5000); // Her 5 saniyede değiş
      
      return () => clearInterval(carouselInterval);
    }
  }, [newsData, isAutoPlay]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Backend durumunu kontrol et
      await apiService.checkHealth();
      setConnectionStatus('online');

      // Paralel olarak tüm verileri çek
      const [marketOverview, cryptoResponse, globalMetricsData, newsResponse, fearGreedData] = await Promise.all([
        apiService.getMarketOverview(),
        apiService.getCryptoData(20),
        fetch('http://localhost:5000/api/global-metrics').then(r => r.json()),
        apiService.getNews(),
        fetch('https://api.alternative.me/fng/?limit=1').then(r => r.json()).catch(() => null)
      ]);

      setMarketData(marketOverview);
      setCryptoData(cryptoResponse.data);
      setGlobalMetrics(globalMetricsData.data);
      setNewsData(newsResponse.data);
      
      if (fearGreedData) {
        setFearGreedIndex(fearGreedData.data[0]);
      }

      // En çok yükselenler (24h değişim % pozitif)
      const gainers = cryptoResponse.data
        .filter(crypto => crypto.quote.USD.percent_change_24h > 0)
        .sort((a, b) => b.quote.USD.percent_change_24h - a.quote.USD.percent_change_24h)
        .slice(0, 5);
      setTopGainers(gainers);
      
      // En çok düşenler (24h değişim % negatif)
      const losers = cryptoResponse.data
        .filter(crypto => crypto.quote.USD.percent_change_24h < 0)
        .sort((a, b) => a.quote.USD.percent_change_24h - b.quote.USD.percent_change_24h)
        .slice(0, 5);
      setTopLosers(losers);

    } catch (err) {
      console.error('Data loading error:', err);
      setError(err.message);
      setConnectionStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  // Fear & Greed Index gösterge rengini belirle
  const getFearGreedColor = (value) => {
    if (value <= 24) return '#ff3d3d'; // Extreme Fear
    if (value <= 49) return '#ff9800'; // Fear
    if (value <= 74) return '#ffeb3b'; // Neutral
    if (value <= 89) return '#4caf50'; // Greed
    return '#3ecf4c'; // Extreme Greed
  };

  const getFearGreedText = (value) => {
    if (value <= 24) return 'Extreme Fear';
    if (value <= 49) return 'Fear';
    if (value <= 74) return 'Neutral';
    if (value <= 89) return 'Greed';
    return 'Extreme Greed';
  };

  // Haber tıklama işlevi
  const handleNewsClick = (news) => {
    console.log('Clicked news:', news.title, news.id);
    setSelectedNews(news);
    setIsModalOpen(true);
    // Body scroll'u engelle
    document.body.style.overflow = 'hidden';
  };



  // Modal kapatma işlevi
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
    // Body scroll'u geri aç
    document.body.style.overflow = 'auto';
    // Auto-play'i tekrar başlat
    setIsAutoPlay(true);
  };

  // Escape tuşu ile modal kapatma
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen]);

  const StatusIndicator = () => (
    <div className={`status-indicator ${connectionStatus}`}>
      <i className={`fas ${connectionStatus === 'online' ? 'fa-check-circle' : connectionStatus === 'offline' ? 'fa-exclamation-circle' : 'fa-spinner fa-spin'}`}></i>
      {connectionStatus === 'online' && 'Backend Bağlantısı Aktif'}
      {connectionStatus === 'offline' && 'Backend Bağlantısı Yok'}
      {connectionStatus === 'checking' && 'Bağlantı Kontrol Ediliyor...'}
    </div>
  );

  if (loading && !marketData) {
    return (
      <div className="home-page">
        <StatusIndicator />
        <div className="container">
          <div className="loading">Veriler yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error && !marketData) {
    return (
      <div className="home-page">
        <StatusIndicator />
        <div className="container">
          <div className="error">
            <h3>Veri Yükleme Hatası</h3>
            <p>{error}</p>
            <p>Backend API sunucusunun çalıştığından emin olun: <code>python api_server.py</code></p>
            <button onClick={loadData} className="retry-btn">Tekrar Dene</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Haberler Kısmı - Carousel */}
      <section className="news-section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-newspaper"></i>
            Kripto Haberler
          </h2>
          
          {newsData.length > 0 ? (
            <div className="news-carousel-container">
              {/* Sol taraf - Ana haber carousel */}
              <div className="main-news-carousel">
                {newsData.slice(0, 6).map((news, index) => (
                  <div
                    key={news.id || index}
                    className={`main-news-slide ${index === currentNewsIndex ? 'active' : ''}`}
                    onClick={index === currentNewsIndex ? () => {
                      console.log('🎯 ANA CAROUSEL TIKLAMA:', index, '-', news.title);
                      setIsAutoPlay(false);
                      handleNewsClick(news);
                    } : undefined}
                    onMouseEnter={() => setIsAutoPlay(false)}
                    onMouseLeave={() => setIsAutoPlay(true)}
                  >
                    <div className="main-news-image">
                      <img
                        src={news.image && news.image !== '' ? news.image : `https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&auto=format&fit=crop`}
                        alt={news.title}
                        onError={(e) => {
                          e.target.src = `https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&auto=format&fit=crop`;
                        }}
                      />
                    </div>
                    <div className="main-news-overlay">
                      <div className="main-news-meta">
                        <span className={`main-news-category ${news.price_change !== undefined && news.price_change >= 0 ? 'positive' : news.price_change !== undefined ? 'negative' : 'neutral'}`}>
                          {news.category}
                        </span>
                        <span className="main-news-time">
                          {new Date(news.date).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <h3 className="main-news-title">{news.title}</h3>
                      <p className="main-news-desc">
                        {news.content.length > 120 ? news.content.slice(0, 120) + '...' : news.content}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Carousel indicators */}
                <div className="carousel-indicators">
                  {newsData.slice(0, 6).map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${index === currentNewsIndex ? 'active' : ''}`}
                      data-indicator-index={index}
                      onClick={(e) => {
                        const clickedIndex = parseInt(e.currentTarget.getAttribute('data-indicator-index'));
                        console.log('🔘 INDICATOR TIKLAMA:', clickedIndex);
                        setCurrentNewsIndex(clickedIndex);
                        setIsAutoPlay(false);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Sağ taraf - Akan haberler */}
              <div className="side-news-ticker">
                <div className="side-news-track">
                  {newsData.slice(0, 6).concat(newsData.slice(0, 6)).map((news, index) => (
                    <div
                      key={`side-${index}`}
                      className="side-news-item"
                      data-side-index={index}
                      onClick={(e) => {
                        const sideIndex = parseInt(e.currentTarget.getAttribute('data-side-index'));
                        const actualIndex = sideIndex % 6;
                        const carouselNews = newsData.slice(0, 6);
                        const selectedNewsItem = carouselNews[actualIndex];
                        console.log('👆 SAĞ HABER TIKLAMA:');
                        console.log('   Side Index:', sideIndex, '-> Actual:', actualIndex);
                        console.log('   Seçilen:', selectedNewsItem.title);
                        setCurrentNewsIndex(actualIndex);
                        handleNewsClick(selectedNewsItem);
                      }}
                    >
                      <div className="side-news-image">
                        <img
                          src={news.image && news.image !== '' ? news.image : `https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&auto=format&fit=crop`}
                          alt={news.title}
                          onError={(e) => {
                            e.target.src = `https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&auto=format&fit=crop`;
                          }}
                        />
                      </div>
                      <div className="side-news-content">
                        <h4 className="side-news-title">{news.title}</h4>
                        <div className="side-news-meta">
                          <span className="side-news-category">{news.category}</span>
                          <span className="side-news-date">
                            {new Date(news.date).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-news">
              <i className="fas fa-newspaper"></i>
              <p>Haberler yükleniyor...</p>
            </div>
          )}
        </div>
      </section>
      {/* Market Overview Section */}
      <section className="section">
          <h2 className="section-title">Piyasa Genel Bakış</h2>
          <div className="market-overview grid grid-3">
            <div className="overview-card card">
              <div className="overview-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Toplam Piyasa Değeri</h3>
              <div className="overview-value">
                ${globalMetrics ? formatLargeNumber(globalMetrics.quote.USD.total_market_cap) : 'Yükleniyor...'}
              </div>
              <div className="overview-change">
                <span className={globalMetrics && globalMetrics.quote.USD.total_market_cap_yesterday_percentage_change >= 0 ? 'positive' : 'negative'}>
                  {globalMetrics ? 
                    `${globalMetrics.quote.USD.total_market_cap_yesterday_percentage_change >= 0 ? '+' : ''}${globalMetrics.quote.USD.total_market_cap_yesterday_percentage_change.toFixed(2)}% (24s)` : 
                    'Yükleniyor...'}
                </span>
              </div>
            </div>

            <div className="overview-card card">
              <div className="overview-icon">
                <i className="fas fa-exchange-alt"></i>
              </div>
              <h3>24s Toplam Hacim</h3>
              <div className="overview-value">
                ${globalMetrics ? formatLargeNumber(globalMetrics.quote.USD.total_volume_24h) : 'Yükleniyor...'}
              </div>
              <div className="overview-change">
                <span className={globalMetrics && globalMetrics.quote.USD.total_volume_24h_yesterday_percentage_change >= 0 ? 'positive' : 'negative'}>
                  {globalMetrics ? 
                    `${globalMetrics.quote.USD.total_volume_24h_yesterday_percentage_change >= 0 ? '+' : ''}${globalMetrics.quote.USD.total_volume_24h_yesterday_percentage_change.toFixed(2)}% (24s)` : 
                    'Yükleniyor...'}
                </span>
              </div>
            </div>

            <div className="overview-card card">
              <div className="overview-icon">
                <i className="fab fa-bitcoin"></i>
              </div>
              <h3>Bitcoin Dominansı</h3>
              <div className="overview-value">
                {globalMetrics ? `${globalMetrics.btc_dominance.toFixed(2)}%` : 'Yükleniyor...'}
              </div>
              <div className="overview-change">
                <span className={globalMetrics && globalMetrics.btc_dominance_24h_percentage_change >= 0 ? 'positive' : 'negative'}>
                  {globalMetrics ? 
                    `${globalMetrics.btc_dominance_24h_percentage_change >= 0 ? '+' : ''}${globalMetrics.btc_dominance_24h_percentage_change.toFixed(2)}%` : 
                    'Yükleniyor...'}
                </span>
              </div>
            </div>
          </div>
        </section>

      {/* Market Slider */}
      <section className="market-slider-section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-chart-line"></i>
            Günlük Piyasa Verisi
          </h2>
          
          <div className="market-slider-wrapper">
            <div className="market-slider">
              {/* İlk set */}
              {cryptoData.slice(0, 15).map((coin) => {
                const change = coin.quote.USD.percent_change_24h;
                const changeClass = change >= 0 ? 'positive' : 'negative';
                
                return (
                  <div key={`first-${coin.id}`} className="market-slider-card">
                    <img 
                      className="coin-logo" 
                      src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                      alt={coin.symbol}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/32x32/ffb300/ffffff?text=${coin.symbol[0]}`;
                      }}
                    />
                    <div className="coin-name">
                      {coin.name} <span className="coin-symbol">{coin.symbol}</span>
                    </div>
                    <div className="coin-price">${coin.quote.USD.price.toLocaleString()}</div>
                    <div className={`coin-change ${changeClass}`}>
                      {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                    </div>
                    {/* Simple sparkline simulation */}
                    <div className="coin-sparkline">
                      <svg width="100%" height="40" viewBox="0 0 100 40">
                        <polyline 
                          fill="none" 
                          stroke={change >= 0 ? '#3ecf4c' : '#ff3d3d'} 
                          strokeWidth="2" 
                          points="0,20 25,15 50,25 75,10 100,20"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
              
              {/* İkinci set (sürekli akış için) */}
              {cryptoData.slice(0, 15).map((coin) => {
                const change = coin.quote.USD.percent_change_24h;
                const changeClass = change >= 0 ? 'positive' : 'negative';
                
                return (
                  <div key={`second-${coin.id}`} className="market-slider-card">
                    <img 
                      className="coin-logo" 
                      src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                      alt={coin.symbol}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/32x32/ffb300/ffffff?text=${coin.symbol[0]}`;
                      }}
                    />
                    <div className="coin-name">
                      {coin.name} <span className="coin-symbol">{coin.symbol}</span>
                    </div>
                    <div className="coin-price">${coin.quote.USD.price.toLocaleString()}</div>
                    <div className={`coin-change ${changeClass}`}>
                      {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                    </div>
                    {/* Simple sparkline simulation */}
                    <div className="coin-sparkline">
                      <svg width="100%" height="40" viewBox="0 0 100 40">
                        <polyline 
                          fill="none" 
                          stroke={change >= 0 ? '#3ecf4c' : '#ff3d3d'} 
                          strokeWidth="2" 
                          points="0,20 25,15 50,25 75,10 100,20"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Fear & Greed Index */}
      <section className="fear-greed-section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-heart"></i>
            Fear & Greed Index
          </h2>
          
          <div className="fear-greed-container">
            <div className="fear-greed-gauge">
              <div className="gauge-container">
                <div className="gauge-chart">
                  {fearGreedIndex ? (
                    <div className="gauge-display">
                      <svg width="250" height="250" viewBox="0 0 250 250">
                        <circle
                          cx="125"
                          cy="125"
                          r="100"
                          fill="none"
                          stroke="#f0f0f0"
                          strokeWidth="20"
                        />
                        <circle
                          cx="125"
                          cy="125"
                          r="100"
                          fill="none"
                          stroke={getFearGreedColor(fearGreedIndex.value)}
                          strokeWidth="20"
                          strokeDasharray={`${2 * Math.PI * 100}`}
                          strokeDashoffset={`${2 * Math.PI * 100 * (1 - fearGreedIndex.value / 100)}`}
                          transform="rotate(-90 125 125)"
                          style={{
                            transition: 'stroke-dashoffset 1s ease-in-out',
                          }}
                        />
                        <text
                          x="125"
                          y="125"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="32"
                          fontWeight="bold"
                          fill="var(--text-main)"
                        >
                          {fearGreedIndex.value}
                        </text>
                      </svg>
                    </div>
                  ) : (
                    <div className="gauge-loading">
                      <i className="fas fa-spinner fa-spin"></i>
                    </div>
                  )}
                </div>
              </div>
              <div className="fear-greed-value">
                <div className="value-display">
                  <span className="value-text" style={{ color: fearGreedIndex ? getFearGreedColor(fearGreedIndex.value) : '#999' }}>
                    {fearGreedIndex ? getFearGreedText(fearGreedIndex.value) : 'Yükleniyor...'}
                  </span>
                  <span className="value-date">
                    {fearGreedIndex ? new Date(fearGreedIndex.timestamp * 1000).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="fear-greed-info">
              <h3>Fear & Greed Index Nedir?</h3>
              <p>Fear & Greed Index, Bitcoin ve kripto para piyasalarındaki duyguları analiz eder. 0-100 arasında bir değer alır.</p>
              
              <div className="fear-greed-scale">
                <div className="scale-item extreme-fear">
                  <div className="scale-color" style={{ backgroundColor: '#ff3d3d' }}></div>
                  <div className="scale-range">0-24</div>
                  <div className="scale-label">Extreme Fear</div>
                </div>
                <div className="scale-item fear">
                  <div className="scale-color" style={{ backgroundColor: '#ff9800' }}></div>
                  <div className="scale-range">25-49</div>
                  <div className="scale-label">Fear</div>
                </div>
                <div className="scale-item neutral">
                  <div className="scale-color" style={{ backgroundColor: '#ffeb3b' }}></div>
                  <div className="scale-range">50-74</div>
                  <div className="scale-label">Neutral</div>
                </div>
                <div className="scale-item greed">
                  <div className="scale-color" style={{ backgroundColor: '#4caf50' }}></div>
                  <div className="scale-range">75-89</div>
                  <div className="scale-label">Greed</div>
                </div>
                <div className="scale-item extreme-greed">
                  <div className="scale-color" style={{ backgroundColor: '#3ecf4c' }}></div>
                  <div className="scale-range">90-100</div>
                  <div className="scale-label">Extreme Greed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Dominance */}
      <section className="market-dominance-section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-chart-pie"></i>
            Market Dominance
          </h2>
          
          <div className="dominance-container">
            <div className="dominance-chart">
              <div className="pie-chart">
                <svg width="400" height="400" viewBox="0 0 400 400">
                  <circle cx="200" cy="200" r="160" fill="none" stroke="#f0f0f0" strokeWidth="2" />
                  {globalMetrics && (
                    <>
                      {/* Bitcoin Dominance */}
                      <circle
                        cx="200"
                        cy="200"
                        r="120"
                        fill="none"
                        stroke="#f7931a"
                        strokeWidth="40"
                        strokeDasharray={`${2 * Math.PI * 120 * (globalMetrics.btc_dominance / 100)}, ${2 * Math.PI * 120}`}
                        strokeDashoffset="0"
                        transform="rotate(-90 200 200)"
                      />
                      {/* Ethereum Dominance */}
                      <circle
                        cx="200"
                        cy="200"
                        r="120"
                        fill="none"
                        stroke="#627eea"
                        strokeWidth="40"
                        strokeDasharray={`${2 * Math.PI * 120 * (globalMetrics.eth_dominance / 100)}, ${2 * Math.PI * 120}`}
                        strokeDashoffset={`-${2 * Math.PI * 120 * (globalMetrics.btc_dominance / 100)}`}
                        transform="rotate(-90 200 200)"
                      />
                      {/* Others */}
                      <circle
                        cx="200"
                        cy="200"
                        r="120"
                        fill="none"
                        stroke="#999"
                        strokeWidth="40"
                        strokeDasharray={`${2 * Math.PI * 120 * ((100 - globalMetrics.btc_dominance - globalMetrics.eth_dominance) / 100)}, ${2 * Math.PI * 120}`}
                        strokeDashoffset={`-${2 * Math.PI * 120 * ((globalMetrics.btc_dominance + globalMetrics.eth_dominance) / 100)}`}
                        transform="rotate(-90 200 200)"
                      />
                    </>
                  )}
                  <text x="200" y="200" textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="bold" fill="var(--text-main)">
                    Market Share
                  </text>
                </svg>
              </div>
            </div>
            
            <div className="dominance-stats">
              {globalMetrics && (
                <>
                  <div className="dominance-item">
                    <div className="dominance-coin">
                      <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/1.png" alt="Bitcoin" />
                      <div>
                        <div className="coin-name">Bitcoin</div>
                        <div className="coin-symbol">BTC</div>
                      </div>
                    </div>
                    <div className="dominance-value">
                      <span className="percentage">{globalMetrics.btc_dominance.toFixed(1)}%</span>
                      <span className="change positive">+0.3%</span>
                    </div>
                  </div>
                  
                  <div className="dominance-item">
                    <div className="dominance-coin">
                      <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png" alt="Ethereum" />
                      <div>
                        <div className="coin-name">Ethereum</div>
                        <div className="coin-symbol">ETH</div>
                      </div>
                    </div>
                    <div className="dominance-value">
                      <span className="percentage">{globalMetrics.eth_dominance.toFixed(1)}%</span>
                      <span className="change negative">-0.2%</span>
                    </div>
                  </div>
                  
                  <div className="dominance-item">
                    <div className="dominance-coin">
                      <img src="https://via.placeholder.com/32x32/999999/ffffff?text=Others" alt="Others" />
                      <div>
                        <div className="coin-name">Others</div>
                        <div className="coin-symbol">ALT</div>
                      </div>
                    </div>
                    <div className="dominance-value">
                      <span className="percentage">{(100 - globalMetrics.btc_dominance - globalMetrics.eth_dominance).toFixed(1)}%</span>
                      <span className="change positive">+0.1%</span>
                    </div>
                  </div>
                </>
              )}
              
              <div className="dominance-info">
                <h3>Market Dominance Nedir?</h3>
                <p>
                  Market dominance, bir kripto paranın toplam kripto para piyasası kapitalizasyonu içindeki payını gösterir. 
                  Bitcoin dominansı özellikle piyasa trendlerini anlamak için önemli bir göstergedir.
                </p>
                
                <div className="dominance-insights">
                  <div className="insight-item">
                    <i className="fas fa-info-circle"></i>
                    <span>Yüksek BTC dominansı genellikle altcoin sezonunun bittiğini gösterir</span>
                  </div>
                  <div className="insight-item">
                    <i className="fas fa-chart-line"></i>
                    <span>Düşük BTC dominansı altcoin rallisinin habercisi olabilir</span>
                  </div>
                  <div className="insight-item">
                    <i className="fas fa-balance-scale"></i>
                    <span>ETH dominansı DeFi ve NFT trendlerini yansıtır</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TradingView Heatmap */}
      <section className="heatmap-section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-th"></i>
            TradingView Kripto Isı Haritası
          </h2>
          
          <div className="heatmap-container">
            <div className="heatmap-widget">
              <div className="tradingview-widget-container" style={{ height: '600px', width: '100%' }}>
                <iframe
                  src="https://s.tradingview.com/embed-widget/crypto-coins-heatmap/?locale=tr&width=100%25&height=600&showTitle=false&dataSource=Crypto&blockChainFilter=true"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                  title="TradingView Crypto Heatmap"
                  frameBorder="0"
                  allowTransparency="true"
                  scrolling="no"
                  allowFullScreen={true}
                />
              </div>
              
              <div className="heatmap-info">
                <div className="info-card">
                  <h3>
                    <i className="fas fa-info-circle"></i>
                    Isı Haritası Nasıl Okunur?
                  </h3>
                  <ul>
                    <li>
                      <span className="color-sample green"></span>
                      Yeşil renkler pozitif performansı (yükseliş) gösterir
                    </li>
                    <li>
                      <span className="color-sample red"></span>
                      Kırmızı renkler negatif performansı (düşüş) gösterir
                    </li>
                    <li>
                      <span className="color-sample size"></span>
                      Kutu boyutu market kapitalizasyonunu temsil eder
                    </li>
                    <li>
                      <i className="fas fa-eye"></i>
                      Renk yoğunluğu fiyat değişiminin şiddetini gösterir
                    </li>
                  </ul>
                </div>
                
                <div className="info-card">
                  <h3>
                    <i className="fas fa-chart-bar"></i>
                    Piyasa Analizi
                  </h3>
                  <div className="market-insights">
                    <div className="insight">
                      <span className="metric">Genel Trend:</span>
                      <span className="value">Karışık</span>
                    </div>
                    <div className="insight">
                      <span className="metric">Volatilite:</span>
                      <span className="value">Orta</span>
                    </div>
                    <div className="insight">
                      <span className="metric">Top Performer:</span>
                      <span className="value">BTC</span>
                    </div>
                    <div className="insight">
                      <span className="metric">Zayıf Performans:</span>
                      <span className="value">Altcoinler</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Long/Short Ratios */}
      <section className="longshort-section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-balance-scale"></i>
            Long/Short Oranları
          </h2>
          
          <div className="longshort-container">
            <div className="longshort-grid">
              {cryptoData.slice(0, 8).map((coin) => {
                // Mock long/short data (gerçek uygulamada API'den gelecek)
                const longRatio = 60 + Math.random() * 30; // %60-90 arası
                const shortRatio = 100 - longRatio;
                const sentiment = longRatio > 60 ? 'bullish' : longRatio > 40 ? 'neutral' : 'bearish';
                
                return (
                  <div key={coin.id} className="longshort-card">
                    <div className="coin-header">
                      <img 
                        src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                        alt={coin.symbol}
                        className="coin-logo"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/32x32/ffb300/ffffff?text=${coin.symbol[0]}`;
                        }}
                      />
                      <div className="coin-details">
                        <span className="coin-symbol">{coin.symbol}</span>
                        <span className="coin-price">${coin.quote.USD.price.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="ratio-display">
                      <div className="ratio-bar">
                        <div 
                          className="long-bar" 
                          style={{ width: `${longRatio}%` }}
                        ></div>
                        <div 
                          className="short-bar" 
                          style={{ width: `${shortRatio}%` }}
                        ></div>
                      </div>
                      
                      <div className="ratio-values">
                        <div className="long-value">
                          <span className="label">Long</span>
                          <span className="percentage">{longRatio.toFixed(1)}%</span>
                        </div>
                        <div className="short-value">
                          <span className="label">Short</span>
                          <span className="percentage">{shortRatio.toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      <div className={`sentiment ${sentiment}`}>
                        <i className={`fas ${sentiment === 'bullish' ? 'fa-arrow-up' : sentiment === 'bearish' ? 'fa-arrow-down' : 'fa-minus'}`}></i>
                        <span>
                          {sentiment === 'bullish' ? 'Boğa' : sentiment === 'bearish' ? 'Ayı' : 'Nötr'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="longshort-info">
              <div className="info-section">
                <h3>
                  <i className="fas fa-question-circle"></i>
                  Long/Short Oranları Nedir?
                </h3>
                <p>
                  Long/Short oranları, piyasadaki yatırımcıların pozisyon dağılımını gösterir. 
                  Yüksek long oranı genel olarak boğa piyasasını, yüksek short oranı ise ayı piyasasını işaret eder.
                </p>
              </div>
              
              <div className="info-section">
                <h3>
                  <i className="fas fa-lightbulb"></i>
                  Nasıl Yorumlanır?
                </h3>
                <ul>
                  <li>Long %70+ : Güçlü boğa trendi</li>
                  <li>Long %60-70 : Orta düzey yükseliş beklentisi</li>
                  <li>Long %40-60 : Belirsiz / Nötr piyasa</li>
                  <li>Long %40- : Düşüş beklentisi hakim</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Token Unlocks */}
      <section className="token-unlocks-section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-unlock"></i>
            Token Kilit Açılışları
          </h2>
          
          <div className="unlocks-container">
            <div className="unlocks-grid">
              {cryptoData.slice(0, 6).map((coin, index) => {
                // Mock unlock data
                const unlockDate = new Date();
                unlockDate.setDate(unlockDate.getDate() + (index + 1) * 15);
                const unlockAmount = (Math.random() * 1000000 + 500000);
                const unlockPercentage = (Math.random() * 15 + 5);
                
                return (
                  <div key={coin.id} className="unlock-card">
                    <div className="unlock-header">
                      <img 
                        src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                        alt={coin.symbol}
                        className="coin-logo"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/32x32/ffb300/ffffff?text=${coin.symbol[0]}`;
                        }}
                      />
                      <div className="unlock-info">
                        <h3>{coin.name}</h3>
                        <span className="coin-symbol">{coin.symbol}</span>
                      </div>
                    </div>
                    
                    <div className="unlock-details">
                      <div className="unlock-date">
                        <i className="fas fa-calendar"></i>
                        <span>{unlockDate.toLocaleDateString('tr-TR')}</span>
                      </div>
                      
                      <div className="unlock-amount">
                        <span className="label">Açılacak Miktar:</span>
                        <span className="amount">{unlockAmount.toLocaleString()} {coin.symbol}</span>
                      </div>
                      
                      <div className="unlock-percentage">
                        <span className="label">Toplam Arzın:</span>
                        <span className="percentage">{unlockPercentage.toFixed(1)}%</span>
                      </div>
                      
                      <div className="unlock-impact">
                        <span className="label">Potansiyel Etki:</span>
                        <span className={`impact ${unlockPercentage > 10 ? 'high' : unlockPercentage > 5 ? 'medium' : 'low'}`}>
                          {unlockPercentage > 10 ? 'Yüksek' : unlockPercentage > 5 ? 'Orta' : 'Düşük'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="unlocks-info">
              <h3>Token Unlock Nedir?</h3>
              <p>
                Token unlock, projelerin önceden kilitlenmiş token'larının piyasaya sürülmesi sürecidir. 
                Bu durumlar genellikle token fiyatları üzerinde önemli etkiler yaratabilir.
              </p>
            </div>
          </div>
        </div>
      </section>

      

      

      {/* News Modal */}
      {isModalOpen && selectedNews && (
        <div className="news-modal-overlay" onClick={closeModal}>
          <div className="news-modal" onClick={(e) => e.stopPropagation()}>
            <div className="news-modal-header">
              <div className="news-modal-category-container">
                <span className={`news-modal-category ${selectedNews.price_change >= 0 ? 'positive' : 'negative'}`}>
                  {selectedNews.category}
                </span>
                <span className="news-modal-time">
                  {new Date(selectedNews.date).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <button className="news-modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="news-modal-content">
              <div className="news-modal-image">
                <img src={selectedNews.image} alt={selectedNews.title} />
              </div>
              
              <div className="news-modal-text">
                <h2 className="news-modal-title">{selectedNews.title}</h2>
                
                <div className="news-modal-summary">
                  <p>{selectedNews.content}</p>
                </div>
                
                <div className="news-modal-details">
                  <h3>Haber Detayları</h3>
                  <div className="news-stats">
                    <div className="stat-item">
                      <span className="stat-label">Kripto Para:</span>
                      <span className="stat-value">{selectedNews.crypto_symbol}</span>
                    </div>
                    {selectedNews.price_change !== undefined && (
                      <div className="stat-item">
                        <span className="stat-label">Fiyat Değişimi:</span>
                        <span className={`stat-value ${selectedNews.price_change >= 0 ? 'positive' : 'negative'}`}>
                          {selectedNews.price_change >= 0 ? '+' : ''}{selectedNews.price_change.toFixed(2)}%
                        </span>
                      </div>
                    )}
                    <div className="stat-item">
                      <span className="stat-label">Kategori:</span>
                      <span className="stat-value">{selectedNews.category}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Yazar:</span>
                      <span className="stat-value">{selectedNews.author}</span>
                    </div>
                  </div>
                  
                  <h4>Piyasa Analizi</h4>
                  <p>
                    {selectedNews.crypto_symbol ? selectedNews.crypto_symbol : selectedNews.title} son performansı ile dikkat çekiyor. 
                    {selectedNews.price_change !== undefined
                      ? (selectedNews.price_change >= 0 
                          ? ` %${selectedNews.price_change.toFixed(2)} artış ile pozitif bir trend sergiliyor ve yatırımcılar arasında umut yaratıyor.`
                          : ` %${Math.abs(selectedNews.price_change).toFixed(2)} düşüş ile piyasada dikkatli bir yaklaşım gerektiriyor.`
                        )
                      : ` Bu haber blockchain ve kripto para sektöründeki gelişmelere ışık tutuyor.`
                    }
                  </p>
                  
                  <div className="market-insights">
                    <h4>Teknik Göstergeler</h4>
                    <ul>
                      {selectedNews.price_change !== undefined ? (
                        <>
                          <li>• Fiyat trendi: {selectedNews.price_change >= 0 ? 'Yükseliş' : 'Düşüş'} yönlü</li>
                          <li>• Piyasa sentiment: {selectedNews.price_change >= 0 ? 'Pozitif' : 'Temkinli'}</li>
                          <li>• Yatırımcı ilgisi: {selectedNews.price_change >= 0 ? 'Yüksek' : 'Dikkatli'}</li>
                          <li>• Risk seviyesi: {Math.abs(selectedNews.price_change) > 5 ? 'Yüksek volatilite' : 'Normal dalgalanma'}</li>
                        </>
                      ) : (
                        <>
                          <li>• Haber türü: {selectedNews.type === 'rss' ? 'RSS Haber' : 'Crypto Analizi'}</li>
                          <li>• Kaynak: {selectedNews.author}</li>
                          <li>• Kategori: {selectedNews.category}</li>
                          <li>• Yayın tarihi: {new Date(selectedNews.date).toLocaleDateString('tr-TR')}</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
                
                <div className="news-modal-actions">
                  <button className="btn-secondary" onClick={closeModal}>
                    <i className="fas fa-arrow-left"></i> Geri Dön
                  </button>
                  {selectedNews.crypto_name ? (
                    <button 
                      className="btn-primary"
                      onClick={() => window.open(`https://coinmarketcap.com/currencies/${selectedNews.crypto_name}/`, '_blank')}
                    >
                      <i className="fas fa-external-link-alt"></i> {selectedNews.crypto_symbol} Detaylarını Gör
                    </button>
                  ) : selectedNews.link ? (
                    <button 
                      className="btn-primary"
                      onClick={() => window.open(selectedNews.link, '_blank')}
                    >
                      <i className="fas fa-external-link-alt"></i> Haberi Oku
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container">
        

        {/* Top Cryptocurrencies Section */}
        <section className="section">
          <h2 className="section-title">Top Kripto Paralar</h2>
          <div className="crypto-table-container card">
            <div className="table-responsive">
              <table className="table crypto-table">
                <thead>
                  <tr>
                    <th>Sıra</th>
                    <th>Coin</th>
                    <th>Fiyat</th>
                    <th>24s Değişim</th>
                    <th>Piyasa Değeri</th>
                    <th>24s Hacim</th>
                  </tr>
                </thead>
                <tbody>
                  {cryptoData.slice(0, 10).map((coin) => {
                    const change = formatPercentage(coin.quote.USD.percent_change_24h);
                    return (
                      <tr key={coin.id}>
                        <td>{coin.cmc_rank}</td>
                        <td>
                          <div className="coin-info">
                            <img 
                              src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                              alt={coin.symbol}
                              className="coin-logo"
                              onError={(e) => {
                                e.target.src = `https://via.placeholder.com/30x30/ffb300/ffffff?text=${coin.symbol[0]}`;
                              }}
                            />
                            <div className="coin-details">
                              <div className="coin-symbol">{coin.symbol}</div>
                              <div className="coin-name">{coin.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="price">{formatCurrency(coin.quote.USD.price)}</td>
                        <td>
                          <span className={`change ${change.className}`}>
                            {change.value}
                          </span>
                        </td>
                        <td>${formatLargeNumber(coin.quote.USD.market_cap)}</td>
                        <td>${formatLargeNumber(coin.quote.USD.volume_24h)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Gainers & Losers Section */}
        <section className="section">
          <h2 className="section-title">Günün Hareketleri</h2>
          <div className="movers-container grid grid-2">
            {/* Gainers */}
            <div className="movers-card card">
              <div className="movers-header">
                <h3>
                  <i className="fas fa-arrow-up"></i>
                  En Çok Yükselenler
                </h3>
              </div>
              <div className="movers-list">
                {topGainers.map((coin) => (
                  <div key={coin.id} className="mover-item">
                    <div className="mover-info">
                      <img 
                        src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                        alt={coin.symbol}
                        className="mover-logo"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/24x24/4caf50/ffffff?text=${coin.symbol[0]}`;
                        }}
                      />
                      <div className="mover-details">
                        <div className="mover-symbol">{coin.symbol}</div>
                        <div className="mover-name">{coin.name}</div>
                      </div>
                    </div>
                    <div className="mover-data">
                      <div className="mover-price">{formatCurrency(coin.quote.USD.price)}</div>
                      <div className="mover-change positive">
                        +{coin.quote.USD.percent_change_24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Losers */}
            <div className="movers-card card">
              <div className="movers-header">
                <h3>
                  <i className="fas fa-arrow-down"></i>
                  En Çok Düşenler
                </h3>
              </div>
              <div className="movers-list">
                {topLosers.map((coin) => (
                  <div key={coin.id} className="mover-item">
                    <div className="mover-info">
                      <img 
                        src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                        alt={coin.symbol}
                        className="mover-logo"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/24x24/f44336/ffffff?text=${coin.symbol[0]}`;
                        }}
                      />
                      <div className="mover-details">
                        <div className="mover-symbol">{coin.symbol}</div>
                        <div className="mover-name">{coin.name}</div>
                      </div>
                    </div>
                    <div className="mover-data">
                      <div className="mover-price">{formatCurrency(coin.quote.USD.price)}</div>
                      <div className="mover-change negative">
                        {coin.quote.USD.percent_change_24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Additional Info Section */}
        <section className="section">
          <div className="info-cards grid grid-2">
            <div className="info-card card">
              <h3>
                <i className="fas fa-info-circle"></i>
                Kullanım Bilgileri
              </h3>
              <ul>
                <li>• Veriler CoinMarketCap API'den çekilmektedir</li>
                <li>• Fiyatlar her 60 saniyede otomatik güncellenir</li>
                <li>• Tüm fiyatlar USD cinsinden gösterilmektedir</li>
                <li>• Backend API güvenli şekilde çalışmaktadır</li>
              </ul>
            </div>

            <div className="info-card card">
              <h3>
                <i className="fas fa-chart-bar"></i>
                Piyasa İstatistikleri
              </h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Active Coins</span>
                  <span className="stat-value">10,000+</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Exchanges</span>
                  <span className="stat-value">500+</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Market Pairs</span>
                  <span className="stat-value">50,000+</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Data Updates</span>
                  <span className="stat-value">Real-time</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Crypto Dictionary - En alta eklendi */}
        <section className="section">
          <CryptoDictionary />
        </section>
      </div>
      {/* Why Choose Us */}
      <section className="why-choose-section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-star"></i>
            Neden Kripto Sohbeti?
          </h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <h3>Anlık Veriler</h3>
              <p>Gerçek zamanlı kripto para fiyatları ve piyasa verileri ile her zaman güncel kalın.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Detaylı Analiz</h3>
              <p>Profesyonel analiz araçları ve göstergelerle piyasayı daha iyi anlayın.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-newspaper"></i>
              </div>
              <h3>Güncel Haberler</h3>
              <p>Kripto para dünyasından en son haberleri ve gelişmeleri takip edin.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Topluluk</h3>
              <p>Kripto para topluluğu ile etkileşim kurun ve deneyimleri paylaşın.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Güvenilir</h3>
              <p>Güvenilir kaynaklardan gelen doğrulanmış veriler ile güvenle karar verin.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3>Mobil Uyumlu</h3>
              <p>Her cihazda mükemmel çalışan responsive tasarım ile her yerden erişim.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 