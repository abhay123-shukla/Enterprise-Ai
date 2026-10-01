import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw, Inbox, ArrowRight, PlusCircle } from 'lucide-react';

/**
 * 4.3 Error State Component
 * Example: Unable to load requests. [Try Again]
 */
export const ErrorState = ({
  title = 'Unable to load data',
  message = null,
  description = null,
  onRetry = null,
  retryLabel = 'Try Again'
}) => {
  const displayMsg = message || description || 'An unexpected error occurred while communicating with the server.';
  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        maxWidth: '520px',
        margin: '40px auto',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        background: 'rgba(244, 63, 94, 0.04)'
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'rgba(244, 63, 94, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          color: '#fb7185'
        }}
      >
        <AlertCircle size={28} />
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
        {displayMsg}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            borderColor: 'rgba(244, 63, 94, 0.4)',
            color: '#ffffff'
          }}
        >
          <RefreshCw size={16} />
          {retryLabel}
        </button>
      )}
    </div>
  );
};

/**
 * 4.4 Empty State Component
 * Example: No requests found. Create your first request →
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No requests found',
  description = null,
  message = null,
  actionText = 'Create your first request →',
  actionLink = '/new-request',
  onAction = null
}) => {
  const displayDesc = description || message || 'There are currently no items to display in this view.';
  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        padding: '56px 24px',
        textAlign: 'center',
        maxWidth: '540px',
        margin: '40px auto'
      }}
    >
      <div
        style={{
          width: '58px',
          height: '58px',
          borderRadius: '14px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px auto',
          color: '#818cf8'
        }}
      >
        <Icon size={28} />
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
        {displayDesc}
      </p>

      {actionLink && !onAction && (
        <Link
          to={actionLink}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px'
          }}
        >
          <PlusCircle size={16} />
          {actionText}
        </Link>
      )}

      {onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px'
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
