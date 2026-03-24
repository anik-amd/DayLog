import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const displayColor = isError && !textColor ? '#ef4444' : (textColor || iconColor);

  const content = (
    <View style={{ backgroundColor }} className="flex-row items-center rounded-full px-3 py-1.5">
      {isLoading ? (
        <ActivityIndicator size="small" color={displayColor} />
      ) : (
        icon && <View className="mr-1.5">{icon}</View>
      )}
      <Text 
        style={{ 
          fontFamily: 'Outfit-Medium',
          color: displayColor,
          fontSize: 14
        }} 
        numberOfLines={1}
      >
        {isLoading ? (onPress ? 'Loading...' : 'Loading') : label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="flex-row items-center mr-2" disabled={isLoading}>
        {content}
      </Pressable>
    );
  }

  return (
    <View className="flex-row items-center mr-2">
      {content}
    </View>
  );
}
