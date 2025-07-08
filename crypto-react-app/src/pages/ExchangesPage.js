import React, { useState, useEffect } from 'react';
import { apiService, formatLargeNumber } from '../services/api';
import './ExchangesPage.css';

const ExchangesPage = () => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('volume');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAll, setShowAll] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    loadExchanges();
  }, []);

  const loadExchanges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Backend API'den gerçek borsa verilerini çek - limit olmadan tümünü al
      const response = await apiService.getExchanges(500); // Daha fazla borsa almak için limit artırıldı
      setExchanges(response.data);
    } catch (err) {
      console.error('Exchanges loading error:', err);
      setError('Borsalar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const sortedExchanges = [...exchanges].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'name') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleShowAll = () => {
    setShowAll(true);
    setDisplayCount(exchanges.length);
  };

  const exchangesToShow = showAll ? sortedExchanges : sortedExchanges.slice(0, displayCount);

  if (loading) {
    return (
      <div className="exchanges-page">
        <div className="container">
          <div className="loading">Borsalar yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exchanges-page">
        <div className="container">
          <div className="error">
            <h3>Borsa Yükleme Hatası</h3>
            <p>{error}</p>
            <button onClick={loadExchanges} className="retry-btn">Tekrar Dene</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exchanges-page">
      <div className="container">
        <div className="page-header">
          <h1>Kripto Borsaları</h1>
          <p>En popüler kripto para borsaları ve trading hacimları</p>
        </div>

        <div className="exchanges-stats">
          <div className="stat-card">
            <h3>Toplam Borsa Sayısı</h3>
            <div className="stat-value">{exchanges.length}</div>
          </div>
          <div className="stat-card">
            <h3>Toplam 24s Hacim</h3>
            <div className="stat-value">
              ${formatLargeNumber(exchanges.reduce((sum, ex) => sum + ex.volume24h, 0))}
            </div>
          </div>
          <div className="stat-card">
            <h3>Ortalama Trust Score</h3>
            <div className="stat-value">
              {(exchanges.reduce((sum, ex) => sum + ex.trustScore, 0) / exchanges.length).toFixed(1)}
            </div>
          </div>
        </div>

        <div className="exchanges-table-container">
          <div className="table-header">
            <h2>Borsa Listesi</h2>
            <div className="table-controls">
              <div className="sort-info">
                Sıralama: <span className="sort-field">{sortBy}</span> 
                <span className="sort-order">({sortOrder === 'asc' ? 'Artan' : 'Azalan'})</span>
              </div>
              {!showAll && exchanges.length > displayCount && (
                <button className="show-all-btn" onClick={handleShowAll}>
                  <i className="fas fa-list"></i>
                  Tümünü Göster ({exchanges.length} borsa)
                </button>
              )}
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="exchanges-table">
              <thead>
                <tr>
                  <th>Sıra</th>
                  <th onClick={() => handleSort('name')} className="sortable">
                    Borsa <i className="fas fa-sort"></i>
                  </th>
                  <th onClick={() => handleSort('volume24h')} className="sortable">
                    24s Hacim <i className="fas fa-sort"></i>
                  </th>
                  <th onClick={() => handleSort('trustScore')} className="sortable">
                    Trust Score <i className="fas fa-sort"></i>
                  </th>
                  <th onClick={() => handleSort('tradingPairs')} className="sortable">
                    Trading Çifti <i className="fas fa-sort"></i>
                  </th>
                  <th onClick={() => handleSort('establishedYear')} className="sortable">
                    Kuruluş <i className="fas fa-sort"></i>
                  </th>
                  <th>Özellikler</th>
                </tr>
              </thead>
              <tbody>
                {exchangesToShow.map((exchange, index) => (
                  <tr key={exchange.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="exchange-info">
                        <img 
                          src={exchange.logo} 
                          alt={exchange.name}
                          className="exchange-logo"
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/32x32/007bff/ffffff?text=${exchange.name[0]}`;
                          }}
                        />
                        <div className="exchange-details">
                          <div className="exchange-name">{exchange.name}</div>
                          <div className="exchange-country">{exchange.country}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="volume-info">
                        <div className="volume-value">${formatLargeNumber(exchange.volume24h)}</div>
                        <div className={`volume-change ${exchange.volumeChange24h >= 0 ? 'positive' : 'negative'}`}>
                          {exchange.volumeChange24h >= 0 ? '+' : ''}{exchange.volumeChange24h.toFixed(2)}%
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="trust-score">
                        <span className="score-value">{exchange.trustScore.toFixed(1)}</span>
                        <div className="score-bar">
                          <div 
                            className="score-fill" 
                            style={{ width: `${(exchange.trustScore / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>{exchange.tradingPairs.toLocaleString()}</td>
                    <td>{exchange.establishedYear}</td>
                    <td>
                      <div className="features">
                        {exchange.supportsFiat && <span className="feature">Fiat</span>}
                        {exchange.hasMarginTrading && <span className="feature">Margin</span>}
                        {exchange.hasFuturesTrading && <span className="feature">Futures</span>}
                        {exchange.mobileApp && <span className="feature">App</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangesPage; 