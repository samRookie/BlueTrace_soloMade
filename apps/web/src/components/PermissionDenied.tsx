import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { getRoleLabel } from '../utils/presenters.js';

export function PermissionDenied({
  requiredAction = 'access this section',
}: {
  requiredAction?: string;
}) {
  const { user } = useAuth();

  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        background: '#fffbeb',
        border: '1px solid #fef3c7',
        borderRadius: '8px',
        margin: '1.5rem 0',
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛡️</div>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#92400e', fontSize: '1.25rem' }}>
        Access Restricted (403 Forbidden)
      </h3>
      <p
        style={{
          color: '#78350f',
          fontSize: '0.9rem',
          maxWidth: '480px',
          margin: '0 auto 1rem auto',
        }}
      >
        Your authenticated persona (<strong>{user ? getRoleLabel(user.role) : 'Anonymous'}</strong>)
        does not possess the requisite institutional permissions to {requiredAction}.
      </p>
    </div>
  );
}
