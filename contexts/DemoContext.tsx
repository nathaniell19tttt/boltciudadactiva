import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type DemoModeType = 'worker' | 'company' | null;

interface DemoContextType {
  demoMode: DemoModeType;
  setDemoMode: (mode: DemoModeType) => void;
  isDemo: boolean;
  showDemoAlert: () => void;
  hideDemoAlert: () => void;
  isDemoAlertVisible: boolean;
  exitDemoMode: () => void;
  getDemoRole: () => 'worker' | 'company' | null;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoModeState] = useState<DemoModeType>(null);
  const [isDemoAlertVisible, setIsDemoAlertVisible] = useState(false);

  const setDemoMode = useCallback((mode: DemoModeType) => {
    setDemoModeState(mode);
  }, []);

  const showDemoAlert = useCallback(() => {
    setIsDemoAlertVisible(true);
  }, []);

  const hideDemoAlert = useCallback(() => {
    setIsDemoAlertVisible(false);
  }, []);

  const exitDemoMode = useCallback(() => {
    setDemoModeState(null);
    setIsDemoAlertVisible(false);
  }, []);

  const getDemoRole = useCallback(() => {
    return demoMode;
  }, [demoMode]);

  const value: DemoContextType = {
    demoMode,
    setDemoMode,
    isDemo: demoMode !== null,
    showDemoAlert,
    hideDemoAlert,
    isDemoAlertVisible,
    exitDemoMode,
    getDemoRole,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
