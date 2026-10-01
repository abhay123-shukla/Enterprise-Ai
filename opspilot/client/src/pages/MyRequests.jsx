import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge, PriorityBadge, DepartmentBadge, SlaTimer } from '../components/Badges';
import { Search, Filter, PlusCircle, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { SkeletonTable } from '../components/Skeleton';
import { ErrorState, EmptyState } from '../components/FeedbackStates';

export const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [department, setDepartment] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 10 });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search,
        status,
        priority,
        department
      }).toString();

      const res = await api.getMyRequests(queryParams);
      setRequests(res.requests || []);
      setPagination(res.pagination || { total: 0, pages: 1, page: 1, limit: 10 });
    } catch (err) {
      console.error('Error fetching my requests:', err);
      setError(err.message || 'Unable to load requests from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, status, priority, department]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffffff' }}>My Requests</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            Track the status, SLA timers, and AI resolutions of your submitted inquiries
          </p>
        </div>
        <Link to="/new-request" className="btn btn-primary">
          <PlusCircle size={16} /> New Request
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '18px 20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search by keywords, error codes, title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px' }}
            />
          </div>

          {/* Status Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '130px' }}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '130px' }}
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Department Filter */}
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

          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>
      </div>

      {/* Requests Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? (
          <SkeletonTable rows={5} />
        ) : error ? (
          <ErrorState
            title="Unable to load requests"
            message={error}
            onRetry={fetchRequests}
            retryLabel="Try Again"
          />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No requests found"
            description="Submit an inquiry to test AI auto-categorization and instant deflection answers."
            actionText="Create your first request →"
            actionLink="/new-request"
          />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 14px' }}>Request Details</th>
                    <th style={{ padding: '12px 14px' }}>Department</th>
                    <th style={{ padding: '12px 14px' }}>Priority</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px' }}>SLA Timer</th>
                    <th style={{ padding: '12px 14px' }}>Date Submitted</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr
                      key={req._id || req.id}
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                    >
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
                          {req.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {req.description}
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
                      <td style={{ padding: '14px', fontSize: '0.8rem', color: '#94a3b8' }}>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <Link
                          to={`/requests/${req._id || req.id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          View Details
                        </Link>
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
