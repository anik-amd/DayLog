import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, Animated, StyleSheet, Pressable } from 'react-native';
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
    return <Text key={i} style={[localStyles.content, { color: colors.text }]}>{part}</Text>;
  });
}

const stripMarkdown = (text: string) => {
  if (!text) return '';
  return text
    .replace(/^#+\s+/gm, '') // strip headers
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // strip bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // strip italics
    .replace(/^[-*]\s+/gm, '') // strip lists
    .replace(/\n+/g, ' ') // strip line breaks into spaces
    .trim();
};

const localStyles = StyleSheet.create({
  time: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    lineHeight: 24,
  },
  meta: {
    fontFamily: 'Outfit-Regular',
    fontSize: 10,
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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
    ]);
    animation.start();
    return () => {
      animation.stop();
      opacityAnim.setValue(1);
      scaleAnim.setValue(1);
    };
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start(() => {
      scaleAnim.setValue(1);
    });
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => navigation.navigate('ReadEntry', { entryId: entry.id })}
    >
      <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}>
        <View className="px-5 py-4" style={showBorder ? { borderTopWidth: 1, borderTopColor: colors.borderSubtle } : {}}>
          <View className="flex-row items-start">
            <Text style={[localStyles.time, { color: colors.textSecondary }]}>
              {formattedTime}
            </Text>
            <View className="flex-1">
              <Text 
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {renderTags(plainTextPreview, colors)}
              </Text>

              {/* Tags */}
              {entry.tags && (
                <View className="flex-row flex-wrap mt-1.5">
                  {entry.tags.split(',').map((tag, index) => (
                    <Pressable
                      key={index}
                      onPress={() => onTagPress?.(tag.trim())}
                      className="flex-row items-center mr-2 mb-1"
                    >
                      <Ionicons name="pricetag-outline" size={12} color={colors.pills.tags.icon} />
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

              {/* Location & Weather Pills */}
              {(entry.locationDisplay || entry.weather) && (
                <View className="flex-row items-center mt-2">
                  {entry.locationDisplay && (
                    <View className="flex-row items-center mr-3">
                      <Ionicons name="location-outline" size={11} color={colors.pills.location.icon} />
                      <Text style={[localStyles.meta, { color: colors.textSecondary }]}>
                        {entry.locationDisplay}
                      </Text>
                    </View>
                  )}
                  {entry.weather && (
                    <View className="flex-row items-center">
                      <Ionicons name="sunny-outline" size={11} color={colors.pills.weather.icon} />
                      <Text style={[localStyles.meta, { color: colors.textSecondary }]}>
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
                      className="w-14 h-14 rounded-lg mr-1.5" 
                      style={{ backgroundColor: colors.borderSubtle }}
                      contentFit="cover"
                      transition={200}
                    />
                  ))}
                  {entry.media.length > 3 && (
                    <View className="w-14 h-14 rounded-lg items-center justify-center" style={{ backgroundColor: colors.surface }}>
                      <Text style={[localStyles.meta, { color: colors.textTertiary }]}>+{entry.media.length - 3}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const EntryCard = React.memo(EntryCardComponent);
export default EntryCard;
