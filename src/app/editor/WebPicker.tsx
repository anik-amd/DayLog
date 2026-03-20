import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WebPickerProps {
  visible: boolean;
  type: 'date' | 'time';
  value: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

export default function WebPicker({ visible, type, value, onClose, onSelect }: WebPickerProps) {
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
        <View style={styles.card}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Select Date</Text>
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
              style={styles.navButton}
            >
              <Ionicons name="chevron-back" size={20} color="#6366f1" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                const newMonth = new Date(calendarMonth);
                newMonth.setMonth(newMonth.getMonth() + 1);
                setCalendarMonth(newMonth);
              }}
              style={styles.navButton}
            >
              <Ionicons name="chevron-forward" size={20} color="#6366f1" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.dayHeaders}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <Text key={day} style={styles.dayHeader}>{day}</Text>
            ))}
          </View>
          
          <View style={styles.calendarGrid}>
            {getDaysInMonth(calendarMonth).map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isSameDay(day, value) && styles.selectedDay,
                  isToday(day) && !isSameDay(day, value) && styles.todayDay,
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
                    isSameDay(day, value) && styles.selectedDayText,
                    isToday(day) && !isSameDay(day, value) && styles.todayDayText,
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
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Time</Text>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.timeDisplay}>
          <Text style={styles.timeText}>{formatTime(value)}</Text>
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
            <Text style={styles.timeLabel}>Hour</Text>
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
          
          <Text style={styles.timeSeparator}>:</Text>
          
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
            <Text style={styles.timeLabel}>Min</Text>
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
    backgroundColor: '#ffffff',
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
