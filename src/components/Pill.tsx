import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
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
    <View style={[styles.container, { backgroundColor }]}>
      {isLoading ? (
        <ActivityIndicator size="small" color={displayColor} />
      ) : (
        icon && <View style={styles.iconContainer}>{icon}</View>
      )}
      <Text 
        style={{ 
          fontFamily: 'Outfit-Medium',
          color: displayColor,
          fontSize: 13,
        }} 
        numberOfLines={1}
      >
        {isLoading ? (onPress ? 'Loading...' : 'Loading') : label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable} disabled={isLoading}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={styles.pressable}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginRight: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    minWidth: 60,
  },
  iconContainer: {
    marginRight: 4,
  },
});
