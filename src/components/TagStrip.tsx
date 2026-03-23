import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { TagEntry } from '../database/tags';

interface TagStripProps {
  tags: TagEntry[];
  selectedTags: string[];
  onTagPress: (tag: string) => void;
  onMorePress: () => void;
}

export default function TagStrip({ tags, selectedTags, onTagPress, onMorePress }: TagStripProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const displayTags = tags.slice(0, 10);

  return (
    <View className="flex-row items-center">
      <View 
        style={[
          styles.container,
          { 
            backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
            borderWidth: 1,
            borderColor: isDark ? '#262626' : '#e5e5e5'
          }
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {displayTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.name);
            return (
              <TouchableOpacity
                key={tag.name}
                onPress={() => onTagPress(tag.name)}
                className="flex-row items-center rounded-full px-3 py-1.5 mr-2"
                style={[
                  isSelected 
                    ? { backgroundColor: '#dcfce7' }
                    : { backgroundColor: isDark ? '#262626' : '#e5e5e5' }
                ]}
              >
                <Text
                  style={{ fontFamily: 'Outfit-Medium' }}
                  className={`text-sm ${isSelected ? 'text-green-600' : 'text-neutral-500'}`}
                >
                  #{tag.name}
                </Text>
                <View
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 ${
                    isSelected ? 'bg-green-200' : isDark ? 'bg-neutral-700' : 'bg-neutral-300'
                  }`}
                >
                  <Text
                    style={{ fontFamily: 'Outfit-Medium', fontSize: 12 }}
                    className={isSelected ? 'text-green-600' : isDark ? 'text-neutral-400' : 'text-neutral-600'}
                  >
                    {tag.count}
                  </Text>
                </View>
                {isSelected && (
                  <TouchableOpacity
                    onPress={() => onTagPress(tag.name)}
                    className="ml-1"
                  >
                    <Ionicons name="close-circle" size={14} color="#16a34a" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      
      <TouchableOpacity
        onPress={onMorePress}
        className="flex-row items-center rounded-full px-3 py-1.5 ml-3"
        style={isDark 
          ? { backgroundColor: '#1e1b4b', borderWidth: 1, borderColor: '#4338ca' }
          : { backgroundColor: '#e8e5f5', borderWidth: 1, borderColor: '#d4d2e8' }
        }
      >
        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: 14, color: isDark ? '#a5b4fc' : '#6366f1' }}>
          All
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingRight: 4,
  },
});
