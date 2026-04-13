import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, TextInput, FlatList, Keyboard } from 'react-native';
import { useColorScheme } from "nativewind";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsive } from '../../hooks/useResponsive';
import { getEntriesGroupedByLocation, getEntriesAtLocation, LocationGroup } from '../../database/entries';
import { Entry } from '../../types/Entry';
import { moderateScale } from '../../utils/responsive';
import EntrySheet from '../../components/EntrySheet';
import WebLeafletMap from './WebLeafletMap';
import { getBrowserLocation } from '../../services/WebGeolocation';

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

const LIGHT_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const DARK_TILE_URL = 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark/{z}/{x}/{y}.png';

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
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

function SearchBar({ 
  colors, 
  fontSize, 
  spacing, 
  onSearch,
  userLocation 
}: { 
  colors: ReturnType<typeof useThemeColors>;
  fontSize: ReturnType<typeof useResponsive>['fontSize'];
  spacing: ReturnType<typeof useResponsive>['spacing'];
  onSearch: (region: Region) => void;
  userLocation?: { lat: number; lon: number } | null;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef<string>('');

  const searchLocation = useCallback(async (text: string) => {
    setQuery(text);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (text.length < 3) {
      setResults([]);
      setShowResults(false);
      setError(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (text !== lastQueryRef.current) {
        lastQueryRef.current = text;
      } else {
        return;
      }
      
      setError(false);
      setSearching(true);
      
      abortControllerRef.current = new AbortController();
      
      try {
        let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=8&accept-language=en`;
        
        if (userLocation) {
          const delta = 0.18;
          const viewbox = `${userLocation.lon - delta},${userLocation.lat - delta},${userLocation.lon + delta},${userLocation.lat + delta}`;
          url += `&viewbox=${viewbox}&bounded=1`;
        }

        const response = await fetch(url, { 
          headers: { 'User-Agent': 'DayLog/1.0' },
          signal: abortControllerRef.current.signal
        });
        
        if (response.status === 429) {
          setError(true);
          return;
        }
        
        const data: SearchResult[] = await response.json();
        
        if (text === lastQueryRef.current) {
          setResults(data);
          setShowResults(data.length > 0);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Search failed:', err);
          setError(true);
        }
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [userLocation]);

  const handleSelect = useCallback((result: SearchResult) => {
    const region: Region = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    onSearch(region);
    setQuery(result.display_name.split(',')[0]);
    setShowResults(false);
    Keyboard.dismiss();
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  }, []);

  return (
    <View style={styles.searchContainer}>
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={moderateScale(20)} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text, fontSize: fontSize.md }]}
          placeholder="Search location..."
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={searchLocation}
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="close-circle" size={moderateScale(20)} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {showResults && (
        <View style={[styles.searchResults, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                key={item.place_id}
                style={[
                  styles.searchResultItem, 
                  { borderBottomColor: colors.border },
                  index === results.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => handleSelect(item)}
              >
                <Ionicons name="location-outline" size={moderateScale(18)} color={colors.textSecondary} />
                <Text 
                  style={{ color: colors.text, fontSize: fontSize.sm, flex: 1, marginLeft: spacing.sm }}
                  numberOfLines={2}
                >
                  {item.display_name}
                </Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          />
        </View>
      )}
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
  isDarkMode,
  onMarkerPress,
  searchRegion,
  onSearchComplete
}: {
  locations: LocationGroup[];
  colors: ReturnType<typeof useThemeColors>;
  fontSize: ReturnType<typeof useResponsive>['fontSize'];
  spacing: ReturnType<typeof useResponsive>['spacing'];
  isTablet: boolean;
  isLandscape: boolean;
  fontScale: number;
  isDarkMode: boolean;
  onMarkerPress?: (location: LocationGroup) => void;
  searchRegion?: Region | null;
  onSearchComplete?: () => void;
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

  useEffect(() => {
    if (searchRegion && mapRef.current) {
      mapRef.current.animateToRegion(searchRegion, 500);
      setTimeout(() => {
        onSearchComplete?.();
      }, 600);
    }
  }, [searchRegion, onSearchComplete]);

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

const handleZoomIn = useCallback(() => {
  if (!mapRef.current) return;
  mapRef.current.animateToRegion({
    latitude: region.latitude,
    longitude: region.longitude,
    latitudeDelta: region.latitudeDelta / 2,
    longitudeDelta: region.longitudeDelta / 2,
  }, 300);
}, [region]);

const handleZoomOut = useCallback(() => {
  if (!mapRef.current) return;
  mapRef.current.animateToRegion({
    latitude: region.latitude,
    longitude: region.longitude,
    latitudeDelta: region.latitudeDelta * 2,
    longitudeDelta: region.longitudeDelta * 2,
  }, 300);
}, [region]);

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
            urlTemplate={isDarkMode ? DARK_TILE_URL : LIGHT_TILE_URL}
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
        <View style={[styles.nativeControls, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity onPress={handleZoomIn} style={[styles.nativeZoomButton, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="add" size={moderateScale(22)} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleZoomOut} style={[styles.nativeZoomButton, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="remove" size={moderateScale(22)} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={fitToMarkers} style={[styles.nativeZoomButton, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="scan-outline" size={moderateScale(20)} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

export default function MapScreen({ navigation }: any) {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();
  const { fontSize, spacing, isTablet, isLandscape, fontScale } = useResponsive();
  const isDarkMode = colorScheme === 'dark';

  const [locations, setLocations] = useState<LocationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchRegion, setSearchRegion] = useState<Region | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<LocationGroup | null>(null);
  const [sheetEntries, setSheetEntries] = useState<Entry[]>([]);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<{ x: number; y: number } | null>(null);

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

  const fetchUserLocation = useCallback(async () => {
    try {
      if (isWeb) {
        const loc = await getBrowserLocation();
        setUserLocation({ lat: loc.latitude, lon: loc.longitude });
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation({ 
            lat: loc.coords.latitude, 
            lon: loc.coords.longitude 
          });
        }
      }
    } catch (error) {
      console.warn('Could not get user location:', error);
    }
  }, []);

  const handleSearch = useCallback((region: Region) => {
    setSearchRegion({ ...region });
  }, []);

  const handleMarkerPress = useCallback(async (location: LocationGroup, position?: { x: number; y: number }) => {
    setSelectedLocation(location);
    setMarkerPosition(position || null);
    setSheetVisible(true);
    setSheetLoading(true);
    
    try {
      const entries = await getEntriesAtLocation(location.latitude, location.longitude, 3);
      setSheetEntries(entries);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
      setSheetEntries([]);
    } finally {
      setSheetLoading(false);
    }
  }, []);

  const handleEntryPress = useCallback((entry: Entry) => {
    setSheetVisible(false);
    setTimeout(() => {
      navigation.getParent()?.navigate('ReadEntry', { entryId: entry.id });
    }, 300);
  }, [navigation]);

  const handleSheetClose = useCallback(() => {
    setSheetVisible(false);
    setSelectedLocation(null);
    setMarkerPosition(null);
    setSheetEntries([]);
  }, []);

  useEffect(() => {
    fetchLocations();
    fetchUserLocation();
  }, [fetchLocations, fetchUserLocation]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingState colors={colors} spacing={spacing} fontSize={fontSize} />
        <StatsBar locations={locations} colors={colors} fontSize={fontSize} spacing={spacing} />
      </View>
    );
  }

  if (locations.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SearchBar colors={colors} fontSize={fontSize} spacing={spacing} onSearch={handleSearch} userLocation={userLocation} />
        <EmptyState colors={colors} spacing={spacing} fontSize={fontSize} />
        <StatsBar locations={locations} colors={colors} fontSize={fontSize} spacing={spacing} />
      </View>
    );
  }

  if (isWeb) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SearchBar colors={colors} fontSize={fontSize} spacing={spacing} onSearch={handleSearch} userLocation={userLocation} />
        <View style={styles.mapContainer}>
          <WebLeafletMap
            locations={locations}
            colors={colors}
            fontSize={fontSize}
            spacing={spacing}
            isDarkMode={isDarkMode}
            searchRegion={searchRegion}
            onMarkerPress={handleMarkerPress}
          />
        </View>
        <StatsBar locations={locations} colors={colors} fontSize={fontSize} spacing={spacing} />
        <EntrySheet
          visible={sheetVisible}
          location={selectedLocation}
          entries={sheetEntries}
          loading={sheetLoading}
          colors={colors}
          fontSize={fontSize}
          spacing={spacing}
          onClose={handleSheetClose}
          onEntryPress={handleEntryPress}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBar colors={colors} fontSize={fontSize} spacing={spacing} onSearch={handleSearch} userLocation={userLocation} />
      <NativeMapView
        locations={locations}
        colors={colors}
        fontSize={fontSize}
        spacing={spacing}
        isTablet={isTablet}
        isLandscape={isLandscape}
        fontScale={fontScale}
        isDarkMode={isDarkMode}
        searchRegion={searchRegion}
        onSearchComplete={() => setSearchRegion(null)}
        onMarkerPress={handleMarkerPress}
      />
      <StatsBar locations={locations} colors={colors} fontSize={fontSize} spacing={spacing} />
      <EntrySheet
        visible={sheetVisible}
        location={selectedLocation}
        entries={sheetEntries}
        loading={sheetLoading}
        colors={colors}
        fontSize={fontSize}
        spacing={spacing}
        markerPosition={markerPosition}
        onClose={handleSheetClose}
        onEntryPress={handleEntryPress}
      />
    </View>
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
  },
  map: {
    flex: 1,
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
  nativeControls: {
    position: 'absolute',
    bottom: moderateScale(100),
    right: moderateScale(12),
    zIndex: 1000,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    flexDirection: 'column',
    gap: moderateScale(8),
    padding: moderateScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  nativeZoomButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
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
  searchContainer: {
    position: 'absolute',
    top: moderateScale(12),
    left: moderateScale(12),
    right: moderateScale(12),
    zIndex: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: moderateScale(8),
    marginRight: moderateScale(8),
    paddingVertical: 0,
  },
  searchResults: {
    marginTop: moderateScale(8),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    maxHeight: moderateScale(200),
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
    borderBottomWidth: 1,
  },
});
