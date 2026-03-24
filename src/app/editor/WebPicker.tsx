import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from "nativewind";
import { useThemeColors } from '../../hooks/useThemeColors';

interface WebPickerProps {
  visible: boolean;
  type: 'date' | 'time';
  value: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

export default function WebPicker({ visible, type, value, onClose, onSelect }: WebPickerProps) {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();
  const isDark = colorScheme === 'dark';
  const [calendarMonth, setCalendarMonth] = useState(value);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  if (!visible) return null;

  if (type === 'date') {
    return (
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text style={{ color: colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '600' }}>Select Date</Text>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text style={{ color: colors.accent, fontWeight: '600' }}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.monthNav}>
            <TouchableOpacity 
              onPress={() => {
                const newMonth = new Date(calendarMonth);
                newMonth.setMonth(newMonth.getMonth() - 1);
                setCalendarMonth(newMonth);
              }}
              style={[styles.navButton, { backgroundColor: colors.surfaceElevated }]}
            >
              <Ionicons name="chevron-back" size={20} color={colors.accent} />
            </TouchableOpacity>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
              {calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                const newMonth = new Date(calendarMonth);
                newMonth.setMonth(newMonth.getMonth() + 1);
                setCalendarMonth(newMonth);
              }}
              style={[styles.navButton, { backgroundColor: colors.surfaceElevated }]}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.accent} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.dayHeaders}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <Text key={day} style={[styles.dayHeader, { color: colors.textSecondary }]}>{day}</Text>
            ))}
          </View>
          
          <View style={styles.calendarGrid}>
            {getDaysInMonth(calendarMonth).map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isSameDay(day, value) && { backgroundColor: colors.accent, borderRadius: 20 },
                  isToday(day) && !isSameDay(day, value) && { borderWidth: 1, borderColor: colors.accent, borderRadius: 20 },
                ]}
                onPress={() => {
                  if (day) {
                    onSelect(day);
                    onClose();
                  }
                }}
              >
                {day && (
                  <Text style={[
                    { color: colors.text, fontSize: 15, fontWeight: '500' },
                    isSameDay(day, value) && { color: '#ffffff', fontWeight: '600' },
                    isToday(day) && !isSameDay(day, value) && { color: colors.accent },
                  ]}>
                    {day.getDate()}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={[styles.header, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={{ color: colors.textSecondary }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '600' }}>Select Time</Text>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={{ color: colors.accent, fontWeight: '600' }}>Done</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.timeDisplay}>
          <Text style={{ color: colors.text, fontSize: 48, fontWeight: '200' }}>{formatTime(value)}</Text>
        </View>
        
        <View style={styles.timePickerGrid}>
          <View style={styles.timeColumn}>
            <TouchableOpacity 
              onPress={() => {
                const newDate = new Date(value);
                newDate.setHours(newDate.getHours() - 1);
                onSelect(newDate);
              }}
              style={styles.timeButton}
            >
              <Ionicons name="chevron-up" size={24} color={colors.accent} />
            </TouchableOpacity>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Hour</Text>
            <TouchableOpacity 
              onPress={() => {
                const newDate = new Date(value);
                newDate.setHours(newDate.getHours() + 1);
                onSelect(newDate);
              }}
              style={styles.timeButton}
            >
              <Ionicons name="chevron-down" size={24} color={colors.accent} />
            </TouchableOpacity>
          </View>
          
          <Text style={{ color: colors.text, fontSize: 48, fontWeight: '200', marginHorizontal: 16 }}>:</Text>
          
          <View style={styles.timeColumn}>
            <TouchableOpacity 
              onPress={() => {
                const newDate = new Date(value);
                newDate.setMinutes(newDate.getMinutes() - 15);
                onSelect(newDate);
              }}
              style={styles.timeButton}
            >
              <Ionicons name="chevron-up" size={24} color={colors.accent} />
            </TouchableOpacity>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Min</Text>
            <TouchableOpacity 
              onPress={() => {
                const newDate = new Date(value);
                newDate.setMinutes(newDate.getMinutes() + 15);
                onSelect(newDate);
              }}
              style={styles.timeButton}
            >
              <Ionicons name="chevron-down" size={24} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    borderRadius: 20,
    width: 340,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
    color: '#737373',
  },
  doneText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#171717',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#171717',
  },
  dayHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#a3a3a3',
    paddingVertical: 4,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  selectedDay: {
    backgroundColor: '#6366f1',
    borderRadius: 20,
  },
  todayDay: {
    borderWidth: 1,
    borderColor: '#6366f1',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  todayDayText: {
    color: '#6366f1',
  },
  timeDisplay: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '200',
    color: '#171717',
  },
  timePickerGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeButton: {
    padding: 12,
    marginVertical: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: '#a3a3a3',
    marginVertical: 4,
  },
  timeSeparator: {
    fontSize: 48,
    fontWeight: '200',
    color: '#171717',
    marginHorizontal: 16,
  },
});
