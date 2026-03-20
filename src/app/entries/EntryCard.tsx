import React, { useRef } from 'react';
import { View, Text, TouchableWithoutFeedback, Animated } from 'react-native';
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
        <View className="bg-neutral-900 p-5 rounded-3xl mb-4 border border-neutral-800 shadow-sm relative overflow-hidden">
          <Text className="text-neutral-500 text-[11px] uppercase tracking-widest mb-2.5 font-bold">
            {formattedDate}
          </Text>
          <Text
            className="text-neutral-200 text-[16px] leading-7 font-medium"
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {plainTextPreview}
          </Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
