import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { RoleBadge } from '../components/Badges';
import { SkeletonTable } from '../components/Skeleton';
import { ErrorState, EmptyState } from '../components/FeedbackStates';
import { Users, Search, Shield, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';

export const AdminUsers = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        search,
        role: roleFilter
      }).toString();

      const res = await api.getUsers(params);
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Unable to load enterprise user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      toast.success('✓ User role updated');
      fetchUsers();
    } catch (err) {
      console.error('Role update error:', err);
      toast.error('✕ Something went wrong');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            <Shield size={16} />
            <span>Governance & Access Control</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffffff' }}>User & Role Management</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            Inspect enterprise directory, manage department affiliations, and adjust role-based privileges
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search by user name or corporate email..."
              className="form-input"
              style={{ paddingLeft: '36px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="employee">Employees</option>
            <option value="agent">Support Agents</option>
            <option value="admin">Administrators</option>
          </select>

          <button type="submit" className="btn btn-secondary">
            Filter Users
          </button>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <ErrorState
          title="Unable to load users."
          message={error}
          onRetry={fetchUsers}
        />
      )}

      {/* Users Table */}
      {!error && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          {loading ? (
            <SkeletonTable rows={6} columns={5} />
          ) : users.length === 0 ? (
            <EmptyState
              title="No users found."
              message="No users matched your search criteria."
            />
          ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 14px' }}>User</th>
                  <th style={{ padding: '12px 14px' }}>Department</th>
                  <th style={{ padding: '12px 14px' }}>Current Role</th>
                  <th style={{ padding: '12px 14px' }}>Change Role (PATCH)</th>
                  <th style={{ padding: '12px 14px' }}>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id || u.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                  >
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: u.role === 'admin' ? '#a855f7' : u.role === 'agent' ? '#06b6d4' : '#6366f1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {u.department || 'General'}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <RoleBadge role={u.role} />
                    </td>
                    <td style={{ padding: '14px' }}>
                      <select
                        className="form-select"
                        style={{ padding: '6px 10px', fontSize: '0.8rem', width: 'auto' }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id || u.id, e.target.value)}
                      >
                        <option value="employee">Employee</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.8rem', color: '#64748b' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
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
