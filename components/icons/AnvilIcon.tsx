import React from 'react';

export const AnvilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Tetrahedral molecular structure */}
    {/* Bonds/Edges */}
    <line x1="12" y1="4" x2="6" y2="16" />
    <line x1="12" y1="4" x2="18" y2="16" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="6" y1="16" x2="18" y2="16" />
    <line x1="6" y1="16" x2="12" y2="20" />
    <line x1="18" y1="16" x2="12" y2="20" />
    
    {/* Atoms/Nodes */}
    <circle cx="12" cy="4" r="2" fill="currentColor" />
    <circle cx="6" cy="16" r="2" fill="currentColor" />
    <circle cx="18" cy="16" r="2" fill="currentColor" />
    <circle cx="12" cy="20" r="2" fill="currentColor" />
  </svg>
);
