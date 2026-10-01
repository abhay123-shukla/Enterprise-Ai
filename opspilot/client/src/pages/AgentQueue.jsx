import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge, DepartmentBadge, SlaTimer } from '../components/Badges';
import {
  Inbox,
  Search,
  ArrowUpDown,
  UserCheck,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { SkeletonTable } from '../components/Skeleton';
import { ErrorState, EmptyState } from '../components/FeedbackStates';

export const AgentQueue = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [sortBy, setSortBy] = useState('slaDeadline');
  const [order, setOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const toast = useToast();

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page,
        limit: 15,
        department,
        status,
        priority,
        sortBy,
        order,
        search
      }).toString();

      const res = await api.getAllRequests(params);
      setRequests(res.requests || []);
      setPagination(res.pagination || { total: 0, pages: 1 });
    } catch (err) {
      console.error('Queue load failed:', err);
      setError(err.message || 'Unable to load agent triage queue from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [department, status, priority, sortBy, order, page]);

  const handleQuickAssign = async (requestId) => {
    try {
      await api.assignRequest(requestId);
      toast.success('✓ Request assigned to you');
      fetchQueue();
    } catch (err) {
      console.error('Quick assign error:', err);
      toast.error('✕ Failed to assign request');
    }
  };

  const handleQuickResolve = async (requestId) => {
    try {
      await api.updateRequest(requestId, { status: 'resolved' });
      toast.success('✓ Request resolved');
      fetchQueue();
    } catch (err) {
      console.error('Quick resolve error:', err);
      toast.error('✕ Failed to resolve request');
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            <Inbox size={16} />
            <span>Support Operations Command</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffffff' }}>Agent Triage Queue</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            Prioritize, assign, and rapidly resolve employee inquiries across all enterprise departments
          </p>
        </div>
      </div>

      {/* Control Bar: Filters, Sort by Priority & SLA (Required by 2.10) */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search inquiries, names, error tags..."
              className="form-input"
              style={{ paddingLeft: '36px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchQueue(); } }}
            />
          </div>

          {/* Department Filter (Required) */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '140px' }}
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
          >
            <option value="all">All Departments</option>
            <option value="IT">IT Support</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Facilities">Facilities</option>
            <option value="Procurement">Procurement</option>
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '130px' }}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="pending">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Priority Sorting (Required) */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '140px' }}
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* SLA / Priority Sort Mode (Required) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Sort:</span>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '140px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="slaDeadline">SLA Deadline</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Date Created</option>
            </select>
            <button
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              className="btn btn-secondary btn-sm"
              title="Toggle sort direction"
            >
              <ArrowUpDown size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <SkeletonTable rows={6} />
        ) : error ? (
          <ErrorState
            title="Unable to load agent queue"
            message={error}
            onRetry={fetchQueue}
            retryLabel="Try Again"
          />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No tickets in queue"
            description="All caught up! There are currently no open tickets matching your filter criteria."
            actionText="Reset Filters"
            onAction={() => {
              setDepartment('all');
              setStatus('all');
              setPriority('all');
              setSearch('');
            }}
          />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 14px' }}>Inquiry Details</th>
                  <th style={{ padding: '12px 14px' }}>Department</th>
                  <th style={{ padding: '12px 14px' }}>Priority</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px' }}>SLA Urgency</th>
                  <th style={{ padding: '12px 14px' }}>Assigned Agent</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req._id || req.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                  >
                    <td style={{ padding: '14px', maxWidth: '340px' }}>
                      <Link
                        to={`/requests/${req._id || req.id}`}
                        style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem', display: 'block' }}
                      >
                        {req.title}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
                        By {req.requester?.name || 'Employee'} • Category: {req.category}
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
                    <td style={{ padding: '14px' }}>
                      {req.assignedTo ? (
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>
                          {req.assignedTo.name}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleQuickAssign(req._id || req.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        >
                          <UserCheck size={12} /> Claim Ticket
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {req.status !== 'resolved' && (
                          <button
                            onClick={() => handleQuickResolve(req._id || req.id)}
                            className="btn btn-success btn-sm"
                            title="Quick Resolve"
                          >
                            <CheckCircle size={13} />
                          </button>
                        )}
                        <Link
                          to={`/requests/${req._id || req.id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          Inspect
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="btn btn-secondary btn-sm"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage(page + 1)}
                  className="btn btn-secondary btn-sm"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};
