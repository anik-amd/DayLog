import { useColorScheme } from 'nativewind';
import { colorSchemes, ColorSchemeColors } from '../themes/colors';
import { useColorSchemeContext } from '../contexts/ColorSchemeContext';

export function useThemeColors(): ColorSchemeColors {
  const { colorScheme } = useColorScheme();
  const { schemeName } = useColorSchemeContext();
  
  const scheme = colorSchemes[schemeName] || colorSchemes.default;
  const isDark = colorScheme === 'dark';

  return isDark ? scheme.dark : scheme.light;
}