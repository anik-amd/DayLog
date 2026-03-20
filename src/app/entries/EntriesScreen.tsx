import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager, TouchableOpacity, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
import { FlashList } from "@shopify/flash-list";
import { BlurView } from 'expo-blur';

export default function EntriesScreen({ navigation }: any) {
  const { colorScheme } = useColorScheme();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // null means "Show All" by default

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
    outputRange: [0, footerHeight + 40], // Slider DOWN out of view
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
      
      // Trigger a smooth layout animation if the amount of entries has changed (e.g. a new one was added)
      if (entries.length !== 0 && entries.length !== currentEntries.length) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      
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

  // Filter entries based on the selected calendar date
  const filteredEntries = selectedDate 
    ? entries.filter((e: Entry) => e.date === selectedDate)
    : entries;

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-neutral-100 dark:bg-neutral-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="flex-1">
        {/* FlashList renders under the fixed header */}
        {loading ? (
            <ActivityIndicator size="large" color="#a1a1aa" className="mt-40" />
        ) : (
             <FlashList
                 data={filteredEntries}
                 keyExtractor={(item) => item.id}
                 renderItem={({ item }) => <EntryCard entry={item} />}
                 showsVerticalScrollIndicator={false}
                 contentContainerStyle={{ 
                     paddingTop: 280, // Generous space for the floating Calendar and Logo bar
                     paddingBottom: 150, 
                     paddingHorizontal: 15 
                 }}
                 ListEmptyComponent={() => (
                     <View className="mt-40 items-center opacity-60">
                         <Ionicons name="journal-outline" size={48} color="#d4d4d4" />
                         <Text className="text-neutral-400 dark:text-zinc-500 text-lg font-medium mt-4">No entries for this day.</Text>
                     </View>
                 )}
                 onScroll={handleScroll}
                 scrollEventThrottle={16}
             />
        )}

        {/* FIXED Top Logo Bar (Pinned to top) */}
        <View 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 40 }}
            className="pt-12 pb-3 px-6 bg-neutral-100/95 dark:bg-neutral-950/95 border-b border-neutral-200/50 dark:border-neutral-800/50"
        >
            <View className="flex-row items-center justify-between">
                <Text className="text-neutral-900 dark:text-neutral-50 text-[24px] font-black tracking-tighter">DayLog</Text>
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
                className="bg-white dark:bg-neutral-900 rounded-[40px] shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                style={{ backgroundColor: colorScheme === 'dark' ? '#171717' : '#ffffff' }}
            >
                <QuickEntryBar onEntrySaved={fetchEntries} />
            </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
