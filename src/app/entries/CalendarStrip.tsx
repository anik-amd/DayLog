import React, { useMemo, useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useColorScheme } from "nativewind";
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsive } from '../../hooks/useResponsive';
import { moderateScale } from '../../utils/responsive';
import { formatDateToString, getTodayString } from '../../utils/dateUtils';

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

    const scrollRef = useRef<ScrollView>(null);
    const datesRef = useRef<DayItem[]>([]);
    const lastCenterDate = useRef<string | null>(null);
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

    const scrollToDate = (date: string) => {
      const dates = datesRef.current;
      if (!dates || dates.length === 0) return;
      const item = dates.find(d => d.id === date);
      if (item && scrollRef.current) {
        lastCenterDate.current = date;
        const index = dates.findIndex(d => d.id === date);
        const offsetX = index * CELL_TOTAL;
        scrollRef.current.scrollTo({ x: offsetX, animated: true });
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
    const id = formatDateToString(d);
    const hasEntries = entries.some(e => e.date === id);

    list.push({
      id,
      dayName: d.toLocaleDateString(undefined, { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: id === getTodayString(),
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
  const todayStr = getTodayString();
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
            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 4, paddingRight: 4, paddingBottom: 4 }}
            >
              {dates.map((item) => {
                const isSelected = item.id === selectedDate;
                const isHighlighted = item.id === highlightedDate;

                return (
                  <TouchableOpacity
                    key={item.id}
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
              })}
            </ScrollView>
          </>
        )}
      </View>
    );
  }
);

export default CalendarStrip;
