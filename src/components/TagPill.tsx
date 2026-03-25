import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { useResponsive } from '../hooks/useResponsive';
import { moderateScale } from '../utils/responsive';

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
  const { fontSize } = useResponsive();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: moderateScale(20),
          paddingHorizontal: moderateScale(12),
          paddingVertical: moderateScale(6),
          marginRight: moderateScale(8),
          marginBottom: moderateScale(8),
          minHeight: moderateScale(36),
        },
        isSelected 
          ? { backgroundColor: colors.pills.tags.background, borderWidth: 2, borderColor: colors.accent }
          : { backgroundColor: colors.surface }
      ]}
    >
      <Text
        style={{ 
          fontFamily: 'Outfit-Medium', 
          fontSize: fontSize.sm, 
          color: isSelected ? colors.pills.tags.text : colors.textSecondary 
        }}
      >
        #{name}
      </Text>
      {count !== undefined && (
        <View
          style={{
            marginLeft: moderateScale(6),
            borderRadius: moderateScale(10),
            paddingHorizontal: moderateScale(6),
            paddingVertical: moderateScale(2),
            backgroundColor: isSelected ? `${colors.accent}30` : colors.surfaceElevated,
          }}
        >
          <Text
            style={{ 
              fontFamily: 'Outfit-Medium', 
              fontSize: fontSize.sm - 2, 
              color: isSelected ? colors.accent : colors.textSecondary 
            }}
          >
            {count}
          </Text>
        </View>
      )}
      {showCheckmark && isSelected && (
        <View style={{ marginLeft: moderateScale(6) }}>
          <Ionicons name="checkmark-circle" size={moderateScale(16)} color={colors.pills.tags.icon} />
        </View>
      )}
      {showRemove && isSelected && (
        <TouchableOpacity onPress={onPress} style={{ marginLeft: moderateScale(4) }}>
          <Ionicons name="close-circle" size={moderateScale(14)} color={colors.pills.tags.icon} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}