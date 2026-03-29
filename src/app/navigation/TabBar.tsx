import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsive } from '../../hooks/useResponsive';
import { moderateScale } from '../../utils/responsive';

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

interface CustomTabBarProps extends BottomTabBarProps {
  onHeightChange?: (height: number) => void;
}

export default function TabBar({ state, descriptors, navigation, onHeightChange }: CustomTabBarProps) {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { fontSize, isTablet, isLandscape } = useResponsive();
  const isDark = colorScheme === "dark";
  const [tabBarHeight, setTabBarHeight] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && height !== tabBarHeight) {
      setTabBarHeight(height);
      onHeightChange?.(height);
    }
  };

  const iconSize = isTablet ? moderateScale(28) : moderateScale(24);
  const iconPadding = isTablet ? moderateScale(14) : moderateScale(10);
  const tabPadding = isTablet ? moderateScale(12) : moderateScale(8);
  const bottomPadding = Math.max(insets.bottom, moderateScale(16)) + moderateScale(8);

  return (
    <View
      onLayout={handleLayout}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: bottomPadding,
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
            style={{ flex: 1, alignItems: 'center', paddingVertical: tabPadding }}
          >
            <View style={{ 
              backgroundColor: isFocused ? colors.accentSelected : 'transparent',
              padding: iconPadding,
              borderRadius: moderateScale(16),
              width: moderateScale(48),
              height: moderateScale(48),
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <Ionicons
                name={Icon}
                size={iconSize}
                color={isFocused ? colors.accent : colors.textTertiary}
              />
            </View>
            <Text
              style={{
                fontFamily: 'Outfit-Medium',
                fontSize: fontSize.sm - 2,
                marginTop: moderateScale(2),
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