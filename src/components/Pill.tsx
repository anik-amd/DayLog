import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface PillProps {
  icon?: React.ReactNode;
  label: string;
  onPress?: () => void;
  backgroundColor: string;
  iconColor: string;
  textColor?: string;
  isLoading?: boolean;
  isError?: boolean;
  showChevron?: boolean;
}

export default function Pill({ 
  icon, 
  label, 
  onPress, 
  backgroundColor, 
  iconColor, 
  textColor,
  isLoading, 
  isError,
  showChevron 
}: PillProps) {
  const displayColor = isError && !textColor ? '#ef4444' : (textColor || iconColor);
  const showLabel = isError ? 'N/A' : label;

  const content = (
    <View style={{ backgroundColor }} className="flex-row items-center rounded-full px-3 py-1.5">
      {icon && <View className="mr-1.5">{icon}</View>}
      <Text 
        style={{ 
          fontFamily: 'Outfit-Medium',
          color: displayColor,
          fontSize: 14
        }} 
        numberOfLines={1}
      >
        {showLabel}
      </Text>
      {showChevron && (
        <View className="ml-1">
          <Text style={{ color: iconColor, fontSize: 12 }}>▼</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="flex-row items-center mr-2">
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
