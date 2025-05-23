import { useEffect } from 'react';

/**
 * Hook that calls the provided callback when the Escape key is pressed
 */
export const useEscapeKey = (callback: () => void): void => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [callback]);
};
