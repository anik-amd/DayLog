import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, TextInput, Keyboard } from 'react-native';
import { useColorScheme } from "nativewind";
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { getEntry, updateEntry } from '../../database/entries';
import { addMediaToEntry, deleteMedia } from '../../database/media';
import { useAutoSave } from '../../hooks/useAutoSave';
import MarkdownRenderer from '../../markdown/MarkdownRenderer';
import { Entry } from '../../types/Entry';

export default function FullScreenEditor({ route, navigation }: any) {
  const { colorScheme } = useColorScheme();
  const { entryId, initialContent } = route.params;
  const [markdown, setMarkdown] = useState(initialContent || '');
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const isSaving = useRef(false);
  const inputRef = useRef<TextInput>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const loadEntry = useCallback(async () => {
    if (entryId) {
      const data = await getEntry(entryId);
      if (data) {
        setEntry(data);
        if (!markdown) setMarkdown(data.content);
      }
    }
  }, [entryId, markdown]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  const handleSave = useCallback(async (textToSave: string) => {
    if (isSaving.current || !entryId) return;
    isSaving.current = true;
    try {
      await updateEntry(entryId, textToSave, Date.now());
    } finally {
      isSaving.current = false;
    }
  }, [entryId]);

  useAutoSave(markdown, (t) => handleSave(t), 1000);

  const handleBack = async () => {
    console.log('handleBack called');
    try {
      await handleSave(markdown);
      console.log('handleBack save complete, going back');
    } catch (e) {
      console.error('handleBack error:', e);
    }
    navigation.goBack();
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const { start, end } = selection;
    const selectedText = markdown.substring(start, end);
    const newText = 
      markdown.substring(0, start) + 
      prefix + selectedText + suffix + 
      markdown.substring(end);
    
    setMarkdown(newText);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const moveMediaToLocal = async (uri: string) => {
    if (Platform.OS === 'web') return uri;
    const filename = uri.split('/').pop();
    const destPath = ((FileSystem as any).documentDirectory || '') + filename;
    try {
      await FileSystem.copyAsync({ from: uri, to: destPath });
      return destPath;
    } catch (e) {
      console.error(e);
      return uri;
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && entryId) {
      const selectedImage = result.assets[0].uri;
      const persistentPath = await moveMediaToLocal(selectedImage);
      
      const newMedia = {
        id: Date.now().toString(),
        entryId: entryId,
        type: "image" as const,
        path: persistentPath,
        createdAt: Date.now()
      };
      
      await addMediaToEntry(newMedia);
      
      // Auto-insert markdown link
      insertMarkdown(`\n![Image](${persistentPath})\n`, '');
      
      // Refresh local entry data to show in gallery
      loadEntry();
    }
  };

  const handleRemoveMedia = async (mediaId: string) => {
    await deleteMedia(mediaId);
    loadEntry();
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-950">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Distraction-Free Universal Header */}
        <View className="flex-row items-center justify-between px-6 pb-4 pt-12 border-b border-neutral-100 dark:border-neutral-900/40">
            <TouchableOpacity onPress={handleBack} className="bg-neutral-50 dark:bg-neutral-900 w-10 h-10 rounded-full items-center justify-center border border-neutral-200 dark:border-neutral-800">
                <Ionicons name="arrow-back" size={20} color="#737373" />
            </TouchableOpacity>

            <View className="flex-row bg-neutral-100 dark:bg-neutral-900 rounded-full p-1 border border-neutral-200 dark:border-neutral-800">
                <TouchableOpacity 
                    onPress={() => setIsEditing(true)}
                    className={`px-5 py-1.5 rounded-full ${isEditing ? 'bg-white dark:bg-neutral-800 shadow-sm' : ''}`}
                >
                    <Text className={`text-[10px] font-black uppercase tracking-widest ${isEditing ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-400'}`}>Write</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setIsEditing(false)}
                    className={`px-5 py-1.5 rounded-full ${!isEditing ? 'bg-white dark:bg-neutral-800 shadow-sm' : ''}`}
                >
                    <Text className={`text-[10px] font-black uppercase tracking-widest ${!isEditing ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-400'}`}>Read</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleBack} className="bg-neutral-900 dark:bg-white w-10 h-10 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={20} color={colorScheme === 'dark' ? '#171717' : '#fff'} />
            </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-8 pt-8" showsVerticalScrollIndicator={false}>
            {/* Gallery (Scrollable Header) */}
            {entry?.media && entry.media.length > 0 && (
                <View className="mb-8">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {entry.media.map((m) => (
                        <View key={m.id} className="relative mr-5">
                            <Image 
                                source={{ uri: m.path }} 
                                className="w-48 h-48 rounded-[36px] bg-neutral-900 border border-neutral-200 dark:border-neutral-800" 
                                contentFit="cover" 
                            />
                            <TouchableOpacity 
                                onPress={() => handleRemoveMedia(m.id)}
                                className="absolute -top-2 -right-2 bg-red-500 w-8 h-8 rounded-full items-center justify-center border-4 border-white dark:border-neutral-950 shadow-lg"
                            >
                                <Ionicons name="close" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {isEditing ? (
                <TextInput
                    ref={inputRef}
                    placeholder="Capture your thoughts..."
                    placeholderTextColor="#a3a3a3"
                    className="text-neutral-900 dark:text-neutral-100 text-[20px] leading-10 font-medium min-h-[500px]"
                    multiline={true}
                    value={markdown}
                    onChangeText={setMarkdown}
                    onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                    autoFocus={true}
                    scrollEnabled={false} // Handled by parent ScrollView
                    underlineColorAndroid="transparent"
                    textAlignVertical="top"
                />
            ) : (
                <View className="pb-20">
                    <MarkdownRenderer content={markdown} />
                </View>
            )}
        </ScrollView>

        {/* NATIVE Writing Toolbar (Only shown in Edit mode) */}
        {isEditing && (
            <View 
                className="flex-row items-center justify-around px-4 py-4 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-900 shadow-2xl"
                style={{ marginBottom: Platform.OS === 'android' ? keyboardHeight : 0 }}
            >
                <ToolbarButton icon="text" onPress={() => insertMarkdown('# ', '')} label="H1" />
                <ToolbarButton icon="list" onPress={() => insertMarkdown('- ', '')} />
                <ToolbarButton icon="link" onPress={() => insertMarkdown('[', '](url)')} />
                <ToolbarButton icon="image" onPress={pickImage} />
                <ToolbarButton icon="code" onPress={() => insertMarkdown('`', '`')} />
                <ToolbarButton icon="happy-outline" onPress={() => insertMarkdown('😊', '')} />
            </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

function ToolbarButton({ icon, onPress, label }: { icon: any, onPress: () => void, label?: string }) {
    return (
        <TouchableOpacity 
            onPress={onPress} 
            className="w-11 h-11 items-center justify-center rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800"
        >
            {label ? (
                <Text className="text-neutral-700 dark:text-neutral-300 text-[11px] font-black">{label}</Text>
            ) : (
                <Ionicons name={icon} size={20} color="#737373" />
            )}
        </TouchableOpacity>
    );
}
