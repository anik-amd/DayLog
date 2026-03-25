import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from "nativewind";
import { Entry } from '../../types/Entry';
import { useThemeColors } from '../../hooks/useThemeColors';

interface EntryCardProps {
  entry: Entry;
  showBorder?: boolean;
  onTagPress?: (tag: string) => void;
}

function renderTags(text: string, colors: any) {
  if (!text) return null;

  const tagPattern = /(#\w+)/g;
  const parts = text.split(tagPattern);

  return parts.map((part, i) => {
    if (part.match(tagPattern)) {
      return <Text key={i} style={[{ fontFamily: 'Outfit-Medium', color: colors.pills.tags.text }]}>{part}</Text>;
    }
    return <Text key={i} style={[styles.content, { color: colors.text }]}>{part}</Text>;
  });
}

const stripMarkdown = (text: string) => {
  if (!text) return '';
  return text
    .replace(/^#+\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
};

const styles = StyleSheet.create({
  time: {
    fontFamily: 'Outfit-Medium',
    fontSize: 13,
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  meta: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    marginLeft: 4,
  },
});

function EntryCardComponent({ entry, showBorder = false, onTagPress }: EntryCardProps) {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();
  const plainTextPreview = stripMarkdown(entry.content);

  const formattedTime = entry.time || new Date(entry.createdAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  const navigation = useNavigation<any>();

  return (
    <Pressable
      onPress={() => navigation.navigate('ReadEntry', { entryId: entry.id })}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View className="px-4 py-3" style={showBorder ? { borderTopWidth: 1, borderTopColor: colors.borderSubtle } : {}}>
        <View className="flex-row items-start">
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {formattedTime}
          </Text>
          <View className="flex-1">
            <Text 
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {renderTags(plainTextPreview, colors)}
            </Text>

            {entry.tags && (
              <View className="flex-row flex-wrap mt-1.5">
                {entry.tags.split(',').map((tag, index) => (
                  <Pressable
                    key={index}
                    onPress={() => onTagPress?.(tag.trim())}
                    className="flex-row items-center mr-3 mb-1"
                  >
                    <Ionicons name="pricetag-outline" size={11} color={colors.pills.tags.icon} />
                    <Text 
                      style={{ 
                        fontFamily: 'Outfit-Medium',
                        fontSize: 12,
                        marginLeft: 4,
                        color: colors.pills.tags.text,
                      }}
                    >
                      {tag.trim()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {(entry.locationDisplay || entry.weather) && (
              <View className="flex-row items-center mt-2">
                {entry.locationDisplay && (
                  <View className="flex-row items-center mr-4">
                    <Ionicons name="location-outline" size={11} color={colors.pills.location.icon} />
                    <Text style={[styles.meta, { color: colors.textSecondary }]}>
                      {entry.locationDisplay}
                    </Text>
                  </View>
                )}
                {entry.weather && (
                  <View className="flex-row items-center">
                    <Ionicons name="sunny-outline" size={11} color={colors.pills.weather.icon} />
                    <Text style={[styles.meta, { color: colors.textSecondary }]}>
                      {entry.weather}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {entry.media && entry.media.length > 0 && (
              <View className="flex-row mt-2">
                {entry.media.slice(0, 3).map((m, idx) => (
                  <Image 
                    key={m.id} 
                    source={{ uri: m.path }} 
                    className="w-12 h-12 rounded-lg mr-1.5" 
                    style={{ backgroundColor: colors.borderSubtle }}
                    contentFit="cover"
                    transition={200}
                  />
                ))}
                {entry.media.length > 3 && (
                  <View className="w-12 h-12 rounded-lg items-center justify-center" style={{ backgroundColor: colors.surface }}>
                    <Text style={[styles.meta, { color: colors.textTertiary }]}>+{entry.media.length - 3}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const EntryCard = React.memo(EntryCardComponent);
export default EntryCard;
