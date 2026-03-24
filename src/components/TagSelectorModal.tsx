import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  TextInput,
  Animated,
  Dimensions,
  StyleSheet,
  LayoutAnimation
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { TagEntry, SortOption, SortDirection, getAllTags } from '../database/tags';
import { getSetting, setSetting } from '../storage/settings';
import { useThemeColors } from '../hooks/useThemeColors';
import TagPill from './TagPill';

interface TagSelectorModalProps {
  visible: boolean;
  tags: TagEntry[];
  selectedTags: string[];
  onClose: () => void;
  onApply: (tags: string[]) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_HEIGHT = SCREEN_HEIGHT * 0.7;

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'usage', label: 'Usage' },
  { key: 'alphabetical', label: 'A-Z' },
  { key: 'date', label: 'Date' },
];

export default function TagSelectorModal({ 
  visible, 
  tags, 
  selectedTags, 
  onClose, 
  onApply 
}: TagSelectorModalProps) {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  
  const [localSelected, setLocalSelected] = useState<string[]>(selectedTags);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('usage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [allTags, setAllTags] = useState<TagEntry[]>(tags);
  const slideAnim = useRef(new Animated.Value(MAX_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadPreferences = async () => {
      const savedSort = await getSetting('tagSortOption');
      const savedDir = await getSetting('tagSortDirection');
      if (savedSort) setSortOption(savedSort as SortOption);
      if (savedDir) setSortDirection(savedDir as SortDirection);
    };
    loadPreferences();
  }, []);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const fetchedTags = await getAllTags();
        setAllTags(fetchedTags);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };
    if (visible) {
      loadTags();
    }
  }, [visible]);

  const handleSortToggle = async (option: SortOption) => {
    if (sortOption === option) {
      const newDir = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDir);
      await setSetting('tagSortDirection', newDir);
    } else {
      setSortOption(option);
      setSortDirection('asc');
      await setSetting('tagSortOption', option);
      await setSetting('tagSortDirection', 'asc');
    }
  };

  useEffect(() => {
    if (visible) {
      setLocalSelected(selectedTags);
      setSearchQuery('');
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: MAX_HEIGHT,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const orderedTags = useMemo(() => {
    const selected = localSelected
      .filter(st => allTags.some(pt => pt.name === st))
      .map(st => allTags.find(pt => pt.name === st)!);
    const others = allTags.filter(pt => !localSelected.includes(pt.name));
    return [...selected, ...others];
  }, [allTags, localSelected]);

const filteredTags = useMemo(() => {
  let base = orderedTags;
  
  if (searchQuery.trim()) {
    base = base.filter(tag => 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  const selected = base.filter(tag => localSelected.includes(tag.name));
  const unselected = base.filter(tag => !localSelected.includes(tag.name));
  
  const sortedUnselected = [...unselected].sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1;
    switch (sortOption) {
      case 'usage':
        return ((b.count || 0) - (a.count || 0)) * dir;
      case 'alphabetical':
        return (a.name || '').localeCompare(b.name || '') * dir;
      case 'date':
        return ((b.createdAt || 0) - (a.createdAt || 0)) * dir;
      default:
        return 0;
    }
  });
  
  return [...selected, ...sortedUnselected];
}, [orderedTags, localSelected, searchQuery, sortOption, sortDirection]);

  const toggleTag = (tagName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLocalSelected(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(t => t !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  };

  const handleClear = () => {
    setLocalSelected([]);
  };

  const handleApply = () => {
    onApply(localSelected);
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: MAX_HEIGHT,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortOption)?.label || 'Usage';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.backdrop,
            { opacity: backdropAnim }
          ]}
        >
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            onPress={handleClose}
            activeOpacity={1}
          />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.container,
            { 
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 16,
              transform: [{ translateY: slideAnim }],
              maxHeight: MAX_HEIGHT,
            }
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.borderSubtle }]} />
          </View>

          <View 
            className="flex-row items-center justify-between px-4 py-3"
            style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
          >
            <Text style={{ fontFamily: 'Outfit-Medium', fontSize: 16, color: colors.text }}>
              Filter by Tags ({allTags.length})
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View className="px-4 pt-3">
            <View 
              className="flex-row items-center rounded-lg px-3 py-2"
              style={{ backgroundColor: colors.surfaceElevated }}
            >
              <Ionicons name="search" size={18} color={colors.textTertiary} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search tags..."
                placeholderTextColor={colors.textTertiary}
                className="flex-1 ml-2"
                style={{ fontFamily: 'Outfit-Regular', fontSize: 16, color: colors.text }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View className="px-4 pt-3 pb-2">
            <View 
              className="flex-row items-center rounded-full px-2 py-1.5"
              style={{ 
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Text style={{ fontFamily: 'Outfit-Medium', fontSize: 13, color: colors.textTertiary, marginRight: 12, marginLeft: 4 }}>
                Sort:
              </Text>
              <View className="flex-row items-center flex-1">
                {SORT_OPTIONS.map((option, index) => (
                  <React.Fragment key={option.key}>
                    <TouchableOpacity
                      onPress={() => handleSortToggle(option.key)}
                      style={{ 
                        paddingHorizontal: 10, 
                        paddingVertical: 4,
                        marginHorizontal: 4,
                        backgroundColor: sortOption === option.key ? colors.accentLight : 'transparent',
                        borderRadius: 12
                      }}
                      className="flex-row items-center"
                    >
                      <Text 
                        style={{ 
                          fontFamily: 'Outfit-Medium', 
                          fontSize: 12,
                          color: sortOption === option.key ? colors.accent : colors.textSecondary
                        }}
                      >
                        {option.label}
                      </Text>
                      {sortOption === option.key && (
                        <Text style={{ color: colors.accent, fontSize: 12, marginLeft: 4 }}>
                          {sortDirection === 'asc' ? '↓' : '↑'}
                        </Text>
                      )}
                    </TouchableOpacity>
                    {index < SORT_OPTIONS.length - 1 && (
                      <View style={{ height: 16, width: 1, backgroundColor: colors.border }} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredTags.map((tag) => (
              <TagPill
                key={tag.name}
                name={tag.name}
                count={tag.count}
                isSelected={localSelected.includes(tag.name)}
                onPress={() => toggleTag(tag.name)}
                showCheckmark={true}
              />
            ))}
            
            {filteredTags.length === 0 && (
              <View className="items-center justify-center py-8">
                <Text style={{ fontFamily: 'Outfit-Regular', color: colors.textTertiary }}>
                  No tags found
                </Text>
              </View>
            )}
          </ScrollView>

          <View className="px-4 pt-3 border-t" style={{ borderColor: colors.border }}>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={handleClear} className="px-4 py-2">
                <Text style={{ fontFamily: 'Outfit-Medium', color: colors.textSecondary }}>
                  Clear
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApply}
                className="flex-1 ml-4 rounded-full py-3 items-center"
                style={{ backgroundColor: colors.accent }}
              >
                <Text style={{ fontFamily: 'Outfit-Medium', color: '#ffffff' }}>
                  Filter{localSelected.length > 0 ? ` (${localSelected.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  scrollView: {
    maxHeight: MAX_HEIGHT - 250,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
