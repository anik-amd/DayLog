import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useColorScheme } from "nativewind";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { Entry } from '../../types/Entry';

interface CalendarStripProps {
  selectedDate: string | null; // YYYY-MM-DD or null for "All"
  onDateSelect: (date: string | null) => void;
  entries: Entry[];
}

export default function CalendarStrip({ selectedDate, onDateSelect, entries }: CalendarStripProps) {
  const [expanded, setExpanded] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };
  // Generate a range of dates (covering the current week and then some)
  const dates = useMemo(() => {
    const list = [];
    const today = new Date();
    // Start from the beginning of the current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    for (let i = 0; i < 14; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const id = d.toISOString().split('T')[0];
      
      // Check if this date has any entries
      const hasEntries = entries.some(e => e.date === id);

      list.push({
        id,
        dayName: d.toLocaleDateString(undefined, { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: id === today.toISOString().split('T')[0],
        hasEntries
      });
    }
    return list;
  }, [entries]);

  // Handle Markings for the Full Month Calendar
  const markedDates = useMemo(() => {
    const marks: any = {};
    
    // Marked days with entries
    entries.forEach(e => {
        marks[e.date] = { 
            marked: true, 
            dotColor: '#6366f1' // Indigo
        };
    });

    // Marked today
    const todayStr = new Date().toISOString().split('T')[0];
    if (marks[todayStr]) {
        marks[todayStr].dotColor = '#6366f1';
    } else {
        marks[todayStr] = { marked: true, dotColor: '#3f3f46' };
    }

    // Selected Date
    if (selectedDate) {
        marks[selectedDate] = { 
            ...marks[selectedDate],
            selected: true,
            selectedColor: '#6366f1',
        };
    }

    return marks;
  }, [entries, selectedDate]);

  return (
    <View className="mb-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] overflow-hidden shadow-sm">
      <View className="flex-row items-center justify-between px-6 pt-5 pb-3">
        <Text className="text-neutral-400 dark:text-neutral-500 text-xs font-bold uppercase tracking-widest">
          {expanded ? 'Full Calendar' : 'This Week'}
        </Text>
        <TouchableOpacity onPress={toggleExpand} className="p-1">
          <Ionicons name={expanded ? "chevron-up" : "grid-outline"} size={18} color={isDark ? "#737373" : "#a3a3a3"} />
        </TouchableOpacity>
      </View>

      {expanded ? (
        <View className="px-2 pb-4">
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
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 22 }}
        >
          {dates.map((date) => {
            const isSelected = date.id === selectedDate;
            const isToday = date.isToday;
            
            return (
              <TouchableOpacity
                key={date.id}
                onPress={() => onDateSelect(isSelected ? null : date.id)}
                className={`items-center justify-center w-14 h-20 rounded-3xl mr-2.5 border-2 ${
                  isSelected 
                  ? 'bg-indigo-600 border-indigo-400' 
                  : isToday
                    ? 'bg-neutral-50 dark:bg-neutral-950 border-indigo-500/50'
                    : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800/80'
                }`}
              >
                <Text className={`text-[10px] uppercase font-black tracking-tighter mb-1 ${
                  isSelected ? 'text-indigo-100' : isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400 dark:text-neutral-500'
                }`}>
                  {date.dayName}
                </Text>
                <Text className={`text-lg font-black ${
                  isSelected ? 'text-white' : isToday ? 'text-neutral-900 dark:text-white' : 'text-neutral-800 dark:text-neutral-200'
                }`}>
                  {date.dayNum}
                </Text>
                
                {date.hasEntries && !isSelected && (
                  <View className={`absolute bottom-2.5 w-1.5 h-1.5 rounded-full ${isToday ? 'bg-indigo-400' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
