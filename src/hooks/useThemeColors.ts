import { useColorScheme } from 'nativewind';
import { colorSchemes, ColorSchemeColors } from '../themes/colors';
import { getColorScheme, setColorScheme as saveColorScheme } from '../storage/settings';
import { useEffect, useState, useCallback } from 'react';

export function useThemeColors(): ColorSchemeColors {
  const { colorScheme } = useColorScheme();
  const [schemeName, setSchemeName] = useState<string>('default');

  useEffect(() => {
    getColorScheme().then((name: string) => {
      if (name && colorSchemes[name]) {
        setSchemeName(name);
      }
    });
  }, []);

  const scheme = colorSchemes[schemeName] || colorSchemes.default;
  const isDark = colorScheme === 'dark';

  return isDark ? scheme.dark : scheme.light;
}

export function useColorSchemeName(): string {
  const [schemeName, setSchemeName] = useState<string>('default');

  useEffect(() => {
    getColorScheme().then((name: string) => {
      if (name && colorSchemes[name]) {
        setSchemeName(name);
      }
    });
  }, []);

  return schemeName;
}

export function useSetColorScheme(): (name: string) => Promise<void> {
  const setSchemeName = useCallback(async (name: string) => {
    if (colorSchemes[name]) {
      await saveColorScheme(name);
    }
  }, []);

  return setSchemeName;
}