import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from "nativewind";
import { Entry } from '../../types/Entry';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsive } from '../../hooks/useResponsive';
import { moderateScale } from '../../utils/responsive';

interface EntryCardProps {
  entry: Entry;
  showBorder?: boolean;
  onTagPress?: (tag: string) => void;
}

function renderTags(text: string, colors: any, fontSizes: any) {
  if (!text) return null;

  const tagPattern = /(#\w+)/g;
  const parts = text.split(tagPattern);

  return parts.map((part, i) => {
    if (part.match(tagPattern)) {
      return <Text key={i} style={[{ fontFamily: 'Outfit-Medium', fontSize: fontSizes.sm, color: colors.pills.tags.text }]}>{part}</Text>;
    }
    return <Text key={i} style={[{ fontFamily: 'Outfit-Regular', fontSize: fontSizes.md, color: colors.text }]}>{part}</Text>;
  });
}

const stripMarkdown = (text: string) => {
  if (!text) return '';
  return text
    .replace(/^#+\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
};

const getWeatherIconFromCondition = (weatherStr: string | undefined): string => {
  if (!weatherStr) return 'sunny-outline';
  const condition = weatherStr.toLowerCase();
  if (condition.includes('clear')) return 'sunny-outline';
  if (condition.includes('partly') || condition.includes('mainly')) return 'partly-sunny-outline';
  if (condition.includes('cloud') || condition.includes('overcast') || condition.includes('fog')) return 'cloud-outline';
  if (condition.includes('rain') || condition.includes('drizzle')) return 'rainy-outline';
  if (condition.includes('snow')) return 'snow-outline';
  if (condition.includes('thunder')) return 'thunderstorm-outline';
  return 'sunny-outline';
};

function EntryCardComponent({ entry, showBorder = false, onTagPress }: EntryCardProps) {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();
  const { fontSize, isLandscape, isTablet } = useResponsive();
  const plainTextPreview = stripMarkdown(entry.content);

  const baseLineHeight = moderateScale(24);
  const lineHeight = isLandscape ? baseLineHeight * 0.9 : baseLineHeight;
  const maxLines = isLandscape ? (isTablet ? 6 : 4) : (isTablet ? 6 : 3);

  const formattedTime = entry.time || new Date(entry.createdAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  const extractTemperature = (weatherStr: string | undefined): string => {
    if (!weatherStr) return '';
    const match = weatherStr.match(/^([\d°F°C]+)/);
    return match ? match[1] : weatherStr;
  };

  const navigation = useNavigation<any>();

  const hasWeather = !!entry.weather;
  const hasTags = !!entry?.tags;
  const hasLocation = !!entry?.locationDisplay;
  const hasMedia = entry?.media && entry.media.length > 0;

  return (
    <Pressable
      onPress={() => navigation.navigate('ReadEntry', { entryId: entry.id })}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View 
        className="px-4 py-3" 
        style={showBorder ? { borderTopWidth: 1, borderTopColor: colors.borderSubtle } : {}}
      >
        <View className="flex-row items-start">
          {/* Time + Weather Column */}
          <View className="items-start" style={{ marginRight: moderateScale(12), minWidth: moderateScale(40) }}>
            <Text
              style={{
                fontFamily: 'Outfit-Medium',
                fontSize: fontSize.sm,
                color: colors.textSecondary,
                lineHeight: lineHeight
              }}
            >
              {formattedTime}
            </Text>
            {hasWeather && (
              <View className="mt-0.5">
                <Ionicons
                  name={getWeatherIconFromCondition(entry.weather) as any}
                  size={moderateScale(12)}
                  color={colors.pills.weather.icon}
                />
                <Text
                  style={{
                    fontFamily: 'Outfit-Medium',
                    fontSize: fontSize.sm - 2,
                    color: colors.pills.weather.text,
                    marginTop: moderateScale(1)
                  }}
                >
                  {extractTemperature(entry.weather)}
                </Text>
              </View>
            )}
          </View>

          {/* Content Column */}
          <View className="flex-1">
            <Text 
              numberOfLines={maxLines}
              ellipsizeMode="tail"
              style={{ 
                fontFamily: 'Outfit-Regular', 
                fontSize: fontSize.md, 
                lineHeight: lineHeight,
                color: colors.text 
              }}
            >
              {renderTags(plainTextPreview, colors, fontSize)}
            </Text>

            {hasTags && (
              <View className="flex-row flex-wrap mt-1.5">
                {entry?.tags?.split(',').map((tag, index) => (
                  <Pressable
                    key={index}
                    onPress={() => onTagPress?.(tag.trim())}
                    className="flex-row items-center mr-3 mb-1"
                  >
                    <Ionicons name="pricetag-outline" size={moderateScale(11)} color={colors.pills.tags.icon} />
                    <Text 
                      style={{ 
                        fontFamily: 'Outfit-Medium',
                        fontSize: fontSize.sm - 2,
                        marginLeft: moderateScale(4),
                        color: colors.pills.tags.text,
                      }}
                    >
                      {tag.trim()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {hasLocation && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-1.5"
                contentContainerStyle={{ alignItems: 'center' }}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="location-outline"
                    size={moderateScale(11)}
                    color={colors.pills.location.icon}
                  />
                  <Text
                    style={{
                      fontFamily: 'Outfit-Regular',
                      fontSize: fontSize.sm - 2,
                      marginLeft: moderateScale(4),
                      color: colors.textSecondary
                    }}
                  >
                    {entry.locationDisplay}
                  </Text>
                </View>
              </ScrollView>
            )}

            {hasMedia && (
              <View className="flex-row mt-1.5">
                {entry?.media?.slice(0, 3).map((m, idx) => (
                  <Image 
                    key={m.id} 
                    source={{ uri: m.path }} 
                    className="rounded-lg mr-1.5" 
                    style={{ 
                      width: moderateScale(48), 
                      height: moderateScale(48),
                      backgroundColor: colors.borderSubtle 
                    }}
                    contentFit="cover"
                    transition={200}
                  />
                ))}
                {(entry?.media?.length || 0) > 3 && (
                  <View 
                    className="rounded-lg items-center justify-center" 
                    style={{ 
                      width: moderateScale(48), 
                      height: moderateScale(48), 
                      backgroundColor: colors.surface 
                    }}
                  >
                    <Text style={{ fontFamily: 'Outfit-Regular', fontSize: fontSize.sm - 2, color: colors.textTertiary }}>
                      +{((entry?.media?.length) || 0) - 3}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const EntryCard = React.memo(EntryCardComponent);
export default EntryCard;
