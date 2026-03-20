import React, { useRef } from 'react';
import { View, Text, TouchableWithoutFeedback, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Entry } from '../../types/Entry';

interface EntryCardProps {
  entry: Entry;
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

export default function EntryCard({ entry }: EntryCardProps) {
  // Extract pure text for timeline preview
  const plainTextPreview = stripMarkdown(entry.content);

  // Format the unix timestamp to a readable date
  const formattedDate = new Date(entry.createdAt).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const navigation = useNavigation<any>();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 12,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => navigation.navigate('FullScreenEditor', { entryId: entry.id, initialContent: entry.content, viewMode: true })}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <View className="bg-white dark:bg-neutral-900 p-5 rounded-[32px] border border-neutral-200 dark:border-neutral-800 mb-4 shadow-sm">
          <Text className="text-neutral-400 dark:text-neutral-500 text-[11px] uppercase tracking-widest mb-2.5 font-bold">
            {formattedDate}
          </Text>
          <Text
            className="text-neutral-800 dark:text-neutral-200 text-[16px] leading-7 font-medium"
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {plainTextPreview}
          </Text>

          {entry.media && entry.media.length > 0 && (
            <View className="flex-row mt-3 mb-1">
              {entry.media.slice(0, 3).map((m, idx) => (
                <Image key={m.id} source={{ uri: m.path }} className="w-16 h-16 rounded-xl mr-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/50" />
              ))}
              {entry.media.length > 3 && (
                <View className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 items-center justify-center border border-neutral-200 dark:border-neutral-700">
                  <Text className="text-neutral-500 dark:text-neutral-400 font-bold text-[13px] tracking-wide">+{entry.media.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
