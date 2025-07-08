import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">🚀</span>
            <span className="logo-text">Kripto Sohbeti</span>
          </Link>

          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <ul className="nav-links">
              <li>
                <Link 
                  to="/" 
                  className={isActive('/') ? 'nav-active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-home"></i>
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link 
                  to="/kripto-paralar" 
                  className={isActive('/kripto-paralar') ? 'nav-active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-coins"></i>
                  Kripto Paralar
                </Link>
              </li>
              <li>
                <Link 
                  to="/borsalar" 
                  className={isActive('/borsalar') ? 'nav-active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-exchange-alt"></i>
                  Borsalar
                </Link>
              </li>
              <li>
                <Link 
                  to="/haberler" 
                  className={isActive('/haberler') ? 'nav-active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-newspaper"></i>
                  Haberler
                </Link>
              </li>
              <li>
                <Link 
                  to="/takvim" 
                  className={isActive('/takvim') ? 'nav-active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-calendar"></i>
                  Takvim
                </Link>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            <button className="menu-toggle" onClick={toggleMenu}>
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 