import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './NewsPage.css';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Backend API'den gerçek haberler çek
      const response = await apiService.getNews();
      setNews(response.data);
    } catch (err) {
      console.error('News loading error:', err);
      setError('Haberler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Piyasa', 'Teknoloji', 'Regulasyon', 'Analiz', 'DeFi', 'NFT', 'Madencilik', 'Güvenlik'];

  const filteredNews = news.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Az önce';
    } else if (diffInHours < 24) {
      return `${diffInHours} saat önce`;
    } else {
      return `${Math.floor(diffInHours / 24)} gün önce`;
    }
  };

  if (loading) {
    return (
      <div className="news-page">
        <div className="container">
          <div className="loading">Haberler yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-page">
        <div className="container">
          <div className="error">
            <h3>Haber Yükleme Hatası</h3>
            <p>{error}</p>
            <button onClick={loadNews} className="retry-btn">Tekrar Dene</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="news-page">
      <div className="container">
        <div className="page-header">
          <h1>Kripto Haberler</h1>
          <p>En güncel kripto para haberleri ve piyasa analizleri</p>
        </div>

        {/* Filter Controls */}
        <div className="filters">
          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'Tümü' : category}
              </button>
            ))}
          </div>

          <div className="search-filter">
            <input
              type="text"
              placeholder="Haber ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <i className="fas fa-search search-icon"></i>
          </div>
        </div>

        {/* News Grid */}
        <div className="news-grid">
          {filteredNews.map(item => (
            <div key={item.id} className="news-card">
              <div className="news-image">
                <img src={item.image} alt={item.title} />
                <div className="news-badge">
                  <span className={`badge ${item.category}`}>{item.category}</span>
                </div>
              </div>
              
              <div className="news-content">
                <h3 className="news-title">{item.title}</h3>
                <p className="news-description">{item.content}</p>
                
                <div className="news-meta">
                  <div className="news-stats">
                    {item.price_change !== undefined && (
                      <span className={`price-change ${item.price_change >= 0 ? 'positive' : 'negative'}`}>
                        {item.price_change >= 0 ? '+' : ''}{item.price_change.toFixed(2)}%
                      </span>
                    )}
                    {item.crypto_symbol && (
                      <span className="crypto-symbol">{item.crypto_symbol}</span>
                    )}
                    {item.type && (
                      <span className={`news-type ${item.type}`}>
                        {item.type === 'rss' ? 'RSS' : 'Crypto'}
                      </span>
                    )}
                  </div>
                  <div className="news-date">
                    <i className="fas fa-clock"></i>
                    {formatDate(item.date)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="no-results">
            <i className="fas fa-search"></i>
            <h3>Sonuç Bulunamadı</h3>
            <p>Aradığınız kriterlere uygun haber bulunmamaktadır.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage; 