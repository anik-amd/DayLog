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
  StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { TagEntry } from '../database/tags';

interface TagSelectorModalProps {
  visible: boolean;
  tags: TagEntry[];
  selectedTags: string[];
  onClose: () => void;
  onApply: (tags: string[]) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_HEIGHT = SCREEN_HEIGHT * 0.7;

export default function TagSelectorModal({ 
  visible, 
  tags, 
  selectedTags, 
  onClose, 
  onApply 
}: TagSelectorModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  
  const [localSelected, setLocalSelected] = useState<string[]>(selectedTags);
  const [searchQuery, setSearchQuery] = useState('');
  const slideAnim = useRef(new Animated.Value(MAX_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

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
      .filter(st => tags.some(pt => pt.name === st))
      .map(st => tags.find(pt => pt.name === st)!);
    const others = tags.filter(pt => !localSelected.includes(pt.name));
    return [...selected, ...others];
  }, [tags, localSelected]);

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return orderedTags;
    return orderedTags.filter(tag => 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orderedTags, searchQuery]);

  const toggleTag = (tagName: string) => {
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
              backgroundColor: isDark ? '#171717' : '#ffffff',
              paddingBottom: insets.bottom + 16,
              transform: [{ translateY: slideAnim }],
              maxHeight: MAX_HEIGHT,
            }
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: isDark ? '#404040' : '#d4d4d4' }]} />
          </View>

          <View 
            className="flex-row items-center justify-between px-4 py-3"
          >
            <Text style={{ fontFamily: 'Outfit-Medium' }} className={`text-base ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              Filter by Tags ({tags.length})
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={isDark ? '#a1a1aa' : '#737373'} />
            </TouchableOpacity>
          </View>

          <View className="px-4 pb-3">
            <View 
              className="flex-row items-center rounded-lg px-3 py-2"
              style={{ backgroundColor: isDark ? '#262626' : '#f4f4f5' }}
            >
              <Ionicons name="search" size={18} color={isDark ? '#737373' : '#a1a1aa'} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search tags..."
                placeholderTextColor={isDark ? '#737373' : '#a1a1aa'}
                className="flex-1 ml-2 text-base"
                style={{ fontFamily: 'Outfit-Regular', color: isDark ? '#ffffff' : '#171717' }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredTags.map((tag) => {
              const isSelected = localSelected.includes(tag.name);
              return (
                <TouchableOpacity
                  key={tag.name}
                  onPress={() => toggleTag(tag.name)}
                  className="flex-row items-center rounded-full px-3 py-2 mr-2 mb-2"
                  style={[
                    isSelected 
                      ? { backgroundColor: '#dcfce7' }
                      : { backgroundColor: isDark ? '#262626' : '#f4f4f5' }
                  ]}
                >
                  <Text
                    style={{ fontFamily: 'Outfit-Medium' }}
                    className={`text-sm ${isSelected ? 'text-green-600' : 'text-neutral-500'}`}
                  >
                    #{tag.name}
                  </Text>
                  <View
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 ${
                      isSelected ? 'bg-green-200' : 'bg-neutral-200'
                    }`}
                  >
                    <Text
                      style={{ fontFamily: 'Outfit-Medium', fontSize: 12 }}
                      className={isSelected ? 'text-green-600' : 'text-neutral-500'}
                    >
                      {tag.count}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="ml-auto">
                      <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
            
            {filteredTags.length === 0 && (
              <View className="items-center justify-center py-8">
                <Text style={{ fontFamily: 'Outfit-Regular' }} className="text-neutral-400">
                  No tags found
                </Text>
              </View>
            )}
          </ScrollView>

          <View className="px-4 pt-3 border-t" style={{ borderColor: isDark ? '#262626' : '#e5e5e5' }}>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={handleClear} className="px-4 py-2">
                <Text style={{ fontFamily: 'Outfit-Medium' }} className="text-neutral-500">
                  Clear
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApply}
                className="flex-1 ml-4 bg-indigo-500 rounded-full py-3 items-center"
              >
                <Text style={{ fontFamily: 'Outfit-Medium' }} className="text-white">
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
    maxHeight: MAX_HEIGHT - 200,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
