import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { initDb } from '../../database/db';
import { createEntry, getAllEntries } from '../../database/entries';
import { Entry } from '../../types/Entry';
import EntryCard from './EntryCard';
import QuickEntryBar from '../editor/QuickEntryBar';

export default function EntriesScreen({ navigation }: any) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      const currentEntries = await getAllEntries();
      
      // Trigger a smooth layout animation if the amount of entries has changed (e.g. a new one was added)
      if (entries.length !== 0 && entries.length !== currentEntries.length) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      
      setEntries(currentEntries);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Whenever this screen comes into focus (e.g. returning from full screen editor), refresh the timeline!
      if (!loading) {
        fetchEntries();
      }
    }, [loading])
  );

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDb();
        
        let currentEntries = await getAllEntries();
        
        if (currentEntries.length === 0) {
          const testEntry: Omit<Entry, 'media'> = {
            id: Date.now().toString(),
            content: "Welcome to DayLog! This is your first test entry, created automatically.",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            date: new Date().toISOString().split('T')[0]
          };
          
          await createEntry(testEntry);
          currentEntries = await getAllEntries();
        }
        
        setEntries(currentEntries);
      } catch (error) {
        console.error("Database initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };

    setupDatabase();
  }, []);

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-neutral-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="flex-1 px-5 pt-8 pb-2">
        <Text className="text-neutral-50 text-[32px] font-extrabold tracking-tight mb-6 mt-2">DayLog</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#a1a1aa" className="mt-10" />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <EntryCard entry={item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          className="flex-1"
        />
      )}

      {/* Settings hidden temporarily or placed better later, removed inline border block to make it cleaner */}
      </View>
      <QuickEntryBar onEntrySaved={fetchEntries} />
    </KeyboardAvoidingView>
  );
}
