import React from 'react';
import { View, Text, Button } from 'react-native';

export default function EntriesScreen({ navigation }: any) {
  return (
    <View className="flex-1 items-center justify-center bg-zinc-900">
      <Text className="text-white text-xl mb-4 font-bold">Entries Timeline</Text>
      <Text className="text-zinc-400 mb-8 max-w-xs text-center">
        This is where the entries timeline will appear.
      </Text>
      <Button
        title="Go to Settings"
        color="#a1a1aa"
        onPress={() => navigation.navigate('Settings')}
      />
    </View>
  );
}
