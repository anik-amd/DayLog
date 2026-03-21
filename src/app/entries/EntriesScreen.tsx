import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager, TouchableOpacity, Animated, ScrollView, Keyboard } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useColorScheme } from "nativewind";
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { initDb } from '../../database/db';
import { createEntry, getAllEntries } from '../../database/entries';
import { Entry } from '../../types/Entry';
import EntryCard from './EntryCard';
import CalendarStrip from './CalendarStrip';
import QuickEntryBar from '../editor/QuickEntryBar';
import Picker from '../editor/Picker';

export default function EntriesScreen({ navigation, route }: any) {
  const { colorScheme } = useColorScheme();
  const routeParams = route.params || {};
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(routeParams.selectedTag || null);
  
  // Date/time picker state (managed at screen level for web)
  const [pickerDate, setPickerDate] = useState(new Date());
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'date' | 'time'>('date');
  const [entryDate, setEntryDate] = useState(new Date());
  const [inputFocused, setInputFocused] = useState(false);

  // Animation values for scroll-driven UI hiding
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const uiPosition = useRef(new Animated.Value(0)).current; 
  const headerHideDistance = 120; // Distance the calendar slides up
  const footerHeight = 120; // QuickEntryBar height
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
        const currentY = event.nativeEvent.contentOffset.y;
        const delta = currentY - lastScrollY.current;
        
        if (currentY < 40) {
            // Near top: Always show
            Animated.timing(uiPosition, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        } else if (delta > 0) {
            // SCROLL DOWN: Hidden progressively
            const currentHide = (uiPosition as any)._value || 0;
            const newHide = Math.min(1, currentHide + (delta / 80)); 
            uiPosition.setValue(newHide);
            
            // Dismiss keyboard on significant scroll down
            if (delta > 20) {
              Keyboard.dismiss();
            }
        } else if (delta < -10) {
            // SCROLL UP: Show instantly/fast
            Animated.timing(uiPosition, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        }
        
        lastScrollY.current = currentY;
      }
    }
  );

  const calendarTranslate = uiPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -headerHideDistance], // Calendar slides UP under the logo plane
    extrapolate: 'clamp'
  });

  const footerTranslate = uiPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, footerHeight + 40], // Slide DOWN out of view
    extrapolate: 'clamp'
  });

  const uiOpacity = uiPosition.interpolate({
    inputRange: [0, 0.7],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const fetchEntries = async () => {
    try {
      const currentEntries = await getAllEntries();
      
      // Trigger a smooth layout animation when entries change
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
      setEntries(currentEntries);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Whenever this screen comes into focus (e.g. returning from full screen editor), refresh the timeline!
      if (!loading) {
        fetchEntries();
      }
    }, [loading])
  );

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDb();
        
        let currentEntries = await getAllEntries();
        
        if (currentEntries.length === 0) {
          const testEntry: Omit<Entry, 'media'> = {
            id: Date.now().toString(),
            content: "Welcome to DayLog! This is your first test entry, created automatically.",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            date: new Date().toISOString().split('T')[0]
          };
          
          await createEntry(testEntry);
          currentEntries = await getAllEntries();
        }
        
        setEntries(currentEntries);
      } catch (error) {
        console.error("Database initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };

    setupDatabase();
  }, []);

  // Filter entries based on the selected calendar date and tag
  const filteredEntries = entries.filter((e: Entry) => {
    const dateMatch = !selectedDate || e.date === selectedDate;
    const tagMatch = !selectedTag || (e.tags && e.tags.includes(selectedTag));
    return dateMatch && tagMatch;
  });

  // Handle tag press to filter by tag
  const handleTagPress = (tag: string) => {
    setSelectedTag(tag);
    setSelectedDate(null); // Clear date filter when filtering by tag
  };

  // Clear tag filter
  const clearTagFilter = () => {
    setSelectedTag(null);
  };

  // Group entries by date
  const groupedEntries = filteredEntries.reduce((groups: { [key: string]: Entry[] }, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      key={colorScheme}
      className="flex-1 bg-neutral-100 dark:bg-neutral-950"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="flex-1">
        {/* Entries rendered under the fixed header */}
        {loading ? (
            <ActivityIndicator size="large" color="#a1a1aa" className="mt-40" />
        ) : (
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
                paddingTop: 280,
                paddingBottom: 150, 
                paddingHorizontal: 15 
            }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {filteredEntries.length === 0 ? (
              <View className="mt-40 items-center opacity-60">
                <Ionicons name="journal-outline" size={48} color="#d4d4d4" />
                <Text style={{ fontFamily: 'Outfit-Regular' }} className="text-neutral-400 dark:text-zinc-500 text-lg mt-4">
                  {selectedTag ? `No entries with #${selectedTag}` : 'No entries for this day.'}
                </Text>
              </View>
            ) : (
              <>
                {/* Tag Filter Indicator */}
                {selectedTag && (
                  <View className="flex-row items-center mb-4 self-start">
                    <Ionicons name="pricetag-outline" size={14} color={colorScheme === 'dark' ? '#4ade80' : '#16a34a'} />
                    <Text style={{ fontFamily: 'Outfit-Medium', color: colorScheme === 'dark' ? '#4ade80' : '#16a34a' }} className="text-sm ml-1.5">
                      {selectedTag}
                    </Text>
                    <TouchableOpacity onPress={clearTagFilter} className="ml-2">
                      <Ionicons name="close-circle" size={16} color={colorScheme === 'dark' ? '#4ade80' : '#16a34a'} />
                    </TouchableOpacity>
                  </View>
                )}
                {sortedDates.map((dateStr) => (
                <View key={dateStr} className="mb-4">
                  {/* Date Header */}
                  <Text style={{ fontFamily: 'Outfit-Medium' }} className="text-neutral-500 dark:text-neutral-400 text-[12px] uppercase tracking-wider mb-2 px-1">
                    {formatDateHeader(dateStr)}
                  </Text>
                  
                  {/* Entries for this date */}
                  <View className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden">
                    {groupedEntries[dateStr].map((entry: Entry, index: number) => (
                      <EntryCard 
                        key={entry.id} 
                        entry={entry} 
                        showBorder={index > 0}
                        onTagPress={handleTagPress}
                      />
                    ))}
                  </View>
                </View>
              ))}
              </>
            )}
          </Animated.ScrollView>
        )}

        {/* FIXED Top Logo Bar (Pinned to top) */}
        <View 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 40 }}
            className="pt-12 pb-3 px-6 bg-neutral-100/95 dark:bg-neutral-950/95 border-b border-neutral-200/50 dark:border-neutral-800/50"
        >
            <View className="flex-row items-center justify-between">
                <Text style={{ fontFamily: 'Outfit-Black' }} className="text-neutral-900 dark:text-neutral-50 text-[24px] tracking-tighter">DayLog</Text>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Settings')}
                    className="bg-white/80 dark:bg-neutral-900 w-9 h-9 rounded-full items-center justify-center border border-neutral-200 dark:border-neutral-800 shadow-sm"
                >
                    <Ionicons name="settings-outline" size={16} color="#737373" />
                </TouchableOpacity>
            </View>
        </View>

        {/* HIDABLE Top Section: Calendar (Solid Floating Card) */}
        <Animated.View 
            style={{ 
                position: 'absolute', 
                top: 95, 
                left: 15, 
                right: 15, 
                zIndex: 30,
                transform: [{ translateY: calendarTranslate }],
                opacity: uiOpacity
            }}
        >
            <View 
                className="bg-white dark:bg-neutral-900 rounded-[32px] shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                style={{ backgroundColor: colorScheme === 'dark' ? '#171717' : '#ffffff' }}
            >
                <View className="px-5 py-4">
                    <CalendarStrip 
                        selectedDate={selectedDate} 
                        onDateSelect={setSelectedDate} 
                        entries={entries}
                    />
                </View>
            </View>
        </Animated.View>

        {/* HIDABLE Bottom Section: Quick Entry Bar (Solid Floating Card) */}
        <Animated.View 
            key={colorScheme}
            style={{ 
                position: 'absolute', 
                bottom: 30,
                left: 16, 
                right: 16, 
                zIndex: 10,
                transform: [{ translateY: footerTranslate }],
                opacity: uiOpacity
            }}
        >
            <View 
                className="rounded-[40px] overflow-hidden"
                style={{ 
                    backgroundColor: colorScheme === 'dark' ? '#1e1b4b' : '#ffffff',
                    borderWidth: inputFocused ? 2 : 1,
                    borderColor: colorScheme === 'dark' ? '#4c1d95' : '#ddd6fe',
                }}
            >
                <QuickEntryBar 
                  onEntrySaved={fetchEntries}
                  entryDate={entryDate}
                  onEntryDateChange={setEntryDate}
                  onFocusChange={setInputFocused}
                  onDatePress={() => {
                    setPickerType('date');
                    setPickerDate(entryDate);
                    setPickerVisible(true);
                  }}
                  onTimePress={() => {
                    setPickerType('time');
                    setPickerDate(entryDate);
                    setPickerVisible(true);
                  }}
                />
            </View>
        </Animated.View>

        {/* Web Picker - Rendered at screen level */}
        {Platform.OS === 'web' && (
          <Picker
            visible={pickerVisible}
            type={pickerType}
            value={pickerDate}
            onClose={() => setPickerVisible(false)}
            onSelect={(selectedDate: Date) => {
              const newDate = new Date(entryDate);
              if (pickerType === 'date') {
                newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
              } else {
                newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
              }
              setEntryDate(newDate);
              setPickerVisible(false);
            }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
