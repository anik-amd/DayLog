import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Share, Alert, Modal, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from "nativewind";
import { getAppStats } from '../../database/entries';
import { useBackupEngine } from '../../services/BackupEngine';
import { getTemperatureUnit, setTemperatureUnit, getTheme, setTheme, getColorScheme } from '../../storage/settings';
import { colorSchemes } from '../../themes/colors';
import { useColorSchemeContext } from '../../contexts/ColorSchemeContext';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colorScheme, setColorScheme } = useColorScheme();
  const { setSchemeName } = useColorSchemeContext();
  const [stats, setStats] = useState({ entries: 0, photos: 0 });
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showTempModal, setShowTempModal] = useState(false);
  const [showColorSchemeModal, setShowColorSchemeModal] = useState(false);
  const [temperatureUnit, setTemperatureUnitState] = useState<'c' | 'f'>('c');
  const [savedTheme, setSavedTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [savedColorScheme, setSavedColorScheme] = useState<string>('default');
  const [lastSync, setLastSync] = useState<string>("Never");
  const [syncing, setSyncing] = useState(false);

  const { promptAsync, response, uploadBackup } = useBackupEngine();

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        setSyncing(true);
        uploadBackup(authentication.accessToken).then(success => {
            if (success) {
                setLastSync(new Date().toLocaleString());
                Alert.alert("Backup Successful", "Your DayLog has been safely uploaded to Google Drive.");
            } else {
                Alert.alert("Backup Failed", "We couldn't reach Google Drive. Please check your connection.");
            }
            setSyncing(false);
        });
      }
    }
  }, [response]);

  useEffect(() => {
    (async () => {
      const unit = await getTemperatureUnit();
      setTemperatureUnitState(unit);
      const theme = await getTheme();
      setSavedTheme(theme);
      const scheme = await getColorScheme();
      setSavedColorScheme(scheme);
    })();
  }, []);

  const handleSetTheme = async (theme: "light" | "dark" | "system") => {
    setColorScheme(theme);
    setSavedTheme(theme);
    await setTheme(theme);
    setShowThemeModal(false);
  };

  const handleSetColorScheme = async (scheme: string) => {
    await setSchemeName(scheme);
    setSavedColorScheme(scheme);
    setShowColorSchemeModal(false);
  };

  const handleSetTempUnit = async (unit: 'c' | 'f') => {
    await setTemperatureUnit(unit);
    setTemperatureUnitState(unit);
    setShowTempModal(false);
  };

  const handleBackup = () => {
    promptAsync();
  };

  const fetchStats = async () => {
    const data = await getAppStats();
    setStats(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onShare = async () => {
    try {
      await Share.share({
        message: 'DayLog - A minimal, offline-first personal journal. Download it now!',
      });
    } catch (error) {
      console.log(error);
    }
  };

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View className="mb-8">
      <Text style={{ fontFamily: 'Outfit-Black' }} className="text-neutral-500 text-[11px] uppercase tracking-widest px-6 mb-3">{title}</Text>
      <View className="bg-white dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800/50">
        {children}
      </View>
    </View>
  );

  const SettingItem = ({ icon, label, value, onPress, last, color = "#a3a3a3" }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      className={`flex-row items-center justify-between px-6 py-4 ${!last ? 'border-b border-neutral-200 dark:border-neutral-800/30' : ''}`}
    >
      <View className="flex-row items-center">
        <View className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 items-center justify-center mr-4">
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={{ fontFamily: 'Outfit-Medium' }} className="text-neutral-900 dark:text-neutral-200 text-[16px]">{label}</Text>
      </View>
      <View className="flex-row items-center">
        {value && <Text style={{ fontFamily: 'Outfit-Regular' }} className="text-neutral-500 mr-2 text-[14px]">{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color="#d4d4d4" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-14 pb-8 flex-row items-center">
            <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="bg-white dark:bg-neutral-900 w-11 h-11 rounded-full items-center justify-center border border-neutral-200 dark:border-neutral-800 mr-5 shadow-sm"
            >
            <Ionicons name="arrow-back" size={22} color={colorScheme === 'dark' ? "#a3a3a3" : "#404040"} />
            </TouchableOpacity>
            <View>
            <Text style={{ fontFamily: 'Outfit-Black' }} className="text-neutral-900 dark:text-neutral-50 text-[32px] tracking-tight">Settings</Text>
            <Text style={{ fontFamily: 'Outfit-Regular' }} className="text-neutral-500 mt-1">Configure your DayLog</Text>
            </View>
        </View>

        <Section title="Statistics">
            <View className="flex-row px-4 py-6 justify-around bg-white dark:bg-neutral-900">
                <View className="items-center">
                    <Text style={{ fontFamily: 'Outfit-Black' }} className="text-indigo-600 dark:text-indigo-400 text-2xl">{stats.entries}</Text>
                    <Text style={{ fontFamily: 'Outfit-Black' }} className="text-neutral-500 text-[10px] uppercase tracking-widest mt-1">Entries</Text>
                </View>
                <View className="w-[1px] h-10 bg-neutral-200 dark:bg-neutral-800" />
                <View className="items-center">
                    <Text style={{ fontFamily: 'Outfit-Black' }} className="text-indigo-600 dark:text-indigo-400 text-2xl">{stats.photos}</Text>
                    <Text style={{ fontFamily: 'Outfit-Black' }} className="text-neutral-500 text-[10px] uppercase tracking-widest mt-1">Photos</Text>
                </View>
            </View>
        </Section>

         <Section title="Appearance">
              <SettingItem 
                  icon={colorScheme === 'dark' ? "moon" : "sunny"} 
                  label="Theme" 
                  value={savedTheme === 'system' ? "System Default" : (colorScheme === 'dark' ? "Dark Mode" : "Light Mode")} 
                  onPress={() => setShowThemeModal(true)} 
              />
              <SettingItem 
                  icon="color-palette-outline" 
                  label="Color Scheme" 
                  value={colorSchemes[savedColorScheme]?.name || 'Default'} 
                  onPress={() => setShowColorSchemeModal(true)} 
              />
            <SettingItem icon="text" label="Editor Font" value="System Default" onPress={() => {}} last />
        </Section>

        <Section title="Cloud Sync">
            <SettingItem 
                icon="cloud-done-outline" 
                label={syncing ? "Backing up..." : "Google Drive Backup"} 
                value={response?.type === 'success' ? "Connected" : "Connect"} 
                onPress={handleBackup} 
                color={syncing ? "#6366f1" : undefined}
            />
            <SettingItem 
                icon="refresh-outline" 
                label="Last Synchronized" 
                value={lastSync} 
                onPress={() => {}} 
                last 
            />
        </Section>

        <Section title="Preferences">
            <SettingItem 
                icon="thermometer-outline" 
                label="Temperature Unit" 
                value={temperatureUnit === 'c' ? 'Celsius (°C)' : 'Fahrenheit (°F)'} 
                onPress={() => setShowTempModal(true)} 
            />
            <SettingItem icon="notifications-outline" label="Reminders" value="Off" onPress={() => {}} />
            <SettingItem icon="cloud-upload-outline" label="Automated Sync" value="Coming Soon" onPress={() => {}} last />
        </Section>

        <Section title="App">
            <SettingItem icon="share-outline" label="Tell a Friend" onPress={onShare} />
            <SettingItem icon="star-outline" label="Rate DayLog" onPress={() => {}} />
            <SettingItem icon="help-circle-outline" label="Support" onPress={() => {}} />
            <SettingItem icon="information-circle-outline" label="About DayLog" value="v1.0.0" onPress={() => {}} last />
        </Section>

        <View className="items-center pb-12 mt-4">
            <Text style={{ fontFamily: 'Outfit-Medium' }} className="text-neutral-700 text-[12px] tracking-tight">Made with minimalism in mind.</Text>
        </View>
      </ScrollView>

      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <Pressable 
            className="flex-1 bg-black/60 items-center justify-end"
            onPress={() => setShowThemeModal(false)}
        >
            <View className="bg-white dark:bg-neutral-900 w-full rounded-t-[40px] px-8 pt-10 pb-16 shadow-2xl">
                <View className="flex-row items-center justify-between mb-8">
                    <Text style={{ fontFamily: 'Outfit-Black' }} className="text-neutral-900 dark:text-neutral-50 text-2xl">Choose Theme</Text>
                    <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                        <Ionicons name="close" size={24} color="#737373" />
                    </TouchableOpacity>
                </View>

                <View className="space-y-3">
                    <TouchableOpacity 
                        onPress={() => handleSetTheme('light')}
                        className={`flex-row items-center justify-between p-5 rounded-2xl border-2 ${
                            colorScheme === 'light' ? 'bg-indigo-50 border-indigo-500' : 'bg-neutral-50 dark:bg-neutral-800 border-transparent'
                        }`}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="sunny" size={20} color={colorScheme === 'light' ? "#4f46e5" : "#a3a3a3"} className="mr-4" />
                            <Text style={{ fontFamily: 'Outfit-SemiBold' }} className={`text-[16px] ml-3 ${colorScheme === 'light' ? 'text-indigo-600' : 'text-neutral-500'}`}>Light Mode</Text>
                        </View>
                        {colorScheme === 'light' && <Ionicons name="checkmark-circle" size={20} color="#4f46e5" />}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => handleSetTheme('dark')}
                        className={`flex-row items-center justify-between p-5 rounded-2xl border-2 ${
                            colorScheme === 'dark' ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500' : 'bg-neutral-50 dark:bg-neutral-800 border-transparent'
                        }`}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="moon" size={20} color={colorScheme === 'dark' ? "#4f46e5" : "#a3a3a3"} className="mr-4" />
                            <Text style={{ fontFamily: 'Outfit-SemiBold' }} className={`text-[16px] ml-3 ${colorScheme === 'dark' ? 'text-indigo-600' : 'text-neutral-500'}`}>Dark Mode</Text>
                        </View>
                        {colorScheme === 'dark' && <Ionicons name="checkmark-circle" size={20} color="#4f46e5" />}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => handleSetTheme('system')}
                        className="flex-row items-center justify-between p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-transparent border-2"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="settings-outline" size={20} color="#a3a3a3" className="mr-4" />
                            <Text style={{ fontFamily: 'Outfit-SemiBold' }} className="text-neutral-500 text-[16px] ml-3">System Default</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showTempModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTempModal(false)}
      >
        <Pressable 
            className="flex-1 bg-black/60 items-center justify-end"
            onPress={() => setShowTempModal(false)}
        >
            <View className="bg-white dark:bg-neutral-900 w-full rounded-t-[40px] px-8 pt-10 pb-16 shadow-2xl">
                <View className="flex-row items-center justify-between mb-8">
                    <Text style={{ fontFamily: 'Outfit-Black' }} className="text-neutral-900 dark:text-neutral-50 text-2xl">Temperature Unit</Text>
                    <TouchableOpacity onPress={() => setShowTempModal(false)}>
                        <Ionicons name="close" size={24} color="#737373" />
                    </TouchableOpacity>
                </View>

                <View className="space-y-3">
                    <TouchableOpacity 
                        onPress={() => handleSetTempUnit('c')}
                        className={`flex-row items-center justify-between p-5 rounded-2xl border-2 ${
                            temperatureUnit === 'c' ? 'bg-indigo-50 border-indigo-500' : 'bg-neutral-50 dark:bg-neutral-800 border-transparent'
                        }`}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="thermometer" size={20} color={temperatureUnit === 'c' ? "#4f46e5" : "#a3a3a3"} className="mr-4" />
                            <Text style={{ fontFamily: 'Outfit-SemiBold' }} className={`text-[16px] ml-3 ${temperatureUnit === 'c' ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-500'}`}>Celsius (°C)</Text>
                        </View>
                        {temperatureUnit === 'c' && <Ionicons name="checkmark-circle" size={20} color="#4f46e5" />}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => handleSetTempUnit('f')}
                        className={`flex-row items-center justify-between p-5 rounded-2xl border-2 ${
                            temperatureUnit === 'f' ? 'bg-indigo-50 border-indigo-500' : 'bg-neutral-50 dark:bg-neutral-800 border-transparent'
                        }`}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="thermometer" size={20} color={temperatureUnit === 'f' ? "#4f46e5" : "#a3a3a3"} className="mr-4" />
                            <Text style={{ fontFamily: 'Outfit-SemiBold' }} className={`text-[16px] ml-3 ${temperatureUnit === 'f' ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-500'}`}>Fahrenheit (°F)</Text>
                        </View>
                        {temperatureUnit === 'f' && <Ionicons name="checkmark-circle" size={20} color="#4f46e5" />}
                    </TouchableOpacity>
                </View>
            </View>
        </Pressable>
      </Modal>

      {/* Color Scheme Modal */}
      <Modal
        visible={showColorSchemeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowColorSchemeModal(false)}
      >
        <Pressable 
            className="flex-1 bg-black/60 items-center justify-end"
            onPress={() => setShowColorSchemeModal(false)}
        >
            <View className="bg-white dark:bg-neutral-900 w-full rounded-t-[40px] px-8 pt-10 pb-16 shadow-2xl">
                <View className="flex-row items-center justify-between mb-8">
                    <Text style={{ fontFamily: 'Outfit-Black' }} className="text-neutral-900 dark:text-neutral-50 text-2xl">Color Scheme</Text>
                    <TouchableOpacity onPress={() => setShowColorSchemeModal(false)}>
                        <Ionicons name="close" size={24} color="#737373" />
                    </TouchableOpacity>
                </View>

                <View className="space-y-3">
                    {Object.entries(colorSchemes).map(([key, scheme]) => (
                        <TouchableOpacity 
                            key={key}
                            onPress={() => handleSetColorScheme(key)}
                            className={`flex-row items-center justify-between p-5 rounded-2xl border-2 ${
                                savedColorScheme === key ? 'bg-indigo-50 border-indigo-500' : 'bg-neutral-50 dark:bg-neutral-800 border-transparent'
                            }`}
                        >
                            <View className="flex-row items-center">
                                <View className="flex-row mr-3">
                                    <View style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: scheme.light.accent, marginRight: 4 }} />
                                    <View style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: scheme.dark.accent }} />
                                </View>
                                <Text style={{ fontFamily: 'Outfit-SemiBold' }} className={`text-[16px] ${savedColorScheme === key ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-500'}`}>{scheme.name}</Text>
                            </View>
                            {savedColorScheme === key && <Ionicons name="checkmark-circle" size={20} color="#4f46e5" />}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Pressable>
      </Modal>
    </View>
  );
}
