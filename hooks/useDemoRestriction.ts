import { useCallback } from 'react';
import { useDemo } from '@/contexts/DemoContext';

/**
 * Hook to check.demo mode and restrict actions
 * Returns a function that returns true if action should proceed (user is logged in)
 * or false if demo mode blocked it (and shows alert)
 */
export function useDemoRestriction() {
  const { isDemo, showDemoAlert } = useDemo();

  /**
   * Call this before any action that requires authentication
   * Returns true if action should proceed, false if blocked by demo mode
   */
  const checkAndProceed = useCallback((): boolean => {
    if (isDemo) {
      showDemoAlert();
      return false;
    }
    return true;
  }, [isDemo, showDemoAlert]);

  return { checkAndProceed, isDemo };
}
