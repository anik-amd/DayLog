import React, { useState, useCallback, useRef } from 'react';
import { View, TextInput, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
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
  const navigation = useNavigation<any>();

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
    // Smoothly animate the appearance/disappearance of the submit button
    const willShowButton = text.trim().length > 0;
    const isShowingButton = content.trim().length > 0;
    if (willShowButton !== isShowingButton) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }

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

  const handleExpand = async () => {
    // Pre-save the document so it accurately shifts to full screen mode
    if (!currentEntryId && content.trim()) {
        const now = Date.now();
        const newId = now.toString();
        const newEntry: Omit<Entry, 'media'> = { id: newId, content, createdAt: now, updatedAt: now, date: new Date().toISOString().split('T')[0] };
        await createEntry(newEntry);
        setCurrentEntryId(newId);
        onEntrySaved();
        navigation.navigate('FullScreenEditor', { entryId: newId, initialContent: content });
    } else if (currentEntryId) {
        await handleSave(content, true);
        navigation.navigate('FullScreenEditor', { entryId: currentEntryId, initialContent: content });
    } else {
        navigation.navigate('FullScreenEditor', { entryId: null, initialContent: '' });
    }
  };

  return (
    <View className="bg-neutral-950 border-t border-neutral-900 px-4 py-3 pb-6 flex-row items-end">
      {content.trim().length > 0 && (
        <TouchableOpacity 
          onPress={handleExpand}
          className="mb-1.5 mr-3 p-1.5 bg-neutral-900 border border-neutral-800 rounded-full"
        >
          <Ionicons name="expand" size={18} color="#a3a3a3" />
        </TouchableOpacity>
      )}
      
      <View className="flex-1 bg-neutral-900 rounded-[20px] border border-neutral-800 max-h-[150px] justify-center">
        <TextInput
          placeholder="What's on your mind?"
          placeholderTextColor="#737373"
          className="text-neutral-100 text-[16px] px-4 py-2.5 leading-5 font-medium"
          multiline={true}
          value={content}
          onChangeText={onChangeText}
        />
      </View>

      {content.trim().length > 0 && (
        <TouchableOpacity 
          onPress={handleSubmit}
          className="bg-indigo-500 w-[44px] h-[44px] rounded-full items-center justify-center ml-3 shadow-md border border-indigo-400/20 mb-0.5"
        >
          <Ionicons name="arrow-up" size={20} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}
