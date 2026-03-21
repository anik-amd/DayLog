import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from "nativewind";
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { getEntry, deleteEntry } from '../../database/entries';
import MarkdownRenderer from '../../markdown/MarkdownRenderer';
import { Entry } from '../../types/Entry';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

export default function ReadEntryScreen({ route, navigation }: any) {
  const { entryId } = route.params;
  const { colorScheme } = useColorScheme();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

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

  const handleDeleteConfirm = async () => {
    if (entry) {
      await deleteEntry(entry.id);
      setIsDeleteModalVisible(false);
      navigation.navigate('Entries');
    }
  };

  if (!entry) return (
    <View className="flex-1 bg-white dark:bg-neutral-950 items-center justify-center">
      <Text style={{ fontFamily: 'Outfit-Regular' }} className="text-neutral-500">Loading...</Text>
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

        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => setIsDeleteModalVisible(true)}
            className="bg-red-50 dark:bg-red-900/20 w-10 h-10 rounded-full items-center justify-center border border-red-100 dark:border-red-900/30 mr-3"
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleEdit}
            className="bg-neutral-900 dark:bg-white w-10 h-10 rounded-full items-center justify-center"
          >
            <Ionicons name="create-outline" size={20} color={colorScheme === 'dark' ? '#171717' : '#fff'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-8 pt-8" showsVerticalScrollIndicator={false}>
        {/* Meta Section */}
        <View className="mb-8">
          <Text style={{ fontFamily: 'Outfit-Medium' }} className="text-neutral-400 dark:text-neutral-500 text-sm uppercase tracking-widest">
            {formattedDate}
          </Text>
          <View className="flex-row flex-wrap items-center mt-2">
            <Ionicons name="time-outline" size={14} color="#a3a3a3" />
            <Text style={{ fontFamily: 'Outfit-Regular' }} className="text-neutral-500 dark:text-neutral-400 text-base ml-1.5 mr-4">
              {formattedTime}
            </Text>
            
            {entry.tags && (
              <View className="flex-row items-center mr-4">
                <Ionicons name="pricetag-outline" size={14} color="#16a34a" />
                <Text style={{ fontFamily: 'Outfit-Regular' }} className="text-green-600 dark:text-green-400 text-base ml-1.5">
                  {entry.tags}
                </Text>
              </View>
            )}

            {(entry.location || entry.weather) && (
              <View className="flex-row items-center">
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

      <ConfirmationModal
        visible={isDeleteModalVisible}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalVisible(false)}
        isDestructive={true}
      />
    </View>
  );
}
