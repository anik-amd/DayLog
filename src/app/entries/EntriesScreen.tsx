import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator } from 'react-native';
import { initDb } from '../../database/db';
import { createEntry, getAllEntries } from '../../database/entries';
import { Entry } from '../../types/Entry';
import EntryCard from './EntryCard';

export default function EntriesScreen({ navigation }: any) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDb();
        
        // Fetch current entries
        let currentEntries = await getAllEntries();
        
        // Create a test entry if the database is completely empty
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
    <View className="flex-1 bg-zinc-900 px-4 py-4">
      <Text className="text-white text-2xl font-bold mb-6">Timeline</Text>

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

      <View className="mt-4 border-t border-zinc-800 pt-4 pb-2">
        <Button
          title="Go to Settings"
          color="#a1a1aa"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
    </View>
  );
}
