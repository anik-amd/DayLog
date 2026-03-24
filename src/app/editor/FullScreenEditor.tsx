import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, TextInput, Pressable, Modal } from 'react-native';
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
import MarkdownRenderer from '../../markdown/MarkdownRenderer';
import { Entry } from '../../types/Entry';
import Pill from '../../components/Pill';
import { fetchWeather, getWeatherIconName } from '../../services/WeatherService';
import { getSetting } from '../../storage/settings';

const extractTags = (text: string): string => {
  const matches = text.match(/#(\w+)/g);
  if (!matches) return '';
  return matches.map(tag => tag.substring(1)).join(', ');
};

const IS_WEB = Platform.OS === 'web';

const trimLocation = (address: Location.LocationGeocodedAddress): string => {
  const parts: string[] = [];
  if (address.subregion) parts.push(address.subregion);
  if (address.city) parts.push(address.city);
  if (address.region) parts.push(address.region);
  if (address.country) parts.push(address.country);
  return parts.filter(Boolean).join(', ');
};

const getFullAddress = (address: Location.LocationGeocodedAddress): string => {
  const parts: string[] = [];
  if (address.name) parts.push(address.name);
  if (address.subregion) parts.push(address.subregion);
  if (address.city) parts.push(address.city);
  if (address.region) parts.push(address.region);
  if (address.country) parts.push(address.country);
  if (address.postalCode) parts.push(address.postalCode);
  return parts.filter(Boolean).join(', ');
};

export default function FullScreenEditor({ route, navigation }: any) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
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
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationFull, setLocationFull] = useState<string | null>(null);
  const [locationDisplay, setLocationDisplay] = useState<string>(initialLocation || '');
  const [weather, setWeather] = useState<string>(initialWeather || '');
  const [weatherCode, setWeatherCode] = useState<number | null>(null);
  const [tags, setTags] = useState<string>(initialTags || '');
  
  // Location/Weather states
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [weatherError, setWeatherError] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);

  // Save confirmation modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
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
        setLatitude(data.latitude || null);
        setLongitude(data.longitude || null);
        setLocationFull(data.locationFull || null);
        setLocationDisplay(data.locationDisplay || '');
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

  const fetchLocation = async (onlyIfGranted = false) => {
    if (IS_WEB) {
      setLatitude(37.7749);
      setLongitude(-122.4194);
      setLocationFull('San Francisco, CA, USA');
      setLocationDisplay('San Francisco, CA, USA');
      setHasLocationPermission(true);
      return;
    }

    if (onlyIfGranted) {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') return;
    }

    setLocationLoading(true);
    setLocationError(false);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
      if (status !== 'granted') {
        setLocationLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;
      
      setLatitude(lat);
      setLongitude(lng);

      const [address] = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng
      });

      if (address) {
        const fullAddr = getFullAddress(address);
        const displayAddr = trimLocation(address);
        setLocationFull(fullAddr);
        setLocationDisplay(displayAddr || 'Unknown');
      } else {
        setLocationError(true);
      }
    } catch (error) {
      console.error('Location error:', error);
      setLocationError(true);
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchWeatherData = async () => {
    if (!latitude || !longitude) {
      await fetchLocation(false);
      if (!latitude || !longitude) return;
    }

    setWeatherLoading(true);
    setWeatherError(false);

    try {
      const weatherData = await fetchWeather(latitude, longitude);
      if (weatherData) {
        setWeatherCode(weatherData.weatherCode);
        const tempUnit = await getSetting('temperatureUnit') || 'c';
        const tempDisplay = tempUnit === 'f' 
          ? `${Math.round(weatherData.temperature * 9/5 + 32)}°F`
          : `${weatherData.temperature}°C`;
        setWeather(`${tempDisplay} ${weatherData.condition}`);
      } else {
        setWeatherError(true);
      }
    } catch (error) {
      console.error('Weather error:', error);
      setWeatherError(true);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleLocationPress = () => {
    fetchLocation(false);
  };

  const handleWeatherPress = () => {
    fetchWeatherData();
  };

  const handleSave = useCallback(async (textToSave: string, currentMetadata: { date: string, time: string, latitude?: number | null, longitude?: number | null, locationFull?: string | null, locationDisplay?: string, weather: string, tags: string }) => {
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
          latitude: latitude || undefined,
          longitude: longitude || undefined,
          locationFull: locationFull || undefined,
          locationDisplay: locationDisplay || undefined,
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
          latitude || undefined, 
          longitude || undefined,
          locationFull || undefined,
          locationDisplay || undefined,
          currentMetadata.weather,
          currentMetadata.tags
        );
      }
    } finally {
      isSaving.current = false;
    }
  }, [currentEntryId, latitude, longitude, locationFull, locationDisplay]);

  // Track unsaved changes - compare with initial content
  useEffect(() => {
    const hasChanges = markdown !== (initialContent || '');
    setHasUnsavedChanges(hasChanges);
  }, [markdown, initialContent]);

  const handleBack = async () => {
    if (hasUnsavedChanges || !currentEntryId) {
      // Show save confirmation modal
      setShowSaveModal(true);
    } else {
      navigation.goBack();
    }
  };

  const handleSaveAndExit = async () => {
    try {
      await handleSave(markdown, { date, time, latitude, longitude, locationFull, locationDisplay, weather, tags });
      setShowSaveModal(false);
      navigation.goBack();
    } catch (e) {
      console.error('handleSaveAndExit error:', e);
    }
  };

  const handleDiscardAndExit = () => {
    setShowSaveModal(false);
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
                        <View key={index} className="flex-row items-center rounded-full px-3 py-1.5 mr-2 border" style={{ 
                          backgroundColor: isDark ? '#166534' : '#dcfce7',
                          borderColor: isDark ? '#166534' : '#dcfce7'
                        }}>
                            <Ionicons name="pricetag-outline" size={14} color={isDark ? '#22c55e' : '#16a34a'} />
                            <Text style={{ fontFamily: 'Outfit-Medium' }} className={`text-[13px] ml-1.5 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                {tag.trim()}
                            </Text>
                        </View>
                    )) : (
                        <View className="flex-row items-center rounded-full px-3 py-1.5 mr-2 border" style={{ 
                          backgroundColor: isDark ? '#166534' : '#dcfce7',
                          borderColor: isDark ? '#166534' : '#dcfce7'
                        }}>
                            <Ionicons name="pricetag-outline" size={14} color={isDark ? '#22c55e' : '#16a34a'} />
                            <Text style={{ fontFamily: 'Outfit-Medium' }} className={`text-[13px] ml-1.5 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                Tags
                            </Text>
                        </View>
                    )}

                    <Pill 
                        onPress={() => setShowDatePicker(true)}
                        icon={<Ionicons name="calendar-outline" size={15} color={isDark ? '#a78bfa' : '#7c3aed'} />}
                        label={formatDate(entryDateObj)}
                        backgroundColor={isDark ? '#2e1065' : '#f3e8ff'}
                        iconColor={isDark ? '#a78bfa' : '#7c3aed'}
                        textColor={isDark ? '#a78bfa' : '#7c3aed'}
                    />

                    <Pill 
                        onPress={() => setShowTimePicker(true)}
                        icon={<Ionicons name="time-outline" size={15} color={isDark ? '#a78bfa' : '#7c3aed'} />}
                        label={time}
                        backgroundColor={isDark ? '#2e1065' : '#f3e8ff'}
                        iconColor={isDark ? '#a78bfa' : '#7c3aed'}
                        textColor={isDark ? '#a78bfa' : '#7c3aed'}
                    />

                    <Pill 
                        onPress={handleLocationPress}
                        icon={
                            locationLoading ? (
                                <Ionicons name="location-outline" size={15} color={isDark ? '#fbbf24' : '#d97706'} />
                            ) : (hasLocationPermission === false && !locationDisplay) ? (
                                <Ionicons name="location-outline" size={15} color="#ef4444" />
                            ) : (
                                <Ionicons name="location-outline" size={15} color={isDark ? '#fbbf24' : '#d97706'} />
                            )
                        }
                        label={locationDisplay || 'Location'}
                        backgroundColor={isDark ? '#451a03' : '#fef3c7'}
                        iconColor={isDark ? '#fbbf24' : '#d97706'}
                        textColor={isDark ? '#fbbf24' : '#d97706'}
                        isLoading={locationLoading}
                    />

                    <Pill 
                        onPress={handleWeatherPress}
                        icon={
                          weatherLoading ? null : weatherError ? (
                            <Ionicons name="cloud-offline-outline" size={15} color="#ef4444" />
                          ) : weatherCode ? (
                            <Ionicons name={getWeatherIconName(weatherCode) as any} size={15} color={isDark ? '#e879f9' : '#d946ef'} />
                          ) : (
                            <Ionicons name="sunny-outline" size={15} color={isDark ? '#e879f9' : '#d946ef'} />
                          )
                        }
                        label={weatherError ? 'N/A' : weather || 'Weather'}
                        backgroundColor={isDark ? '#4a044e' : '#fdf4ff'}
                        iconColor={isDark ? '#e879f9' : '#d946ef'}
                        textColor={isDark ? '#e879f9' : '#d946ef'}
                        isError={weatherError}
                        isLoading={weatherLoading}
                    />

                    <Pill 
                        onPress={pickImage}
                        icon={<Ionicons name="image-outline" size={15} color={isDark ? '#38bdf8' : '#0284c7'} />}
                        label="Photo"
                        backgroundColor={isDark ? '#0c4a6e' : '#e0f2fe'}
                        iconColor={isDark ? '#38bdf8' : '#0284c7'}
                        textColor={isDark ? '#38bdf8' : '#0284c7'}
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

      {/* Save Confirmation Modal */}
      <Modal
        visible={showSaveModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <Pressable 
          className="flex-1 bg-black/60 items-center justify-end"
          onPress={() => setShowSaveModal(false)}
        >
          <View className="bg-white dark:bg-neutral-900 w-full rounded-t-[40px] px-8 pt-10 pb-16 shadow-2xl">
            <View className="flex-row items-center justify-between mb-8">
              <Text style={{ fontFamily: 'Outfit-Black' }} className="text-neutral-900 dark:text-neutral-50 text-2xl">
                {currentEntryId ? 'Save Changes?' : 'Save Entry?'}
              </Text>
              <TouchableOpacity onPress={() => setShowSaveModal(false)}>
                <Ionicons name="close" size={24} color="#737373" />
              </TouchableOpacity>
            </View>

            <View className="space-y-3">
              <TouchableOpacity 
                onPress={handleSaveAndExit}
                className="flex-row items-center justify-center p-5 rounded-2xl bg-indigo-500"
              >
                <Text style={{ fontFamily: 'Outfit-SemiBold' }} className="text-white text-[16px]">
                  {currentEntryId ? 'Save & Exit' : 'Save Entry'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleDiscardAndExit}
                className="flex-row items-center justify-center p-5 rounded-2xl bg-red-500"
              >
                <Text style={{ fontFamily: 'Outfit-SemiBold' }} className="text-white text-[16px]">
                  Discard{currentEntryId ? ' Changes' : ''}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setShowSaveModal(false)}
                className="flex-row items-center justify-center p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-800"
              >
                <Text style={{ fontFamily: 'Outfit-SemiBold' }} className="text-neutral-600 dark:text-neutral-400 text-[16px]">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
