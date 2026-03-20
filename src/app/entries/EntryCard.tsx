import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from "nativewind";
import { Entry } from '../../types/Entry';

interface EntryCardProps {
  entry: Entry;
  showBorder?: boolean;
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

function EntryCardComponent({ entry, showBorder = false }: EntryCardProps) {
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
      onPress={() => navigation.navigate('FullScreenEditor', { entryId: entry.id, initialContent: entry.content, viewMode: true })}
    >
      <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}>
        <View className={`px-5 py-4 ${showBorder ? 'border-t border-neutral-100 dark:border-neutral-800' : ''}`}>
          <View className="flex-row items-start">
            <Text className="text-neutral-400 dark:text-neutral-500 text-[12px] font-medium mr-3 mt-0.5">
              {formattedTime}
            </Text>
            <View className="flex-1">
              <Text 
                className="text-neutral-700 dark:text-neutral-300 text-[15px] leading-6"
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {plainTextPreview}
              </Text>

              {/* Location & Weather Pills */}
              {(entry.location || entry.weather) && (
                <View className="flex-row items-center mt-2">
                  {entry.location && (
                    <View className="flex-row items-center mr-3">
                      <Ionicons name="location-outline" size={11} color={colorScheme === 'dark' ? '#a3a3a3' : '#737373'} />
                      <Text className="text-neutral-400 dark:text-neutral-500 text-[10px] ml-1">
                        {entry.location}
                      </Text>
                    </View>
                  )}
                  {entry.weather && (
                    <View className="flex-row items-center">
                      <Ionicons name="sunny-outline" size={11} color={colorScheme === 'dark' ? '#a3a3a3' : '#737373'} />
                      <Text className="text-neutral-400 dark:text-neutral-500 text-[10px] ml-1">
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
                      <Text className="text-neutral-500 dark:text-neutral-400 font-medium text-[12px]">+{entry.media.length - 3}</Text>
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
