import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LocationGroup } from '../../database/entries';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsive } from '../../hooks/useResponsive';
import { moderateScale } from '../../utils/responsive';
import { ColorSchemeColors } from '../../themes/colors';

interface WebMapViewProps {
  locations: LocationGroup[];
  onMarkerPress?: (location: LocationGroup) => void;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const buildHtml = (
  locations: LocationGroup[],
  colors: ColorSchemeColors,
  isDark: boolean
) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    #map { z-index: 1; }
    
    .marker-pin {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 2px solid white;
      cursor: pointer;
    }
    
    .custom-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .tag-cloud {
      display: none;
      flex-wrap: wrap;
      justify-content: center;
      max-width: 150px;
      margin-top: 6px;
      gap: 4px;
    }
    
    .tag-cloud.visible {
      display: flex;
    }
    
    .tag-pill {
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 10px;
      white-space: nowrap;
    }
    
    .zoom-hint {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: ${colors.surface};
      color: ${colors.textSecondary};
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    
    .leaflet-control-attribution {
      font-size: 8px !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="zoom-hint" class="zoom-hint">
    <span>Zoom in to see tags</span>
  </div>
  <script>
    const map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    });
    
    const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    
    osm.addTo(map);
    
    const locations = ${JSON.stringify(locations)};
    const accentColor = '${colors.accent}';
    const tagBg = '${colors.pills.tags.background}';
    const tagText = '${colors.pills.tags.text}';
    const zoomHint = document.getElementById('zoom-hint');
    
    let markers = [];
    
    function createCustomIcon(count) {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      
      const pin = document.createElement('div');
      pin.className = 'marker-pin';
      pin.style.backgroundColor = accentColor;
      pin.textContent = count;
      el.appendChild(pin);
      
      const tagCloud = document.createElement('div');
      tagCloud.className = 'tag-cloud';
      el.appendChild(tagCloud);
      
      return L.divIcon({
        html: el.outerHTML,
        className: 'custom-icon',
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -50]
      });
    }
    
    function fitAllMarkers() {
      if (locations.length === 0) return;
      
      const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
    
    locations.forEach((loc, index) => {
      const icon = createCustomIcon(loc.entryCount);
      const marker = L.marker([loc.latitude, loc.longitude], { icon })
        .addTo(map);
      
      const el = marker.getElement();
      if (el) {
        const tagCloud = el.querySelector('.tag-cloud');
        const tags = loc.tags ? loc.tags.slice(0, 5) : [];
        
        tags.forEach(tag => {
          const pill = document.createElement('div');
          pill.className = 'tag-pill';
          pill.style.backgroundColor = tagBg;
          pill.style.color = tagText;
          pill.textContent = '#' + tag.name + ' (' + tag.count + ')';
          tagCloud.appendChild(pill);
        });
        
        el.addEventListener('mouseover', () => tagCloud.classList.add('visible'));
        el.addEventListener('mouseout', () => tagCloud.classList.remove('visible'));
        el.addEventListener('touchstart', () => tagCloud.classList.add('visible'));
        el.addEventListener('touchend', () => setTimeout(() => tagCloud.classList.remove('visible'), 2000));
      }
      
      marker.on('click', () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'markerPress',
          location: loc
        }));
      });
      
      markers.push(marker);
    });
    
    map.on('zoomend', () => {
      const zoom = map.getZoom();
      const showTags = zoom >= 14;
      
      document.querySelectorAll('.tag-cloud').forEach(el => {
        if (showTags) {
          el.classList.add('visible');
        } else {
          el.classList.remove('visible');
        }
      });
      
      zoomHint.style.display = showTags ? 'none' : 'flex';
    });
    
    if (locations.length > 0) {
      fitAllMarkers();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'ready',
        bounds: map.getBounds()
      }));
    } else {
      map.setView([40.7128, -74.0060], 4);
    }
    
    window.fitToMarkers = fitAllMarkers;
  </script>
</body>
</html>
`;

export default function WebMapView({ locations, onMarkerPress }: WebMapViewProps) {
  const colors = useThemeColors();
  const { fontSize, spacing, isTablet, isLandscape } = useResponsive();
  const webViewRef = useRef<WebView>(null);
  const { colorScheme } = require('nativewind').useColorScheme();
  const isDark = colorScheme === 'dark';
  const [html, setHtml] = useState('');
  
  useEffect(() => {
    setHtml(buildHtml(locations, colors, isDark));
  }, [locations, colors, isDark]);
  
  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerPress' && onMarkerPress) {
        onMarkerPress(data.location);
      }
    } catch (e) {
      console.log('WebView message parse error:', e);
    }
  }, [onMarkerPress]);
  
  const fitToMarkers = useCallback(() => {
    webViewRef.current?.injectJavaScript('window.fitToMarkers && window.fitToMarkers();');
  }, []);
  
  const injectedJS = `
    setTimeout(() => {
      if (window.fitToMarkers) window.fitToMarkers();
    }, 500);
    true;
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: html || '<html><body></body></html>' }}
        style={styles.webview}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={handleMessage}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scalesPageToFit={false}
        bounces={false}
        injectedJavaScript={injectedJS}
        mixedContentMode="compatibility"
      />
      
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: moderateScale(16),
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    borderRadius: moderateScale(16),
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
