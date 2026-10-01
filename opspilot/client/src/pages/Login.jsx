import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Bot, LogIn, AlertCircle, Sparkles } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, quickLoginAs } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      toast.success('✓ Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      toast.error('✕ ' + (err.message || 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError('');
    try {
      await quickLoginAs(role);
      toast.success(`✓ Signed in as ${role.toUpperCase()}`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Demo login failed');
      toast.error('✕ Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '460px',
      margin: '60px auto',
      padding: '0 20px'
    }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            color: 'white',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
          }}>
            <LogIn size={24} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>Welcome Back</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            Sign in to your OpsPilot Enterprise Workspace
          </p>
        </div>

        {/* 1-Click Demo Login Panel for Judges */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '22px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#c7d2fe', marginBottom: '10px' }}>
            <Sparkles size={14} color="#818cf8" />
            <span>Judge 1-Click Instant Logins:</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('employee')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '7px 4px', background: 'rgba(255, 255, 255, 0.08)' }}
            >
              👤 Employee
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('agent')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '7px 4px', background: 'rgba(255, 255, 255, 0.08)' }}
            >
              🛠️ Agent
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '7px 4px', background: 'rgba(255, 255, 255, 0.08)' }}
            >
              👑 Admin
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#fb7185',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '18px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. employee@opspilot.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to OpsPilot'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.85rem', color: '#94a3b8' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#38bdf8', fontWeight: 600 }}>
            Create one here
          </Link>
        </div>
      </div>
    </div>
  );
};
