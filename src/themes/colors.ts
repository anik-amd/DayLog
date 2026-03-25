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
  accentSelected: string;
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
      accentSelected: '#c7d2fe',
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
      accentSelected: '#4338ca',
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
      accentSelected: '#e9d5ff',
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
      accentSelected: '#6b4f8a',
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
  nord: {
    name: 'Nord',
    light: {
      background: '#ECEFF4',
      surface: '#E5E9F0',
      surfaceElevated: '#F5F8FA',
      text: '#2E3440',
      textSecondary: '#4C566A',
      textTertiary: '#81A1C1',
      accent: '#88C0D0',
      accentLight: '#E3F1F5',
      accentSelected: '#d8dee9',
      border: '#B0BCC8',
      borderSubtle: '#E5E9F0',
      success: '#5D8A4A',
      warning: '#EBCB8B',
      error: '#BF616A',
      pills: {
        tags: { background: '#D4E8D1', icon: '#5D8A4A', text: '#5D8A4A' },
        date: { background: '#E8E0F0', icon: '#B48EAD', text: '#B48EAD' },
        time: { background: '#E8E0F0', icon: '#B48EAD', text: '#B48EAD' },
        location: { background: '#FFF5E6', icon: '#D08770', text: '#D08770' },
        weather: { background: '#D0E5EA', icon: '#5A8A9A', text: '#5A8A9A' },
        photo: { background: '#D0DEE8', icon: '#5A7A94', text: '#5A7A94' },
      },
    },
    dark: {
      background: '#2E3440',
      surface: '#3B4252',
      surfaceElevated: '#434C5E',
      text: '#ECEFF4',
      textSecondary: '#D8DEE9',
      textTertiary: '#81A1C1',
      accent: '#88C0D0',
      accentLight: '#4C566A',
      accentSelected: '#5e7a96',
      border: '#4C566A',
      borderSubtle: '#3B4252',
      success: '#A3BE8C',
      warning: '#EBCB8B',
      error: '#BF616A',
      pills: {
        tags: { background: '#354A2E', icon: '#A3BE8C', text: '#A3BE8C' },
        date: { background: '#4A3550', icon: '#B48EAD', text: '#B48EAD' },
        time: { background: '#4A3550', icon: '#B48EAD', text: '#B48EAD' },
        location: { background: '#4A3830', icon: '#D08770', text: '#D08770' },
        weather: { background: '#354550', icon: '#88C0D0', text: '#88C0D0' },
        photo: { background: '#354050', icon: '#81A1C1', text: '#81A1C1' },
      },
    },
  },
};

export const getColorSchemeName = (scheme: string): string => {
  return colorSchemes[scheme]?.name || 'Default';
};