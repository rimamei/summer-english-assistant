import type { CSSProperties } from 'react';

export const classes = {
  spinner: {
    width: '16px',
    height: '16px',
    border: '3px solid #e57373',
    borderRadius: '50px',
    animation: 'spin 1s linear infinite',
    borderBottomColor: 'transparent',
  } as CSSProperties,
};
