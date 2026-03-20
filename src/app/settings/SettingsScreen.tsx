import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getAppStats } from '../../database/entries';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState({ entries: 0, photos: 0 });

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
      <View className="bg-neutral-900 border-y border-neutral-800/50">
        {children}
      </View>
    </View>
  );

  const SettingItem = ({ icon, label, value, onPress, last, color = "#a3a3a3" }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      className={`flex-row items-center justify-between px-6 py-4 ${!last ? 'border-b border-neutral-800/30' : ''}`}
    >
      <View className="flex-row items-center">
        <View className="w-8 h-8 rounded-lg bg-neutral-800 items-center justify-center mr-4">
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text className="text-neutral-200 font-medium text-[16px]">{label}</Text>
      </View>
      <View className="flex-row items-center">
        {value && <Text className="text-neutral-500 mr-2 text-[14px]">{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color="#404040" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-neutral-950">
      <View className="px-6 pt-14 pb-8 flex-row items-center">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="bg-neutral-900 w-11 h-11 rounded-full items-center justify-center border border-neutral-800 mr-5"
        >
          <Ionicons name="arrow-back" size={22} color="#a3a3a3" />
        </TouchableOpacity>
        <View>
          <Text className="text-neutral-50 text-[32px] font-extrabold tracking-tight">Settings</Text>
          <Text className="text-neutral-500 font-medium mt-1">Configure your DayLog</Text>
        </View>
      </View>

      <Section title="Statistics">
         <View className="flex-row px-4 py-6 justify-around bg-neutral-900">
            <View className="items-center">
                <Text className="text-indigo-400 text-2xl font-black">{stats.entries}</Text>
                <Text className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest mt-1">Entries</Text>
            </View>
            <View className="w-[1px] h-10 bg-neutral-800" />
            <View className="items-center">
                <Text className="text-indigo-400 text-2xl font-black">{stats.photos}</Text>
                <Text className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest mt-1">Photos</Text>
            </View>
         </View>
      </Section>

      <Section title="Appearance">
        <SettingItem icon="moon" label="Theme" value="Dark Only (MVP)" onPress={() => {}} />
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
    </ScrollView>
  );
}
