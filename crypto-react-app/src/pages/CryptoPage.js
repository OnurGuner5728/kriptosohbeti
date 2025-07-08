import React, { useState, useEffect } from 'react';
import { apiService, formatCurrency, formatLargeNumber, formatPercentage } from '../services/api';
import './CryptoPage.css';

const CryptoPage = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'cmc_rank', direction: 'asc' });
  const [displayCount, setDisplayCount] = useState(100);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadCryptoData();
    const interval = setInterval(loadCryptoData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadCryptoData = async (limit = 5000) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCryptoData(limit);
      setCryptoData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...cryptoData].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortConfig.key) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.quote.USD.price;
        bValue = b.quote.USD.price;
        break;
      case 'change':
        aValue = a.quote.USD.percent_change_24h;
        bValue = b.quote.USD.percent_change_24h;
        break;
      case 'market_cap':
        aValue = a.quote.USD.market_cap;
        bValue = b.quote.USD.market_cap;
        break;
      case 'volume':
        aValue = a.quote.USD.volume_24h;
        bValue = b.quote.USD.volume_24h;
        break;
      default:
        aValue = a.cmc_rank;
        bValue = b.cmc_rank;
    }

    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const filteredData = sortedData.filter(coin =>
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedData = filteredData.slice(0, displayCount);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setDisplayCount(prev => prev + 100);
    setLoadingMore(false);
  };

  const handleCryptoClick = (crypto) => {
    setSelectedCrypto(crypto);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCrypto(null);
    document.body.style.overflow = 'auto';
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

  if (loading) {
    return (
      <div className="crypto-page">
        <div className="container">
          <div className="loading">Kripto para verileri yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="crypto-page">
        <div className="container">
          <div className="error">
            <h3>Veri Yükleme Hatası</h3>
            <p>{error}</p>
            <button onClick={loadCryptoData} className="retry-btn">Tekrar Dene</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="crypto-page">
      <div className="container">
        <section className="section">
          <h1 className="section-title">Kripto Para Piyasası</h1>
          
          {/* Controls */}
          <div className="crypto-controls card">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Kripto para ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="stats-summary">
              <span>
                {displayedData.length} / {filteredData.length} kripto para gösteriliyor
                {displayCount < filteredData.length && (
                  <button 
                    className="load-more-btn"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Yükleniyor...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus"></i>
                        100 Daha Göster
                      </>
                    )}
                  </button>
                )}
              </span>
            </div>
          </div>

          {/* Crypto Table */}
          <div className="crypto-table-container card">
            <div className="table-responsive">
              <table className="table crypto-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('cmc_rank')} className="sortable">
                      Sıra
                      {sortConfig.key === 'cmc_rank' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('name')} className="sortable">
                      Coin
                      {sortConfig.key === 'name' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('price')} className="sortable">
                      Fiyat
                      {sortConfig.key === 'price' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('change')} className="sortable">
                      24s Değişim
                      {sortConfig.key === 'change' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('market_cap')} className="sortable">
                      Piyasa Değeri
                      {sortConfig.key === 'market_cap' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('volume')} className="sortable">
                      24s Hacim
                      {sortConfig.key === 'volume' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>Arz</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedData.map((coin) => {
                    const change = formatPercentage(coin.quote.USD.percent_change_24h);
                    return (
                      <tr key={coin.id} className="crypto-row" onClick={() => handleCryptoClick(coin)}>
                        <td className="rank">{coin.cmc_rank}</td>
                        <td>
                          <div className="coin-info">
                            <img 
                              src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                              alt={coin.symbol}
                              className="coin-logo"
                              onError={(e) => {
                                e.target.src = `https://via.placeholder.com/32x32/ffb300/ffffff?text=${coin.symbol[0]}`;
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
                        <td className="market-cap">${formatLargeNumber(coin.quote.USD.market_cap)}</td>
                        <td className="volume">${formatLargeNumber(coin.quote.USD.volume_24h)}</td>
                        <td className="supply">
                          {coin.circulating_supply ? formatLargeNumber(coin.circulating_supply) : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Crypto Detail Modal */}
      {isModalOpen && selectedCrypto && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="modal-header">
              <div className="crypto-basic-info">
                <img 
                  src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${selectedCrypto.id}.png`}
                  alt={selectedCrypto.symbol}
                  className="crypto-modal-logo"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/64x64/ffb300/ffffff?text=${selectedCrypto.symbol[0]}`;
                  }}
                />
                <div className="crypto-modal-details">
                  <h2>{selectedCrypto.name} ({selectedCrypto.symbol})</h2>
                  <div className="crypto-rank">#{selectedCrypto.cmc_rank}</div>
                </div>
              </div>
              <div className="crypto-price-info">
                <div className="current-price">{formatCurrency(selectedCrypto.quote.USD.price)}</div>
                <div className={`price-change ${selectedCrypto.quote.USD.percent_change_24h >= 0 ? 'positive' : 'negative'}`}>
                  {selectedCrypto.quote.USD.percent_change_24h >= 0 ? '+' : ''}
                  {selectedCrypto.quote.USD.percent_change_24h.toFixed(2)}% (24s)
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div className="crypto-stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Piyasa Değeri</div>
                  <div className="stat-value">${formatLargeNumber(selectedCrypto.quote.USD.market_cap)}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">24s Hacim</div>
                  <div className="stat-value">${formatLargeNumber(selectedCrypto.quote.USD.volume_24h)}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Dolaşımdaki Arz</div>
                  <div className="stat-value">
                    {selectedCrypto.circulating_supply ? formatLargeNumber(selectedCrypto.circulating_supply) : 'N/A'}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Toplam Arz</div>
                  <div className="stat-value">
                    {selectedCrypto.total_supply ? formatLargeNumber(selectedCrypto.total_supply) : 'N/A'}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Maksimum Arz</div>
                  <div className="stat-value">
                    {selectedCrypto.max_supply ? formatLargeNumber(selectedCrypto.max_supply) : 'Sınırsız'}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Hacim/Piyasa Değeri</div>
                  <div className="stat-value">
                    {(selectedCrypto.quote.USD.volume_24h / selectedCrypto.quote.USD.market_cap).toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="price-changes">
                <h3>Fiyat Değişimleri</h3>
                <div className="changes-grid">
                  <div className="change-item">
                    <div className="change-label">1 Saat</div>
                    <div className={`change-value ${selectedCrypto.quote.USD.percent_change_1h >= 0 ? 'positive' : 'negative'}`}>
                      {selectedCrypto.quote.USD.percent_change_1h >= 0 ? '+' : ''}
                      {selectedCrypto.quote.USD.percent_change_1h.toFixed(2)}%
                    </div>
                  </div>
                  <div className="change-item">
                    <div className="change-label">24 Saat</div>
                    <div className={`change-value ${selectedCrypto.quote.USD.percent_change_24h >= 0 ? 'positive' : 'negative'}`}>
                      {selectedCrypto.quote.USD.percent_change_24h >= 0 ? '+' : ''}
                      {selectedCrypto.quote.USD.percent_change_24h.toFixed(2)}%
                    </div>
                  </div>
                  <div className="change-item">
                    <div className="change-label">7 Gün</div>
                    <div className={`change-value ${selectedCrypto.quote.USD.percent_change_7d >= 0 ? 'positive' : 'negative'}`}>
                      {selectedCrypto.quote.USD.percent_change_7d >= 0 ? '+' : ''}
                      {selectedCrypto.quote.USD.percent_change_7d.toFixed(2)}%
                    </div>
                  </div>
                  <div className="change-item">
                    <div className="change-label">30 Gün</div>
                    <div className={`change-value ${selectedCrypto.quote.USD.percent_change_30d >= 0 ? 'positive' : 'negative'}`}>
                      {selectedCrypto.quote.USD.percent_change_30d >= 0 ? '+' : ''}
                      {selectedCrypto.quote.USD.percent_change_30d.toFixed(2)}%
                    </div>
                  </div>
                  <div className="change-item">
                    <div className="change-label">60 Gün</div>
                    <div className={`change-value ${selectedCrypto.quote.USD.percent_change_60d >= 0 ? 'positive' : 'negative'}`}>
                      {selectedCrypto.quote.USD.percent_change_60d >= 0 ? '+' : ''}
                      {selectedCrypto.quote.USD.percent_change_60d.toFixed(2)}%
                    </div>
                  </div>
                  <div className="change-item">
                    <div className="change-label">90 Gün</div>
                    <div className={`change-value ${selectedCrypto.quote.USD.percent_change_90d >= 0 ? 'positive' : 'negative'}`}>
                      {selectedCrypto.quote.USD.percent_change_90d >= 0 ? '+' : ''}
                      {selectedCrypto.quote.USD.percent_change_90d.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="crypto-additional-info">
                <h3>Ek Bilgiler</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">CoinMarketCap ID</div>
                    <div className="info-value">{selectedCrypto.id}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Sembol</div>
                    <div className="info-value">{selectedCrypto.symbol}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Sıra</div>
                    <div className="info-value">#{selectedCrypto.cmc_rank}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Platform</div>
                    <div className="info-value">
                      {selectedCrypto.platform ? selectedCrypto.platform.name : 'Native'}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Son Güncelleme</div>
                    <div className="info-value">
                      {new Date(selectedCrypto.last_updated).toLocaleString('tr-TR')}
                    </div>
                  </div>
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoPage; 