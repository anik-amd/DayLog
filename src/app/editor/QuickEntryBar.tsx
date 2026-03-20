import React, { useState, useCallback, useRef } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createEntry, updateEntry } from '../../database/entries';
import { useAutoSave } from '../../hooks/useAutoSave';
import { Entry } from '../../types/Entry';

interface QuickEntryBarProps {
  onEntrySaved: () => void;
}

export default function QuickEntryBar({ onEntrySaved }: QuickEntryBarProps) {
  const [content, setContent] = useState('');
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const isSaving = useRef(false);

  const handleSave = useCallback(async (textToSave: string, finalizeAndRefresh: boolean = false) => {
    if (!textToSave.trim() || isSaving.current) return;
    
    isSaving.current = true;
    try {
      const now = Date.now();
      if (!currentEntryId) {
        const newId = now.toString();
        const newEntry: Omit<Entry, 'media'> = {
          id: newId,
          content: textToSave,
          createdAt: now,
          updatedAt: now,
          date: new Date().toISOString().split('T')[0]
        };
        await createEntry(newEntry);
        setCurrentEntryId(newId);
        if (finalizeAndRefresh) onEntrySaved();
      } else {
        await updateEntry(currentEntryId, textToSave, now);
        if (finalizeAndRefresh) onEntrySaved();
      }
    } finally {
      isSaving.current = false;
    }
  }, [currentEntryId, onEntrySaved]);

  useAutoSave(content, (text) => handleSave(text, false), 1000);

  const onChangeText = (text: string) => {
    setContent(text);
    if (text === '') {
      setCurrentEntryId(null);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    // Save the final text state before clearing, and update timeline
    await handleSave(content, true);
    
    // Clear the input and reset the tracking ID for a new entry
    setContent('');
    setCurrentEntryId(null);
  };

  return (
    <View className="bg-zinc-800 border-t border-zinc-700 p-3 pt-2 shadow-lg flex-row items-end">
      <View className="flex-1 bg-zinc-900 rounded-3xl min-h-[50px] max-h-[150px]">
        <TextInput
          placeholder="Type a quick entry..."
          placeholderTextColor="#a1a1aa"
          className="text-white text-base px-5 py-3"
          multiline={true}
          value={content}
          onChangeText={onChangeText}
        />
      </View>

      {content.trim().length > 0 && (
        <TouchableOpacity 
          onPress={handleSubmit}
          className="bg-blue-600 w-12 h-12 rounded-full items-center justify-center ml-3 mb-1"
        >
          <Ionicons name="send" size={20} color="white" style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      )}
    </View>
  );
}
