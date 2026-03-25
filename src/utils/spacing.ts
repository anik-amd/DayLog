import { moderateScale } from './responsive';

export const spacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(48),
};

export const fontSize = {
  xs: moderateScale(10),
  sm: moderateScale(12),
  md: moderateScale(14),
  lg: moderateScale(16),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  title: moderateScale(28),
};

export const iconSize = {
  sm: moderateScale(14),
  md: moderateScale(18),
  lg: moderateScale(24),
  xl: moderateScale(32),
};

export const borderRadius = {
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(20),
  full: moderateScale(9999),
};