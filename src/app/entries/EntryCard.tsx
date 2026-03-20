import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('FullScreenEditor', { entryId: entry.id, initialContent: entry.content })}
    >
      <View className="bg-neutral-900 p-5 rounded-3xl mb-4 border border-neutral-800 shadow-sm relative overflow-hidden">
        <Text className="text-neutral-500 text-[11px] uppercase tracking-widest mb-2.5 font-bold">
          {formattedDate}
        </Text>
        <Text className="text-neutral-200 text-[16px] leading-7 font-medium break-words">
          {previewText}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
