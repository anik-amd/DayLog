import React, { useMemo, useState, useRef, forwardRef, useImperativeHandle, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ListRenderItemInfo, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useColorScheme } from "nativewind";
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsive } from '../../hooks/useResponsive';
import { moderateScale } from '../../utils/responsive';

import { Entry } from '../../types/Entry';

interface CalendarStripProps {
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
  entries: Entry[];
  highlightedDate?: string | null;
  onHighlightChange?: (date: string) => void;
}

export interface CalendarStripRef {
  scrollToDate: (date: string) => void;
}

interface DayItem {
  id: string;
  dayName: string;
  dayNum: number;
  isToday: boolean;
  hasEntries: boolean;
}

const CalendarStrip = forwardRef<CalendarStripRef, CalendarStripProps>(
  function CalendarStrip({ selectedDate, onDateSelect, entries, highlightedDate, onHighlightChange }, ref) {
    const [expanded, setExpanded] = useState(false);
    const { colorScheme } = useColorScheme();
    const colors = useThemeColors();
    const { fontSize, isLandscape, isTablet } = useResponsive();
    const isDark = colorScheme === "dark";
    
    const CELL_WIDTH = isTablet ? moderateScale(52) : moderateScale(44);
    const CELL_MARGIN = isTablet ? moderateScale(10) : moderateScale(8);
    const CELL_TOTAL = CELL_WIDTH + CELL_MARGIN;
    
    const scrollRef = useRef<FlatList<DayItem>>(null);
    const datesRef = useRef<DayItem[]>([]);
    const lastCenterDate = useRef<string | null>(null);
    const lastUpdateTime = useRef<number>(0);
    const screenWidthRef = useRef(0);
    
    // Get screen width from dimensions
    const [screenWidth, setScreenWidth] = useState(0);
    
    useEffect(() => {
      const { width } = Dimensions.get('window');
      screenWidthRef.current = width;
      setScreenWidth(width);
    }, []);

    const toggleExpand = () => {
      setExpanded(!expanded);
    };

    const handleFlatListScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!onHighlightChange) return;
      
      // Throttle updates to every 100ms
      const now = Date.now();
      if (now - lastUpdateTime.current < 100) return;
      
      const dates = datesRef.current;
      if (!dates || dates.length === 0) return;

      const offsetX = event.nativeEvent.contentOffset.x;
      const listLeftPadding = 4;
      const centerX = offsetX + (screenWidth - 30) / 2 - listLeftPadding;
      const centerIndex = Math.max(0, Math.floor(centerX / CELL_TOTAL));
      const clampedIndex = Math.min(centerIndex, dates.length - 1);
      const centerDate = dates[clampedIndex];

      if (centerDate && centerDate.id !== lastCenterDate.current) {
        lastCenterDate.current = centerDate.id;
        lastUpdateTime.current = now;
        onHighlightChange(centerDate.id);
      }
    }, [onHighlightChange, screenWidth, CELL_TOTAL]);

    const scrollToDate = (date: string) => {
      const dates = datesRef.current;
      if (!dates || dates.length === 0) return;
      const item = dates.find(d => d.id === date);
      if (item && scrollRef.current) {
        lastCenterDate.current = date;
        scrollRef.current.scrollToItem({ item, animated: true, viewPosition: 0.5 });
      }
    };

    useImperativeHandle(ref, () => ({
      scrollToDate
    }));

    const dates: DayItem[] = useMemo(() => {
      const list: DayItem[] = [];
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 60);

      for (let i = 0; i < 90; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const id = d.toISOString().split('T')[0];
        const hasEntries = entries.some(e => e.date === id);

        list.push({
          id,
          dayName: d.toLocaleDateString(undefined, { weekday: 'short' }),
          dayNum: d.getDate(),
          isToday: id === today.toISOString().split('T')[0],
          hasEntries
        });
      }
      datesRef.current = list;
      return list;
    }, [entries]);

    const markedDates = useMemo(() => {
      const marks: any = {};
      entries.forEach(e => {
        marks[e.date] = { marked: true, dotColor: colors.accent };
      });
      const todayStr = new Date().toISOString().split('T')[0];
      if (marks[todayStr]) {
        marks[todayStr].dotColor = colors.accent;
      } else {
        marks[todayStr] = { marked: true, dotColor: isDark ? '#3f3f46' : '#d4d4d4' };
      }
      if (selectedDate) {
        marks[selectedDate] = {
          ...marks[selectedDate],
          selected: true,
          selectedColor: colors.accent,
        };
      }
      return marks;
    }, [entries, selectedDate, colors.accent, isDark]);

    const monthLabel = useMemo(() => {
      try {
        if (!highlightedDate) return new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        const parts = highlightedDate.split('-');
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (isNaN(d.getTime())) return new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      } catch {
        return new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      }
    }, [highlightedDate]);

    const getItemLayout = (_: any, index: number) => ({
      length: CELL_TOTAL,
      offset: CELL_TOTAL * index,
      index,
    });

    const renderItem = ({ item }: ListRenderItemInfo<DayItem>) => {
      const isSelected = item.id === selectedDate;
      const isHighlighted = item.id === highlightedDate;

      return (
        <TouchableOpacity
          onPress={() => onDateSelect(isSelected ? null : item.id)}
          style={{ width: CELL_WIDTH, height: 56, marginRight: CELL_MARGIN }}
          activeOpacity={0.8}
        >
          <View
            className="flex-1 items-center justify-center rounded-[20px]"
            style={[
              isSelected
                ? { backgroundColor: colors.accent }
                : isHighlighted
                  ? { backgroundColor: colors.accentLight, borderWidth: 1, borderColor: colors.accent }
                  : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }
            ]}
          >
            <Text style={{ fontFamily: 'Outfit-Black', fontSize: 8, letterSpacing: -0.5, color: isSelected ? '#ffffff' : isHighlighted ? colors.accent : item.isToday ? colors.accent : (isDark ? '#737373' : '#a1a1aa') }}>
              {item.dayName}
            </Text>
            <Text style={{ fontFamily: 'Outfit-Black', fontSize: 14, color: isSelected ? '#ffffff' : isHighlighted ? colors.accent : item.isToday ? (isDark ? '#ffffff' : '#171717') : (isDark ? '#e4e4e7' : '#404040') }}>
              {item.dayNum}
            </Text>
            {item.hasEntries && !isSelected && (
              <View className="absolute bottom-1.5 w-1 h-1 rounded-full" style={{ backgroundColor: item.isToday ? colors.accent : (isDark ? '#52525b' : '#d4d4d4') }} />
            )}
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <View>
        <View className="flex-row items-center justify-between px-0 pt-0 pb-2">
          <TouchableOpacity
            onPress={() => selectedDate && onDateSelect(null)}
            className="flex-row items-center"
          >
            <Text style={{ fontFamily: 'Outfit-Black' }} className="text-neutral-400 dark:text-neutral-500 text-[9px] uppercase tracking-[2px]">
              {selectedDate ? 'Filtered' : expanded ? 'Full Calendar' : 'All Entries'}
            </Text>
            {selectedDate && (
              <Ionicons name="close-circle" size={12} color={colors.accent} className="ml-1" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleExpand} className="p-1">
            <Ionicons name={expanded ? "chevron-up" : "grid-outline"} size={14} color={isDark ? "#737373" : "#a3a3a3"} />
          </TouchableOpacity>
        </View>

        {expanded ? (
          <View className="pb-2">
            <Calendar
              // Disabled: swipe requires React Navigation context, causes "Couldn't find a navigation context" error on Android
              enableSwipeMonths={false}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: isDark ? '#737373' : '#a3a3a3',
                selectedDayBackgroundColor: colors.accent,
                selectedDayTextColor: '#ffffff',
                todayTextColor: colors.accent,
                dayTextColor: isDark ? '#e5e5e5' : '#404040',
                textDisabledColor: isDark ? '#3f3f46' : '#d4d4d4',
                dotColor: colors.accent,
                selectedDotColor: '#ffffff',
                arrowColor: colors.accent,
                monthTextColor: isDark ? '#ffffff' : '#171717',
                textMonthFontWeight: 'black',
                textDayFontWeight: 'bold',
                textDayHeaderFontWeight: 'medium',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 11
              }}
              onDayPress={(day: any) => onDateSelect(day.dateString === selectedDate ? null : day.dateString)}
              markedDates={markedDates}
            />
          </View>
        ) : (
          <>
            <Text style={{ fontFamily: 'Outfit-Medium' }} className="text-neutral-600 dark:text-neutral-300 text-[11px] uppercase tracking-widest mb-1.5 text-center">
              {monthLabel}
            </Text>
            <FlatList
              ref={scrollRef}
              data={dates}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              getItemLayout={getItemLayout}
              contentContainerStyle={{ paddingLeft: 4, paddingRight: 4, paddingBottom: 4 }}
              onScroll={handleFlatListScroll}
              scrollEventThrottle={16}
            />
          </>
        )}
      </View>
    );
  }
);

export default CalendarStrip;
