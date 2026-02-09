import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AppRole } from './AuthContext';

interface DemoContextType {
  isDemoMode: boolean;
  demoRole: AppRole | null;
  enterDemo: (role: AppRole) => void;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  demoRole: null,
  enterDemo: () => {},
  exitDemo: () => {},
});

export const useDemo = () => useContext(DemoContext);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(() => sessionStorage.getItem('urgenceos_demo') === 'true');
  const [demoRole, setDemoRole] = useState<AppRole | null>(() => sessionStorage.getItem('urgenceos_demo_role') as AppRole | null);

  const enterDemo = useCallback((role: AppRole) => {
    sessionStorage.setItem('urgenceos_demo', 'true');
    sessionStorage.setItem('urgenceos_demo_role', role);
    setIsDemoMode(true);
    setDemoRole(role);
  }, []);

  const exitDemo = useCallback(() => {
    sessionStorage.removeItem('urgenceos_demo');
    sessionStorage.removeItem('urgenceos_demo_role');
    setIsDemoMode(false);
    setDemoRole(null);
  }, []);

  return (
    <DemoContext.Provider value={{ isDemoMode, demoRole, enterDemo, exitDemo }}>
      {children}
    </DemoContext.Provider>
  );
};
