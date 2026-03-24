export interface ColorSchemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentLight: string;
  border: string;
  borderSubtle: string;
  success: string;
  warning: string;
  error: string;
}

export interface ColorScheme {
  name: string;
  light: ColorSchemeColors;
  dark: ColorSchemeColors;
}

export const colorSchemes: Record<string, ColorScheme> = {
  default: {
    name: 'Default',
    light: {
      background: '#ffffff',
      surface: '#fafafa',
      surfaceElevated: '#ffffff',
      text: '#27272a',
      textSecondary: '#71717a',
      textTertiary: '#a1a1aa',
      accent: '#6366f1',
      accentLight: '#e0e7ff',
      border: '#e5e5e5',
      borderSubtle: '#f4f4f5',
      success: '#16a34a',
      warning: '#d97706',
      error: '#ef4444',
    },
    dark: {
      background: '#09090b',
      surface: '#171717',
      surfaceElevated: '#1e1e1e',
      text: '#e4e4e7',
      textSecondary: '#71717a',
      textTertiary: '#52525b',
      accent: '#818cf8',
      accentLight: '#312e81',
      border: '#262626',
      borderSubtle: '#404040',
      success: '#22c55e',
      warning: '#fbbf24',
      error: '#ef4444',
    },
  },
  dracula: {
    name: 'Dracula',
    light: {
      background: '#f8f8f2',
      surface: '#ffffff',
      surfaceElevated: '#fafafa',
      text: '#282a36',
      textSecondary: '#6272a4',
      textTertiary: '#8b8fa3',
      accent: '#bd93f9',
      accentLight: '#f3e8ff',
      border: '#e0e0e0',
      borderSubtle: '#ebebeb',
      success: '#50fa7b',
      warning: '#f1fa8c',
      error: '#ff5555',
    },
    dark: {
      background: '#282a36',
      surface: '#44475a',
      surfaceElevated: '#383a59',
      text: '#f8f8f2',
      textSecondary: '#bd93f9',
      textTertiary: '#6272a4',
      accent: '#bd93f9',
      accentLight: '#4a3b6b',
      border: '#44475a',
      borderSubtle: '#555b70',
      success: '#50fa7b',
      warning: '#f1fa8c',
      error: '#ff5555',
    },
  },
};

export const getColorSchemeName = (scheme: string): string => {
  return colorSchemes[scheme]?.name || 'Default';
};