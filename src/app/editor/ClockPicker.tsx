import React, { useState } from 'react';
import { View, Text as RNText, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { useColorScheme } from "nativewind";
import { useThemeColors } from '../../hooks/useThemeColors';

interface ClockPickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

export default function ClockPicker({ value, onChange }: ClockPickerProps) {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();
  const isDark = colorScheme === 'dark';
  
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');
  
  const size = 240;
  const center = size / 2;
  const radius = size / 2 - 30;
  
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 15, 30, 45];
  
  const currentHour = value.getHours() % 12 || 12;
  const currentMinute = value.getMinutes();
  const isPM = value.getHours() >= 12;
  
  const getPosition = (value: number, max: number, r: number) => {
    const angle = (value / max) * 2 * Math.PI - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };
  
  const handleHourSelect = (hour: number) => {
    const newDate = new Date(value);
    let h = hour;
    if (isPM && hour !== 12) h = hour + 12;
    if (!isPM && hour === 12) h = 0;
    newDate.setHours(h);
    onChange(newDate);
    setMode('minute');
  };
  
  const handleMinuteSelect = (minute: number) => {
    const newDate = new Date(value);
    newDate.setMinutes(minute);
    onChange(newDate);
  };
  
  const handleAmPmToggle = (pm: boolean) => {
    const newDate = new Date(value);
    const currentHour = newDate.getHours();
    if (pm && currentHour < 12) {
      newDate.setHours(currentHour + 12);
    } else if (!pm && currentHour >= 12) {
      newDate.setHours(currentHour - 12);
    }
    onChange(newDate);
  };
  
  const hourAngle = ((currentHour + currentMinute / 60) / 12) * 360;
  const minuteAngle = (currentMinute / 60) * 360;
  
  const hourHandEnd = getPosition(currentHour + currentMinute / 60, 12, radius * 0.5);
  const minuteHandEnd = getPosition(currentMinute / 15, 4, radius * 0.7);
  
  const textColor = colors.text;
  const subtextColor = colors.textSecondary;
  const accentColor = colors.accent;
  const bgColor = colors.surface;
  
  return (
    <View style={styles.container}>
      {/* Time Display */}
      <View style={styles.timeDisplay}>
        <TouchableOpacity onPress={() => setMode('hour')}>
          <RNText style={[styles.timeUnit, { color: mode === 'hour' ? accentColor : textColor }]}>
            {currentHour.toString().padStart(2, '0')}
          </RNText>
        </TouchableOpacity>
        <RNText style={[styles.timeSeparator, { color: textColor }]}>:</RNText>
        <TouchableOpacity onPress={() => setMode('minute')}>
          <RNText style={[styles.timeUnit, { color: mode === 'minute' ? accentColor : textColor }]}>
            {currentMinute.toString().padStart(2, '0')}
          </RNText>
        </TouchableOpacity>
      </View>
      
      {/* AM/PM Toggle */}
      <View style={styles.amPmContainer}>
        <TouchableOpacity
          onPress={() => handleAmPmToggle(false)}
          style={[
            styles.amPmButton,
            !isPM && { backgroundColor: accentColor },
            !isPM ? {} : { backgroundColor: bgColor }
          ]}
        >
          <RNText style={[styles.amPmText, { color: !isPM ? '#fff' : textColor }]}>AM</RNText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleAmPmToggle(true)}
          style={[
            styles.amPmButton,
            isPM && { backgroundColor: accentColor },
            isPM ? {} : { backgroundColor: bgColor }
          ]}
        >
          <RNText style={[styles.amPmText, { color: isPM ? '#fff' : textColor }]}>PM</RNText>
        </TouchableOpacity>
      </View>
      
      {/* Circular Clock */}
      <View style={styles.clockContainer}>
        <Svg width={size} height={size}>
          {/* Outer circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.border}
            strokeWidth={2}
            fill={bgColor}
          />
          
          {/* Hour hand */}
          {mode === 'hour' && (
            <Line
              x1={center}
              y1={center}
              x2={hourHandEnd.x}
              y2={hourHandEnd.y}
              stroke={accentColor}
              strokeWidth={4}
              strokeLinecap="round"
            />
          )}
          
          {/* Minute hand */}
          {mode === 'minute' && (
            <Line
              x1={center}
              y1={center}
              x2={minuteHandEnd.x}
              y2={minuteHandEnd.y}
              stroke={accentColor}
              strokeWidth={3}
              strokeLinecap="round"
            />
          )}
          
          {/* Center dot */}
          <Circle cx={center} cy={center} r={8} fill={accentColor} />
        </Svg>
        
        {/* Hour numbers */}
        {mode === 'hour' && hours.map((h) => {
          const pos = getPosition(h, 12, radius - 15);
          return (
            <TouchableOpacity
              key={h}
              style={[
                styles.numberButton,
                {
                  left: pos.x - 18,
                  top: pos.y - 18,
                  backgroundColor: currentHour === h ? accentColor : 'transparent',
                  borderRadius: currentHour === h ? 18 : 0,
                },
              ]}
              onPress={() => handleHourSelect(h)}
            >
              <RNText style={[
                styles.numberText,
                { color: currentHour === h ? '#fff' : textColor },
              ]}>
                {h}
              </RNText>
            </TouchableOpacity>
          );
        })}
        
        {/* Minute numbers */}
        {mode === 'minute' && minutes.map((m) => {
          const pos = getPosition(m / 15, 4, radius - 15);
          return (
            <TouchableOpacity
              key={m}
              style={[
                styles.numberButton,
                {
                  left: pos.x - 18,
                  top: pos.y - 18,
                  backgroundColor: currentMinute === m ? accentColor : 'transparent',
                  borderRadius: currentMinute === m ? 18 : 0,
                },
              ]}
              onPress={() => handleMinuteSelect(m)}
            >
              <RNText style={[
                styles.numberText,
                { color: currentMinute === m ? '#fff' : textColor },
              ]}>
                {m.toString().padStart(2, '0')}
              </RNText>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Mode indicator */}
      <RNText style={[styles.modeHint, { color: subtextColor }]}>
        Tap center to switch: {mode === 'hour' ? 'Hours' : 'Minutes'}
      </RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeUnit: {
    fontSize: 48,
    fontWeight: '200',
    width: 80,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 48,
    fontWeight: '200',
  },
  amPmContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
   amPmButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  amPmText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clockContainer: {
    position: 'relative',
    width: 240,
    height: 240,
  },
  numberButton: {
    position: 'absolute',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modeHint: {
    marginTop: 16,
    fontSize: 12,
  },
});
