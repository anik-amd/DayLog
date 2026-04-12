import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useColorScheme } from "nativewind";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsive } from '../../hooks/useResponsive';
import { getEntriesGroupedByLocation, LocationGroup } from '../../database/entries';
import { moderateScale } from '../../utils/responsive';
import WebLeafletMap from './WebLeafletMap';

const isWeb = Platform.OS === 'web';

let MapView: any = null;
let Marker: any = null;
let UrlTile: any = null;

if (!isWeb) {
  try {
    const mapsModule = require('react-native-maps');
    MapView = mapsModule.default;
    Marker = mapsModule.Marker;
    UrlTile = mapsModule.UrlTile;
  } catch (e) {
    console.warn('react-native-maps not available');
  }
}

const DEFAULT_REGION = {
  latitude: 40.7128,
  longitude: -74.0060,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

function LoadingState({ colors, spacing, fontSize }: {
  colors: ReturnType<typeof useThemeColors>;
  spacing: ReturnType<typeof useResponsive>['spacing'];
  fontSize: ReturnType<typeof useResponsive>['fontSize'];
}) {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={colors.textTertiary} />
      <Text style={{ fontFamily: 'Outfit-Regular', color: colors.textSecondary, fontSize: fontSize.md, marginTop: spacing.sm }}>
        Loading location data...
      </Text>
    </View>
  );
}

function EmptyState({ colors, spacing, fontSize }: {
  colors: ReturnType<typeof useThemeColors>;
  spacing: ReturnType<typeof useResponsive>['spacing'];
  fontSize: ReturnType<typeof useResponsive>['fontSize'];
}) {
  return (
    <View className="flex-1 items-center justify-center" style={{ paddingBottom: moderateScale(100) }}>
      <Ionicons name="map-outline" size={moderateScale(64)} color={colors.textTertiary} />
      <Text style={{ fontFamily: 'Outfit-Regular', color: colors.textTertiary, fontSize: fontSize.lg, marginTop: spacing.md, textAlign: 'center', paddingHorizontal: spacing.xl }}>
        No entries with location
      </Text>
      <Text style={{ fontFamily: 'Outfit-Regular', color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.sm, textAlign: 'center', paddingHorizontal: spacing.xl }}>
        Add location to your entries to see them on the map.
      </Text>
    </View>
  );
}

function StatsBar({ locations, colors, fontSize, spacing }: {
  locations: LocationGroup[];
  colors: ReturnType<typeof useThemeColors>;
  fontSize: ReturnType<typeof useResponsive>['fontSize'];
  spacing: ReturnType<typeof useResponsive>['spacing'];
}) {
  return (
    <View style={[styles.statsBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <View style={styles.statItem}>
        <Ionicons name="location" size={moderateScale(18)} color={colors.accent} />
        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: fontSize.sm, color: colors.text, marginLeft: spacing.xs }}>
          {locations.length}
        </Text>
        <Text style={{ fontFamily: 'Outfit-Regular', fontSize: fontSize.sm, color: colors.textSecondary, marginLeft: spacing.xs }}>
          {locations.length === 1 ? 'location' : 'locations'}
        </Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name="document-text" size={moderateScale(18)} color={colors.accent} />
        <Text style={{ fontFamily: 'Outfit-Medium', fontSize: fontSize.sm, color: colors.text, marginLeft: spacing.xs }}>
          {locations.reduce((sum, loc) => sum + loc.entryCount, 0)}
        </Text>
        <Text style={{ fontFamily: 'Outfit-Regular', fontSize: fontSize.sm, color: colors.textSecondary, marginLeft: spacing.xs }}>
          entries
        </Text>
      </View>
    </View>
  );
}

function NativeMapView({ 
  locations, 
  colors, 
  fontSize, 
  spacing, 
  isTablet, 
  isLandscape,
  fontScale,
  onMarkerPress 
}: { 
  locations: LocationGroup[];
  colors: ReturnType<typeof useThemeColors>;
  fontSize: ReturnType<typeof useResponsive>['fontSize'];
  spacing: ReturnType<typeof useResponsive>['spacing'];
  isTablet: boolean;
  isLandscape: boolean;
  fontScale: number;
  onMarkerPress?: (location: LocationGroup) => void;
}) {
  const mapRef = useRef<any>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [showTags, setShowTags] = useState(false);

  useEffect(() => {
    if (locations.length > 0) {
      setRegion({
        latitude: locations[0].latitude,
        longitude: locations[0].longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }
  }, [locations]);

  const handleRegionChange = useCallback((newRegion: Region) => {
    setRegion(newRegion);
    const zoomedIn = newRegion.latitudeDelta < 0.05;
    setShowTags(zoomedIn);
  }, []);

  const fitToMarkers = useCallback(() => {
    if (locations.length === 0 || !mapRef.current) return;
    const coordinates = locations.map(loc => ({
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));
    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: {
        top: moderateScale(80),
        right: moderateScale(40),
        bottom: moderateScale(100),
        left: moderateScale(40),
      },
      animated: true,
    });
  }, [locations]);

  const getMarkerSize = useCallback((entryCount: number) => {
    const baseSize = moderateScale(28);
    const maxSize = moderateScale(48);
    const size = Math.min(maxSize, baseSize + entryCount * 2);
    return { width: size, height: size, fontSize: moderateScale(12, 0.3) };
  }, []);

  const getTagPillSize = useCallback((tagCount: number, maxCount: number) => {
    const scaleFactor = isTablet ? 1.2 : 1;
    const minFontSize = moderateScale(10) * scaleFactor;
    const maxFontSize = moderateScale(14) * scaleFactor;
    const fontSizeCalc = minFontSize + (maxFontSize - minFontSize) * (tagCount / Math.max(maxCount, 1));
    return {
      fontSize: Math.max(minFontSize, Math.min(maxFontSize, fontSizeCalc)) * fontScale,
      paddingHorizontal: moderateScale(8) * scaleFactor,
      paddingVertical: moderateScale(4) * scaleFactor,
    };
  }, [isTablet, fontScale]);

  return (
    <>
      <View style={[styles.header, { paddingHorizontal: isLandscape ? spacing.lg : spacing.md, paddingTop: spacing.sm }]}>
        <Text style={{ fontFamily: 'Outfit-Black', fontSize: fontSize.xl, color: colors.text }}>
          Map
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={fitToMarkers}
            style={{
              width: moderateScale(44),
              height: moderateScale(44),
              borderRadius: moderateScale(22),
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.sm,
            }}
          >
            <Ionicons name="scan-outline" size={moderateScale(20)} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapContainer}>
        {MapView && (
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            onRegionChangeComplete={handleRegionChange}
            mapType="none"
            showsUserLocation
            showsMyLocationButton={false}
            showsCompass={false}
          >
            <UrlTile
              urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />
            {locations.map((location, index) => {
              const markerSize = getMarkerSize(location.entryCount);
              const maxTagCount = location.tags.length > 0 ? location.tags[0].count : 0;

              return (
                <Marker
                  key={`${location.latitude},${location.longitude}-${index}`}
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  tracksViewChanges={false}
                  onPress={() => onMarkerPress?.(location)}
                >
                  <View style={styles.markerContainer}>
                    <View
                      style={[
                        styles.markerCircle,
                        {
                          width: markerSize.width,
                          height: markerSize.height,
                          borderRadius: markerSize.width / 2,
                          backgroundColor: colors.accent,
                        },
                        styles.markerShadow,
                      ]}
                    >
                      <Text
                        style={[
                          styles.markerText,
                          {
                            fontSize: markerSize.fontSize,
                            color: '#ffffff',
                          },
                        ]}
                      >
                        {location.entryCount}
                      </Text>
                    </View>

                    {showTags && location.tags.length > 0 && (
                      <View style={styles.tagCloudContainer}>
                        {location.tags.slice(0, 5).map((tag, tagIndex) => {
                          const pillSize = getTagPillSize(tag.count, maxTagCount);
                          return (
                            <View
                              key={tag.name}
                              style={[
                                styles.tagPill,
                                {
                                  backgroundColor: colors.pills.tags.background,
                                  paddingHorizontal: pillSize.paddingHorizontal,
                                  paddingVertical: pillSize.paddingVertical,
                                  marginTop: tagIndex > 0 ? moderateScale(4) : 0,
                                },
                              ]}
                            >
                              <Text
                                style={{
                                  fontFamily: 'Outfit-Medium',
                                  fontSize: pillSize.fontSize,
                                  color: colors.pills.tags.text,
                                }}
                              >
                                #{tag.name}
                              </Text>
                              <Text
                                style={{
                                  fontFamily: 'Outfit-Regular',
                                  fontSize: pillSize.fontSize * 0.85,
                                  color: colors.pills.tags.text,
                                  marginLeft: moderateScale(4),
                                  opacity: 0.8,
                                }}
                              >
                                ({tag.count})
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </Marker>
              );
            })}
          </MapView>
        )}

        {!showTags && (
          <View style={[styles.zoomHint, { backgroundColor: colors.surface }]}>
            <Ionicons name="globe-outline" size={moderateScale(16)} color={colors.textSecondary} />
            <Text style={{ fontFamily: 'Outfit-Regular', fontSize: moderateScale(12), color: colors.textSecondary, marginLeft: moderateScale(6) }}>
              Zoom in to see tags
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

export default function MapScreen() {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();
  const { fontSize, spacing, isTablet, isLandscape, fontScale } = useResponsive();

  const [locations, setLocations] = useState<LocationGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = useCallback(async () => {
    try {
      const data = await getEntriesGroupedByLocation(3);
      setLocations(data);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingHorizontal: spacing.md, paddingTop: spacing.md }]}>
          <Text style={{ fontFamily: 'Outfit-Black', fontSize: fontSize.xl, color: colors.text }}>
            Map
          </Text>
        </View>
        <LoadingState colors={colors} spacing={spacing} fontSize={fontSize} />
      </SafeAreaView>
    );
  }

  if (locations.length === 0) {
    return (
      <SafeAreaView className="flex-1" style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingHorizontal: spacing.md, paddingTop: spacing.md }]}>
          <Text style={{ fontFamily: 'Outfit-Black', fontSize: fontSize.xl, color: colors.text }}>
            Map
          </Text>
        </View>
        <EmptyState colors={colors} spacing={spacing} fontSize={fontSize} />
      </SafeAreaView>
    );
  }

  if (isWeb) {
    return (
      <SafeAreaView className="flex-1" style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingHorizontal: spacing.md, paddingTop: spacing.md }]}>
          <Text style={{ fontFamily: 'Outfit-Black', fontSize: fontSize.xl, color: colors.text }}>
            Map
          </Text>
        </View>
        <View style={styles.mapContainer}>
          <WebLeafletMap
            locations={locations}
            colors={colors}
            fontSize={fontSize}
            spacing={spacing}
          />
        </View>
        <StatsBar locations={locations} colors={colors} fontSize={fontSize} spacing={spacing} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={[styles.container, { backgroundColor: colors.background }]}>
      <NativeMapView
        locations={locations}
        colors={colors}
        fontSize={fontSize}
        spacing={spacing}
        isTablet={isTablet}
        isLandscape={isLandscape}
        fontScale={fontScale}
      />
      <StatsBar locations={locations} colors={colors} fontSize={fontSize} spacing={spacing} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: moderateScale(8),
    zIndex: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    borderRadius: moderateScale(16),
    marginHorizontal: moderateScale(16),
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    borderRadius: moderateScale(16),
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  markerText: {
    fontFamily: 'Outfit-Bold',
  },
  tagCloudContainer: {
    marginTop: moderateScale(8),
    alignItems: 'center',
    maxWidth: moderateScale(150),
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(12),
  },
  zoomHint: {
    position: 'absolute',
    bottom: moderateScale(16),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(24),
    borderTopWidth: 1,
    gap: moderateScale(32),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
