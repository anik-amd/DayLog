import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from "nativewind";
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { getEntry } from '../../database/entries';
import MarkdownRenderer from '../../markdown/MarkdownRenderer';
import { Entry } from '../../types/Entry';

export default function ReadEntryScreen({ route, navigation }: any) {
  const { entryId } = route.params;
  const { colorScheme } = useColorScheme();
  const [entry, setEntry] = useState<Entry | null>(null);

  const loadEntry = useCallback(async () => {
    if (entryId) {
      const data = await getEntry(entryId);
      if (data) {
        setEntry(data);
      }
    }
  }, [entryId]);

  useFocusEffect(
    useCallback(() => {
      loadEntry();
    }, [loadEntry])
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    if (entry) {
      navigation.navigate('FullScreenEditor', { 
        entryId: entry.id, 
        initialContent: entry.content 
      });
    }
  };

  if (!entry) return (
    <View className="flex-1 bg-white dark:bg-neutral-950 items-center justify-center">
      <Text className="text-neutral-500">Loading...</Text>
    </View>
  );

  const formattedDate = new Date(entry.createdAt).toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const formattedTime = entry.time || new Date(entry.createdAt).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950">
      {/* Custom Header */}
      <View className="flex-row items-center justify-between px-6 pb-4 pt-12 border-b border-neutral-100 dark:border-neutral-900/40">
        <TouchableOpacity 
          onPress={handleBack} 
          className="bg-neutral-50 dark:bg-neutral-900 w-10 h-10 rounded-full items-center justify-center border border-neutral-200 dark:border-neutral-800"
        >
          <Ionicons name="arrow-back" size={20} color="#737373" />
        </TouchableOpacity>

        <Text style={{ fontFamily: 'Outfit-Bold' }} className="text-neutral-900 dark:text-neutral-100 text-lg">
          Entry
        </Text>

        <TouchableOpacity 
          onPress={handleEdit}
          className="bg-neutral-900 dark:bg-white w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons name="create-outline" size={20} color={colorScheme === 'dark' ? '#171717' : '#fff'} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-8 pt-8" showsVerticalScrollIndicator={false}>
        {/* Meta Section */}
        <View className="mb-8">
          <Text style={{ fontFamily: 'Outfit-Medium' }} className="text-neutral-400 dark:text-neutral-500 text-sm uppercase tracking-widest">
            {formattedDate}
          </Text>
          <View className="flex-row items-center mt-2">
            <Ionicons name="time-outline" size={14} color="#a3a3a3" />
            <Text style={{ fontFamily: 'Outfit-Regular' }} className="text-neutral-500 dark:text-neutral-400 text-base ml-1.5">
              {formattedTime}
            </Text>
            
            {(entry.location || entry.weather) && (
              <View className="flex-row items-center ml-4">
                {entry.location && (
                  <View className="flex-row items-center mr-3">
                    <Ionicons name="location-outline" size={14} color="#a3a3a3" />
                    <Text style={{ fontFamily: 'Outfit-Regular' }} className="text-neutral-500 dark:text-neutral-400 text-base ml-1.5">
                      {entry.location}
                    </Text>
                  </View>
                )}
                {entry.weather && (
                  <View className="flex-row items-center">
                    <Ionicons name="sunny-outline" size={14} color="#a3a3a3" />
                    <Text style={{ fontFamily: 'Outfit-Regular' }} className="text-neutral-500 dark:text-neutral-400 text-base ml-1.5">
                      {entry.weather}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Gallery */}
        {entry.media && entry.media.length > 0 && (
          <View className="mb-10">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {entry.media.map((m) => (
                <View key={m.id} className="mr-5">
                  <Image 
                    source={{ uri: m.path }} 
                    className="w-64 h-64 rounded-[40px] bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800" 
                    contentFit="cover" 
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Content */}
        <View className="pb-32">
          <MarkdownRenderer content={entry.content} />
        </View>
      </ScrollView>
    </View>
  );
}
