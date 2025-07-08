import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopTicker from './components/TopTicker';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ExchangesPage from './pages/ExchangesPage';
import NewsPage from './pages/NewsPage';
import CryptoPage from './pages/CryptoPage';
import CalendarPage from './pages/CalendarPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <TopTicker />
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/borsalar" element={<ExchangesPage />} />
            <Route path="/haberler" element={<NewsPage />} />
            <Route path="/kripto-paralar" element={<CryptoPage />} />
            <Route path="/takvim" element={<CalendarPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 