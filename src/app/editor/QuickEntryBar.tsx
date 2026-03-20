import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Platform, UIManager, Image, Text, Modal, Platform as RNPlatform } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import { createEntry, updateEntry } from '../../database/entries';
import { addMediaToEntry } from '../../database/media';
import { useAutoSave } from '../../hooks/useAutoSave';
import { Entry } from '../../types/Entry';

interface QuickEntryBarProps {
  onEntrySaved: () => void;
}

export default function QuickEntryBar({ onEntrySaved }: QuickEntryBarProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  
  // Date/time state
  const [entryDate, setEntryDate] = useState(new Date());
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

  useEffect(() => {
    if (isFocused || content.trim().length > 0) {
      setShowMetadata(true);
      fetchLocationAndWeather();
    } else {
      setShowMetadata(false);
    }
  }, [isFocused, content]);

  const fetchLocationAndWeather = async () => {
    if (RNPlatform.OS === 'web') {
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
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(entryDate);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setEntryDate(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(entryDate);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setEntryDate(newDate);
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
      <View className="bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
        {/* Metadata Strip */}
        {showMetadata && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            className="mx-4 mt-3 mb-2"
          >
            <View className="flex-row items-center bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl px-3 py-2.5">
              {/* Date Pill */}
              <TouchableOpacity 
                onPress={() => setShowDatePicker(true)}
                className="flex-row items-center bg-white dark:bg-neutral-900 rounded-full px-3 py-1.5 mr-2 flex-shrink-0"
              >
                <PillItem 
                  icon={
                    <Ionicons name="calendar-outline" size={14} color="#6366f1" />
                  }
                  onPress={() => setShowDatePicker(true)}
                >
                  {formatDate(entryDate)}
                </PillItem>
              </TouchableOpacity>

              {/* Time Pill */}
              <TouchableOpacity 
                onPress={() => setShowTimePicker(true)}
                className="flex-row items-center bg-white dark:bg-neutral-900 rounded-full px-3 py-1.5 mr-2 flex-shrink-0"
              >
                <PillItem 
                  icon={
                    <Ionicons name="time-outline" size={14} color="#6366f1" />
                  }
                  onPress={() => setShowTimePicker(true)}
                >
                  {formatTime(entryDate)}
                </PillItem>
              </TouchableOpacity>

              {/* Weather Pill */}
              <View className="flex-row items-center bg-white dark:bg-neutral-900 rounded-full px-3 py-1.5 mr-2 flex-shrink-0">
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
              <View className="flex-row items-center bg-white dark:bg-neutral-900 rounded-full px-3 py-1.5 flex-shrink-0">
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
            </View>
          </Animated.View>
        )}

        {/* Main Input Row */}
        <View className="bg-white dark:bg-neutral-900 px-4 py-3 flex-row items-center">
          {/* Image icon */}
          {shouldShowIcons && (
            <Animated.View
              entering={FadeIn.springify().damping(15).stiffness(120)}
              exiting={FadeOut.springify().duration(150)}
            >
              <TouchableOpacity 
                  onPress={pickImage}
                  className="mr-2 p-1.5"
              >
                  <Ionicons name="image" size={20} color="#6366f1" />
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {/* Text input */}
          <View className="flex-1 relative">
            <View className={`${isFocused ? 'bg-neutral-100 dark:bg-neutral-800/50' : ''} rounded-full`}>
              {/* Images preview */}
              {images.length > 0 && (
                <View className="flex-row px-3 pt-2">
                  {images.map((uri, i) => (
                    <Image key={i} source={{ uri }} className="w-6 h-6 rounded mr-1" />
                  ))}
                </View>
              )}
              
              <View className="flex-row items-center">
                <TextInput
                  placeholder="What's on your mind?"
                  placeholderTextColor="#737373"
                  className="flex-1 text-neutral-900 dark:text-neutral-100 text-[14px] px-4 py-2 pr-10 leading-4 font-normal"
                  multiline={true}
                  value={content}
                  onChangeText={onChangeText}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  textAlignVertical="center"
                  underlineColorAndroid="transparent"
                />
                
                {/* Expand icon */}
                {shouldShowIcons && (
                  <Animated.View
                    entering={FadeIn.springify().damping(15).stiffness(120)}
                    exiting={FadeOut.springify().duration(150)}
                    className="absolute right-2"
                  >
                    <TouchableOpacity 
                        onPress={handleExpand}
                        className="p-1.5"
                    >
                        <Ionicons name="expand-outline" size={16} color="#a3a3a3" />
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
            </View>
          </View>
          
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

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={entryDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}

        {/* Time Picker Modal */}
        {showTimePicker && (
          <DateTimePicker
            value={entryDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>
  );
}
