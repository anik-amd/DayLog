import React from 'react';
import { View, Text } from 'react-native';
import { Entry } from '../../types/Entry';

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

  return (
    <View className="bg-zinc-800 p-4 rounded-xl mb-3 border border-zinc-700">
      <Text className="text-zinc-400 text-xs mb-2 font-medium">{formattedDate}</Text>
      <Text className="text-white text-base leading-relaxed break-words">
        {previewText}
      </Text>
    </View>
  );
}
