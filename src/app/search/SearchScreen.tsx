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
import { useThemeColors } from '../../hooks/useThemeColors';
import TagPill from '../../components/TagPill';
import { useResponsive } from '../../hooks/useResponsive';
import { moderateScale } from '../../utils/responsive';

const MAX_VISIBLE_TAGS = 10;

export default function SearchScreen() {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();
  const { fontSize, spacing, isTablet } = useResponsive();
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
      searchKeys = ['content', 'tags', 'location', 'weather'];
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
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View 
        className="pt-12 px-4 pb-4"
        style={{ 
          borderBottomWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface
        }}
      >
        <View className="flex-row items-center">
          <View 
            className="flex-1 flex-row items-center rounded-full px-4 py-2"
            style={{ backgroundColor: colors.surface }}
          >
            <Ionicons name="search" size={20} color={colors.textTertiary} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder={searchMode === 'tag' ? 'Search tags...' : 'Search entries, tags, locations...'}
              placeholderTextColor={colors.textTertiary}
              className="flex-1 ml-2"
              style={{ 
                fontFamily: 'Outfit-Regular',
                fontSize: 16,
                color: colors.text
              }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="ml-3"
          >
            <Text style={{ fontFamily: 'Outfit-Medium', color: colors.accent }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : query.trim() === '' ? (
        <View className="flex-1">
          {popularTags.length > 0 && (
            <View className="px-4 pt-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text style={{ fontFamily: 'Outfit-Medium', fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Most used tags
                </Text>
                {popularTags.length > MAX_VISIBLE_TAGS && (
                  <TouchableOpacity onPress={() => setTagModalVisible(true)}>
                    <Text style={{ fontFamily: 'Outfit-Medium', fontSize: 12, color: colors.accent }}>
                      Show all
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View className="flex-row flex-wrap">
                {(showAllTags ? popularTags : popularTags.slice(0, MAX_VISIBLE_TAGS)).map(({ name, count }) => (
                  <TagPill
                    key={name}
                    name={name}
                    count={count}
                    onPress={() => navigation.navigate('Home', { screen: 'Entries', params: { selectedTags: [name] } })}
                  />
                ))}
              </View>
            </View>
          )}
          {!showAllTags && (
            <View className="flex-1 items-center justify-center opacity-50 px-4">
              <Ionicons name="search" size={48} color={colors.textTertiary} />
              <Text 
                style={{ fontFamily: 'Outfit-Regular', fontSize: 16, color: colors.textTertiary, marginTop: 16 }}
              >
                Start typing to search
              </Text>
            </View>
          )}
        </View>
      ) : searching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : results.length === 0 ? (
        <View className="flex-1 items-center justify-center opacity-50">
          <Ionicons name="document-text-outline" size={48} color={colors.textTertiary} />
          <Text 
            style={{ fontFamily: 'Outfit-Regular', fontSize: 16, color: colors.textTertiary, marginTop: 16 }}
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
                style={{ backgroundColor: colors.surface }}
              >
                <Text 
                  numberOfLines={3}
                  style={{ fontFamily: 'Outfit-Regular', fontSize: 15, lineHeight: 24, color: colors.text }}
                >
                  {entry.content}
                </Text>
                <View className="flex-row items-center mt-3">
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text 
                    style={{ fontFamily: 'Outfit-Regular', fontSize: 12, color: colors.textSecondary, marginLeft: 4 }}
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
