import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, TextInput as RNTextInput, TouchableOpacity, Platform, UIManager, Image, Text, StyleSheet, ScrollView, KeyboardAvoidingView } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
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
}

export default function QuickEntryBar({ onEntrySaved, entryDate: propEntryDate, onEntryDateChange, onDatePress, onTimePress }: QuickEntryBarProps) {
  const { colorScheme } = useColorScheme();
  const inputRef = useRef<RNTextInput>(null);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  
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
  
  // Weather state
  const [weather, setWeather] = useState<string | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  
  const isSaving = useRef(false);
  const navigation = useNavigation<any>();
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (content.trim().length > 0 || (isFocused && !hasScrolledRef.current)) {
      setShowMetadata(true);
      fetchLocationAndWeather();
    } else {
      setShowMetadata(false);
    }
  }, [isFocused, content]);

  const fetchLocationAndWeather = async () => {
    if (IS_WEB) {
      setLocation('San Francisco, CA');
      setWeather('72°F Sunny');
      return;
    }

    setLocationLoading(true);
    setWeatherLoading(true);
    setLocationError(false);
    setWeatherError(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError(true);
        setWeatherError(true);
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

  const handleSave = useCallback(async (textToSave: string, finalizeAndRefresh: boolean = false) => {
    if (!textToSave.trim() || isSaving.current) return;
    
    isSaving.current = true;
    try {
      const now = entryDate.getTime();
      if (!currentEntryId) {
        const newId = now.toString();
        const newEntry: Omit<Entry, 'media'> = {
          id: newId,
          content: textToSave,
          createdAt: now,
          updatedAt: now,
          date: entryDate.toISOString().split('T')[0]
        };
        await createEntry(newEntry);
        setCurrentEntryId(newId);
        if (finalizeAndRefresh) onEntrySaved();
      } else {
        await updateEntry(currentEntryId, textToSave, now);
        if (finalizeAndRefresh) onEntrySaved();
      }
    } finally {
      isSaving.current = false;
    }
  }, [currentEntryId, onEntrySaved, entryDate]);

  useAutoSave(content, (text) => handleSave(text, false), 1000);

  const onChangeText = (text: string) => {
    setContent(text);
    if (text === '') {
      setCurrentEntryId(null);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Delay hiding to allow for interaction with metadata
    setTimeout(() => {
      if (!content.trim()) {
        setIsFocused(false);
        hasScrolledRef.current = false;
      }
    }, 200);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    await handleSave(content, true);
    
    setContent('');
    setImages([]);
    setCurrentEntryId(null);
    setEntryDate(new Date());
  };

  const handleExpand = async () => {
    if (!currentEntryId && content.trim()) {
        const now = entryDate.getTime();
        const newId = now.toString();
        const newEntry: Omit<Entry, 'media'> = { id: newId, content, createdAt: now, updatedAt: now, date: entryDate.toISOString().split('T')[0] };
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
        activeEntryId = now.toString();
        const newEntry: Omit<Entry, 'media'> = { id: activeEntryId, content: content || '', createdAt: now, updatedAt: now, date: entryDate.toISOString().split('T')[0] };
        await createEntry(newEntry);
        setCurrentEntryId(activeEntryId);
      }
      
      const newMedia = {
        id: Date.now().toString(),
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

  const shouldShowIcons = isFocused || content.trim().length > 0;

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isSameDay = (d1: Date | null, d2: Date) => {
    if (!d1) return false;
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return isSameDay(date, today);
  };

  const PillItem = ({ icon, children, onPress, isError, isLoading }: { 
    icon: React.ReactNode; 
    children: React.ReactNode; 
    onPress?: () => void;
    isError?: boolean;
    isLoading?: boolean;
  }) => (
    <View className="flex-row items-center">
      {icon}
      <Text className={`text-[12px] ml-1.5 ${isError ? 'text-red-500' : 'text-neutral-600 dark:text-neutral-400'}`}>
        {children}
      </Text>
      {onPress && (
        <Ionicons name="chevron-down" size={12} color={isError ? "#ef4444" : "#a3a3a3"} className="ml-1" />
      )}
    </View>
  );

  return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="px-4 pt-3"
      >
        {/* Single Card - pills and input together */}
        <View className="rounded-2xl bg-white dark:bg-neutral-900 py-3">
          {/* Pills Row - only show when typing */}
          {showMetadata && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 8, paddingRight: 16 }}
            >
            {/* Date Pill */}
            <TouchableOpacity 
              onPress={() => {
                if (IS_WEB && onDatePress) {
                  onDatePress();
                } else {
                  setShowDatePicker(true);
                }
              }}
              className="flex-row items-center rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 mr-2"
            >
              <Ionicons name="calendar-outline" size={14} color="#6366f1" />
              <Text className="text-neutral-600 dark:text-neutral-400 text-[12px] ml-1.5">
                {formatDate(entryDate)}
              </Text>
              <Ionicons name="chevron-down" size={12} color="#a3a3a3" className="ml-1" />
            </TouchableOpacity>

            {/* Time Pill */}
            <TouchableOpacity 
              onPress={() => {
                if (IS_WEB && onTimePress) {
                  onTimePress();
                } else {
                  setShowTimePicker(true);
                }
              }}
              className="flex-row items-center rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 mr-2"
            >
              <Ionicons name="time-outline" size={14} color="#6366f1" />
              <Text className="text-neutral-600 dark:text-neutral-400 text-[12px] ml-1.5">
                {formatTime(entryDate)}
              </Text>
              <Ionicons name="chevron-down" size={12} color="#a3a3a3" className="ml-1" />
            </TouchableOpacity>

            {/* Weather Pill */}
            <View className="flex-row items-center rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 mr-2">
              <PillItem 
                icon={
                  weatherLoading ? (
                    <Ionicons name="cloudy-outline" size={14} color="#a3a3a3" />
                  ) : weatherError ? (
                    <Ionicons name="cloud-offline-outline" size={14} color="#ef4444" />
                  ) : (
                    <Ionicons name="sunny-outline" size={14} color="#f59e0b" />
                  )
                }
                isError={weatherError}
                isLoading={weatherLoading}
              >
                {weatherError ? 'N/A' : weather || '...'}
              </PillItem>
            </View>

            {/* Location Pill */}
            <View className="flex-row items-center rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 mr-2">
              <PillItem 
                icon={
                  locationLoading ? (
                    <Ionicons name="location-outline" size={14} color="#a3a3a3" />
                  ) : locationError ? (
                    <Ionicons name="location-outline" size={14} color="#ef4444" />
                  ) : (
                    <Ionicons name="location-outline" size={14} color="#6366f1" />
                  )
                }
                isError={locationError}
                isLoading={locationLoading}
              >
                {locationError ? 'Unavailable' : location || '...'}
              </PillItem>
            </View>

            {/* Photo Pill */}
            <TouchableOpacity 
              onPress={pickImage}
              className="flex-row items-center rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5"
            >
              <Ionicons name="image" size={14} color="#6366f1" />
              <Text className="text-neutral-600 dark:text-neutral-400 text-[12px] ml-1.5">Photo</Text>
            </TouchableOpacity>
          </ScrollView>
          )}

          {/* Input Row */}
          <View className={`flex-row items-center px-4 ${showMetadata ? 'mt-3' : ''}`}>
            {/* Images preview */}
            {images.length > 0 && (
              <View className="flex-row mr-2">
                {images.map((uri, i) => (
                  <Image key={i} source={{ uri }} className="w-6 h-6 rounded" />
                ))}
              </View>
            )}

            {/* Text input */}
            <View className="flex-1">
              <RNTextInput
                ref={inputRef}
                placeholder="What's on your mind?"
                placeholderTextColor="#737373"
                className="text-neutral-900 dark:text-neutral-100 text-[14px] leading-4 font-normal p-0"
                multiline={true}
                value={content}
                onChangeText={onChangeText}
                onFocus={handleFocus}
                onBlur={handleBlur}
                textAlignVertical="center"
                underlineColorAndroid="transparent"
              />
            </View>

            {/* Expand icon */}
            {shouldShowIcons && (
              <Animated.View
                entering={FadeIn.springify().damping(15).stiffness(120)}
                exiting={FadeOut.springify().duration(150)}
              >
                <TouchableOpacity 
                    onPress={handleExpand}
                    className="p-1.5 ml-2"
                >
                    <Ionicons name="expand-outline" size={16} color="#a3a3a3" />
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Submit icon */}
            {content.trim().length > 0 && (
              <Animated.View
                entering={FadeIn.springify().damping(15).stiffness(120)}
                exiting={FadeOut.springify().duration(150)}
              >
                <TouchableOpacity 
                    onPress={handleSubmit}
                    className="ml-2 p-2 bg-indigo-500 rounded-full"
                >
                    <Ionicons name="checkmark" size={18} color="white" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>

        {/* Bottom padding */}
      <View className="h-1" />

      {/* Native Date/Time Pickers - iOS uses native, Android uses custom picker */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <DateTimePicker
            value={entryDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        ) : (
          <Picker
            visible={showDatePicker}
            type="date"
            value={entryDate}
            onClose={() => setShowDatePicker(false)}
            onSelect={(date) => {
              handleDateChange({ type: 'set' }, date);
              setShowDatePicker(false);
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
            onChange={handleTimeChange}
          />
        ) : (
          <Picker
            visible={showTimePicker}
            type="time"
            value={entryDate}
            onClose={() => setShowTimePicker(false)}
            onSelect={(date) => {
              handleTimeChange({ type: 'set' }, date);
              setShowTimePicker(false);
            }}
          />
        )
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({});
