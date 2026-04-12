import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Alert, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from "nativewind";
import { getAppStats } from '../../database/entries';
import { getGoogleAuthRequest, shareBackupFile, getBackupInfo, BackupInfo } from '../../services/BackupService';
import { restoreFromString } from '../../services/RestoreService';
import { getTemperatureUnit, setTemperatureUnit, getTheme, setTheme, getColorScheme } from '../../storage/settings';
import { colorSchemes } from '../../themes/colors';
import { useColorSchemeContext } from '../../contexts/ColorSchemeContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsive } from '../../hooks/useResponsive';
import { moderateScale } from '../../utils/responsive';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colorScheme, setColorScheme } = useColorScheme();
  const colors = useThemeColors();
  const { setSchemeName } = useColorSchemeContext();
  const { fontSize, spacing, isTablet } = useResponsive();
  const [stats, setStats] = useState({ entries: 0, photos: 0 });
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showTempModal, setShowTempModal] = useState(false);
  const [showColorSchemeModal, setShowColorSchemeModal] = useState(false);
  const [temperatureUnit, setTemperatureUnitState] = useState<'c' | 'f'>('c');
  const [savedTheme, setSavedTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [savedColorScheme, setSavedColorScheme] = useState<string>('default');
  const [lastSync, setLastSync] = useState<string>("Never");
  const [syncing, setSyncing] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('');

  const [request, response, promptAsync] = getGoogleAuthRequest();
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        setSyncing(true);
        const { uploadBackupToDrive } = require('../../services/BackupService');
        uploadBackupToDrive(authentication.accessToken).then((success: boolean) => {
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
      try {
        const info = await getBackupInfo();
        setBackupInfo(info);
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const unit = await getTemperatureUnit();
      setTemperatureUnitState(unit);
      const theme = await getTheme();
      setSavedTheme(theme);
      const scheme = await getColorScheme();
      setSavedColorScheme(scheme);
      setAppVersion(Constants.expoConfig?.version || '0.0.0');
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

  const handleExportBackup = async () => {
    try {
      const success = await shareBackupFile();
      if (success) {
        Alert.alert("Backup Created", "Your backup file has been downloaded.");
      }
    } catch (error) {
      Alert.alert("Backup Failed", "Could not create backup file.");
    }
  };

  const handleRestore = async () => {
    Alert.alert(
      "Restore Backup",
      "This will replace all current entries with the backup. This cannot be undone. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: () => {
            setShowRestoreModal(true);
          },
        },
      ]
    );
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
      const { Platform } = require('react-native');
      const { shareBackupFile } = require('../../services/BackupService');
      await shareBackupFile();
    } catch (error) {
      console.log(error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View className="mb-8">
      <Text style={{ fontFamily: 'Outfit-Black', color: colors.textTertiary, fontSize: fontSize.sm - 1, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>{title}</Text>
      <View style={{ backgroundColor: colors.surface, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border }}>
        {children}
      </View>
    </View>
  );

  const SettingItem = ({ icon, label, value, onPress, last, color = colors.textSecondary }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: last ? 0 : 1, borderColor: colors.border }}
    >
      <View className="flex-row items-center">
        <View style={{ width: moderateScale(32), height: moderateScale(32), borderRadius: moderateScale(8), backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md }}>
          <Ionicons name={icon} size={moderateScale(18)} color={color} />
        </View>
        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: fontSize.md, color: colors.text }}>{label}</Text>
      </View>
      <View className="flex-row items-center">
        {value && <Text style={{ fontFamily: 'Outfit-Regular', fontSize: fontSize.sm, color: colors.textSecondary, marginRight: spacing.sm }}>{value}</Text>}
        <Ionicons name="chevron-forward" size={moderateScale(16)} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-14 pb-8 flex-row items-center">
            <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{ width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(22), backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, marginRight: spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
            >
            <Ionicons name="arrow-back" size={moderateScale(22)} color={colors.textSecondary} />
            </TouchableOpacity>
            <View>
            <Text style={{ fontFamily: 'Outfit-Black', fontSize: fontSize.title, color: colors.text, letterSpacing: -0.5 }}>Settings</Text>
            <Text style={{ fontFamily: 'Outfit-Regular', fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.xs }}>Configure your DayLog</Text>
            </View>
        </View>

        <Section title="Statistics">
            <View style={{ flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.lg, justifyContent: 'space-around', backgroundColor: colors.surface }}>
                <View className="items-center">
                    <Text style={{ fontFamily: 'Outfit-Black', fontSize: fontSize.xl, color: colors.accent }}>{stats.entries}</Text>
                    <Text style={{ fontFamily: 'Outfit-Black', color: colors.textTertiary, fontSize: fontSize.xs, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.xs }}>Entries</Text>
                </View>
                <View style={{ width: 1, height: moderateScale(40), backgroundColor: colors.border }} />
                <View className="items-center">
                    <Text style={{ fontFamily: 'Outfit-Black', fontSize: fontSize.xl, color: colors.accent }}>{stats.photos}</Text>
                    <Text style={{ fontFamily: 'Outfit-Black', color: colors.textTertiary, fontSize: fontSize.xs, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.xs }}>Photos</Text>
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

         <Section title="Backup & Restore">
            <SettingItem 
                icon="cloud-upload-outline" 
                label={syncing ? "Backing up..." : "Backup to Google Drive"} 
                value={backupInfo ? `${backupInfo.entryCount} entries` : "Export"} 
                onPress={handleBackup} 
                color={syncing ? colors.accent : colors.textSecondary}
            />
            <SettingItem 
                icon="download-outline" 
                label="Download Backup" 
                value={backupInfo ? formatBytes(backupInfo.size) : ""} 
                onPress={handleExportBackup} 
            />
            <SettingItem 
                icon="cloud-download-outline" 
                label="Restore from Backup" 
                value="" 
                onPress={handleRestore} 
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
            <SettingItem icon="information-circle-outline" label="About DayLog" value={appVersion ? `v${appVersion}` : ''} onPress={() => {}} last />
        </Section>

        <View className="items-center pb-12 mt-4">
            <Text style={{ fontFamily: 'Outfit-Medium', fontSize: 12, color: colors.textSecondary }}>Made with minimalism in mind.</Text>
        </View>
      </ScrollView>

      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <Pressable 
            className="flex-1 items-center justify-end"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onPress={() => setShowThemeModal(false)}
        >
            <View style={{ backgroundColor: colors.surface, width: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 32, paddingTop: 40, paddingBottom: 64, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}>
                <View className="flex-row items-center justify-between mb-8">
                    <Text style={{ fontFamily: 'Outfit-Black', fontSize: 24, color: colors.text }}>Choose Theme</Text>
                    <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                        <Ionicons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

            <View style={{ gap: spacing.sm }}>
              <TouchableOpacity
                onPress={() => handleSetTheme('light')}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 16, borderWidth: 2,
                  backgroundColor: colorScheme === 'light' ? colors.accentLight : colors.surfaceElevated,
                  borderColor: colorScheme === 'light' ? colors.accent : 'transparent'
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="sunny" size={20} color={colorScheme === 'light' ? colors.accent : colors.textSecondary} style={{ marginRight: 16 }} />
                  <Text style={{ fontFamily: 'Outfit-SemiBold', fontSize: 16, color: colorScheme === 'light' ? colors.accent : colors.textSecondary }}>Light Mode</Text>
                </View>
                {colorScheme === 'light' && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSetTheme('dark')}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 16, borderWidth: 2,
                  backgroundColor: colorScheme === 'dark' ? colors.accentLight : colors.surfaceElevated,
                  borderColor: colorScheme === 'dark' ? colors.accent : 'transparent'
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="moon" size={20} color={colorScheme === 'dark' ? colors.accent : colors.textSecondary} style={{ marginRight: 16 }} />
                  <Text style={{ fontFamily: 'Outfit-SemiBold', fontSize: 16, color: colorScheme === 'dark' ? colors.accent : colors.textSecondary }}>Dark Mode</Text>
                </View>
                {colorScheme === 'dark' && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSetTheme('system')}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 16, borderWidth: 2,
                  backgroundColor: colors.surfaceElevated,
                  borderColor: 'transparent'
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="settings-outline" size={20} color={colors.textSecondary} style={{ marginRight: 16 }} />
                  <Text style={{ fontFamily: 'Outfit-SemiBold', fontSize: 16, color: colors.textSecondary }}>System Default</Text>
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
            className="flex-1 items-center justify-end"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onPress={() => setShowTempModal(false)}
        >
            <View style={{ backgroundColor: colors.surface, width: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 32, paddingTop: 40, paddingBottom: 64, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}>
                <View className="flex-row items-center justify-between mb-8">
                    <Text style={{ fontFamily: 'Outfit-Black', fontSize: 24, color: colors.text }}>Temperature Unit</Text>
                    <TouchableOpacity onPress={() => setShowTempModal(false)}>
                        <Ionicons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

            <View style={{ gap: spacing.sm }}>
              <TouchableOpacity
                onPress={() => handleSetTempUnit('c')}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 16, borderWidth: 2,
                  backgroundColor: temperatureUnit === 'c' ? colors.accentLight : colors.surfaceElevated,
                  borderColor: temperatureUnit === 'c' ? colors.accent : 'transparent'
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="thermometer" size={20} color={temperatureUnit === 'c' ? colors.accent : colors.textSecondary} style={{ marginRight: 16 }} />
                  <Text style={{ fontFamily: 'Outfit-SemiBold', fontSize: 16, color: temperatureUnit === 'c' ? colors.accent : colors.textSecondary }}>Celsius (°C)</Text>
                </View>
                {temperatureUnit === 'c' && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSetTempUnit('f')}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 16, borderWidth: 2,
                  backgroundColor: temperatureUnit === 'f' ? colors.accentLight : colors.surfaceElevated,
                  borderColor: temperatureUnit === 'f' ? colors.accent : 'transparent'
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="thermometer" size={20} color={temperatureUnit === 'f' ? colors.accent : colors.textSecondary} style={{ marginRight: 16 }} />
                  <Text style={{ fontFamily: 'Outfit-SemiBold', fontSize: 16, color: temperatureUnit === 'f' ? colors.accent : colors.textSecondary }}>Fahrenheit (°F)</Text>
                </View>
                {temperatureUnit === 'f' && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
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
            className="flex-1 items-center justify-end"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onPress={() => setShowColorSchemeModal(false)}
        >
            <View style={{ backgroundColor: colors.surface, width: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 32, paddingTop: 40, paddingBottom: 64, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}>
                <View className="flex-row items-center justify-between mb-8">
                    <Text style={{ fontFamily: 'Outfit-Black', fontSize: 24, color: colors.text }}>Color Scheme</Text>
                    <TouchableOpacity onPress={() => setShowColorSchemeModal(false)}>
                        <Ionicons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

            <View style={{ gap: spacing.sm }}>
              {Object.entries(colorSchemes).map(([key, scheme]) => (
                        <TouchableOpacity 
                            key={key}
                            onPress={() => handleSetColorScheme(key)}
                            style={{
                                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 16, borderWidth: 2,
                                backgroundColor: savedColorScheme === key ? colors.accentLight : colors.surfaceElevated,
                                borderColor: savedColorScheme === key ? colors.accent : 'transparent'
                            }}
                        >
                            <View className="flex-row items-center">
                                <View className="flex-row mr-3">
                                    <View style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: scheme.light.accent, marginRight: 4 }} />
                                    <View style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: scheme.dark.accent }} />
                                </View>
                                <Text style={{ fontFamily: 'Outfit-SemiBold', fontSize: 16, color: savedColorScheme === key ? colors.accent : colors.text }}>{scheme.name}</Text>
                            </View>
                            {savedColorScheme === key && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Pressable>
      </Modal>
    </View>
  );
}
