import React from 'react';

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div
    className={`bg-[#141B22] rounded animate-pulse ${className}`}
    role="status"
    aria-label="Chargement..."
  />
)

export default Skeleton;
