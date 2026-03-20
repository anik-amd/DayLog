import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EntriesScreen from '../entries/EntriesScreen';
import SettingsScreen from '../settings/SettingsScreen';
import FullScreenEditor from '../editor/FullScreenEditor';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#18181b' }, // zinc-900
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#18181b' } // ensure dark mode default background is consistent
      }}
    >
      <Stack.Screen name="Entries" component={EntriesScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen 
        name="FullScreenEditor" 
        component={FullScreenEditor} 
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
    </Stack.Navigator>
  );
}
