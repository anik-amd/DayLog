import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, TextInput as RNTextInput, TouchableOpacity, Pressable, Platform, UIManager, Image, Text, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from "nativewind";
import DateTimePicker from '@react-native-community/datetimepicker';
import Picker from './Picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import { createEntry, updateEntry } from '../../database/entries';
import { addMediaToEntry } from '../../database/media';
import { useAutoSave } from '../../hooks/useAutoSave';
import { Entry } from '../../types/Entry';

const IS_WEB = Platform.OS === 'web';

interface QuickEntryBarProps {
  onEntrySaved: () => void;
  entryDate?: Date;
  onEntryDateChange?: (date: Date) => void;
  onDatePress?: () => void;
  onTimePress?: () => void;
  onFocusChange?: (focused: boolean) => void;
}

const extractTags = (text: string): string => {
  const matches = text.match(/#(\w+)/g);
  if (!matches) return '';
  return matches.map(tag => tag.substring(1)).join(', ');
};

export default function QuickEntryBar({ onEntrySaved, entryDate: propEntryDate, onEntryDateChange, onDatePress, onTimePress, onFocusChange }: QuickEntryBarProps) {
  const { colorScheme } = useColorScheme();
  const inputRef = useRef<RNTextInput>(null);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  
  // Tags state
  const [tags, setTags] = useState('');
  
  // Date/time state - use prop if provided, otherwise local state
  const [localEntryDate, setLocalEntryDate] = useState(new Date());
  const entryDate = propEntryDate ?? localEntryDate;
  const setEntryDate = (date: Date) => {
    if (onEntryDateChange) {
      onEntryDateChange(date);
    }
    setLocalEntryDate(date);
  };
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Location state
  const [location, setLocation] = useState<string | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  
  // Weather state
  const [weather, setWeather] = useState<string | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  
  const isSaving = useRef(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Check permission silently on mount
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
      if (status === 'granted') {
        fetchLocationAndWeather(true);
      }
    })();
  }, []);

  // Real-time tag extraction
  useEffect(() => {
    const extracted = extractTags(content);
    setTags(extracted);
  }, [content]);

  const fetchLocationAndWeather = async (onlyIfGranted = false) => {
    if (IS_WEB) {
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
    setWeatherLoading(true);
    setLocationError(false);
    setWeatherError(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
      if (status !== 'granted') {
        setLocationLoading(false);
        setWeatherLoading(false);
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
      } else {
        setLocationError(true);
      }
    } catch (error) {
      console.error('Location error:', error);
      setLocationError(true);
    } finally {
      setLocationLoading(false);
    }

    // Mock weather for now - in production, use a weather API
    try {
      // Simulating weather fetch - replace with actual weather API
      await new Promise(resolve => setTimeout(resolve, 500));
      setWeather('72°F Sunny');
    } catch (error) {
      setWeatherError(true);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleLocationPress = () => {
    fetchLocationAndWeather(false);
  };

  const handleSave = useCallback(async (textToSave: string, finalizeAndRefresh: boolean = false, forceSave: boolean = false) => {
    if (!textToSave.trim()) return;
    
    // Skip if already saving (unless forcing save like on submit)
    if (isSaving.current && !forceSave) return;
    
    isSaving.current = true;
    try {
      const now = entryDate.getTime();
      const dateStr = entryDate.toISOString().split('T')[0];
      const timeStr = formatTime(entryDate);
      const extractedTags = extractTags(textToSave);
      
      if (!currentEntryId) {
        console.log('Creating new entry...');
        const newId = `${now}-${Math.random().toString(36).substring(2, 9)}`;
        const newEntry: Omit<Entry, 'media'> = {
          id: newId,
          content: textToSave,
          createdAt: now,
          updatedAt: now,
          date: dateStr,
          time: timeStr,
          location: location || undefined,
          weather: weatherError ? undefined : weather || undefined,
          tags: extractedTags || undefined
        };
        await createEntry(newEntry);
        setCurrentEntryId(newId);
        console.log('Entry created, calling onEntrySaved');
        if (finalizeAndRefresh) onEntrySaved();
      } else {
        console.log('Updating existing entry...');
        await updateEntry(currentEntryId, textToSave, now, dateStr, timeStr, location || undefined, weatherError ? undefined : weather || undefined, extractedTags || undefined);
        if (finalizeAndRefresh) onEntrySaved();
      }

      if (finalizeAndRefresh) {
        setContent('');
        setImages([]);
        setCurrentEntryId(null);
        setEntryDate(new Date());
        inputRef.current?.blur();
      }
    } finally {
      isSaving.current = false;
    }
  }, [currentEntryId, onEntrySaved, entryDate, location, weather, weatherError]);

  useAutoSave(content, (text) => handleSave(text, false, false), 1000);

  const onChangeText = (text: string) => {
    setContent(text);
    if (text === '') {
      setCurrentEntryId(null);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    try {
      await handleSave(content, true, true);
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
  };

  const handleExpand = async () => {
    if (!currentEntryId && content.trim()) {
        const now = entryDate.getTime();
        const newId = `${now}-${Math.random().toString(36).substring(2, 9)}`;
        const currentTags = extractTags(content);
        const newEntry: Omit<Entry, 'media'> = { 
          id: newId, 
          content, 
          createdAt: now, 
          updatedAt: now, 
          date: entryDate.toISOString().split('T')[0],
          tags: currentTags || undefined
        };
        await createEntry(newEntry);
        setCurrentEntryId(newId);
        onEntrySaved();
        navigation.navigate('FullScreenEditor', { entryId: newId, initialContent: content, viewMode: false });
    } else if (currentEntryId) {
        await handleSave(content, true);
        navigation.navigate('FullScreenEditor', { entryId: currentEntryId, initialContent: content, viewMode: false });
    } else {
        navigation.navigate('FullScreenEditor', { entryId: null, initialContent: '', viewMode: false });
    }
  };

  const moveMediaToLocal = async (uri: string) => {
    if (Platform.OS === 'web') {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.error("Failed to persist web image:", e);
        return uri;
      }
    }
    
    const filename = uri.split('/').pop();
    const destPath = ((FileSystem as any).documentDirectory || '') + filename;
    
    try {
      await FileSystem.copyAsync({ from: uri, to: destPath });
      return destPath;
    } catch (e) {
      console.error("Failed to copy image to local storage:", e);
      return uri;
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      const persistentLocalPath = await moveMediaToLocal(selectedImage);
      
      const now = entryDate.getTime();
      let activeEntryId = currentEntryId;
      
      if (!activeEntryId) {
        activeEntryId = `${now}-${Math.random().toString(36).substring(2, 9)}`;
        const currentTags = extractTags(content);
        const newEntry: Omit<Entry, 'media'> = { 
          id: activeEntryId, 
          content: content || '', 
          createdAt: now, 
          updatedAt: now, 
          date: entryDate.toISOString().split('T')[0],
          tags: currentTags || undefined
        };
        await createEntry(newEntry);
        setCurrentEntryId(activeEntryId);
      }
      
      const newMedia = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        entryId: activeEntryId,
        type: "image" as const,
        path: persistentLocalPath,
        createdAt: Date.now()
      };
      
      await addMediaToEntry(newMedia);
      setImages(prev => [...prev, persistentLocalPath]);
      onEntrySaved();
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'dismissed' || !selectedDate) {
      setShowDatePicker(false);
      return;
    }
    const newDate = new Date(entryDate);
    newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    setEntryDate(newDate);
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (event.type === 'dismissed' || !selectedTime) {
      setShowTimePicker(false);
      return;
    }
    const newDate = new Date(entryDate);
    newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
    setEntryDate(newDate);
    if (Platform.OS === 'ios') {
      setShowTimePicker(false);
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const PillItem = ({ icon, children, onPress, isError, isLoading, color = '#db2777' }: { 
    icon: React.ReactNode; 
    children: React.ReactNode; 
    onPress?: () => void;
    isError?: boolean;
    isLoading?: boolean;
    color?: string;
  }) => (
    <View className="flex-row items-center">
      {icon}
      <Text style={{ fontFamily: 'Outfit-Medium', color: isError ? '#ef4444' : color }} className="text-[14px] ml-1.5">
        {children}
      </Text>
    </View>
  );

  const handleCardPress = () => {
    inputRef.current?.focus();
  };

  return (
      <View 
        key={colorScheme}
        className="px-4 pt-3"
      >
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={handleCardPress}
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: colorScheme === 'dark' ? '#1e1b4b' : '#ffffff',
            paddingVertical: 8,
          }}
        >
          {/* Pills Row - always visible */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ height: 36, paddingTop: 2 }}
            contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 8, paddingRight: 16, flexWrap: 'nowrap' }}
            scrollEventThrottle={16}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              canCancelContentTouches={true}
            >
              {/* Tag Pill */}
              <View className="flex-row items-center rounded-full px-3 py-1.5 mr-2"
                style={{ backgroundColor: '#f0fdf4' }}
              >
                <PillItem 
                  icon={<Ionicons name="pricetag-outline" size={15} color="#16a34a" />}
                  color="text-green-600 dark:text-green-400"
                >
                  {tags || 'Tags'}
                </PillItem>
              </View>

              {/* Date Pill */}
              <Pressable 
                onPress={() => {
                  setShowDatePicker(true);
                }}
                className="flex-row items-center rounded-full px-3 py-1.5 mr-2"
                style={{ backgroundColor: '#ede9fe' }}
              >
                <Ionicons name="calendar-outline" size={15} color="#7c3aed" />
                <Text className="text-[14px] ml-1.5" style={{ color: '#7c3aed' }}>
                  {formatDate(entryDate)}
                </Text>
                <Ionicons name="chevron-down" size={12} color="#a78bfa" className="ml-1" />
              </Pressable>

              {/* Time Pill */}
              <Pressable 
                onPress={() => {
                  setShowTimePicker(true);
                }}
                className="flex-row items-center rounded-full px-3 py-1.5 mr-2"
                style={{ backgroundColor: '#ede9fe' }}
              >
                <Ionicons name="time-outline" size={15} color="#7c3aed" />
                <Text className="text-[14px] ml-1.5" style={{ color: '#7c3aed' }}>
                  {formatTime(entryDate)}
                </Text>
                <Ionicons name="chevron-down" size={12} color="#a78bfa" className="ml-1" />
              </Pressable>

              {/* Weather Pill */}
              <View className="flex-row items-center rounded-full px-3 py-1.5 mr-2"
                style={{ backgroundColor: '#fdf4ff' }}
              >
                <PillItem 
                  icon={
                    weatherLoading ? (
                      <Ionicons name="cloudy-outline" size={15} color="#d946ef" />
                    ) : weatherError ? (
                      <Ionicons name="cloud-offline-outline" size={15} color="#ef4444" />
                    ) : (
                      <Ionicons name="sunny-outline" size={15} color="#f59e0b" />
                    )
                  }
                  isError={weatherError}
                  isLoading={weatherLoading}
                >
                  {weatherError ? 'N/A' : weather || '...'}
                </PillItem>
              </View>

              {/* Location Pill */}
              <Pressable 
                onPress={handleLocationPress}
                className="flex-row items-center rounded-full px-3 py-1.5 mr-2"
                style={{ backgroundColor: '#fef3c7' }}
              >
                <PillItem 
                  icon={
                    locationLoading ? (
                      <Ionicons name="location-outline" size={15} color="#d97706" />
                    ) : (hasLocationPermission === false && !location) ? (
                      <Ionicons name="location-outline" size={15} color="#ef4444" />
                    ) : (
                      <Ionicons name="location-outline" size={15} color="#d97706" />
                    )
                  }
                  isError={locationError}
                  isLoading={locationLoading}
                >
                  {location || 'Location'}
                </PillItem>
              </Pressable>

              {/* Photo Pill */}
              <Pressable 
                onPress={pickImage}
                className="flex-row items-center rounded-full px-3 py-1.5"
                style={{ backgroundColor: '#e0f2fe' }}
              >
                <Ionicons name="image" size={15} color="#0284c7" />
                <Text style={{ fontFamily: 'Outfit-Medium', color: '#0284c7' }} className="text-[14px] ml-1.5">Photo</Text>
              </Pressable>
            </ScrollView>

          {/* Input Row */}
          <View className="px-4 pt-3">
            {/* Images + Input Row */}
            <View className="flex-row items-end">
              {/* Images preview */}
              {images.length > 0 && (
                <View className="flex-row mr-2 mb-0.5">
                  {images.map((uri, i) => (
                    <Image key={i} source={{ uri }} className="w-6 h-6 rounded" />
                  ))}
                </View>
              )}

              {/* Text input */}
              <RNTextInput
                ref={inputRef}
                placeholder="What's on your mind?"
                placeholderTextColor={colorScheme === 'dark' ? '#a78bfa' : '#a1a1aa'}
                className="flex-1 p-0"
                style={{ 
                  color: colorScheme === 'dark' ? '#e4e4e7' : '#27272a',
                  fontSize: 15,
                  lineHeight: 22,
                  fontFamily: 'Outfit-Regular',
                  backgroundColor: 'transparent',
                }}
                multiline={true}
                value={content}
                onChangeText={onChangeText}
                blurOnSubmit={false}
                textAlignVertical="top"
                underlineColorAndroid="transparent"
              />
            </View>

            {/* Icons row - always at bottom of the input area */}
            <View className="flex-row justify-end mt-1 pb-0.5">
              {/* Expand icon */}
              <TouchableOpacity 
                  onPress={handleExpand}
                  className="p-1.5 rounded-full"
                  style={{ backgroundColor: '#ede9fe' }}
              >
                  <Ionicons name="expand-outline" size={14} color="#7c3aed" />
              </TouchableOpacity>

              {/* Submit icon */}
              {content.trim().length > 0 && (
                <TouchableOpacity 
                    onPress={handleSubmit}
                    className="ml-2 p-2 rounded-full"
                    style={{ backgroundColor: '#818cf8' }}
                >
                    <Ionicons name="checkmark" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Bottom padding */}
        <View className="h-1" />

      {/* Native Date/Time Pickers - iOS uses native, Android uses custom picker */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <DateTimePicker
            value={entryDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              handleDateChange(event, date);
              if (event.type === 'set' && date) {
                setTimeout(() => inputRef.current?.focus(), 100);
              }
            }}
          />
        ) : (
          <Picker
            visible={showDatePicker}
            type="date"
            value={entryDate}
            onClose={() => {
              setShowDatePicker(false);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            onSelect={(date) => {
              handleDateChange({ type: 'set' }, date);
              setShowDatePicker(false);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
          />
        )
      )}
      {showTimePicker && (
        Platform.OS === 'ios' ? (
          <DateTimePicker
            value={entryDate}
            mode="time"
            display="default"
            onChange={(event, date) => {
              handleTimeChange(event, date);
              if (event.type === 'set' && date) {
                setTimeout(() => inputRef.current?.focus(), 100);
              }
            }}
          />
        ) : (
          <Picker
            visible={showTimePicker}
            type="time"
            value={entryDate}
            onClose={() => {
              setShowTimePicker(false);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            onSelect={(date) => {
              handleTimeChange({ type: 'set' }, date);
              setShowTimePicker(false);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
