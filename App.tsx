import './global.css';
import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import RootNavigator from './src/app/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={DarkTheme}>
        <StatusBar barStyle="light-content" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
