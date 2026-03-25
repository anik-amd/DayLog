import { useWindowDimensions } from 'react-native';
import { 
  isSmallPhone, 
  isLargePhone, 
  isTablet, 
  isLandscape, 
  isPortrait, 
  getBreakpoint, 
  getSpacing, 
  getFontSize,
  BREAKPOINTS
} from '../utils/responsive';

export interface ResponsiveValues {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
  isSmallPhone: boolean;
  isLargePhone: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  breakpoint: keyof typeof BREAKPOINTS;
  spacing: ReturnType<typeof getSpacing>;
  fontSize: ReturnType<typeof getFontSize>;
  isCompact: boolean;
  isSpacious: boolean;
}

export function useResponsive(): ResponsiveValues {
  const { width, height, scale, fontScale } = useWindowDimensions();
  
  const breakpoint = getBreakpoint();
  const spacing = getSpacing();
  const fontSizes = getFontSize();

  return {
    width,
    height,
    scale,
    fontScale,
    isSmallPhone,
    isLargePhone,
    isTablet,
    isLandscape,
    isPortrait,
    breakpoint,
    spacing,
    fontSize: fontSizes,
    isCompact: breakpoint === 'xs' || breakpoint === 'sm',
    isSpacious: breakpoint === 'lg' || breakpoint === 'xl',
  };
}