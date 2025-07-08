import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './CalendarPage.css';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('upcoming');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Backend API'den gerçek etkinlik verilerini çek
      const response = await apiService.getEvents();
      setEvents(response.data);
    } catch (err) {
      console.error('Events loading error:', err);
      setError('Etkinlikler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (viewType === 'upcoming') {
      return eventDate > now;
    } else if (viewType === 'past') {
      return eventDate < now;
    } else {
      return true; // all
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((date - now) / (1000 * 60 * 60));
    
    if (Math.abs(diffInHours) < 24) {
      if (diffInHours > 0) {
        return `${diffInHours} saat sonra`;
      } else {
        return `${Math.abs(diffInHours)} saat önce`;
      }
    } else {
      return date.toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const getImpactColor = (impact) => {
    switch(impact) {
      case 'High': return 'impact-high';
      case 'Medium': return 'impact-medium';
      case 'Low': return 'impact-low';
      default: return 'impact-medium';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Technical': 'category-technical',
      'Partnership': 'category-partnership',
      'Governance': 'category-governance',
      'Marketing': 'category-marketing',
      'Development': 'category-development',
      'Community': 'category-community'
    };
    return colors[category] || 'category-default';
  };

  if (loading) {
    return (
      <div className="calendar-page">
        <div className="container">
          <div className="loading">Etkinlikler yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-page">
        <div className="container">
          <div className="error">
            <h3>Etkinlik Yükleme Hatası</h3>
            <p>{error}</p>
            <button onClick={loadEvents} className="retry-btn">Tekrar Dene</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <div className="container">
        <div className="page-header">
          <h1>Kripto Takvimi</h1>
          <p>Önemli kripto para etkinlikleri ve duyuruları</p>
        </div>

        <div className="calendar-stats">
          <div className="stat-card">
            <h3>Toplam Etkinlik</h3>
            <div className="stat-value">{events.length}</div>
          </div>
          <div className="stat-card">
            <h3>Yaklaşan Etkinlikler</h3>
            <div className="stat-value">
              {events.filter(e => e.status === 'upcoming').length}
            </div>
          </div>
          <div className="stat-card">
            <h3>Yüksek Etki</h3>
            <div className="stat-value">
              {events.filter(e => e.impact === 'High').length}
            </div>
          </div>
        </div>

        <div className="calendar-controls">
          <div className="view-buttons">
            <button
              className={`view-btn ${viewType === 'upcoming' ? 'active' : ''}`}
              onClick={() => setViewType('upcoming')}
            >
              <i className="fas fa-calendar-plus"></i>
              Yaklaşan
            </button>
            <button
              className={`view-btn ${viewType === 'past' ? 'active' : ''}`}
              onClick={() => setViewType('past')}
            >
              <i className="fas fa-calendar-check"></i>
              Geçmiş
            </button>
            <button
              className={`view-btn ${viewType === 'all' ? 'active' : ''}`}
              onClick={() => setViewType('all')}
            >
              <i className="fas fa-calendar"></i>
              Tümü
            </button>
          </div>
        </div>

        <div className="events-container">
          <h2>
            {viewType === 'upcoming' && 'Yaklaşan Etkinlikler'}
            {viewType === 'past' && 'Geçmiş Etkinlikler'}
            {viewType === 'all' && 'Tüm Etkinlikler'}
          </h2>

          <div className="events-grid">
            {filteredEvents.map(event => (
              <div key={event.id} className={`event-card ${event.status}`}>
                <div className="event-header">
                  <div className="event-coin">
                    <img 
                      src={event.coinImage} 
                      alt={event.coin}
                      className="coin-logo"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/32x32/007bff/ffffff?text=${event.coin[0]}`;
                      }}
                    />
                    <div className="coin-info">
                      <span className="coin-symbol">{event.coin}</span>
                      <span className="coin-name">{event.coinName}</span>
                    </div>
                  </div>
                  <div className="event-badges">
                    {event.isVerified && (
                      <span className="verified-badge">
                        <i className="fas fa-check-circle"></i>
                      </span>
                    )}
                    <span className={`impact-badge ${getImpactColor(event.impact)}`}>
                      {event.impact}
                    </span>
                  </div>
                </div>

                <div className="event-content">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-meta">
                    <div className="event-date-time">
                      <i className="fas fa-calendar"></i>
                      <span>{formatDate(event.date)}</span>
                      <i className="fas fa-clock"></i>
                      <span>{event.time}</span>
                    </div>
                    
                    <div className="event-category">
                      <span className={`category-badge ${getCategoryColor(event.category)}`}>
                        {event.category}
                      </span>
                    </div>
                  </div>

                  <div className="event-stats">
                    <div className="price-info">
                      <span className="price">${event.price.toFixed(2)}</span>
                      <span className={`price-change ${event.priceChange >= 0 ? 'positive' : 'negative'}`}>
                        {event.priceChange >= 0 ? '+' : ''}{event.priceChange.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="event-votes">
                      <i className="fas fa-thumbs-up"></i>
                      <span>{event.votes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="no-events">
              <i className="fas fa-calendar-times"></i>
              <h3>Etkinlik Bulunamadı</h3>
              <p>Seçilen kriterlere uygun etkinlik bulunmamaktadır.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage; 