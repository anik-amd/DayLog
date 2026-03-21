import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, Animated, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from "nativewind";
import { Entry } from '../../types/Entry';

interface EntryCardProps {
  entry: Entry;
  showBorder?: boolean;
  onTagPress?: (tag: string) => void;
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
  const plainTextPreview = stripMarkdown(entry.content);

  const formattedTime = entry.time || new Date(entry.createdAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  const navigation = useNavigation<any>();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
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
    ]).start();
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
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => navigation.navigate('ReadEntry', { entryId: entry.id })}
    >
      <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}>
        <View className={`px-5 py-4 ${showBorder ? 'border-t border-neutral-100 dark:border-neutral-800' : ''}`}>
          <View className="flex-row items-start">
            <Text style={[localStyles.time, { color: colorScheme === 'dark' ? '#71717a' : '#a1a1aa' }]}>
              {formattedTime}
            </Text>
            <View className="flex-1">
              <Text 
                style={[localStyles.content, { color: colorScheme === 'dark' ? '#d4d4d8' : '#52525b' }]}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {plainTextPreview}
              </Text>

              {/* Tags */}
              {entry.tags && (
                <View className="flex-row items-center mt-1.5">
                  <View className="flex-row items-center mr-2">
                    <Ionicons name="pricetag-outline" size={11} color={colorScheme === 'dark' ? '#a1a1aa' : '#737373'} />
                  </View>
                  {entry.tags.split(',').map((tag, index) => (
                    <Pressable
                      key={index}
                      onPress={() => onTagPress?.(tag.trim())}
                      className="mr-1.5"
                    >
                      <Text 
                        style={{ 
                          fontFamily: 'Outfit-Medium',
                          fontSize: 10,
                          color: colorScheme === 'dark' ? '#71717a' : '#a1a1aa',
                        }}
                      >
                        {index > 0 ? '' : '#'}{tag.trim()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Location & Weather Pills */}
              {(entry.location || entry.weather) && (
                <View className="flex-row items-center mt-2">
                  {entry.location && (
                    <View className="flex-row items-center mr-3">
                      <Ionicons name="location-outline" size={11} color={colorScheme === 'dark' ? '#a3a3a3' : '#737373'} />
                      <Text style={[localStyles.meta, { color: colorScheme === 'dark' ? '#71717a' : '#a1a1aa' }]}>
                        {entry.location}
                      </Text>
                    </View>
                  )}
                  {entry.weather && (
                    <View className="flex-row items-center">
                      <Ionicons name="sunny-outline" size={11} color={colorScheme === 'dark' ? '#a3a3a3' : '#737373'} />
                      <Text style={[localStyles.meta, { color: colorScheme === 'dark' ? '#71717a' : '#a1a1aa' }]}>
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
                      className="w-14 h-14 rounded-lg mr-1.5 bg-neutral-100 dark:bg-neutral-800" 
                      contentFit="cover"
                      transition={200}
                    />
                  ))}
                  {entry.media.length > 3 && (
                    <View className="w-14 h-14 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 items-center justify-center">
                      <Text style={[localStyles.meta, { color: colorScheme === 'dark' ? '#a1a1aa' : '#71717a' }]}>+{entry.media.length - 3}</Text>
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
