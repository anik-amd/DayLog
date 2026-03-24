import './global.css';
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import RootNavigator from './src/app/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from "nativewind";
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_900Black } from '@expo-google-fonts/outfit';
import { getTheme } from './src/storage/settings';
import { ColorSchemeProvider } from './src/contexts/ColorSchemeContext';

function AppContent() {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    (async () => {
      const savedTheme = await getTheme();
      if (savedTheme) {
        setColorScheme(savedTheme);
      }
    })();
  }, []);

  return (
    <>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colorScheme === 'dark' ? '#09090b' : '#f5f5f4'}
      />
      <RootNavigator />
    </>
  );
}

export default function App() {
  const [fontsLoaded, error] = useFonts({
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
    'Outfit-Black': Outfit_900Black,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ColorSchemeProvider>
        <NavigationContainer theme={DarkTheme}>
          <AppContent />
        </NavigationContainer>
      </ColorSchemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090b',
  },
});
