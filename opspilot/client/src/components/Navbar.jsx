import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './Badges';
import { 
  Bot, 
  LayoutDashboard, 
  PlusCircle, 
  ListFilter, 
  Inbox, 
  BookOpen, 
  BarChart3, 
  Users, 
  LogOut, 
  Sparkles,
  UserCheck,
  Menu,
  X
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, quickLoginAs } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleQuickSwitch = async (role) => {
    try {
      await quickLoginAs(role);
      navigate('/dashboard');
    } catch (err) {
      console.error('Quick switch failed:', err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 13, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      {/* Top Demo Role Switcher Strip (Special Hackathon Feature for Judges) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '5px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        color: '#94a3b8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={14} color="#6366f1" />
          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Judge Demo Switcher:</span>
          <span>Click to test any persona instantly:</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => handleQuickSwitch('employee')}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '3px 10px',
              fontSize: '0.75rem',
              borderColor: user?.role === 'employee' ? '#6366f1' : 'transparent',
              background: user?.role === 'employee' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'
            }}
          >
            👤 Employee (Alex)
          </button>
          <button
            onClick={() => handleQuickSwitch('agent')}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '3px 10px',
              fontSize: '0.75rem',
              borderColor: user?.role === 'agent' ? '#06b6d4' : 'transparent',
              background: user?.role === 'agent' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)'
            }}
          >
            🛠️ Agent (Marcus)
          </button>
          <button
            onClick={() => handleQuickSwitch('admin')}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '3px 10px',
              fontSize: '0.75rem',
              borderColor: user?.role === 'admin' ? '#a855f7' : 'transparent',
              background: user?.role === 'admin' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)'
            }}
          >
            👑 Admin (Sarah)
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <Bot size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Ops<span style={{ color: '#38bdf8' }}>Pilot</span>
            </span>
            <span style={{
              display: 'block',
              fontSize: '0.65rem',
              color: '#94a3b8',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 700
            }}>
              Enterprise AI Copilot
            </span>
          </div>
        </Link>

        {/* Links (Desktop) */}
        {isAuthenticated && (
          <nav className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Universal: Dashboard */}
            <Link
              to="/dashboard"
              className="btn btn-secondary btn-sm"
              style={{
                background: isActive('/dashboard') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                borderColor: isActive('/dashboard') ? '#6366f1' : 'transparent',
                color: isActive('/dashboard') ? '#ffffff' : '#94a3b8'
              }}
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>

            {/* 4.6 Employee Navigation */}
            {user?.role === 'employee' && (
              <>
                <Link
                  to="/new-request"
                  className="btn btn-primary btn-sm"
                  style={{
                    background: isActive('/new-request') ? 'linear-gradient(135deg, #4f46e5, #4338ca)' : undefined
                  }}
                >
                  <PlusCircle size={16} /> New Request
                </Link>
                <Link
                  to="/my-requests"
                  className="btn btn-secondary btn-sm"
                  style={{
                    background: isActive('/my-requests') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    borderColor: isActive('/my-requests') ? '#6366f1' : 'transparent',
                    color: isActive('/my-requests') ? '#ffffff' : '#94a3b8'
                  }}
                >
                  <ListFilter size={16} /> My Requests
                </Link>
                <Link
                  to="/knowledge"
                  className="btn btn-secondary btn-sm"
                  style={{
                    background: isActive('/knowledge') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    borderColor: isActive('/knowledge') ? '#6366f1' : 'transparent',
                    color: isActive('/knowledge') ? '#ffffff' : '#94a3b8'
                  }}
                >
                  <BookOpen size={16} /> Knowledge Base
                </Link>
              </>
            )}

            {/* 4.6 Agent Navigation */}
            {user?.role === 'agent' && (
              <>
                <Link
                  to="/agent-queue"
                  className="btn btn-secondary btn-sm"
                  style={{
                    background: isActive('/agent-queue') ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                    borderColor: isActive('/agent-queue') ? '#06b6d4' : 'transparent',
                    color: isActive('/agent-queue') ? '#ffffff' : '#94a3b8'
                  }}
                >
                  <Inbox size={16} /> Agent Queue
                </Link>
                <Link
                  to="/my-requests"
                  className="btn btn-secondary btn-sm"
                  style={{
                    background: isActive('/my-requests') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    borderColor: isActive('/my-requests') ? '#6366f1' : 'transparent',
                    color: isActive('/my-requests') ? '#ffffff' : '#94a3b8'
                  }}
                >
                  <ListFilter size={16} /> My Requests
                </Link>
                <Link
                  to="/knowledge"
                  className="btn btn-secondary btn-sm"
                  style={{
                    background: isActive('/knowledge') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    borderColor: isActive('/knowledge') ? '#6366f1' : 'transparent',
                    color: isActive('/knowledge') ? '#ffffff' : '#94a3b8'
                  }}
                >
                  <BookOpen size={16} /> Knowledge Base
                </Link>
              </>
            )}

            {/* 4.6 Admin Navigation */}
            {user?.role === 'admin' && (
              <>
                <Link
                  to="/analytics"
                  className="btn btn-secondary btn-sm"
                  style={{
                    background: isActive('/analytics') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    borderColor: isActive('/analytics') ? '#6366f1' : 'transparent',
                    color: isActive('/analytics') ? '#ffffff' : '#94a3b8'
                  }}
                >
                  <BarChart3 size={16} /> Analytics
                </Link>
                <Link
                  to="/knowledge"
                  className="btn btn-secondary btn-sm"
                  style={{
                    background: isActive('/knowledge') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    borderColor: isActive('/knowledge') ? '#6366f1' : 'transparent',
                    color: isActive('/knowledge') ? '#ffffff' : '#94a3b8'
                  }}
                >
                  <BookOpen size={16} /> Knowledge Base
                </Link>
                <Link
                  to="/admin/users"
                  className="btn btn-secondary btn-sm"
                  style={{
                    background: isActive('/admin/users') ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                    borderColor: isActive('/admin/users') ? '#a855f7' : 'transparent',
                    color: isActive('/admin/users') ? '#ffffff' : '#94a3b8'
                  }}
                >
                  <Users size={16} /> Users
                </Link>
              </>
            )}
          </nav>
        )}

        {/* User Pill / Login Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }} className="hide-on-tablet">
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                  {user?.name || 'User'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                  <RoleBadge role={user?.role || 'employee'} />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{user?.department || ''}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="btn btn-secondary btn-sm"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger (Visible only on screens <= 768px) */}
          {isAuthenticated && (
            <button
              className="nav-mobile-toggle btn btn-secondary btn-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'none', padding: '8px' }}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isAuthenticated && mobileMenuOpen && (
        <div
          className="animate-slide-up"
          style={{
            background: 'rgba(15, 23, 42, 0.98)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
          >
            <LayoutDashboard size={16} /> Dashboard
          </Link>

          {user?.role === 'employee' && (
            <>
              <Link
                to="/new-request"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ justifyContent: 'flex-start' }}
              >
                <PlusCircle size={16} /> New Request
              </Link>
              <Link
                to="/my-requests"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <ListFilter size={16} /> My Requests
              </Link>
              <Link
                to="/knowledge"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <BookOpen size={16} /> Knowledge Base
              </Link>
            </>
          )}

          {user?.role === 'agent' && (
            <>
              <Link
                to="/agent-queue"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <Inbox size={16} /> Agent Queue
              </Link>
              <Link
                to="/my-requests"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <ListFilter size={16} /> My Requests
              </Link>
              <Link
                to="/knowledge"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <BookOpen size={16} /> Knowledge Base
              </Link>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <Link
                to="/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <BarChart3 size={16} /> Analytics
              </Link>
              <Link
                to="/knowledge"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <BookOpen size={16} /> Knowledge Base
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <Users size={16} /> Users
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
