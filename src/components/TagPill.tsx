import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';

interface TagPillProps {
  name: string;
  count?: number;
  isSelected?: boolean;
  onPress: () => void;
  showCheckmark?: boolean;
  showRemove?: boolean;
}

export default function TagPill({ name, count, isSelected = false, onPress, showCheckmark = false, showRemove = false }: TagPillProps) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 6,
          marginRight: 8,
          marginBottom: 8,
        },
        isSelected 
          ? { backgroundColor: colors.pills.tags.background, borderWidth: 2, borderColor: colors.accent }
          : { backgroundColor: colors.surface }
      ]}
    >
      <Text
        style={{ 
          fontFamily: 'Outfit-Medium', 
          fontSize: 14, 
          color: isSelected ? colors.pills.tags.text : colors.textSecondary 
        }}
      >
        #{name}
      </Text>
      {count !== undefined && (
        <View
          style={{
            marginLeft: 6,
            borderRadius: 10,
            paddingHorizontal: 6,
            paddingVertical: 2,
            backgroundColor: isSelected ? `${colors.accent}30` : colors.surfaceElevated,
          }}
        >
          <Text
            style={{ 
              fontFamily: 'Outfit-Medium', 
              fontSize: 12, 
              color: isSelected ? colors.accent : colors.textSecondary 
            }}
          >
            {count}
          </Text>
        </View>
      )}
      {showCheckmark && isSelected && (
        <View style={{ marginLeft: 6 }}>
          <Ionicons name="checkmark-circle" size={16} color={colors.pills.tags.icon} />
        </View>
      )}
      {showRemove && isSelected && (
        <TouchableOpacity onPress={onPress} style={{ marginLeft: 4 }}>
          <Ionicons name="close-circle" size={14} color={colors.pills.tags.icon} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
