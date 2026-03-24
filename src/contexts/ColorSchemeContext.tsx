import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { colorSchemes } from '../themes/colors';
import { getColorScheme, setColorScheme as saveColorScheme } from '../storage/settings';

interface ColorSchemeContextType {
  schemeName: string;
  setSchemeName: (name: string) => Promise<void>;
}

export const ColorSchemeContext = createContext<ColorSchemeContextType>({
  schemeName: 'default',
  setSchemeName: async () => {},
});

export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  const [schemeName, setSchemeNameState] = useState('default');

  useEffect(() => {
    getColorScheme().then(name => {
      if (name && colorSchemes[name]) {
        setSchemeNameState(name);
      }
    });
  }, []);

  const setSchemeName = useCallback(async (name: string) => {
    if (colorSchemes[name]) {
      await saveColorScheme(name);
      setSchemeNameState(name);
    }
  }, []);

  return (
    <ColorSchemeContext.Provider value={{ schemeName, setSchemeName }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorSchemeContext() {
  return useContext(ColorSchemeContext);
}