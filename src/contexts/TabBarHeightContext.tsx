import React, { createContext, useContext, useState, useCallback } from 'react';

interface TabBarHeightContextType {
  tabBarHeight: number;
  setTabBarHeight: (height: number) => void;
}

const TabBarHeightContext = createContext<TabBarHeightContextType>({
  tabBarHeight: 80,
  setTabBarHeight: () => {},
});

export const useTabBarHeight = () => useContext(TabBarHeightContext);

interface TabBarHeightProviderProps {
  children: React.ReactNode;
}

export function TabBarHeightProvider({ children }: TabBarHeightProviderProps) {
  const [tabBarHeight, setTabBarHeight] = useState(80);

  const updateTabBarHeight = useCallback((height: number) => {
    setTabBarHeight(height);
  }, []);

  return (
    <TabBarHeightContext.Provider value={{ tabBarHeight, setTabBarHeight: updateTabBarHeight }}>
      {children}
    </TabBarHeightContext.Provider>
  );
}