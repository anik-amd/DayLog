import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from "nativewind";
import EntriesScreen from '../entries/EntriesScreen';
import SettingsScreen from '../settings/SettingsScreen';
import FullScreenEditor from '../editor/FullScreenEditor';
import ReadEntryScreen from '../entries/ReadEntryScreen';
import MapScreen from '../map/MapScreen';
import SearchScreen from '../search/SearchScreen';
import TabBar from './TabBar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  const { colorScheme } = useColorScheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colorScheme === 'dark' ? '#171717' : '#ffffff' }
      }}
    >
      <Stack.Screen name="Entries" component={EntriesScreen} />
      <Stack.Screen
        name="ReadEntry"
        component={ReadEntryScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="FullScreenEditor"
        component={FullScreenEditor}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
    </Tab.Navigator>
  );
}
