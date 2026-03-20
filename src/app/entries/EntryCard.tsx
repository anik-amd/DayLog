import React, { useRef } from 'react';
import { View, Text, TouchableWithoutFeedback, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Entry } from '../../types/Entry';
import MarkdownRenderer from '../../markdown/MarkdownRenderer';

interface EntryCardProps {
  entry: Entry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  // Create a preview version of the text if it's too long
  const previewText = entry.content.length > 200 
    ? entry.content.substring(0, 200).trimEnd() + '...' 
    : entry.content;

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
      onPress={() => navigation.navigate('FullScreenEditor', { entryId: entry.id, initialContent: entry.content })}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <View className="bg-neutral-900 p-5 rounded-3xl mb-4 border border-neutral-800 shadow-sm relative overflow-hidden">
          <Text className="text-neutral-500 text-[11px] uppercase tracking-widest mb-2.5 font-bold">
            {formattedDate}
          </Text>
          <View className="mb-1">
            <MarkdownRenderer content={previewText} />
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
