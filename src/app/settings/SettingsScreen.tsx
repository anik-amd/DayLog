import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Share, Alert, Modal, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from "nativewind";
import { getAppStats } from '../../database/entries';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [stats, setStats] = useState({ entries: 0, photos: 0 });
  const [showThemeModal, setShowThemeModal] = useState(false);

  const handleSetTheme = (theme: "light" | "dark" | "system") => {
    setColorScheme(theme);
    setShowThemeModal(false);
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
      <Text className="text-neutral-500 text-[11px] uppercase font-black tracking-widest px-6 mb-3">{title}</Text>
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
        <Text className="text-neutral-900 dark:text-neutral-200 font-medium text-[16px]">{label}</Text>
      </View>
      <View className="flex-row items-center">
        {value && <Text className="text-neutral-500 mr-2 text-[14px]">{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color="#d4d4d4" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-neutral-100 dark:bg-neutral-950">
      <View className="px-6 pt-14 pb-8 flex-row items-center">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="bg-white dark:bg-neutral-900 w-11 h-11 rounded-full items-center justify-center border border-neutral-200 dark:border-neutral-800 mr-5 shadow-sm"
        >
          <Ionicons name="arrow-back" size={22} color={colorScheme === 'dark' ? "#a3a3a3" : "#404040"} />
        </TouchableOpacity>
        <View>
          <Text className="text-neutral-900 dark:text-neutral-50 text-[32px] font-extrabold tracking-tight">Settings</Text>
          <Text className="text-neutral-500 font-medium mt-1">Configure your DayLog</Text>
        </View>
      </View>

      <Section title="Statistics">
         <View className="flex-row px-4 py-6 justify-around bg-white dark:bg-neutral-900">
            <View className="items-center">
                <Text className="text-indigo-600 dark:text-indigo-400 text-2xl font-black">{stats.entries}</Text>
                <Text className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest mt-1">Entries</Text>
            </View>
            <View className="w-[1px] h-10 bg-neutral-200 dark:bg-neutral-800" />
            <View className="items-center">
                <Text className="text-indigo-600 dark:text-indigo-400 text-2xl font-black">{stats.photos}</Text>
                <Text className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest mt-1">Photos</Text>
            </View>
         </View>
      </Section>

      <Section title="Appearance">
        <SettingItem 
            icon={colorScheme === 'dark' ? "moon" : "sunny"} 
            label="Theme" 
            value={colorScheme === 'dark' ? "Dark Mode" : "Light Mode"} 
            onPress={() => setShowThemeModal(true)} 
        />
        <SettingItem icon="text" label="Editor Font" value="System Default" onPress={() => {}} last />
      </Section>

      <Section title="Preferences">
        <SettingItem icon="notifications-outline" label="Reminders" value="Off" onPress={() => {}} />
        <SettingItem icon="cloud-upload-outline" label="Sync to Drive" value="Coming Soon" onPress={() => {}} last />
      </Section>

      <Section title="App">
        <SettingItem icon="share-outline" label="Tell a Friend" onPress={onShare} />
        <SettingItem icon="star-outline" label="Rate DayLog" onPress={() => {}} />
        <SettingItem icon="help-circle-outline" label="Support" onPress={() => {}} />
        <SettingItem icon="information-circle-outline" label="About DayLog" value="v1.0.0" onPress={() => {}} last />
      </Section>

      <View className="items-center pb-12 mt-4">
        <Text className="text-neutral-700 text-[12px] font-medium tracking-tight">Made with minimalism in mind.</Text>
      </View>

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
                    <Text className="text-neutral-900 dark:text-neutral-50 text-2xl font-black">Choose Theme</Text>
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
                            <Text className={`font-bold text-[16px] ml-3 ${colorScheme === 'light' ? 'text-indigo-600' : 'text-neutral-500'}`}>Light Mode</Text>
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
                            <Text className={`font-bold text-[16px] ml-3 ${colorScheme === 'dark' ? 'text-indigo-600' : 'text-neutral-500'}`}>Dark Mode</Text>
                        </View>
                        {colorScheme === 'dark' && <Ionicons name="checkmark-circle" size={20} color="#4f46e5" />}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => handleSetTheme('system')}
                        className="flex-row items-center justify-between p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-transparent border-2"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="settings-outline" size={20} color="#a3a3a3" className="mr-4" />
                            <Text className="font-bold text-neutral-500 text-[16px] ml-3">System Default</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
