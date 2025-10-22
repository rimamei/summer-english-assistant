import type { CSSProperties } from "react";

export const classes = {
    modalStyle: {
        position: 'fixed',
        width: '380px',
        maxWidth: '90vw',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow:
            '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e5e7eb',
        zIndex: 2147483648,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
        animation: 'summer-modal-appear 0.2s ease-out',
    } as CSSProperties,

    headerStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #f3f4f6',
        backgroundColor: '#f9fafb',
    } as CSSProperties,

    contentStyle: {
        padding: '20px',
        maxHeight: '400px',
        overflowY: 'auto',
    } as CSSProperties,

    textAreaStyle: {
        width: '100%',
        minHeight: '80px',
        padding: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'vertical' as const,
        outline: 'none',
        backgroundColor: '#f9fafb',
    } as CSSProperties,

    buttonStyle: {
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease',
    } as CSSProperties,
}