import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, TextInput } from 'react-native';
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

const extractTags = (text: string): string => {
  const matches = text.match(/#(\w+)/g);
  if (!matches) return '';
  return matches.map(tag => tag.substring(1)).join(', ');
};

export default function FullScreenEditor({ route, navigation }: any) {
  const { colorScheme } = useColorScheme();
  const { entryId, initialContent } = route.params;
  const [markdown, setMarkdown] = useState(initialContent || '');
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const isSaving = useRef(false);
  const inputRef = useRef<TextInput>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  // Metadata state
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [weather, setWeather] = useState<string>('');
  const [tags, setTags] = useState<string>('');

  const loadEntry = useCallback(async () => {
    if (entryId) {
      const data = await getEntry(entryId);
      if (data) {
        setEntry(data);
        if (!markdown) setMarkdown(data.content);
        setDate(data.date || '');
        setTime(data.time || '');
        setLocation(data.location || '');
        setWeather(data.weather || '');
        setTags(data.tags || '');
      }
    }
  }, [entryId, markdown]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  // Real-time tag extraction
  useEffect(() => {
    if (isEditing) {
      const extracted = extractTags(markdown);
      setTags(extracted);
    }
  }, [markdown, isEditing]);

  const handleSave = useCallback(async (textToSave: string, currentMetadata: { date: string, time: string, location: string, weather: string, tags: string }) => {
    if (isSaving.current || !entryId) return;
    isSaving.current = true;
    try {
      await updateEntry(
        entryId, 
        textToSave, 
        Date.now(), 
        currentMetadata.date, 
        currentMetadata.time, 
        currentMetadata.location, 
        currentMetadata.weather,
        currentMetadata.tags
      );
    } finally {
      isSaving.current = false;
    }
  }, [entryId]);

  useAutoSave(markdown, (t) => handleSave(t, { date, time, location, weather, tags }), 1000);

  const handleBack = async () => {
    try {
      await handleSave(markdown, { date, time, location, weather, tags });
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
      insertMarkdown(`\n![Image](${persistentPath})\n`, '');
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
                <View>
                    <View className="flex-row flex-wrap mb-4">
                        <MetadataInput icon="pricetag-outline" value={tags} onChangeText={setTags} placeholder="Tags" />
                        <MetadataInput icon="calendar-outline" value={date} onChangeText={setDate} placeholder="Date" />
                        <MetadataInput icon="time-outline" value={time} onChangeText={setTime} placeholder="Time" />
                        <MetadataInput icon="location-outline" value={location} onChangeText={setLocation} placeholder="Location" />
                        <MetadataInput icon="sunny-outline" value={weather} onChangeText={setWeather} placeholder="Weather" />
                    </View>
                    <TextInput
                        ref={inputRef}
                        placeholder="Capture your thoughts..."
                        placeholderTextColor="#a3a3a3"
                        className="text-neutral-900 dark:text-neutral-100 text-[20px] leading-10 min-h-[500px]"
                        style={{ fontFamily: 'Outfit-Regular' }}
                        multiline={true}
                        value={markdown}
                        onChangeText={setMarkdown}
                        onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                        autoFocus={true}
                        scrollEnabled={false}
                        underlineColorAndroid="transparent"
                        textAlignVertical="top"
                    />
                </View>
            ) : (
                <View className="pb-20">
                    <View className="mb-6">
                        <Text style={{ fontFamily: 'Outfit-Medium' }} className="text-neutral-400 dark:text-neutral-500 text-xs uppercase tracking-widest">
                            {new Date(entry?.createdAt || Date.now()).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Text>
                        <View className="flex-row flex-wrap mt-2">
                            {tags && <ReadMeta icon="pricetag-outline" value={tags} />}
                            {time && <ReadMeta icon="time-outline" value={time} />}
                            {location && <ReadMeta icon="location-outline" value={location} />}
                            {weather && <ReadMeta icon="sunny-outline" value={weather} />}
                        </View>
                    </View>
                    <MarkdownRenderer content={markdown} />
                </View>
            )}
        </ScrollView>

        {isEditing && (
            <View className="flex-row items-center justify-around px-4 py-4 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-900 shadow-2xl">
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

function MetadataInput({ icon, value, onChangeText, placeholder }: { icon: any, value: string, onChangeText: (t: string) => void, placeholder: string }) {
    return (
        <View className="flex-row items-center bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 rounded-full mr-2 mb-2 border border-neutral-100 dark:border-neutral-800">
            <Ionicons name={icon} size={14} color="#737373" />
            <TextInput 
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#a3a3a3"
                className="text-neutral-700 dark:text-neutral-300 text-[12px] ml-1.5 min-w-[60px]"
                style={{ fontFamily: 'Outfit-Medium' }}
            />
        </View>
    );
}

function ReadMeta({ icon, value }: { icon: any, value: string }) {
    return (
        <View className="flex-row items-center mr-4 mb-2">
            <Ionicons name={icon} size={14} color="#a3a3a3" />
            <Text style={{ fontFamily: 'Outfit-Regular' }} className="text-neutral-500 dark:text-neutral-400 text-sm ml-1.5">{value}</Text>
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
