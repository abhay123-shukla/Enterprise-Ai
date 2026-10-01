import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Home, AlertCircle } from 'lucide-react';

export const NotFound = () => {
  return (
    <div style={{
      maxWidth: '560px',
      margin: '80px auto',
      textAlign: 'center',
      padding: '0 20px'
    }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '48px 32px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '16px',
          background: 'rgba(244, 63, 94, 0.15)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fb7185',
          marginBottom: '20px',
          border: '1px solid rgba(244, 63, 94, 0.3)'
        }}>
          <AlertCircle size={36} />
        </div>
        <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em' }}>
          404
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: '6px' }}>
          Page Not Found
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px', marginBottom: '28px' }}>
          The requested OpsPilot route or resource could not be found.
        </p>

        <Link to="/dashboard" className="btn btn-primary" style={{ padding: '12px 24px' }}>
          <Home size={18} /> Go to Dashboard
        </Link>
      </div>
    </div>
  );
};
