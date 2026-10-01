import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge, PriorityBadge, DepartmentBadge, SlaTimer } from '../components/Badges';
import { SkeletonCard, SkeletonTable } from '../components/Skeleton';
import { ErrorState, EmptyState } from '../components/FeedbackStates';
import { 
  Sparkles, 
  PlusCircle, 
  Inbox, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Bot
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      if (user?.role === 'employee') {
        const res = await api.getMyRequests('limit=5');
        setRequests(res?.requests || []);
      } else {
        const [reqRes, analyticsRes] = await Promise.all([
          api.getAllRequests('limit=6&sortBy=createdAt&order=desc').catch(() => ({ requests: [] })),
          api.getAnalytics().catch(() => null)
        ]);
        setRequests(reqRes?.requests || []);
        setAnalytics(analyticsRes);
      }
    } catch (err) {
      console.error('Dashboard load failed:', err);
      setError(err.message || 'Unable to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Compute metrics defensively
  const openCount = analytics?.summary?.openCount ?? requests.filter(r => r.status === 'open').length;
  const pendingCount = analytics?.summary?.pendingCount ?? requests.filter(r => r.status === 'pending').length;
  const resolvedCount = analytics?.summary?.resolvedCount ?? requests.filter(r => r.status === 'resolved' || r.status === 'closed').length;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px' }} className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '30px',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            <Bot size={18} />
            <span>AI Operations Copilot Active</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '4px' }}>
            {user?.role === 'employee' && "Submit inquiries, receive instant AI answers, and track resolution progress in real time."}
            {user?.role === 'agent' && "Your AI copilot is monitoring SLA risks and drafting contextual responses across department queues."}
            {user?.role === 'admin' && "Enterprise Operations Command Center: Monitor SLAs, auto-detect knowledge gaps, and optimize support velocity."}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {user?.role === 'employee' ? (
            <Link to="/new-request" className="btn btn-primary" style={{ padding: '12px 20px' }}>
              <PlusCircle size={18} /> Submit New Request
            </Link>
          ) : (
            <>
              <Link to="/agent-queue" className="btn btn-primary" style={{ padding: '12px 20px' }}>
                <Inbox size={18} /> Open Agent Queue
              </Link>
              <Link to="/analytics" className="btn btn-secondary" style={{ padding: '12px 20px' }}>
                <BarChart3 size={18} /> View Analytics
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Metrics Counters (Open | Pending | Resolved) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {loading ? (
          <>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </>
        ) : (
          <>
            {/* Open */}
            <div className="glass-panel" style={{ padding: '22px 24px', borderLeft: '4px solid #38bdf8' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Open Inquiries
                </span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <Clock size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>
                {openCount}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '6px' }}>
                ● Ready for triage & resolution
              </div>
            </div>

            {/* Pending */}
            <div className="glass-panel" style={{ padding: '22px 24px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  In Progress / Pending
                </span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                  <AlertCircle size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>
                {pendingCount}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '6px' }}>
                ● Assigned to support specialists
              </div>
            </div>

            {/* Resolved */}
            <div className="glass-panel" style={{ padding: '22px 24px', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Resolved Requests
                </span>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>
                {resolvedCount}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '6px' }}>
                ● Closed within SLA standards
              </div>
            </div>
          </>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div style={{ marginBottom: '28px' }}>
          <ErrorState
            title="Unable to load requests."
            message={error}
            onRetry={fetchData}
          />
        </div>
      )}

      {/* Recent Requests Section */}
      {!error && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {user?.role === 'employee' ? 'Your Recent Requests' : 'Recent Inbound Requests'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Live updates with AI categorization and SLA indicators
              </p>
            </div>
            <Link
              to={user?.role === 'employee' ? '/my-requests' : '/agent-queue'}
              style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <SkeletonTable rows={5} columns={6} />
          ) : requests.length === 0 ? (
            <EmptyState
              title="No requests found."
              description="Create your first request to see AI triage and automated SLA routing in action!"
              actionText="Create your first request →"
              actionLink="/new-request"
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 14px' }}>Request</th>
                    <th style={{ padding: '12px 14px' }}>Department</th>
                    <th style={{ padding: '12px 14px' }}>Priority</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px' }}>SLA Time</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr
                      key={req._id || req.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
                          {req.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          Category: {req.category || 'General'}
                        </div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <DepartmentBadge department={req.department} />
                      </td>
                      <td style={{ padding: '14px' }}>
                        <PriorityBadge priority={req.priority} />
                      </td>
                      <td style={{ padding: '14px' }}>
                        <StatusBadge status={req.status} />
                      </td>
                      <td style={{ padding: '14px' }}>
                        <SlaTimer deadline={req.slaDeadline} resolvedAt={req.resolvedAt} status={req.status} />
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <Link
                          to={`/requests/${req._id || req.id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.8rem' }}
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
