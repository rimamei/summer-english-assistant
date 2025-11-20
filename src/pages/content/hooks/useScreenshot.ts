import { useState, useCallback } from 'react';

interface ScreenshotArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface UseScreenshotReturn {
  isSelecting: boolean;
  screenshotArea: ScreenshotArea | null;
  startSelection: (x: number, y: number) => void;
  updateSelection: (x: number, y: number) => void;
  finishSelection: () => Promise<string | null>;
  cancelSelection: () => void;
  error: string;
}

export function useScreenshot(): UseScreenshotReturn {
  const [isSelecting, setIsSelecting] = useState(false);
  const [screenshotArea, setScreenshotArea] = useState<ScreenshotArea | null>(null);
  const [error, setError] = useState('');

  const startSelection = useCallback((x: number, y: number) => {
    setIsSelecting(true);
    setScreenshotArea({
      startX: x,
      startY: y,
      endX: x,
      endY: y,
    });
  }, []);

  const updateSelection = useCallback((x: number, y: number) => {
    setScreenshotArea(prev => {
      if (!prev) return null;
      return {
        ...prev,
        endX: x,
        endY: y,
      };
    });
  }, []);

  const captureScreenshot = useCallback(async (area: ScreenshotArea): Promise<string | null> => {
    try {
      // Request screenshot from background script
      const response = await chrome.runtime.sendMessage({
        type: 'CAPTURE_SCREENSHOT',
      });

      if (!response) {
        setError('Failed to capture screenshot: No response from background script');
        return null;
      }

      if (response.error) {
        setError('Failed to capture screenshot: ' + response.error);
        return null;
      }

      if (!response.dataUrl) {
        setError('Failed to capture screenshot: No dataUrl in response');
        return null;
      }

      // Calculate the cropping area
      const img = new Image();
      img.src = response.dataUrl;

      return new Promise(resolve => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(null);
            return;
          }

          // Get actual coordinates (normalize if selection was made right-to-left or bottom-to-top)
          const x = Math.min(area.startX, area.endX);
          const y = Math.min(area.startY, area.endY);
          const width = Math.abs(area.endX - area.startX);
          const height = Math.abs(area.endY - area.startY);

          // Set canvas size to the selection area
          canvas.width = width;
          canvas.height = height;

          // Calculate device pixel ratio for proper cropping
          const dpr = window.devicePixelRatio || 1;

          // Draw the cropped portion
          ctx.drawImage(img, x * dpr, y * dpr, width * dpr, height * dpr, 0, 0, width, height);

          // Convert to data URL
          const croppedDataUrl = canvas.toDataURL('image/png');
          resolve(croppedDataUrl);
        };

        img.onerror = () => {
          setError('Failed to load screenshot image');
          resolve(null);
        };
      });
    } catch (error) {
      setError('Error capturing screenshot: ' + error);
      return null;
    }
  }, []);

  const finishSelection = useCallback(async (): Promise<string | null> => {
    if (!screenshotArea) return null;

    const dataUrl = await captureScreenshot(screenshotArea);
    setIsSelecting(false);
    setScreenshotArea(null);
    return dataUrl;
  }, [screenshotArea, captureScreenshot]);

  const cancelSelection = useCallback(() => {
    setIsSelecting(false);
    setScreenshotArea(null);
  }, []);

  return {
    isSelecting,
    screenshotArea,
    startSelection,
    updateSelection,
    finishSelection,
    cancelSelection,
    error,
  };
}
