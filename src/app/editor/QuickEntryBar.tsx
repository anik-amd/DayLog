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
  const [isFocused, setIsFocused] = useState(false);
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
      <View className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-900 px-4 py-3 flex-row items-center">
        {/* Image icon on the left */}
        <TouchableOpacity 
            onPress={pickImage}
            className="mr-2 p-1.5 border border-transparent rounded-full"
        >
            <Ionicons name="image" size={20} color="#6366f1" />
        </TouchableOpacity>
        
        {/* Text input container with integrated expand icon */}
        <View className="flex-1 bg-neutral-50 dark:bg-neutral-950/50 rounded-[24px] border border-neutral-200 dark:border-neutral-800 overflow-hidden relative">
          {content.trim().length > 0 && (
            <View className="flex-row px-3 pt-1 pb-1">
              {images.map((uri, i) => (
                <Image key={i} source={{ uri }} className="w-8 h-8 rounded mr-1 border border-neutral-200 dark:border-neutral-800" />
              ))}
            </View>
          )}
          <TextInput
            placeholder={isFocused || content.trim().length > 0 ? "" : "What's on your mind?"}
            placeholderTextColor="#737373"
            className="text-neutral-900 dark:text-neutral-100 text-[14px] px-4 py-2.5 pr-16 leading-4 font-normal"
            multiline={true}
            value={content}
            onChangeText={onChangeText}
            textAlignVertical="center"
            underlineColorAndroid="transparent"
          />
          
          {/* Expand icon integrated with input (muted color - right side of text input) */}
          {isFocused || content.trim().length > 0 && (
            <TouchableOpacity 
                onPress={handleExpand}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full"
            >
                <Ionicons name="expand-outline" size={16} color="#a3a3a3" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Submit icon (checkmark) - to the right of input box */}
        {content.trim().length > 0 && (
          <TouchableOpacity 
              onPress={handleSubmit}
              className="ml-2 p-2 bg-indigo-500 rounded-full"
          >
              <Ionicons name="checkmark" size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>
  );
}
