import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntry, updateEntry } from '../../database/entries';
import { useAutoSave } from '../../hooks/useAutoSave';
import MarkdownRenderer from '../../markdown/MarkdownRenderer';

export default function FullScreenEditor({ route, navigation }: any) {
  const { entryId, initialContent, viewMode = false } = route.params;
  const [content, setContent] = useState(initialContent || '');
  const [isViewing, setIsViewing] = useState(viewMode);
  const isSaving = useRef(false);

  useEffect(() => {
    // If we only passed an ID but no content, load it.
    if (!initialContent && entryId) {
      const loadEntry = async () => {
        const data = await getEntry(entryId);
        if (data) setContent(data.content);
      };
      loadEntry();
    }
  }, [entryId, initialContent]);

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

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-neutral-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Custom Header for Full Screen */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-900 mt-2">
        <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#f5f5f5" />
        </TouchableOpacity>
        
        {isViewing ? (
          <TouchableOpacity onPress={() => setIsViewing(false)} className="bg-neutral-800 px-5 py-2 rounded-full shadow-lg border border-neutral-700">
            <Ionicons name="pencil" size={20} color="#e5e5e5" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleBack} className="bg-indigo-500 px-5 py-2 rounded-full shadow-lg border border-indigo-400/20">
            <Ionicons name="checkmark" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1 px-6 py-4">
        {isViewing ? (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <MarkdownRenderer content={content} />
          </ScrollView>
        ) : (
          <TextInput
            placeholder="Start writing..."
            placeholderTextColor="#737373"
            className="text-neutral-100 text-[18px] leading-8 font-medium flex-1"
            multiline={true}
            value={content}
            onChangeText={setContent}
            autoFocus={true}
            textAlignVertical="top"
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
