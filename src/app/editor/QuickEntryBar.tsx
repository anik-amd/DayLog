import React, { useState, useCallback, useRef } from 'react';
import { View, TextInput, TouchableOpacity, LayoutAnimation, Platform, UIManager, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { createEntry, updateEntry } from '../../database/entries';
import { addMediaToEntry } from '../../database/media';
import { useAutoSave } from '../../hooks/useAutoSave';
import { Entry } from '../../types/Entry';

interface QuickEntryBarProps {
  onEntrySaved: () => void;
}

export default function QuickEntryBar({ onEntrySaved }: QuickEntryBarProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
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
    setImages([]);
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
        navigation.navigate('FullScreenEditor', { entryId: newId, initialContent: content, viewMode: false });
    } else if (currentEntryId) {
        await handleSave(content, true);
        navigation.navigate('FullScreenEditor', { entryId: currentEntryId, initialContent: content, viewMode: false });
    } else {
        navigation.navigate('FullScreenEditor', { entryId: null, initialContent: '', viewMode: false });
    }
  };

  const moveMediaToLocal = async (uri: string) => {
    if (Platform.OS === 'web') {
      // On web, blob URIs expire on page reload. We'll convert to a DataURL (Base64) 
      // to ensure the journal entry remains persistent for this MVP.
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.error("Failed to persist web image:", e);
        return uri;
      }
    }
    
    // On native mobile, we MUST copy the image to the persistent documentDirectory!
    // Temporary cache URIs from picker will otherwise be deleted by the OS on reboot.
    const filename = uri.split('/').pop();
    const destPath = ((FileSystem as any).documentDirectory || '') + filename;
    
    try {
      await FileSystem.copyAsync({ from: uri, to: destPath });
      return destPath;
    } catch (e) {
      console.error("Failed to copy image to local storage:", e);
      return uri; // Return original if copy fails
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      const persistentLocalPath = await moveMediaToLocal(selectedImage);
      
      const now = Date.now();
      let activeEntryId = currentEntryId;
      
      // Auto-create entry securely before attachment if missing
      if (!activeEntryId) {
        activeEntryId = now.toString();
        const newEntry: Omit<Entry, 'media'> = { id: activeEntryId, content: content || '', createdAt: now, updatedAt: now, date: new Date().toISOString().split('T')[0] };
        await createEntry(newEntry);
        setCurrentEntryId(activeEntryId);
      }
      
      const newMedia = {
        id: Date.now().toString(),
        entryId: activeEntryId,
        type: "image" as const,
        path: persistentLocalPath,
        createdAt: Date.now()
      };
      
      await addMediaToEntry(newMedia);
      setImages(prev => [...prev, persistentLocalPath]);
      onEntrySaved(); // Prompt timeline refetch immediately
    }
  };

  return (
    <View className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-900 px-4 py-3 pb-6 flex-row items-end">
      {content.trim().length > 0 && (
        <TouchableOpacity 
          onPress={handleExpand}
          className="mb-1.5 mr-2 p-1.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full"
        >
          <Ionicons name="expand" size={18} color="#a3a3a3" />
        </TouchableOpacity>
      )}

      <TouchableOpacity 
          onPress={pickImage}
          className="mb-1.5 mr-3 p-1.5 border border-transparent rounded-full"
      >
          <Ionicons name="image" size={24} color={content.trim().length > 0 ? "#737373" : "#6366f1"} />
      </TouchableOpacity>
      
      <View className="flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-[28px] border border-neutral-200 dark:border-neutral-800 max-h-[250px] overflow-hidden">
        {images.length > 0 && (
          <View className="flex-row px-4 pt-3 pb-1">
            {images.map((uri, i) => (
              <Image key={i} source={{ uri }} className="w-12 h-12 rounded-lg mr-2 border border-neutral-200 dark:border-neutral-800" />
            ))}
          </View>
        )}
        <TextInput
          placeholder="What's on your mind?"
          placeholderTextColor="#737373"
          className="text-neutral-900 dark:text-neutral-100 text-[16px] px-5 py-3.5 leading-5 font-medium"
          multiline={true}
          value={content}
          onChangeText={onChangeText}
          textAlignVertical="center"
          underlineColorAndroid="transparent"
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
