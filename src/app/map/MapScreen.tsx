import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from "nativewind";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapScreen() {
  const { colorScheme } = useColorScheme();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900" style={styles.container}>
      <View className="flex-1 items-center justify-center">
        <Text style={{ fontFamily: 'Outfit-Regular' }} className="text-neutral-400 dark:text-neutral-500 text-base">
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
