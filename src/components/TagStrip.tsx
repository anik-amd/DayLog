import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { TagEntry } from '../database/tags';

interface TagStripProps {
  tags: TagEntry[];
  selectedTags: string[];
  onTagPress: (tag: string) => void;
  onMorePress?: () => void;
}

export default function TagStrip({ tags, selectedTags, onTagPress, onMorePress }: TagStripProps) {
  const { colorScheme } = useColorScheme();
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
            style={{ backgroundColor: isDark ? '#2e1065' : '#eef2ff' }}
          >
            <Text style={{ fontFamily: 'Outfit-Medium', fontSize: 14, color: isDark ? '#a78bfa' : '#6366f1' }}>
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
                  ? { backgroundColor: isDark ? '#166534' : '#dcfce7' }
                  : { backgroundColor: isDark ? '#262626' : '#f4f4f5' }
              ]}
            >
              <Text
                style={{ fontFamily: 'Outfit-Medium' }}
                className={`text-sm ${isSelected ? (isDark ? 'text-green-400' : 'text-green-600') : 'text-neutral-500'}`}
              >
                #{tag.name}
              </Text>
              <View
                className={`ml-1.5 rounded-full px-1.5 py-0.5 ${
                  isSelected ? (isDark ? 'bg-green-900' : 'bg-green-200') : isDark ? 'bg-neutral-700' : 'bg-neutral-300'
                }`}
              >
                <Text
                  style={{ fontFamily: 'Outfit-Medium', fontSize: 12 }}
                  className={isSelected ? (isDark ? 'text-green-400' : 'text-green-600') : isDark ? 'text-neutral-400' : 'text-neutral-600'}
                >
                  {tag.count}
                </Text>
              </View>
               {isSelected && (
                <TouchableOpacity
                  onPress={() => onTagPress(tag.name)}
                  className="ml-1"
                >
                  <Ionicons name="close-circle" size={14} color={isDark ? '#22c55e' : '#16a34a'} />
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
