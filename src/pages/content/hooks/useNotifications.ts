import { useCallback } from 'react';

interface UseNotificationsReturn {
  showNotification: (message: string, color: string) => void;
  hideNotification: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const showNotification = useCallback((message: string, color: string) => {
    
    const existing = document.querySelector('[data-summer-notification]');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.setAttribute('data-summer-notification', 'true');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 2147483649;
      animation: summer-notification-slide 0.3s ease-out;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 300px;
    `;

    // Add animation styles if not already present
    if (!document.querySelector('#summer-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'summer-notification-styles';
      style.textContent = `
        @keyframes summer-notification-slide {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes summer-notification-fade-out {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove notification after 4 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'summer-notification-fade-out 0.3s ease-in';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 4000);
  }, []);

  const hideNotification = useCallback(() => {
    const existing = document.querySelector('[data-summer-notification]');
    if (existing) {
      existing.remove();
    }
  }, []);

  return {
    showNotification,
    hideNotification,
  };
}