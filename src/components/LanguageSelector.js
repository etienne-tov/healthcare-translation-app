// File: components/LanguageSelector.js
import React from 'react';

function LanguageSelector({ label, selectedLanguage, onLanguageChange, languages }) {
  return (
    <div className="language-selector">
      <label>{label}</label>
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;




