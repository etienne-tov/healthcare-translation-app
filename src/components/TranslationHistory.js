import React, { useState } from 'react';
import '../TranslationHistory.css';

function TranslationHistory({ history, onSelectItem, onClearHistory, isOpen, onClose }) {
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Format date for display
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };
  
  // Truncate text if too long
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Get unique specialties for filter dropdown
  const specialties = ['all', ...new Set(history.map(item => item.specialty))];
  
  // Filter history based on specialty and search term
  const filteredHistory = history.filter(item => {
    const matchesSpecialty = filterSpecialty === 'all' || item.specialty === filterSpecialty;
    const matchesSearch = searchTerm === '' || 
      item.original.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.translated.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });
  
  // Handle item selection and close modal
  const handleSelectItem = (item) => {
    onSelectItem(item);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="history-modal-overlay" onClick={onClose}>
      <div className="history-modal" onClick={e => e.stopPropagation()}>
        <div className="history-modal-header">
          <h2>Translation History</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="history-filters">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search translations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="specialty-filter">
            <label>Filter by specialty:</label>
            <select 
              value={filterSpecialty} 
              onChange={(e) => setFilterSpecialty(e.target.value)}
            >
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>
                  {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {filteredHistory.length === 0 ? (
          <div className="empty-history">
            <p>No translation history available</p>
          </div>
        ) : (
          <div className="history-list-container">
            <ul className="history-list">
              {filteredHistory.map((item) => (
                <li
                  key={item.id}
                  className="history-item"
                  onClick={() => handleSelectItem(item)}
                >
                  <div className="history-item-header">
                    <span className="history-date">{formatDate(item.timestamp)}</span>
                    <span className="history-languages">
                      {item.sourceLanguage} → {item.targetLanguage}
                    </span>
                  </div>
                  <div className="history-content">
                    <div className="history-original">
                      <h4>Original:</h4>
                      <p>{truncateText(item.original)}</p>
                    </div>
                    <div className="history-translated">
                      <h4>Translation:</h4>
                      <p>{truncateText(item.translated)}</p>
                    </div>
                  </div>
                  {item.specialty !== 'general' && (
                    <div className="history-specialty-tag">
                      {item.specialty}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="history-modal-footer">
          <button
            className="clear-history-button"
            onClick={onClearHistory}
            disabled={history.length === 0}
          >
            Clear All History
          </button>
        </div>
      </div>
    </div>
  );
}

export default TranslationHistory;