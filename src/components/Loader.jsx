import React from 'react';

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="loader-container">
      <div className="global-spinner"></div>
      <p style={{ color: '#9aa0a6', marginTop: '1rem', fontSize: '0.95rem' }}>{text}</p>
    </div>
  );
}
