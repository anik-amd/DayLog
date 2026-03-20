import React, { useState, useCallback, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Platform, UIManager, Image } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
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
    setContent(text);
    if (text === '') {
      setCurrentEntryId(null);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
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

  const shouldShowIcons = isFocused || content.trim().length > 0;

  return (
      <View className="bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 px-4 py-2 flex-row items-center">
        {/* Image icon on the left - only shows when focused or has content */}
        {shouldShowIcons && (
          <Animated.View
            entering={FadeIn.springify().damping(15).stiffness(120)}
            exiting={FadeOut.springify().duration(150)}
          >
            <TouchableOpacity 
                onPress={pickImage}
                className="mr-2 p-1.5"
            >
                <Ionicons name="image" size={20} color="#6366f1" />
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {/* Text input - minimal, no border by default */}
        <View className="flex-1 relative">
          {/* Input container - subtle bg when needed, transparent by default */}
          <View className={`${isFocused ? 'bg-neutral-100 dark:bg-neutral-800/50' : ''} rounded-full`}>
            {/* Images preview */}
            {images.length > 0 && (
              <View className="flex-row px-3 pt-2">
                {images.map((uri, i) => (
                  <Image key={i} source={{ uri }} className="w-6 h-6 rounded mr-1" />
                ))}
              </View>
            )}
            
            <View className="flex-row items-center">
              <TextInput
                placeholder="What's on your mind?"
                placeholderTextColor="#737373"
                className="flex-1 text-neutral-900 dark:text-neutral-100 text-[14px] px-4 py-2 pr-10 leading-4 font-normal"
                multiline={true}
                value={content}
                onChangeText={onChangeText}
                onFocus={handleFocus}
                onBlur={handleBlur}
                textAlignVertical="center"
                underlineColorAndroid="transparent"
              />
              
              {/* Expand icon - inside input, right side */}
              {shouldShowIcons && (
                <Animated.View
                  entering={FadeIn.springify().damping(15).stiffness(120)}
                  exiting={FadeOut.springify().duration(150)}
                  className="absolute right-2"
                >
                  <TouchableOpacity 
                      onPress={handleExpand}
                      className="p-1.5"
                  >
                      <Ionicons name="expand-outline" size={16} color="#a3a3a3" />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>
        </View>
        
        {/* Submit icon (checkmark) - to the right */}
        {content.trim().length > 0 && (
          <Animated.View
            entering={FadeIn.springify().damping(15).stiffness(120)}
            exiting={FadeOut.springify().duration(150)}
          >
            <TouchableOpacity 
                onPress={handleSubmit}
                className="ml-2 p-2 bg-indigo-500 rounded-full"
            >
                <Ionicons name="checkmark" size={18} color="white" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
  );
}
