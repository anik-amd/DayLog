import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, TextInput, ScrollView, Text, ActivityIndicator, Keyboard, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import Fuse from 'fuse.js';
import { getAllEntries } from '../../database/entries';
import { getAllTags, TagEntry } from '../../database/tags';
import { Entry } from '../../types/Entry';
import TagSelectorModal from '../../components/TagSelectorModal';

const MAX_VISIBLE_TAGS = 10;

export default function SearchScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation<any>();
  const inputRef = useRef<TextInput>(null);
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Entry[]>([]);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [popularTags, setPopularTags] = useState<TagEntry[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'content' | 'tag'>('content');
  const [tagModalVisible, setTagModalVisible] = useState(false);

  useEffect(() => {
    loadEntries();
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const tags = await getAllTags();
      setPopularTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, allEntries]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setTimeout(() => inputRef.current?.focus(), 100);
    });
    return unsubscribe;
  }, [navigation]);

  const loadEntries = async () => {
    try {
      const entries = await getAllEntries();
      const sortedEntries = entries.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAllEntries(sortedEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = useCallback((searchQuery: string) => {
    setSearching(true);
    
    let processedQuery = searchQuery.trim();
    let searchKeys: string[];
    
    // Detect tag search (starts with #)
    if (processedQuery.startsWith('#')) {
      searchKeys = ['tags'];
      processedQuery = processedQuery.substring(1); // Remove #
      setSearchMode('tag');
    } else {
      searchKeys = ['content', 'tags', 'location'];
      setSearchMode('content');
    }
    
    if (processedQuery.length < 1) {
      setResults([]);
      setSearching(false);
      return;
    }
    
    const searchFuse = new Fuse(allEntries, {
      keys: searchKeys,
      threshold: 0.3,
      distance: 100,
      ignoreLocation: true,
      includeMatches: true,
      minMatchCharLength: 1,
    });
    
    const searchResults = searchFuse.search(processedQuery);
    // Deduplicate entries (same entry may match multiple fields)
    const uniqueEntries = searchResults.reduce((acc, result) => {
      if (!acc.find(e => e.id === result.item.id)) {
        acc.push(result.item);
      }
      return acc;
    }, [] as Entry[]);
    
    setResults(uniqueEntries);
    setSearching(false);
  }, [allEntries]);

  const handleEntryPress = (entry: Entry) => {
    navigation.navigate('Home', {
      screen: 'ReadEntry',
      params: { entryId: entry.id }
    });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: isDark ? '#171717' : '#ffffff' }}>
      <View 
        className="pt-12 px-4 pb-4 border-b"
        style={{ 
          borderColor: isDark ? '#262626' : '#e5e5e5',
          backgroundColor: isDark ? '#1c1c1c' : '#f5f5f5'
        }}
      >
        <View className="flex-row items-center">
          <View 
            className="flex-1 flex-row items-center rounded-full px-4 py-2"
            style={{ backgroundColor: isDark ? '#262626' : '#ffffff' }}
          >
            <Ionicons name="search" size={20} color={isDark ? '#737373' : '#a1a1aa'} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder={searchMode === 'tag' ? 'Search tags...' : 'Search entries, tags, locations...'}
              placeholderTextColor={isDark ? '#737373' : '#a1a1aa'}
              className="flex-1 text-base ml-2"
              style={{ 
                fontFamily: 'Outfit-Regular',
                color: isDark ? '#ffffff' : '#171717'
              }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={20} color={isDark ? '#737373' : '#a1a1aa'} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="ml-3"
          >
            <Text style={{ fontFamily: 'Outfit-Medium', color: '#6366f1' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : query.trim() === '' ? (
        <View className="flex-1">
          {popularTags.length > 0 && (
            <View className="px-4 pt-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text style={{ fontFamily: 'Outfit-Medium' }} className="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                  Most used tags
                </Text>
                {popularTags.length > MAX_VISIBLE_TAGS && (
                  <TouchableOpacity onPress={() => setTagModalVisible(true)}>
                    <Text style={{ fontFamily: 'Outfit-Medium' }} className="text-indigo-500 text-xs">
                      Show all
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View className="flex-row flex-wrap">
                {(showAllTags ? popularTags : popularTags.slice(0, MAX_VISIBLE_TAGS)).map(({ name, count }) => (
                  <TouchableOpacity
                    key={name}
                    onPress={() => navigation.navigate('Home', { screen: 'Entries', params: { selectedTags: [name] } })}
                    className="flex-row items-center rounded-full px-3 py-1.5 mr-2 mb-2"
                    style={{ backgroundColor: isDark ? '#404040' : '#f4f4f5' }}
                  >
                    <Text style={{ fontFamily: 'Outfit-Medium' }} className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      #{name}
                    </Text>
                    <View className={`ml-1.5 rounded-full px-1.5 py-0.5 ${isDark ? 'bg-neutral-700' : 'bg-neutral-300'}`}>
                      <Text style={{ fontFamily: 'Outfit-Medium', fontSize: 12 }} className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>
                        {count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          {!showAllTags && (
            <View className="flex-1 items-center justify-center opacity-50 px-4">
              <Ionicons name="search" size={48} color={isDark ? '#52525b' : '#a1a1aa'} />
              <Text 
                style={{ fontFamily: 'Outfit-Regular' }}
                className="text-neutral-400 dark:text-neutral-500 mt-4"
              >
                Start typing to search
              </Text>
            </View>
          )}
        </View>
      ) : searching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : results.length === 0 ? (
        <View className="flex-1 items-center justify-center opacity-50">
          <Ionicons name="document-text-outline" size={48} color={isDark ? '#52525b' : '#a1a1aa'} />
          <Text 
            style={{ fontFamily: 'Outfit-Regular' }}
            className="text-neutral-400 dark:text-neutral-500 mt-4"
          >
            No entries found
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {results.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              onPress={() => handleEntryPress(entry)}
              className="px-4 mb-3"
            >
              <View 
                className="rounded-xl p-4"
                style={{ backgroundColor: isDark ? '#262626' : '#ffffff' }}
              >
                <Text 
                  numberOfLines={3}
                  style={{ fontFamily: 'Outfit-Regular' }}
                  className="text-neutral-800 dark:text-neutral-200 text-[15px] leading-6"
                >
                  {entry.content}
                </Text>
                <View className="flex-row items-center mt-3">
                  <Ionicons name="time-outline" size={14} color="#a1a1aa" />
                  <Text 
                    style={{ fontFamily: 'Outfit-Regular' }}
                    className="text-neutral-400 text-[12px] ml-1"
                  >
                    {new Date(entry.createdAt).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

        {/* Tag Selector Modal */}
        <TagSelectorModal
          visible={tagModalVisible}
          tags={popularTags}
          selectedTags={[]}
          onClose={() => setTagModalVisible(false)}
          onApply={(tags) => {
            if (tags.length > 0) {
              navigation.navigate('Home', { screen: 'Entries', params: { selectedTags: tags } });
            }
            setTagModalVisible(false);
          }}
        />
      </View>
    );
}
