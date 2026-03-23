import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, TextInput, Pressable } from 'react-native';
import { useColorScheme } from "nativewind";
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import Picker from './Picker';
import { getEntry, updateEntry, createEntry } from '../../database/entries';
import { addMediaToEntry, deleteMedia } from '../../database/media';
import { useAutoSave } from '../../hooks/useAutoSave';
import MarkdownRenderer from '../../markdown/MarkdownRenderer';
import { Entry } from '../../types/Entry';
import Pill from '../../components/Pill';

const extractTags = (text: string): string => {
  const matches = text.match(/#(\w+)/g);
  if (!matches) return '';
  return matches.map(tag => tag.substring(1)).join(', ');
};

export default function FullScreenEditor({ route, navigation }: any) {
  const { colorScheme } = useColorScheme();
  const { 
    entryId: initialEntryId, 
    initialContent,
    initialDate,
    initialTime,
    initialLocation,
    initialWeather,
    initialTags
  } = route.params;
  
  const [markdown, setMarkdown] = useState(initialContent || '');
  const [entry, setEntry] = useState<Entry | null>(null);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(initialEntryId || null);
  const isSaving = useRef(false);
  const inputRef = useRef<TextInput>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const isInitialLoad = useRef(true);

  // Metadata state - initialize with passed values
  const [date, setDate] = useState<string>(initialDate || '');
  const [time, setTime] = useState<string>(initialTime || '');
  const [location, setLocation] = useState<string>(initialLocation || '');
  const [weather, setWeather] = useState<string>(initialWeather || '');
  const [tags, setTags] = useState<string>(initialTags || '');
  
  // Location/Weather states
  const [locationLoading, setLocationLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  
  // Date/Time objects for pickers
  const [entryDateObj, setEntryDateObj] = useState(() => {
    if (initialDate) {
      const parsed = new Date(initialDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Handle tag press to navigate to timeline with tag filter
  const handleTagPress = (tag: string) => {
    navigation.navigate('Entries', { selectedTags: [tag] });
  };

  const loadEntry = useCallback(async () => {
    if (currentEntryId) {
      const data = await getEntry(currentEntryId);
      if (data) {
        setEntry(data);
        const content = data.content || '';
        setMarkdown(content);
        setDate(data.date || '');
        setTime(data.time || '');
        setLocation(data.location || '');
        setWeather(data.weather || '');
        // Extract tags from content instead of using stored comma-separated tags
        setTags(extractTags(content));
        
        if (data.date) {
            const parsedDate = new Date(data.date);
            if (!isNaN(parsedDate.getTime())) {
                setEntryDateObj(parsedDate);
            }
        }
      }
    }
  }, [currentEntryId]);

  useEffect(() => {
    loadEntry();
    
    // Check permission silently on mount
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
    })();
  }, [loadEntry]);

  // Real-time tag extraction (only after initial load)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    const extracted = extractTags(markdown);
    setTags(extracted);
  }, [markdown]);

  const fetchLocationAndWeather = async (onlyIfGranted = false) => {
    if (Platform.OS === 'web') {
      setLocation('San Francisco, CA');
      setWeather('72°F Sunny');
      setHasLocationPermission(true);
      return;
    }

    if (onlyIfGranted) {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') return;
    }

    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
      if (status !== 'granted') {
        setLocationLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });

      if (address) {
        const locationStr = address.city 
          ? `${address.city}, ${address.region}` 
          : address.subregion || 'Unknown';
        setLocation(locationStr);
      }
      
      // Mock weather for consistency
      setWeather('72°F Sunny');
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLocationPress = () => {
    fetchLocationAndWeather(false);
  };

  const handleSave = useCallback(async (textToSave: string, currentMetadata: { date: string, time: string, location: string, weather: string, tags: string }) => {
    if (isSaving.current) return;
    if (!textToSave.trim()) return;
    
    isSaving.current = true;
    try {
      if (!currentEntryId) {
        // Create new entry
        const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const now = Date.now();
        const newEntry: Omit<Entry, 'media'> = {
          id: newId,
          content: textToSave,
          createdAt: now,
          updatedAt: now,
          date: currentMetadata.date || new Date().toISOString().split('T')[0],
          time: currentMetadata.time || '',
          location: currentMetadata.location || undefined,
          weather: currentMetadata.weather || undefined,
          tags: currentMetadata.tags || undefined
        };
        await createEntry(newEntry);
        setCurrentEntryId(newId); // Update state so subsequent saves update this entry
      } else {
        // Update existing entry
        await updateEntry(
          currentEntryId, 
          textToSave, 
          Date.now(), 
          currentMetadata.date, 
          currentMetadata.time, 
          currentMetadata.location, 
          currentMetadata.weather,
          currentMetadata.tags
        );
      }
    } finally {
      isSaving.current = false;
    }
  }, [currentEntryId]);

  useAutoSave(markdown, (t) => handleSave(t, { date, time, location, weather, tags }), 1000);

  const handleBack = async () => {
    try {
      await handleSave(markdown, { date, time, location, weather, tags });
    } catch (e) {
      console.error('handleBack error:', e);
    }
    navigation.goBack();
  };

  const moveMediaToLocal = async (uri: string) => {
    if (Platform.OS === 'web') return uri;
    const filename = uri.split('/').pop();
    const destPath = ((FileSystem as any).documentDirectory || '') + filename;
    try {
      await FileSystem.copyAsync({ from: uri, to: destPath });
      return destPath;
    } catch (e) {
      console.error(e);
      return uri;
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && currentEntryId) {
      const selectedImage = result.assets[0].uri;
      const persistentPath = await moveMediaToLocal(selectedImage);
      
      const newMedia = {
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        entryId: currentEntryId,
        type: "image" as const,
        path: persistentPath,
        createdAt: Date.now()
      };
      
      await addMediaToEntry(newMedia);
      loadEntry();
    }
  };

  const handleRemoveMedia = async (mediaId: string) => {
    await deleteMedia(mediaId);
    loadEntry();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEntryDateObj(selectedDate);
      const dateStr = selectedDate.toISOString().split('T')[0];
      setDate(dateStr);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setEntryDateObj(selectedTime);
      const timeStr = selectedTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      setTime(timeStr);
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toISOString().split('T')[0];
    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View className="flex-row items-center justify-between px-6 pb-4 pt-12 border-b border-neutral-100 dark:border-neutral-900/40">
            <TouchableOpacity onPress={handleBack} className="bg-neutral-50 dark:bg-neutral-900 w-10 h-10 rounded-full items-center justify-center border border-neutral-200 dark:border-neutral-800">
                <Ionicons name="arrow-back" size={20} color="#737373" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleBack} className="bg-neutral-900 dark:bg-white w-10 h-10 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={20} color={colorScheme === 'dark' ? '#171717' : '#fff'} />
            </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-8 pt-8" showsVerticalScrollIndicator={false}>
            {entry?.media && entry.media.length > 0 && (
                <View className="mb-8">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {entry.media.map((m) => (
                        <View key={m.id} className="relative mr-5">
                            <Image 
                                source={{ uri: m.path }} 
                                className="w-48 h-48 rounded-[36px] bg-neutral-900 border border-neutral-200 dark:border-neutral-800" 
                                contentFit="cover" 
                            />
                            <TouchableOpacity 
                                onPress={() => handleRemoveMedia(m.id)}
                                className="absolute -top-2 -right-2 bg-red-500 w-8 h-8 rounded-full items-center justify-center border-4 border-white dark:border-neutral-950 shadow-lg"
                            >
                                <Ionicons name="close" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            <View>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    className="mb-6"
                    contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
                >
                    {tags ? tags.split(',').filter(t => t.trim()).map((tag, index) => (
                        <View key={index} className="flex-row items-center rounded-full px-3 py-1.5 mr-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                            <Ionicons name="pricetag-outline" size={14} color="#16a34a" />
                            <Text style={{ fontFamily: 'Outfit-Medium' }} className="text-[13px] ml-1.5 text-green-600 dark:text-green-400">
                                {tag.trim()}
                            </Text>
                        </View>
                    )) : (
                        <View className="flex-row items-center rounded-full px-3 py-1.5 mr-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                            <Ionicons name="pricetag-outline" size={14} color="#16a34a" />
                            <Text style={{ fontFamily: 'Outfit-Medium' }} className="text-[13px] ml-1.5 text-green-600 dark:text-green-400">
                                Tags
                            </Text>
                        </View>
                    )}

                    <Pill 
                        onPress={() => setShowDatePicker(true)}
                        icon={<Ionicons name="calendar-outline" size={15} color="#7c3aed" />}
                        label={formatDate(entryDateObj)}
                        backgroundColor="#f3e8ff"
                        iconColor="#7c3aed"
                        textColor="#7c3aed"
                    />

                    <Pill 
                        onPress={() => setShowTimePicker(true)}
                        icon={<Ionicons name="time-outline" size={15} color="#7c3aed" />}
                        label={time}
                        backgroundColor="#f3e8ff"
                        iconColor="#7c3aed"
                        textColor="#7c3aed"
                    />

                    <Pill 
                        onPress={handleLocationPress}
                        icon={
                            locationLoading ? (
                                <Ionicons name="location-outline" size={15} color="#d97706" />
                            ) : (hasLocationPermission === false && !location) ? (
                                <Ionicons name="location-outline" size={15} color="#ef4444" />
                            ) : (
                                <Ionicons name="location-outline" size={15} color="#d97706" />
                            )
                        }
                        label={location || 'Location'}
                        backgroundColor="#fef3c7"
                        iconColor="#d97706"
                        textColor="#d97706"
                        isLoading={locationLoading}
                    />

                    <Pill 
                        icon={<Ionicons name="sunny-outline" size={15} color="#d946ef" />}
                        label={weather || 'Weather'}
                        backgroundColor="#fdf4ff"
                        iconColor="#d946ef"
                        textColor="#d946ef"
                    />

                    <Pill 
                        onPress={pickImage}
                        icon={<Ionicons name="image-outline" size={15} color="#0284c7" />}
                        label="Photo"
                        backgroundColor="#e0f2fe"
                        iconColor="#0284c7"
                        textColor="#0284c7"
                    />
                </ScrollView>

                <TextInput
                    ref={inputRef}
                    placeholder="Capture your thoughts..."
                    placeholderTextColor="#a3a3a3"
                    className="text-neutral-900 dark:text-neutral-100 text-[20px] leading-10 min-h-[500px]"
                    style={{ fontFamily: 'Outfit-Regular' }}
                    multiline={true}
                    value={markdown}
                    onChangeText={setMarkdown}
                    onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                    autoFocus={true}
                    scrollEnabled={false}
                    underlineColorAndroid="transparent"
                    textAlignVertical="top"
                />
            </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <DateTimePicker
            value={entryDateObj}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        ) : (
          <Picker
            visible={showDatePicker}
            type="date"
            value={entryDateObj}
            onClose={() => setShowDatePicker(false)}
            onSelect={(date) => {
              handleDateChange({ type: 'set' }, date);
            }}
          />
        )
      )}
      {showTimePicker && (
        Platform.OS === 'ios' ? (
          <DateTimePicker
            value={entryDateObj}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        ) : (
          <Picker
            visible={showTimePicker}
            type="time"
            value={entryDateObj}
            onClose={() => setShowTimePicker(false)}
            onSelect={(date) => {
              handleTimeChange({ type: 'set' }, date);
            }}
          />
        )
      )}
    </View>
  );
}
