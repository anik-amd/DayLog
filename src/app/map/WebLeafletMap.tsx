import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationGroup } from '../../database/entries';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useResponsive } from '../../hooks/useResponsive';
import { moderateScale } from '../../utils/responsive';
import { ColorSchemeColors } from '../../themes/colors';

interface WebLeafletMapProps {
  locations: LocationGroup[];
  colors: ColorSchemeColors;
  fontSize: any;
  spacing: any;
  onMarkerPress?: (location: LocationGroup) => void;
}

declare global {
  interface Window {
    L: any;
    initLeafletMap: (containerId: string, locations: any[], accentColor: string, tagBg: string, tagText: string, callback: string) => void;
  }
}

export default function WebLeafletMap({ locations, colors, fontSize, spacing, onMarkerPress }: WebLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      if (window.L) {
        initMap();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        initMap();
      };
      document.body.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainerRef.current || !window.L || mapRef.current) return;

      const map = window.L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      });

      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      mapRef.current = map;
      setIsMapReady(true);
    };

    loadLeaflet();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !window.L) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    locations.forEach((location) => {
      const accentColor = colors.accent;
      const tagBg = colors.pills.tags.background;
      const tagText = colors.pills.tags.text;

      const icon = window.L.divIcon({
        html: `
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${accentColor};
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">${location.entryCount}</div>
        `,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = window.L.marker([location.latitude, location.longitude], { icon })
        .addTo(mapRef.current);

      if (onMarkerPress) {
        marker.on('click', () => onMarkerPress(location));
      }

      markersRef.current.push(marker);
    });

    if (locations.length > 0) {
      const bounds = window.L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [locations, isMapReady, colors, onMarkerPress]);

  const fitToMarkers = useCallback(() => {
    if (!mapRef.current || !window.L || locations.length === 0) return;
    const bounds = window.L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
    mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [locations]);

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <div
          ref={mapContainerRef}
          id="leaflet-map"
          style={{ width: '100%', height: '100%' }}
        />
      </View>
      <View style={[styles.controls, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={fitToMarkers}
          style={[styles.fitButton, { backgroundColor: colors.surfaceElevated }]}
        >
          <Ionicons name="scan-outline" size={moderateScale(20)} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  mapWrapper: {
    flex: 1,
    borderRadius: moderateScale(16),
    overflow: 'hidden',
  },
  controls: {
    position: 'absolute',
    top: moderateScale(12),
    right: moderateScale(12),
    borderRadius: moderateScale(12),
    borderWidth: 1,
  },
  fitButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
