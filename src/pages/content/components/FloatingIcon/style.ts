import type { CSSProperties } from "react";

export const classes = {
    iconStyle: {
        position: 'fixed',
        width: '32px',
        height: '32px',
        backgroundColor: '#3b82f6',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 2147483647,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '2px solid white',
        transition: 'all 0.2s ease',
        animation: 'summer-translation-appear 0.2s ease-out',
        color: 'white',
        // Prevent text selection on the icon
        userSelect: 'none',
        WebkitUserSelect: 'none',
    } as CSSProperties
};
