export interface PillColors {
  background: string;
  icon: string;
  text: string;
}

export interface PilsColors {
  tags: PillColors;
  date: PillColors;
  time: PillColors;
  location: PillColors;
  weather: PillColors;
  photo: PillColors;
}

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
  pills: PilsColors;
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
      pills: {
        tags: { background: '#f0fdf4', icon: '#16a34a', text: '#16a34a' },
        date: { background: '#ede9fe', icon: '#7c3aed', text: '#7c3aed' },
        time: { background: '#ede9fe', icon: '#7c3aed', text: '#7c3aed' },
        location: { background: '#fef3c7', icon: '#d97706', text: '#d97706' },
        weather: { background: '#fdf4ff', icon: '#d946ef', text: '#d946ef' },
        photo: { background: '#e0f2fe', icon: '#0284c7', text: '#0284c7' },
      },
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
      pills: {
        tags: { background: '#14532d', icon: '#22c55e', text: '#22c55e' },
        date: { background: '#4c1d95', icon: '#a78bfa', text: '#a78bfa' },
        time: { background: '#4c1d95', icon: '#a78bfa', text: '#a78bfa' },
        location: { background: '#451a03', icon: '#fbbf24', text: '#fbbf24' },
        weather: { background: '#831843', icon: '#e879f9', text: '#e879f9' },
        photo: { background: '#164e63', icon: '#22d3ee', text: '#22d3ee' },
      },
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
      pills: {
        tags: { background: '#f3e8ff', icon: '#9055d4', text: '#9055d4' },
        date: { background: '#ffe4f0', icon: '#d43385', text: '#d43385' },
        time: { background: '#e0faff', icon: '#0891b2', text: '#0891b2' },
        location: { background: '#fefce8', icon: '#b8960f', text: '#b8960f' },
        weather: { background: '#fff4e6', icon: '#e66a00', text: '#e66a00' },
        photo: { background: '#e0ffe4', icon: '#0f8f4d', text: '#0f8f4d' },
      },
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
      border: '#555b70',
      borderSubtle: '#4a4560',
      success: '#50fa7b',
      warning: '#f1fa8c',
      error: '#ff5555',
      pills: {
        tags: { background: '#3d3556', icon: '#bd93f9', text: '#bd93f9' },
        date: { background: '#4a2d4a', icon: '#ff79c6', text: '#ff79c6' },
        time: { background: '#2d3d4a', icon: '#8be9fd', text: '#8be9fd' },
        location: { background: '#3d3520', icon: '#f1fa8c', text: '#f1fa8c' },
        weather: { background: '#4a3020', icon: '#ffb86c', text: '#ffb86c' },
        photo: { background: '#203d2d', icon: '#50fa7b', text: '#50fa7b' },
      },
    },
  },
};

export const getColorSchemeName = (scheme: string): string => {
  return colorSchemes[scheme]?.name || 'Default';
};