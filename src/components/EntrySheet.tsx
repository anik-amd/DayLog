import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationGroup } from '../database/entries';
import { Entry } from '../types/Entry';
import { useThemeColors } from '../hooks/useThemeColors';
import { useResponsive } from '../hooks/useResponsive';
import { moderateScale } from '../utils/responsive';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 100;
const ENTRY_HEIGHT = 90;
const DEFAULT_HEIGHT = SCREEN_HEIGHT * 0.4;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.9;
const MIN_BUBBLE_HEIGHT = 60;
const MAX_BUBBLE_HEIGHT = SCREEN_HEIGHT * 0.4;
const BUBBLE_WIDTH_PERCENT = 0.3;

interface EntrySheetProps {
  visible: boolean;
  location: LocationGroup | null;
  entries: Entry[];
  loading: boolean;
  colors: ReturnType<typeof useThemeColors>;
  fontSize: ReturnType<typeof useResponsive>['fontSize'];
  spacing: ReturnType<typeof useResponsive>['spacing'];
  markerPosition?: { x: number; y: number } | null;
  onClose: () => void;
  onEntryPress: (entry: Entry) => void;
}

function EntryItem({ entry, colors, fontSize, onPress }: {
  entry: Entry;
  colors: ReturnType<typeof useThemeColors>;
  fontSize: ReturnType<typeof useResponsive>['fontSize'];
  onPress: () => void;
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPreview = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <Pressable
      onPress={onPress}
      style={[styles.entryItem, { backgroundColor: colors.surfaceElevated }]}
    >
      <View style={[styles.datePill, { backgroundColor: colors.pills.date.background }]}>
        <Ionicons name="calendar-outline" size={moderateScale(12)} color={colors.pills.date.icon} />
        <Text style={[styles.dateText, { color: colors.pills.date.text }]}>
          {formatDate(entry.date)}
        </Text>
      </View>
      <Text
        style={[styles.entryContent, { color: colors.text }]}
        numberOfLines={3}
      >
        {getPreview(entry.content)}
      </Text>
    </Pressable>
  );
}

function LoadingState({ colors }: { colors: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={styles.loadingContainer}>
      <View style={[styles.loadingDot, { backgroundColor: colors.textTertiary }]} />
      <View style={[styles.loadingDot, { backgroundColor: colors.textTertiary }]} />
      <View style={[styles.loadingDot, { backgroundColor: colors.textTertiary }]} />
    </View>
  );
}

function EmptyState({ colors, fontSize }: { colors: ReturnType<typeof useThemeColors>; fontSize: ReturnType<typeof useResponsive>['fontSize'] }) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={moderateScale(40)} color={colors.textTertiary} />
      <Text style={[styles.emptyText, { color: colors.textTertiary, fontSize: fontSize.sm }]}>
        No entries at this location
      </Text>
    </View>
  );
}

export default function EntrySheet({
  visible,
  location,
  entries,
  loading,
  colors,
  fontSize,
  spacing,
  markerPosition,
  onClose,
  onEntryPress,
}: EntrySheetProps) {
  const { isTablet, width } = useResponsive();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [visible]);

  const getLocationName = () => {
    if (!location) return '';
    return location.locationFull || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  const calculateBubblePosition = () => {
    if (!markerPosition) return null;

    const bubbleWidth = width * BUBBLE_WIDTH_PERCENT;
    const entryCount = entries.length;
    const contentHeight = entryCount * ENTRY_HEIGHT + HEADER_HEIGHT;
    const bubbleHeight = Math.min(Math.max(contentHeight, MIN_BUBBLE_HEIGHT), MAX_BUBBLE_HEIGHT);

    const MARGIN = 12;
    const ARROW_SIZE = 12;

    let left = markerPosition.x + ARROW_SIZE + MARGIN;
    let flipToLeft = false;

    if (left + bubbleWidth > SCREEN_WIDTH - MARGIN) {
      left = markerPosition.x - bubbleWidth - ARROW_SIZE - MARGIN;
      flipToLeft = true;
    }

    if (left < MARGIN) {
      left = MARGIN;
    }

    let top = markerPosition.y - bubbleHeight / 2;

    if (top < MARGIN) {
      top = MARGIN;
    }
    if (top + bubbleHeight > SCREEN_HEIGHT - MARGIN - 80) {
      top = SCREEN_HEIGHT - bubbleHeight - MARGIN - 80;
    }

    return {
      left,
      top,
      bubbleWidth,
      bubbleHeight,
      flipToLeft,
    };
  };

  const bubblePosition = calculateBubblePosition();

  if (!isVisible) return null;

  if (isTablet && bubblePosition) {
    return (
      <Animated.View
        style={[
          styles.floatingBubble,
          {
            left: bubblePosition.left,
            top: bubblePosition.top,
            width: bubblePosition.bubbleWidth,
            backgroundColor: colors.surface,
            opacity: opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={[styles.bubbleArrow, {
          left: bubblePosition.flipToLeft ? bubblePosition.bubbleWidth : -ARROW_SIZE,
          borderRightColor: bubblePosition.flipToLeft ? 'transparent' : colors.surface,
          borderLeftColor: bubblePosition.flipToLeft ? colors.surface : 'transparent',
        }]} />
        <View style={[styles.bubbleHeader, { backgroundColor: colors.surface }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="location" size={moderateScale(16)} color={colors.accent} />
              <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSize.sm }]} numberOfLines={1}>
                {getLocationName()}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={moderateScale(18)} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.entryCount, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
            {loading ? 'Loading...' : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
          </Text>
        </View>
        <View style={[styles.bubbleContent, { height: bubblePosition.bubbleHeight - HEADER_HEIGHT }]}>
          {loading ? (
            <LoadingState colors={colors} />
          ) : entries.length === 0 ? (
            <EmptyState colors={colors} fontSize={fontSize} />
          ) : (
            <FlatList
              data={entries}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <EntryItem
                  entry={item}
                  colors={colors}
                  fontSize={fontSize}
                  onPress={() => onEntryPress(item)}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.bottomSheet,
        { backgroundColor: colors.surface, transform: [{ translateY }], opacity },
      ]}
    >
      <View style={[styles.sheetHeader, { backgroundColor: colors.surface }]}>
        <View style={styles.headerTop}>
          <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
        </View>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="location" size={moderateScale(18)} color={colors.accent} />
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSize.md }]} numberOfLines={1}>
              {getLocationName()}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={moderateScale(20)} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.entryCount, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
          {loading ? 'Loading...' : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
        </Text>
      </View>
      <View style={styles.sheetContent}>
        {loading ? (
          <LoadingState colors={colors} />
        ) : entries.length === 0 ? (
          <EmptyState colors={colors} fontSize={fontSize} />
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <EntryItem
                entry={item}
                colors={colors}
                fontSize={fontSize}
                onPress={() => onEntryPress(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Animated.View>
  );
}

const ARROW_SIZE = 12;

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: DEFAULT_HEIGHT,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingBubble: {
    position: 'absolute',
    borderRadius: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 500,
    overflow: 'visible',
  },
  bubbleArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -ARROW_SIZE,
    width: 0,
    height: 0,
    borderTopWidth: ARROW_SIZE,
    borderBottomWidth: ARROW_SIZE,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  bubbleHeader: {
    paddingHorizontal: moderateScale(12),
    paddingTop: moderateScale(12),
    paddingBottom: moderateScale(8),
    borderTopLeftRadius: moderateScale(16),
    borderTopRightRadius: moderateScale(16),
  },
  bubbleContent: {
    paddingHorizontal: moderateScale(12),
    paddingBottom: moderateScale(12),
  },
  sheetHeader: {
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(8),
  },
  headerTop: {
    alignItems: 'center',
    paddingVertical: moderateScale(8),
  },
  dragHandle: {
    width: moderateScale(40),
    height: moderateScale(4),
    borderRadius: moderateScale(2),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: moderateScale(8),
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: moderateScale(8),
  },
  headerTitle: {
    fontFamily: 'Outfit-Medium',
    marginLeft: moderateScale(8),
    flex: 1,
  },
  closeButton: {
    padding: moderateScale(4),
  },
  entryCount: {
    fontFamily: 'Outfit-Regular',
    marginTop: moderateScale(4),
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: moderateScale(16),
  },
  listContent: {
    paddingBottom: moderateScale(20),
  },
  entryItem: {
    padding: moderateScale(12),
    borderRadius: moderateScale(12),
    marginTop: moderateScale(8),
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
    marginBottom: moderateScale(8),
  },
  dateText: {
    fontFamily: 'Outfit-Medium',
    fontSize: moderateScale(11),
    marginLeft: moderateScale(4),
  },
  entryContent: {
    fontFamily: 'Outfit-Regular',
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: moderateScale(8),
  },
  loadingDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Outfit-Regular',
    marginTop: moderateScale(12),
    textAlign: 'center',
  },
});
