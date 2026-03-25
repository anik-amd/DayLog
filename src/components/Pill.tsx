import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../hooks/useResponsive';
import { moderateScale } from '../utils/responsive';

interface PillProps {
  icon?: React.ReactNode;
  label: string;
  onPress?: () => void;
  backgroundColor: string;
  iconColor: string;
  textColor?: string;
  isLoading?: boolean;
  isError?: boolean;
}

export default function Pill({ 
  icon, 
  label, 
  onPress, 
  backgroundColor, 
  iconColor, 
  textColor,
  isLoading, 
  isError
}: PillProps) {
  const { fontSize } = useResponsive();
  const displayColor = isError && !textColor ? '#ef4444' : (textColor || iconColor);

  const content = (
    <View style={{ 
      backgroundColor, 
      flexDirection: 'row', 
      alignItems: 'center', 
      borderRadius: moderateScale(20), 
      paddingHorizontal: moderateScale(12), 
      paddingVertical: moderateScale(8),
      minHeight: moderateScale(36),
      minWidth: moderateScale(60),
    }}>
      {isLoading ? (
        <ActivityIndicator size="small" color={displayColor} />
      ) : (
        icon && <View style={{ marginRight: moderateScale(4) }}>{icon}</View>
      )}
      <Text 
        style={{ 
          fontFamily: 'Outfit-Medium',
          color: displayColor,
          fontSize: fontSize.sm,
        }} 
        numberOfLines={1}
      >
        {isLoading ? (onPress ? 'Loading...' : 'Loading') : label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={{ marginRight: moderateScale(8) }} disabled={isLoading}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={{ marginRight: moderateScale(8) }}>
      {content}
    </View>
  );
}