import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { TagEntry } from '../database/tags';
import { useThemeColors } from '../hooks/useThemeColors';

interface TagStripProps {
  tags: TagEntry[];
  selectedTags: string[];
  onTagPress: (tag: string) => void;
  onMorePress?: () => void;
}

export default function TagStrip({ tags, selectedTags, onTagPress, onMorePress }: TagStripProps) {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();
  const isDark = colorScheme === 'dark';
  
  const displayTags = tags.slice(0, 10);

  return (
    <View className="flex-row items-center">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {onMorePress && (
          <TouchableOpacity
            onPress={onMorePress}
            className="flex-row items-center rounded-full px-3 py-1.5 mr-2"
            style={{ backgroundColor: colors.accentLight }}
          >
            <Text style={{ fontFamily: 'Outfit-Medium', fontSize: 14, color: colors.accent }}>
              All
            </Text>
          </TouchableOpacity>
        )}
        {displayTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name);
          return (
            <TouchableOpacity
              key={tag.name}
              onPress={() => onTagPress(tag.name)}
              className="flex-row items-center rounded-full px-3 py-1.5 mr-2"
              style={[
                isSelected 
                  ? { backgroundColor: colors.pills.tags.background }
                  : { backgroundColor: isDark ? '#262626' : '#f4f4f5' }
              ]}
            >
              <Text
                style={{ fontFamily: 'Outfit-Medium', fontSize: 14, color: isSelected ? colors.pills.tags.text : colors.textSecondary }}
              >
                #{tag.name}
              </Text>
              <View
                style={{
                  marginLeft: 6,
                  borderRadius: 10,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  backgroundColor: isSelected ? `${colors.pills.tags.icon}20` : colors.surface
                }}
              >
                <Text
                  style={{ fontFamily: 'Outfit-Medium', fontSize: 12, color: isSelected ? colors.pills.tags.icon : colors.textSecondary }}
                >
                  {tag.count}
                </Text>
              </View>
               {isSelected && (
                <TouchableOpacity
                  onPress={() => onTagPress(tag.name)}
                  className="ml-1"
                >
                  <Ionicons name="close-circle" size={14} color={colors.pills.tags.icon} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
});
