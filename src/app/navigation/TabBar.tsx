import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';

type TabRoute = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const tabs: TabRoute[] = [
  { name: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { name: 'Map', icon: 'map-outline', activeIcon: 'map' },
  { name: 'Search', icon: 'search-outline', activeIcon: 'search' },
];

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: Math.max(insets.bottom, 16) + 8,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 50,
        flexDirection: 'row',
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = typeof (options.tabBarLabel ?? options.title ?? route.name) === 'string'
          ? (options.tabBarLabel ?? options.title ?? route.name) as string
          : route.name;
        const isFocused = state.index === index;
        const tab = tabs.find(t => t.name === route.name) || tabs[0];
        const Icon = isFocused ? tab.activeIcon : tab.icon;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 8 }}
          >
            <View style={{
              backgroundColor: isFocused ? colors.accentLight : 'transparent',
              padding: 6,
              borderRadius: 12
            }}>
              <Ionicons
                name={Icon}
                size={20}
                color={isFocused ? colors.accent : colors.textTertiary}
              />
            </View>
            <Text
              style={{
                fontFamily: 'Outfit-Medium',
                fontSize: 10,
                marginTop: 2,
                color: isFocused ? colors.accent : colors.textTertiary,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
