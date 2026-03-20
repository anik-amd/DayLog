import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Modal } from 'react-native';
import { useColorScheme } from "nativewind";
import { Ionicons } from '@expo/vector-icons';

interface PickerProps {
  visible: boolean;
  type: 'date' | 'time';
  value: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

export default function Picker({ visible, type, value, onClose, onSelect }: PickerProps) {
  const [calendarMonth, setCalendarMonth] = useState(value);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  const bgColor = isDark ? '#171717' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#171717';
  const subtextColor = isDark ? '#a3a3a3' : '#737373';
  const borderColor = isDark ? '#262626' : '#e5e5e5';

  if (type === 'date') {
    return (
      <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.card, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <Text style={[styles.cancelText, { color: subtextColor }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.title, { color: textColor }]}>Select Date</Text>
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.monthNav}>
              <TouchableOpacity 
                onPress={() => {
                  const newMonth = new Date(calendarMonth);
                  newMonth.setMonth(newMonth.getMonth() - 1);
                  setCalendarMonth(newMonth);
                }}
                style={[styles.navButton, { backgroundColor: isDark ? '#262626' : '#f4f4f5' }]}
              >
                <Ionicons name="chevron-back" size={20} color="#6366f1" />
              </TouchableOpacity>
              <Text style={[styles.monthTitle, { color: textColor }]}>
                {calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  const newMonth = new Date(calendarMonth);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setCalendarMonth(newMonth);
                }}
                style={[styles.navButton, { backgroundColor: isDark ? '#262626' : '#f4f4f5' }]}
              >
                <Ionicons name="chevron-forward" size={20} color="#6366f1" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.dayHeaders}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <Text key={day} style={[styles.dayHeader, { color: subtextColor }]}>{day}</Text>
              ))}
            </View>
            
            <View style={styles.calendarGrid}>
              {getDaysInMonth(calendarMonth).map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    isSameDay(day, value) && { backgroundColor: '#6366f1' },
                    isToday(day) && !isSameDay(day, value) && { borderColor: '#6366f1', borderWidth: 1 },
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
                      styles.dayText,
                      { color: textColor },
                      isSameDay(day, value) && { color: '#ffffff', fontWeight: '600' },
                      isToday(day) && !isSameDay(day, value) && { color: '#6366f1' },
                    ]}>
                      {day.getDate()}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: bgColor }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text style={[styles.cancelText, { color: subtextColor }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: textColor }]}>Select Time</Text>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.timeDisplay}>
            <Text style={[styles.timeText, { color: textColor }]}>{formatTime(value)}</Text>
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
                <Ionicons name="chevron-up" size={24} color="#6366f1" />
              </TouchableOpacity>
              <Text style={[styles.timeLabel, { color: subtextColor }]}>Hour</Text>
              <TouchableOpacity 
                onPress={() => {
                  const newDate = new Date(value);
                  newDate.setHours(newDate.getHours() + 1);
                  onSelect(newDate);
                }}
                style={styles.timeButton}
              >
                <Ionicons name="chevron-down" size={24} color="#6366f1" />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.timeSeparator, { color: textColor }]}>:</Text>
            
            <View style={styles.timeColumn}>
              <TouchableOpacity 
                onPress={() => {
                  const newDate = new Date(value);
                  newDate.setMinutes(newDate.getMinutes() - 15);
                  onSelect(newDate);
                }}
                style={styles.timeButton}
              >
                <Ionicons name="chevron-up" size={24} color="#6366f1" />
              </TouchableOpacity>
              <Text style={[styles.timeLabel, { color: subtextColor }]}>Min</Text>
              <TouchableOpacity 
                onPress={() => {
                  const newDate = new Date(value);
                  newDate.setMinutes(newDate.getMinutes() + 15);
                  onSelect(newDate);
                }}
                style={styles.timeButton}
              >
                <Ionicons name="chevron-down" size={24} color="#6366f1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  doneText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
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
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
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
    borderRadius: 20,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
  },
  timeDisplay: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '200',
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
    marginVertical: 4,
  },
  timeSeparator: {
    fontSize: 48,
    fontWeight: '200',
    marginHorizontal: 16,
  },
});
