import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DESIGN_WIDTH = 390;
const DESIGN_HEIGHT = 844;

export const scaledWidth = (percent: number): number => (percent / 100) * SCREEN_WIDTH;

export const scaledHeight = (percent: number): number => (percent / 100) * SCREEN_HEIGHT;

export const scale = (size: number): number => {
  const scaleFactor = Math.min(SCREEN_WIDTH / DESIGN_WIDTH, SCREEN_HEIGHT / DESIGN_HEIGHT);
  return Math.round(size * scaleFactor);
};

export const moderateScale = (size: number, factor = 0.5): number => {
  const scaleFactor = Math.min(SCREEN_WIDTH / DESIGN_WIDTH, SCREEN_HEIGHT / DESIGN_HEIGHT);
  const scaled = size * scaleFactor;
  return Math.round(size + (scaled - size) * factor);
};

export const verticalScale = (size: number): number => {
  const scaleFactor = SCREEN_HEIGHT / DESIGN_HEIGHT;
  return Math.round(size * scaleFactor);
};

export const fontScaleSize = (size: number, systemFontScale: number): number => {
  const scaled = moderateScale(size);
  return Math.round(scaled * systemFontScale);
};

export const isSmallPhone = SCREEN_WIDTH < 375;
export const isLargePhone = SCREEN_WIDTH >= 414;
export const isTablet = SCREEN_WIDTH >= 768;
export const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;
export const isPortrait = SCREEN_HEIGHT >= SCREEN_WIDTH;

export const BREAKPOINTS = {
  xs: 0,
  sm: 375,
  md: 414,
  lg: 768,
  xl: 1024,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export const getBreakpoint = (): Breakpoint => {
  if (SCREEN_WIDTH < BREAKPOINTS.sm) return 'xs';
  if (SCREEN_WIDTH < BREAKPOINTS.md) return 'sm';
  if (SCREEN_WIDTH < BREAKPOINTS.lg) return 'md';
  if (SCREEN_WIDTH < BREAKPOINTS.xl) return 'lg';
  return 'xl';
};

export const getSpacing = (): {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
} => {
  const isLandscapeLayout = isLandscape;
  const isLargeScreen = isTablet;
  
  const base = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };

  if (isLargeScreen) {
    return {
      xs: moderateScale(base.xs * 1.2),
      sm: moderateScale(base.sm * 1.2),
      md: moderateScale(base.md * 1.5),
      lg: moderateScale(base.lg * 1.5),
      xl: moderateScale(base.xl * 1.5),
      xxl: moderateScale(base.xxl * 1.5),
    };
  }

  if (isLandscapeLayout) {
    return {
      xs: moderateScale(base.xs * 0.8),
      sm: moderateScale(base.sm * 0.9),
      md: moderateScale(base.md),
      lg: moderateScale(base.lg * 0.9),
      xl: moderateScale(base.xl * 0.9),
      xxl: moderateScale(base.xxl * 0.9),
    };
  }

  return {
    xs: moderateScale(base.xs),
    sm: moderateScale(base.sm),
    md: moderateScale(base.md),
    lg: moderateScale(base.lg),
    xl: moderateScale(base.xl),
    xxl: moderateScale(base.xxl),
  };
};

export const getFontSize = (): {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  title: number;
} => {
  return {
    xs: moderateScale(10),
    sm: moderateScale(12),
    md: moderateScale(14),
    lg: moderateScale(16),
    xl: moderateScale(20),
    xxl: moderateScale(24),
    title: moderateScale(28),
  };
};