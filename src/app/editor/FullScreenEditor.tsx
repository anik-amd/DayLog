import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntry, updateEntry } from '../../database/entries';
import { deleteMedia } from '../../database/media';
import { useAutoSave } from '../../hooks/useAutoSave';
import MarkdownRenderer from '../../markdown/MarkdownRenderer';
import { Entry } from '../../types/Entry';

export default function FullScreenEditor({ route, navigation }: any) {
  const { entryId, initialContent, viewMode = false } = route.params;
  const [content, setContent] = useState(initialContent || '');
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isViewing, setIsViewing] = useState(viewMode);
  const isSaving = useRef(false);

  const loadEntry = useCallback(async () => {
    if (entryId) {
      const data = await getEntry(entryId);
      if (data) {
        setEntry(data);
        setContent(data.content);
      }
    }
  }, [entryId]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  const handleSave = useCallback(async (textToSave: string) => {
    if (!textToSave.trim() || isSaving.current || !entryId) return;
    
    isSaving.current = true;
    try {
      await updateEntry(entryId, textToSave, Date.now());
    } finally {
      isSaving.current = false;
    }
  }, [entryId]);

  // Hook into auto-save with a 1 second debounce
  useAutoSave(content, (t) => handleSave(t), 1000);

  const handleBack = async () => {
    await handleSave(content); // Always ensure a save before going back
    navigation.goBack();
  };

  const handleRemoveMedia = async (mediaId: string) => {
    await deleteMedia(mediaId);
    loadEntry(); // Refresh local state
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white dark:bg-neutral-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Custom Header for Full Screen */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-900/50 mt-2">
        <TouchableOpacity 
          onPress={handleBack} 
          className="bg-neutral-100 dark:bg-neutral-900 w-11 h-11 rounded-full items-center justify-center border border-neutral-200 dark:border-neutral-800"
        >
          <Ionicons name="arrow-back" size={22} color="#a3a3a3" />
        </TouchableOpacity>
        
        {isViewing ? (
          <TouchableOpacity onPress={() => setIsViewing(false)} className="bg-neutral-100 dark:bg-neutral-800 w-11 h-11 rounded-full items-center justify-center border border-neutral-200 dark:border-neutral-700 shadow-sm">
            <Ionicons name="pencil" size={18} color="#a3a3a3" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleBack} className="bg-indigo-500 w-11 h-11 rounded-full items-center justify-center border border-indigo-400/20 shadow-sm">
            <Ionicons name="checkmark" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">
          {/* Media Gallery */}
          {entry?.media && entry.media.length > 0 && (
            <View className="flex-row flex-wrap mb-6">
              {entry.media.map((m) => (
                <View key={m.id} className="relative mr-3 mb-3">
                  <Image 
                    source={{ uri: m.path }} 
                    className="w-24 h-24 rounded-2xl bg-neutral-900 border border-neutral-800" 
                  />
                  {!isViewing && (
                    <TouchableOpacity 
                      onPress={() => handleRemoveMedia(m.id)}
                      className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center border border-neutral-950"
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {isViewing ? (
            <MarkdownRenderer content={content} />
          ) : (
            <TextInput
              placeholder="Start writing..."
              placeholderTextColor="#737373"
              className="text-neutral-900 dark:text-neutral-100 text-[18px] leading-8 font-medium"
              multiline={true}
              value={content}
              onChangeText={setContent}
              autoFocus={!initialContent} // Only autoFocus if we're starting a new long entry
              scrollEnabled={false} // Handled by parent ScrollView
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
