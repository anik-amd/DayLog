import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from "nativewind";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function MapScreen() {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();

  return (
    <SafeAreaView className="flex-1" style={[styles.container, { backgroundColor: colors.background }]}>
      <View className="flex-1 items-center justify-center">
        <Text style={{ fontFamily: 'Outfit-Regular', color: colors.textTertiary, fontSize: 16 }}>
          Map coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
