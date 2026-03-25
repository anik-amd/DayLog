import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, SafeAreaView, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from "nativewind";
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { getEntry, deleteEntry } from '../../database/entries';
import MarkdownRenderer from '../../markdown/MarkdownRenderer';
import { Entry } from '../../types/Entry';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsive } from '../../hooks/useResponsive';
import { moderateScale } from '../../utils/responsive';

export default function ReadEntryScreen({ route, navigation }: any) {
  const { entryId } = route.params;
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();
  const { fontSize, spacing } = useResponsive();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // Handle tag press to navigate to timeline with tag filter
  const handleTagPress = (tag: string) => {
    navigation.navigate('Entries', { selectedTags: [tag] });
  };

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
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
      <Text style={{ fontFamily: 'Outfit-Regular', color: colors.textTertiary }}>Loading...</Text>
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
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Custom Header */}
      <View className="flex-row items-center justify-between px-6 pb-4 pt-12" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity 
          onPress={handleBack} 
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => setIsDeleteModalVisible(true)}
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${colors.error}20`, borderWidth: 1, borderColor: `${colors.error}30` }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleEdit}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.accent }}
          >
            <Ionicons name="create-outline" size={20} color={colorScheme === 'dark' ? colors.background : '#ffffff'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-8 pt-8" showsVerticalScrollIndicator={false}>
        {/* Meta Section */}
        <View className="mb-8">
          <Text style={{ fontFamily: 'Outfit-Medium', color: colors.textTertiary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            {formattedDate}
          </Text>
          <View className="flex-row flex-wrap items-center mt-2">
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={{ fontFamily: 'Outfit-Regular', color: colors.textSecondary, fontSize: 16, marginLeft: 6, marginRight: 16 }}>
              {formattedTime}
            </Text>
            
            {entry.tags && entry.tags.split(',').map((tag, index) => (
              <Pressable
                key={index}
                onPress={() => handleTagPress(tag.trim())}
                className="flex-row items-center mr-3"
              >
                <Ionicons name="pricetag-outline" size={14} color={colors.pills.tags.icon} />
                <Text style={{ fontFamily: 'Outfit-Regular', color: colors.pills.tags.text, fontSize: 16, marginLeft: 6 }}>
                  {tag.trim()}
                </Text>
              </Pressable>
            ))}

            {(entry.locationDisplay || entry.weather) && (
              <View className="flex-row items-center">
                {entry.locationDisplay && (
                  <View className="flex-row items-center mr-3">
                    <Ionicons name="location-outline" size={14} color={colors.pills.location.icon} />
                    <Text style={{ fontFamily: 'Outfit-Regular', color: colors.textSecondary, fontSize: 16, marginLeft: 6 }}>
                      {entry.locationDisplay}
                    </Text>
                  </View>
                )}
                {entry.weather && (
                  <View className="flex-row items-center">
                    <Ionicons name="sunny-outline" size={14} color={colors.pills.weather.icon} />
                    <Text style={{ fontFamily: 'Outfit-Regular', color: colors.textSecondary, fontSize: 16, marginLeft: 6 }}>
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
                    className="w-64 h-64 rounded-[40px]"
                    style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }} 
                    contentFit="cover" 
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Content */}
        <View className="pb-32">
          <MarkdownRenderer content={entry.content} onTagPress={handleTagPress} />
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
