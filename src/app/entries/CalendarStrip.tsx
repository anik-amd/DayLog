import React, { useMemo, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, FlatList, TouchableOpacity, LayoutAnimation, Platform, UIManager, StyleSheet, Dimensions, ListRenderItemInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useColorScheme } from "nativewind";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { Entry } from '../../types/Entry';

interface CalendarStripProps {
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
  entries: Entry[];
  highlightedDate?: string | null;
}

export interface CalendarStripRef {
  scrollToDate: (date: string) => void;
}

const CELL_WIDTH = 44;
const CELL_MARGIN = 8;
const CELL_TOTAL = CELL_WIDTH + CELL_MARGIN;

interface DayItem {
  id: string;
  dayName: string;
  dayNum: number;
  isToday: boolean;
  hasEntries: boolean;
}

const CalendarStrip = forwardRef<CalendarStripRef, CalendarStripProps>(
  function CalendarStrip({ selectedDate, onDateSelect, entries, highlightedDate }, ref) {
    const [expanded, setExpanded] = useState(false);
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const scrollRef = useRef<FlatList<DayItem>>(null);
    const datesRef = useRef<DayItem[]>([]);

    const toggleExpand = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(!expanded);
    };

    const scrollToDate = (date: string) => {
      const dates = datesRef.current;
      const item = dates.find(d => d.id === date);
      if (item && scrollRef.current) {
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
        marks[e.date] = { marked: true, dotColor: '#6366f1' };
      });
      const todayStr = new Date().toISOString().split('T')[0];
      if (marks[todayStr]) {
        marks[todayStr].dotColor = '#6366f1';
      } else {
        marks[todayStr] = { marked: true, dotColor: '#3f3f46' };
      }
      if (selectedDate) {
        marks[selectedDate] = {
          ...marks[selectedDate],
          selected: true,
          selectedColor: '#6366f1',
        };
      }
      return marks;
    }, [entries, selectedDate]);

    const monthLabel = useMemo(() => {
      try {
        if (!highlightedDate) return new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        const parts = highlightedDate.split('-');
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
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
            className={`flex-1 items-center justify-center rounded-[20px] ${
              isSelected
                ? 'bg-indigo-600'
                : isHighlighted
                  ? 'bg-indigo-200 dark:bg-indigo-900/60 border border-indigo-400 dark:border-indigo-600'
                  : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 shadow-sm'
            }`}
            style={!isSelected && !isHighlighted ? {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 3,
            } : {}}
          >
            <Text style={{ fontFamily: 'Outfit-Black' }} className={`text-[8px] uppercase tracking-tighter ${
              isSelected ? 'text-indigo-200' : isHighlighted ? 'text-indigo-600 dark:text-indigo-300' : item.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400 dark:text-neutral-500'
            }`}>
              {item.dayName}
            </Text>
            <Text style={{ fontFamily: 'Outfit-Black' }} className={`text-[14px] ${
              isSelected ? 'text-white' : isHighlighted ? 'text-indigo-700 dark:text-indigo-200' : item.isToday ? 'text-neutral-900 dark:text-white' : 'text-neutral-800 dark:text-neutral-200'
            }`}>
              {item.dayNum}
            </Text>
            {item.hasEntries && !isSelected && (
              <View className={`absolute bottom-1.5 w-1 h-1 rounded-full ${item.isToday ? 'bg-indigo-400' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
            )}
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <View className="overflow-hidden">
        <View className="flex-row items-center justify-between px-0 pt-0 pb-2">
          <TouchableOpacity
            onPress={() => selectedDate && onDateSelect(null)}
            className="flex-row items-center"
          >
            <Text style={{ fontFamily: 'Outfit-Black' }} className="text-neutral-400 dark:text-neutral-500 text-[9px] uppercase tracking-[2px]">
              {selectedDate ? 'Filtered' : expanded ? 'Full Calendar' : 'All Entries'}
            </Text>
            {selectedDate && (
              <Ionicons name="close-circle" size={12} color="#6366f1" className="ml-1" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleExpand} className="p-1">
            <Ionicons name={expanded ? "chevron-up" : "grid-outline"} size={14} color={isDark ? "#737373" : "#a3a3a3"} />
          </TouchableOpacity>
        </View>

        {expanded ? (
          <View className="px-0 pb-2">
            <Calendar
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: isDark ? '#737373' : '#a3a3a3',
                selectedDayBackgroundColor: '#6366f1',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#6366f1',
                dayTextColor: isDark ? '#e5e5e5' : '#404040',
                textDisabledColor: isDark ? '#3f3f46' : '#d4d4d4',
                dotColor: '#6366f1',
                selectedDotColor: '#ffffff',
                arrowColor: '#6366f1',
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
              scrollEventThrottle={16}
            />
          </>
        )}
      </View>
    );
  }
);

export default CalendarStrip;
