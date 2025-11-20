import type { CSSProperties } from 'react';

export const classes = {
  tooltipContainer: {
    position: 'fixed',
    left: `50%`,
    bottom: '-20px',
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    zIndex: 2147483648,
    opacity: 1,
    pointerEvents: 'none',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    transform: 'translateX(-50%)',
    // Smooth appearance animation
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  } as CSSProperties,
};
