import type { CSSProperties } from "react";

export const classes = {
    modalStyle: {
        position: 'fixed',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '4px',
        minWidth: '500px',
        maxWidth: '400px',
        minHeight: '100px',
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

    smallText: {
        fontSize: '11px',
        color: ' #6b7280',
        padding: '0 !important',
        margin: '0 !important',
        lineHeight: '1.2 !important'
    } as CSSProperties,

    contentText: {
        fontSize: '12px',
        color: '#374151',
        lineHeight: '1.43 !important',
        fontWeight: '500',
        padding: '0 !important',
        margin: '0 !important',
    },

    modalHead: {
        padding: '4px 6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        userSelect: 'none',
    } as CSSProperties,

    modalHeadTitle: {
        fontWeight: '600',
        fontSize: '12px',
        color: '#111827',
        marginRight: '42px',
    } as CSSProperties,

    closeButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '2px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    } as CSSProperties,
}