import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';
import { moderateScale } from '../../utils/responsive';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const getBackgroundColor = (isPressed: boolean): string => {
    if (disabled) return '#e5e5e5';
    
    const baseColors: Record<string, string> = {
      primary: '#6366f1',
      secondary: '#f4f4f5',
      outline: 'transparent',
      ghost: 'transparent',
      destructive: '#ef4444',
    };
    
    const pressedColors: Record<string, string> = {
      primary: '#4f46e5',
      secondary: '#e4e4e7',
      outline: 'transparent',
      ghost: '#f4f4f5',
      destructive: '#dc2626',
    };
    
    return isPressed ? pressedColors[variant] : baseColors[variant];
  };

  const getTextColor = (isPressed: boolean): string => {
    if (disabled) return '#a1a1aa';
    
    const baseColors: Record<string, string> = {
      primary: '#ffffff',
      secondary: '#18181b',
      outline: '#6366f1',
      ghost: '#6366f1',
      destructive: '#ffffff',
    };
    
    const pressedColors: Record<string, string> = {
      primary: '#ffffff',
      secondary: '#18181b',
      outline: '#4f46e5',
      ghost: '#4f46e5',
      destructive: '#ffffff',
    };
    
    return isPressed ? pressedColors[variant] : baseColors[variant];
  };

  const getSizeStyles = (): { paddingVertical: number; paddingHorizontal: number; fontSize: number } => {
    const sizes = {
      sm: { paddingVertical: moderateScale(8), paddingHorizontal: moderateScale(12), fontSize: moderateScale(12) },
      md: { paddingVertical: moderateScale(12), paddingHorizontal: moderateScale(16), fontSize: moderateScale(14) },
      lg: { paddingVertical: moderateScale(16), paddingHorizontal: moderateScale(20), fontSize: moderateScale(16) },
    };
    return sizes[size];
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          backgroundColor: getBackgroundColor(false),
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: disabled ? '#e5e5e5' : '#6366f1',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor(false)} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeStyles.fontSize,
                color: getTextColor(false),
                marginLeft: icon ? moderateScale(8) : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(12),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Outfit-SemiBold',
    textAlign: 'center',
  },
});