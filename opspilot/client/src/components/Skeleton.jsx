import React from 'react';

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '6px', style = {} }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 25%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.03) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.6s infinite ease-in-out',
        ...style
      }}
    />
  );
};

export const SkeletonCard = ({ rows = 3 }) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="40%" height="24px" borderRadius="8px" />
        <Skeleton width="18%" height="22px" borderRadius="12px" />
      </div>
      <Skeleton width="90%" height="16px" />
      <Skeleton width="75%" height="16px" />
      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
        <Skeleton width="70px" height="24px" borderRadius="6px" />
        <Skeleton width="90px" height="24px" borderRadius="6px" />
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Skeleton width="30%" height="28px" borderRadius="8px" />
        <Skeleton width="20%" height="32px" borderRadius="8px" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '16px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.02)'
            }}
          >
            <Skeleton width="35%" height="18px" />
            <Skeleton width="15%" height="18px" />
            <Skeleton width="15%" height="18px" />
            <Skeleton width="12%" height="18px" />
            <Skeleton width="10%" height="28px" borderRadius="6px" />
          </div>
        ))}
      </div>
    </div>
  );
};
