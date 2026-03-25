import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import { TagEntry } from '../database/tags';
import { useThemeColors } from '../hooks/useThemeColors';
import { useResponsive } from '../hooks/useResponsive';
import { moderateScale } from '../utils/responsive';
import TagPill from './TagPill';

interface TagStripProps {
  tags: TagEntry[];
  selectedTags: string[];
  onTagPress: (tag: string) => void;
  onMorePress?: () => void;
}

export default function TagStrip({ tags, selectedTags, onTagPress, onMorePress }: TagStripProps) {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();
  const { spacing } = useResponsive();
  
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
          <TagPill
            name="All"
            onPress={onMorePress}
            isSelected={false}
          />
        )}
        {displayTags.map((tag) => (
          <TagPill
            key={tag.name}
            name={tag.name}
            count={tag.count}
            isSelected={selectedTags.includes(tag.name)}
            onPress={() => onTagPress(tag.name)}
            showRemove={true}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(4),
  },
});