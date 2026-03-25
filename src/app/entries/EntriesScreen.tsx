import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager, TouchableOpacity, Animated, ScrollView, Keyboard } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { initDb } from '../../database/db';
import { createEntry, getAllEntries } from '../../database/entries';
import { getAllTags } from '../../database/tags';
import { getTheme, setTheme } from '../../storage/settings';
import { Entry } from '../../types/Entry';
import EntryCard from './EntryCard';
import CalendarStrip, { CalendarStripRef } from './CalendarStrip';
import QuickEntryBar from '../editor/QuickEntryBar';
import Picker from '../editor/Picker';
import TagStrip from '../../components/TagStrip';
import TagSelectorModal from '../../components/TagSelectorModal';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useTabBarHeight } from '../../contexts/TabBarHeightContext';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';
import { useResponsive } from '../../hooks/useResponsive';
import { moderateScale } from '../../utils/responsive';

export default function EntriesScreen({ navigation, route }: any) {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { tabBarHeight } = useTabBarHeight();
  const keyboardHeight = useKeyboardHeight();
  const { spacing, fontSize, isTablet, isLandscape } = useResponsive();
  const routeParams = route.params || {};
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    routeParams.selectedTags || routeParams.selectedTag ? [routeParams.selectedTag || routeParams.selectedTags[0]] : []
  );
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [popularTags, setPopularTags] = useState<{ name: string; count: number }[]>([]);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [savedTheme, setSavedTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    (async () => {
      const theme = await getTheme();
      setSavedTheme(theme);
    })();
  }, []);

  const themeIconRotate = useRef(new Animated.Value(0)).current;

  const handleThemeToggle = async () => {
    const currentNativeScheme = colorScheme;
    let newTheme: 'light' | 'dark';
    
    if (currentNativeScheme === 'dark') {
      newTheme = 'light';
    } else {
      newTheme = 'dark';
    }
    
    await setTheme(newTheme);
    setSavedTheme(newTheme);
    setColorScheme(newTheme);

    Animated.sequence([
      Animated.timing(themeIconRotate, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(themeIconRotate, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotateInterpolate = themeIconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const orderedTags = useMemo(() => {
    const selected = selectedTags
      .filter(st => popularTags.some(pt => pt.name === st))
      .map(st => popularTags.find(pt => pt.name === st)!);
    const others = popularTags.filter(pt => !selectedTags.includes(pt.name));
    return [...selected, ...others];
  }, [popularTags, selectedTags]);
  
  // Date/time picker state (managed at screen level for web)
  const [pickerDate, setPickerDate] = useState(new Date());
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'date' | 'time'>('date');
  const [entryDate, setEntryDate] = useState(new Date());
  const [inputFocused, setInputFocused] = useState(false);
  const [highlightedDate, setHighlightedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const calendarRef = useRef<CalendarStripRef>(null);
  const datePositionsRef = useRef<{ [date: string]: number }>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const headerPosition = useRef(new Animated.Value(0)).current;
  const calendarTranslate = useRef(new Animated.Value(0)).current;
  const quickBarTranslate = useRef(new Animated.Value(0)).current;
  const footerHeight = 120;
  const highlightedDateRef = useRef(highlightedDate);
  const allSortedDatesRef = useRef<string[]>([]);
  const lastScrollY = useRef(0);
  const headerVisible = useRef(true);

  useEffect(() => {
    highlightedDateRef.current = highlightedDate;
  }, [highlightedDate]);

  useEffect(() => {
    if (route.params?.selectedTags !== undefined) {
      setSelectedTags(route.params.selectedTags);
    } else if (route.params?.selectedTag !== undefined) {
      setSelectedTags([route.params.selectedTag]);
    }
  }, [route.params?.selectedTags, route.params?.selectedTag]);

  useEffect(() => {
    const allGroupedEntries = entries.reduce((groups: { [key: string]: Entry[] }, entry) => {
      const date = entry.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
      return groups;
    }, {});
    allSortedDatesRef.current = Object.keys(allGroupedEntries).sort((a, b) => b.localeCompare(a));
  }, [entries]);

  useEffect(() => {
    if (entries.length === 0) return;
    const timer = setTimeout(() => {
      const positions = datePositionsRef.current;
      const dates = allSortedDatesRef.current;
      const viewportTop = 78;

      let visibleDate: string | null = null;
      for (const date of dates) {
        if (positions[date] !== undefined && positions[date] < viewportTop + 250) {
          visibleDate = date;
          break;
        }
      }
      if (visibleDate && visibleDate !== highlightedDateRef.current) {
        highlightedDateRef.current = visibleDate;
        setHighlightedDate(visibleDate);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [entries]);

  const handleScroll = (event: any) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const delta = currentY - lastScrollY.current;

    const positions = datePositionsRef.current;
    const dates = allSortedDatesRef.current;

    const viewportTop = currentY + 95;

    let visibleDate: string | null = null;
    for (const date of dates) {
      if (positions[date] !== undefined && positions[date] >= viewportTop - 30) {
        visibleDate = date;
        break;
      }
    }

    if (visibleDate && visibleDate !== highlightedDateRef.current) {
      highlightedDateRef.current = visibleDate;
      setHighlightedDate(visibleDate);
      calendarRef.current?.scrollToDate(visibleDate);
    }

    if (delta > 8 && headerVisible.current) {
      headerVisible.current = false;
      Animated.parallel([
        Animated.spring(headerPosition, {
          toValue: -88,
          useNativeDriver: true,
          speed: 40,
          bounciness: 0,
        }),
        Animated.spring(calendarTranslate, {
          toValue: -68,
          useNativeDriver: true,
          speed: 40,
          bounciness: 0,
        }),
        Animated.spring(quickBarTranslate, {
          toValue: 200,
          useNativeDriver: true,
          speed: 40,
          bounciness: 0,
        }),
      ]).start();
    } else if (delta < -8 && !headerVisible.current) {
      headerVisible.current = true;
      Animated.parallel([
        Animated.spring(headerPosition, {
          toValue: 0,
          useNativeDriver: true,
          speed: 30,
          bounciness: 4,
        }),
        Animated.spring(calendarTranslate, {
          toValue: 0,
          useNativeDriver: true,
          speed: 30,
          bounciness: 4,
        }),
        Animated.spring(quickBarTranslate, {
          toValue: 0,
          useNativeDriver: true,
          speed: 30,
          bounciness: 4,
        }),
      ]).start();
    }

    lastScrollY.current = currentY;
  };

  const fetchEntries = async () => {
    try {
      const currentEntries = await getAllEntries();
      setEntries(currentEntries);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    }
  };

  const loadTagCounts = async () => {
    try {
      const tags = await getAllTags();
      const counts: Record<string, number> = {};
      for (const tag of tags) {
        counts[tag.name] = tag.count;
      }
      setTagCounts(counts);
      setPopularTags(tags);
    } catch (error) {
      console.error("Failed to load tag counts:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Whenever this screen comes into focus (e.g. returning from full screen editor), refresh the timeline!
      if (!loading) {
        fetchEntries();
        loadTagCounts();
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
            id: `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            content: "Welcome to DayLog! This is your first test entry, created automatically.",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            date: new Date().toISOString().split('T')[0]
          };
          
          await createEntry(testEntry);
          currentEntries = await getAllEntries();
        }
        
        setEntries(currentEntries);
        await loadTagCounts();
        
        if (currentEntries.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          highlightedDateRef.current = today;
          setHighlightedDate(today);
          setTimeout(() => {
            calendarRef.current?.scrollToDate(today);
          }, 100);
        }
      } catch (error) {
        console.error("Database initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };

    setupDatabase();
  }, []);

  // Filter entries based on the selected calendar date and tags (AND logic)
  const filteredEntries = entries.filter((e: Entry) => {
    const dateMatch = !selectedDate || e.date === selectedDate;
    const tagMatch = selectedTags.length === 0 || 
      selectedTags.every(tag => e.tags?.includes(tag));
    return dateMatch && tagMatch;
  });

  // Handle tag press to toggle tag filter
  const handleTagPress = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
    setSelectedDate(null);
  };

  // Clear all tag filters
  const clearTagFilter = () => {
    setSelectedTags([]);
  };

  // When selectedDate is cleared, reset highlightedDate to today
  useEffect(() => {
    if (!selectedDate && entries.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      highlightedDateRef.current = today;
      setHighlightedDate(today);
      calendarRef.current?.scrollToDate(today);
    }
  }, [selectedDate]);

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
    <View 
      key={colorScheme}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-1">
        {/* Entries rendered under the fixed header */}
        {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={colors.textTertiary} />
              <Text style={{ fontFamily: 'Outfit-Regular', color: colors.textSecondary }} className="mt-3">Loading...</Text>
            </View>
        ) : (
           <ScrollView
            ref={scrollViewRef as any}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
                paddingTop: 280,
                paddingBottom: 150, 
                paddingHorizontal: 15 
            }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* Tag Strip - scrolls with content */}
            {popularTags.length > 0 && (
              <View className="mb-4">
                <TagStrip
                  tags={orderedTags}
                  selectedTags={selectedTags}
                  onTagPress={handleTagPress}
                  onMorePress={() => setTagModalVisible(true)}
                />
              </View>
            )}
            
            {filteredEntries.length === 0 ? (
              <View className="mt-40 items-center opacity-60">
                <Ionicons name="journal-outline" size={48} color={colors.textTertiary} />
                <Text style={{ fontFamily: 'Outfit-Regular', color: colors.textTertiary, fontSize: 16, marginTop: 16 }}>
                  {selectedTags.length > 0 ? `No entries with #${selectedTags.join(', #')}` : 'No entries for this day.'}
                </Text>
              </View>
            ) : (
              <>
                {sortedDates.map((dateStr) => (
                <View
                  key={dateStr}
                  className="mb-4"
                  onLayout={(e) => {
                    const newY = e.nativeEvent.layout.y;
                    datePositionsRef.current[dateStr] = newY;

                    const count = Object.keys(datePositionsRef.current).length;
                    const positions = datePositionsRef.current;
                    const dates = allSortedDatesRef.current;

                    const viewportTop = 78;
                    let visibleDate: string | null = null;
                    for (const date of dates) {
                      if (positions[date] !== undefined && positions[date] < viewportTop + 250) {
                        visibleDate = date;
                        break;
                      }
                    }
                    if (visibleDate && visibleDate !== highlightedDateRef.current) {
                      highlightedDateRef.current = visibleDate;
                      setHighlightedDate(visibleDate);
                    }
                  }}
                >
                  {/* Date Header */}
                  <Text style={{ fontFamily: 'Outfit-Medium', color: colors.textSecondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>
                    {formatDateHeader(dateStr)}
                  </Text>
                  
                  {/* Entries for this date */}
                  <View style={{ backgroundColor: colors.background, borderRadius: 16, overflow: 'hidden' }}>
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
          </ScrollView>
        )}

        {/* FIXED Top Logo Bar (Pinned to top) */}
        <Animated.View
            style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                zIndex: 40,
                paddingTop: Math.max(insets.top, 48),
                paddingBottom: 12,
                paddingHorizontal: 24,
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.08,
                shadowRadius: 3,
                elevation: 2,
                transform: [{ translateY: headerPosition }],
            }}
        >
            <View className="flex-1 flex-row items-center justify-between">
                <Text style={{ fontFamily: 'Outfit-Black', fontSize: fontSize.xl, color: colors.text }}>DayLog</Text>
                <View className="flex-row items-center">
                    <TouchableOpacity 
                        onPress={() => setTagModalVisible(true)}
                        style={{
                            backgroundColor: colors.surface,
                            width: 44,
                            height: 44,
                            borderRadius: 999,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: colors.border,
                            marginRight: 8,
                        }}
                    >
                        <Ionicons name="pricetag-outline" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={handleThemeToggle}
                        style={{
                            backgroundColor: colors.surface,
                            width: 44,
                            height: 44,
                            borderRadius: 999,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: colors.border,
                            marginRight: 8,
                        }}
                    >
                        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                            <Ionicons name={colorScheme === 'dark' ? 'sunny' : 'moon'} size={18} color={colors.textSecondary} />
                        </Animated.View>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Settings')}
                        style={{
                            backgroundColor: colors.surface,
                            width: 44,
                            height: 44,
                            borderRadius: 999,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}
                    >
                        <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>

        {/* FIXED Top Section: Calendar (Solid Floating Card) */}
        <Animated.View 
            style={{ 
                position: 'absolute', 
                top: 78 + Math.max(insets.top, 48),
                left: 15,
                right: 15,
                zIndex: 30,
                borderRadius: 16,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
                elevation: 4,
                transform: [{ translateY: calendarTranslate }],
            }}
        >
            <View 
                style={{ 
                    backgroundColor: colors.background,
                    borderWidth: 2,
                    borderColor: (selectedTags.length > 0 || selectedDate)
                        ? colors.accent
                        : colors.border,
                    borderRadius: 16,
                    overflow: 'hidden',
                }}
            >
                <View className="px-4 py-2">
                    <CalendarStrip
                        ref={calendarRef}
                        selectedDate={selectedDate}
                        onDateSelect={(date) => {
                          setSelectedDate(date);
                          if (date) {
                            highlightedDateRef.current = date;
                            setHighlightedDate(date);
                            calendarRef.current?.scrollToDate(date);
                          }
                        }}
                        entries={entries}
                        highlightedDate={highlightedDate}
                        onHighlightChange={(date) => {
                          if (date !== highlightedDateRef.current) {
                            highlightedDateRef.current = date;
                            setHighlightedDate(date);
                          }
                        }}
                    />
                </View>
            </View>
        </Animated.View>

        {/* HIDABLE Bottom Section: Quick Entry Bar (Solid Floating Card) */}
        <Animated.View 
            key={colorScheme}
            style={{ 
                position: 'absolute', 
                bottom: tabBarHeight + keyboardHeight + spacing.md,
                left: spacing.md, 
                right: spacing.md, 
                zIndex: 999,
                transform: [
                    { translateY: quickBarTranslate },
                ],
            }}
        >
            <View 
                style={{ 
                    backgroundColor: colors.background,
                    borderRadius: moderateScale(40),
                    borderWidth: inputFocused ? 2 : 1,
                    borderColor: inputFocused ? colors.accent : colors.border,
                    overflow: 'hidden',
                }}
            >
                <QuickEntryBar 
                  onEntrySaved={() => {
                    fetchEntries();
                    loadTagCounts();
                  }}
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

        {/* Tag Selector Modal */}
        <TagSelectorModal
          visible={tagModalVisible}
          tags={orderedTags}
          selectedTags={selectedTags}
          onClose={() => setTagModalVisible(false)}
          onApply={(tags) => {
            setSelectedTags(tags);
            setTagModalVisible(false);
          }}
        />
      </View>
    </View>
  );
}
