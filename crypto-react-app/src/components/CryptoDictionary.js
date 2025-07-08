import React, { useState } from 'react';
import { cryptoTerms, popularTerms, getTermsByLetter, searchTerms } from '../data/terms';
import './CryptoDictionary.css';

const CryptoDictionary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [activeView, setActiveView] = useState('popular'); // popular, letter, search
  
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setActiveView('search');
    } else {
      setActiveView('popular');
    }
  };
  
  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    setActiveView('letter');
    setSearchQuery('');
  };
  
  const getTermsToShow = () => {
    if (activeView === 'search') {
      return searchTerms(searchQuery);
    } else if (activeView === 'letter') {
      return getTermsByLetter(selectedLetter);
    } else {
      return cryptoTerms.filter(term => popularTerms.includes(term.term));
    }
  };

  return (
    <div className="crypto-dictionary">
      <div className="dictionary-header">
        <h2>
          <i className="fas fa-book"></i>
          Kripto Sözlüğü
        </h2>
        <div className="dictionary-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Terim ara..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="dictionary-content">
        <div className="alphabet-filter">
          <button 
            className={activeView === 'popular' ? 'active' : ''}
            onClick={() => {
              setActiveView('popular');
              setSearchQuery('');
              setSelectedLetter('');
            }}
          >
            Popüler
          </button>
          {alphabet.map(letter => (
            <button
              key={letter}
              className={selectedLetter === letter ? 'active' : ''}
              onClick={() => handleLetterClick(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
        
        <div className="terms-container">
          {getTermsToShow().map((term, index) => (
            <div key={index} className="term-item">
              <h3>{term.term}</h3>
              <p>{term.definition}</p>
            </div>
          ))}
          
          {getTermsToShow().length === 0 && (
            <div className="no-terms">
              <i className="fas fa-search"></i>
              <p>Aradığınız terim bulunamadı</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CryptoDictionary; 