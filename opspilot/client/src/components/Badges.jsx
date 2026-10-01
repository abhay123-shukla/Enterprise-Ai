import React from 'react';
import { Clock, ShieldAlert, CheckCircle, AlertTriangle, Layers } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const s = (status || 'open').toLowerCase();
  return (
    <span className={`badge badge-${s}`}>
      {s === 'resolved' || s === 'closed' ? <CheckCircle size={12} /> : <Clock size={12} />}
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const p = (priority || 'Medium').toLowerCase();
  return (
    <span className={`badge badge-${p}`}>
      {p === 'critical' ? <ShieldAlert size={12} /> : p === 'high' ? <AlertTriangle size={12} /> : null}
      {priority}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const r = (role || 'employee').toLowerCase();
  return (
    <span className={`badge badge-role-${r}`}>
      {role}
    </span>
  );
};

export const DepartmentBadge = ({ department }) => {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 8px',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '600',
      background: 'rgba(255, 255, 255, 0.07)',
      color: '#cbd5e1',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <Layers size={11} />
      {department || 'General'}
    </span>
  );
};

export const SlaTimer = ({ deadline, resolvedAt, status }) => {
  if (resolvedAt || status === 'resolved' || status === 'closed') {
    return (
      <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <CheckCircle size={13} /> SLA Met
      </span>
    );
  }

  if (!deadline) return <span style={{ color: '#64748b', fontSize: '0.8rem' }}>No SLA</span>;

  const target = new Date(deadline).getTime();
  const diff = target - Date.now();
  const isBreached = diff <= 0;

  const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
  const minutes = Math.floor((Math.abs(diff) % (1000 * 60 * 60)) / (1000 * 60));

  if (isBreached) {
    return (
      <span style={{ color: '#f43f5e', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <AlertTriangle size={13} /> Breached by {hours}h {minutes}m
      </span>
    );
  }

  const isUrgent = diff < 2 * 60 * 60 * 1000;

  return (
    <span style={{ color: isUrgent ? '#f59e0b' : '#38bdf8', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <Clock size={13} /> {hours}h {minutes}m left
    </span>
  );
};
