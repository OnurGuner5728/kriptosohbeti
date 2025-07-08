import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Instagram',
      icon: 'fab fa-instagram',
      url: 'https://instagram.com/kripto.sohbeti',
      color: '#E4405F',
      gradient: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)'
    },
    {
      name: 'Twitter',
      icon: 'fab fa-twitter',
      url: 'https://twitter.com/Kripto_Sohbeti',
      color: '#1DA1F2',
      gradient: 'linear-gradient(45deg, #1da1f2 0%, #0d95e8 100%)'
    },
    {
      name: 'Facebook',
      icon: 'fab fa-facebook',
      url: 'https://www.facebook.com/profile.php?id=61564861690428',
      color: '#4267B2',
      gradient: 'linear-gradient(45deg, #4267b2 0%, #365899 100%)'
    },
    {
      name: 'TikTok',
      icon: 'fab fa-tiktok',
      url: 'https://tiktok.com/@kriptosohbeti',
      color: '#FF0050',
      gradient: 'linear-gradient(45deg, #ff0050 0%, #ff4081 100%)'
    },
    {
      name: 'Spotify',
      icon: 'fab fa-spotify',
      url: 'https://open.spotify.com/show/4TTnE8swYb2lnJTaw4wVxG?si=dV_9mxCpS6aj7zcZ2RXQ2g',
      color: '#1DB954',
      gradient: 'linear-gradient(45deg, #1db954 0%, #1ed760 100%)'
    },

  ];

  return (
    <footer className="footer">
      <div className="footer-background">
        <div className="footer-particles"></div>
      </div>
      
      <div className="container">
        <div className="footer-content">
          {/* Logo & Description */}
          <div className="footer-section">
            <div className="footer-logo">
              <img src="/favicon.png" alt="Kripto Sohbeti" className="logo-icon" />
              <span className="logo-text">Kripto Sohbeti</span>
            </div>
            <p className="footer-description">
              Kripto para dünyasının en güncel haberleri, analizleri ve verilerini takip edin. 
              Profesyonel yatırım kararları için güvenilir kaynak.
            </p>
            
            {/* Social Media Icons */}
            <div className="social-links">
              <h4>Bizi Takip Edin</h4>
              <div className="social-icons">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    style={{ background: social.gradient }}
                    title={social.name}
                  >
                    <i className={social.icon}></i>
                    <span className="social-tooltip">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div className="footer-section">
            <h3 className="footer-title">
              <i className="fas fa-desktop"></i>
              Platform
            </h3>
            <ul className="footer-links">
              <li><Link to="/">Ana Sayfa</Link></li>
              <li><Link to="/haberler">Haberler</Link></li>
              <li><Link to="/kripto-paralar">Kripto Paralar</Link></li>
              <li><Link to="/borsalar">Borsalar</Link></li>
              <li><Link to="/takvim">Kripto Takvim</Link></li>
            </ul>
          </div>

          {/* Analysis Links */}
          <div className="footer-section">
            <h3 className="footer-title">
              <i className="fas fa-chart-line"></i>
              Analizler
            </h3>
            <ul className="footer-links">
              <li><a href="#long-short">Long/Short Oranları</a></li>
              <li><a href="#heat-map">Isı Haritası</a></li>
              <li><a href="#fear-greed">Korku & Hırs Endeksi</a></li>
              <li><a href="#dominance">Piyasa Dominansı</a></li>
              <li><a href="#liquidation">Likidite Haritası</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="footer-section">
            <h3 className="footer-title">
              <i className="fas fa-building"></i>
              Şirket
            </h3>
            <ul className="footer-links">
              <li><a href="#about">Hakkımızda</a></li>
              <li><a href="#contact">Bize Ulaşın</a></li>
              <li><a href="#privacy">Gizlilik Politikası</a></li>
              <li><a href="#terms">Kullanım Koşulları</a></li>
              <li><a href="#faq">S.S.S</a></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="footer-section">
            <h3 className="footer-title">
              <i className="fas fa-headset"></i>
              Destek & İletişim
            </h3>
            <ul className="footer-links">
              <li><a href="#support">Teknik Destek</a></li>
              <li><a href="#feedback">Geri Bildirim</a></li>
              <li><a href="#partnership">Ortaklık</a></li>
              <li><a href="#advertise">Reklam Ver</a></li>
              <li><a href="#contact">İletişim</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {currentYear} Kripto Sohbeti. Tüm hakları saklıdır.</p>
            <p className="footer-disclaimer">
              Bu site yatırım tavsiyesi vermemektedir. Tüm yatırım kararları kişiseldir.
            </p>
          </div>
          
          <div className="footer-badges">
            <div className="badge secure">
              <i className="fas fa-shield-alt"></i>
              <span>Güvenli</span>
            </div>
            <div className="badge realtime">
              <i className="fas fa-chart-line"></i>
              <span>Gerçek Zamanlı</span>
            </div>
            <div className="badge verified">
              <i className="fas fa-check-circle"></i>
              <span>Doğrulanmış</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 