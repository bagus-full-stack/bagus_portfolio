import React from 'react';

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div
    className={`bg-[var(--bg-card)] rounded animate-pulse ${className}`}
    role="status"
    aria-label="Chargement..."
  />
)

export default Skeleton;
