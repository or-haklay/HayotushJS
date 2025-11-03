import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { useWalk } from '../../context/WalkContext';
import { watchPosition, stopLocationTracking } from '../../services/locationService';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const isExpoGo = Constants.appOwnership === 'expo';

// Enable MapView for testing (will show error in console but won't crash)
const MAPS_ENABLED = true;
let MapView = null;
let Polyline = null;
let Marker = null;

// Try to import react-native-maps
if (MAPS_ENABLED) {
  try {
    const maps = require('react-native-maps');
    if (maps && maps.default) {
      MapView = maps.default;
      Polyline = maps.Polyline;
      Marker = maps.Marker;
    }
  } catch (error) {
    console.warn('⚠️ react-native-maps not available:', error.message);
  }
}

const ActiveWalkScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { 
    activeWalk, 
    isTracking, 
    stopWalk, 
    addLocationPoint,
    updateWalkStats,
    dispatch
  } = useWalk();
  
  // Track duration locally in component state
  const [localDuration, setLocalDuration] = useState(0);
  const trackingRef = useRef({ isTracking, activeWalk: !!activeWalk, startTime: null });
  const dispatchRef = useRef(dispatch);
  
  // Initialize duration when walk starts
  useEffect(() => {
    if (activeWalk && isTracking && activeWalk.startTime) {
      trackingRef.current = {
        isTracking,
        activeWalk: !!activeWalk,
        startTime: new Date(activeWalk.startTime)
      };
      console.log('✅ Initialized tracking with start time:', trackingRef.current.startTime);
    }
  }, [isTracking, activeWalk?.startTime]);
  
  // Update refs when values change
  useEffect(() => {
    trackingRef.current.isTracking = isTracking;
    trackingRef.current.activeWalk = !!activeWalk;
    dispatchRef.current = dispatch;
  }, [isTracking, activeWalk, dispatch]);
  
  // Update duration every second
  useEffect(() => {
    if (!isTracking || !activeWalk) {
      return;
    }
    
    console.log('▶️ Setting up duration update interval');
    
    const interval = setInterval(() => {
      try {
        const current = trackingRef.current;
        if (current.isTracking && current.activeWalk && current.startTime) {
          const elapsed = (Date.now() - current.startTime.getTime()) / 1000;
          setLocalDuration(elapsed);
          
          // Also update the context
          dispatchRef.current({ type: 'UPDATE_DURATION' });
        }
      } catch (error) {
        console.error('❌ Error updating duration:', error);
      }
    }, 1000);
    
    console.log('✅ Duration interval started');
    
    return () => {
      console.log('🛑 Clearing duration interval');
      clearInterval(interval);
    };
  }, [isTracking, activeWalk?.petId]); // Only depend on tracking status and petId

  const [isStopping, setIsStopping] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const mapRef = useRef(null);
  const [mapRegion, setMapRegion] = useState(null);

  // Reset map region when starting a new walk
  useEffect(() => {
    if (activeWalk && isTracking && !watchId) {
      console.log('🚶 Starting new walk - resetting map region');
      setMapRegion(null); // Reset to allow new initial location
      startLocationTracking();
    }

    return () => {
      // Cleanup will be handled when walk is stopped
      if (watchId) {
        console.log('🧹 Cleaning up location tracking');
        stopLocationTracking(watchId);
        setWatchId(null);
      }
    };
  }, [activeWalk?.petId, isTracking]);

  // Update map region when route changes (but don't override user-set region)
  useEffect(() => {
    // Only auto-update region if we don't have one set yet
    if (!mapRegion && activeWalk?.route && activeWalk.route.length > 0) {
      const route = activeWalk.route;
      const latitudes = route.map(p => p.lat);
      const longitudes = route.map(p => p.lng);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      const latDelta = Math.max((maxLat - minLat) * 1.2, 0.01);
      const lngDelta = Math.max((maxLng - minLng) * 1.2, 0.01);
      
      setMapRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      });
    }
  }, [activeWalk?.route, mapRegion]);

  const startLocationTracking = async () => {
    try {
      // Get initial location first
      try {
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        // Add initial location point
        addLocationPoint({
          lat: initialLocation.coords.latitude,
          lng: initialLocation.coords.longitude,
          timestamp: new Date(initialLocation.timestamp),
          accuracy: initialLocation.coords.accuracy,
        });
        
        // Store initial location for map animation (triggers immediate re-render)
        const initialRegion = {
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        
        setMapRegion(initialRegion);
        
        // Force immediate map update after short delay to ensure map is ready
        setTimeout(() => {
          if (mapRef.current && MapView) {
            mapRef.current.animateToRegion(initialRegion, 0);
          }
        }, 100);
      } catch (initialError) {
        console.warn('Could not get initial location:', initialError.message);
      }
      
      // Start watching position with faster updates
      const id = await watchPosition((location) => {
        const { latitude, longitude, accuracy } = location.coords;
        const timestamp = new Date();
        
        addLocationPoint({
          lat: latitude,
          lng: longitude,
          timestamp,
          accuracy,
        });

        // Don't auto-follow user on map to avoid constant reloading
        // User can manually pan the map if needed
      });
      
      setWatchId(id);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const handleStopWalk = async () => {
    Alert.alert(
      t('walks.stop_walk'),
      t('walks.stop_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('walks.stop'),
          style: 'destructive',
          onPress: async () => {
            setIsStopping(true);
            try {
              await stopWalk();
              // Navigate directly to main walks screen instead of history
              router.replace('/(tabs)/walks');
            } catch (error) {
              console.error('Error stopping walk:', error);
              Alert.alert(t('walks.error'), t('walks.stop_error'));
              setIsStopping(false);
            } finally {
              // Don't set isStopping to false here if navigation succeeded
              // Let the component unmount handle it
            }
          },
        },
      ]
    );
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };


  // If no active walk and not loading, redirect back to walks screen
  useEffect(() => {
    if (!activeWalk && !isTracking && !isStopping) {
      // Use router.replace to avoid adding to navigation stack
      router.replace('/(tabs)/walks');
    }
  }, [activeWalk, isTracking, isStopping, router]);

  if (!activeWalk) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          {t('walks.loading')}
        </Text>
      </SafeAreaView>
    );
  }

  const routeCoordinates = activeWalk.route?.map(point => ({
    latitude: point.lat,
    longitude: point.lng,
  })) || [];
  
  // Use mapRegion if exists, otherwise calculate from route or use default
  let currentRegion;
  if (mapRegion) {
    // Prefer user-set region or initial location
    currentRegion = mapRegion;
  } else if (routeCoordinates.length > 0) {
    // Calculate center from route
    const lats = routeCoordinates.map(c => c.latitude);
    const lngs = routeCoordinates.map(c => c.longitude);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    currentRegion = {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max((Math.max(...lats) - Math.min(...lats)) * 1.5, 0.01),
      longitudeDelta: Math.max((Math.max(...lngs) - Math.min(...lngs)) * 1.5, 0.01),
    };
  } else {
    // Default to Israel center if no location yet
    currentRegion = {
      latitude: 31.7683,
      longitude: 35.2137,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Stats Header */}
      <View style={[styles.statsHeader, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {formatDistance(activeWalk?.distance || 0)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('walks.distance')}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {formatDuration(localDuration || activeWalk?.duration || 0)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('walks.duration')}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {activeWalk?.pois?.length || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('walks.pois')}
          </Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {MapView && MAPS_ENABLED ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={currentRegion}
            showsUserLocation={false}
            showsMyLocationButton={false}
            scrollEnabled={true}
            zoomEnabled={true}
            pitchEnabled={false}
            rotateEnabled={false}
            onMapReady={() => {
              // If we have a map region set, animate to it immediately
              if (mapRegion && mapRef.current) {
                // Use requestAnimationFrame to ensure map is fully rendered
                requestAnimationFrame(() => {
                  if (mapRef.current) {
                    mapRef.current.animateToRegion(mapRegion, 0);
                  }
                });
              }
            }}
          >
            {/* Route polyline */}
            {routeCoordinates.length > 1 && Polyline && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor={theme.colors.primary}
                strokeWidth={4}
              />
            )}
            
            {/* Start point marker */}
            {routeCoordinates.length > 0 && Marker && (
              <Marker
                coordinate={routeCoordinates[0]}
                title={t('walks.start_point')}
                pinColor="green"
              />
            )}
            
            {/* End point marker (only if walk is completed) */}
            {routeCoordinates.length > 1 && activeWalk.endTime && Marker && (
              <Marker
                coordinate={routeCoordinates[routeCoordinates.length - 1]}
                title={t('walks.end_point')}
                pinColor="red"
              />
            )}
            
            {/* POI markers */}
            {activeWalk.pois?.map((poi, index) => (
              Marker && (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: poi.location?.lat || poi.lat,
                    longitude: poi.location?.lng || poi.lng,
                  }}
                  title={poi.name}
                  description={t(`walks.poi_type.${poi.type}`) || poi.type}
                />
              )
            ))}
          </MapView>
        ) : (
          <View style={[styles.mapFallback, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="map" size={64} color={theme.colors.primary} />
            <Text style={[styles.mapFallbackText, { color: theme.colors.onSurface }]}>
              {t('walks.tracking_active')}
            </Text>
            <Text style={[styles.mapFallbackSubtext, { color: theme.colors.onSurfaceVariant }]}>
              {isExpoGo 
                ? 'המפה תהיה זמינה בבנייה מותאמת אישית' 
                : 'מעקב פעיל - המפה תופיע בבנייה מותאמת אישית'
              }
            </Text>
            
            {/* Route Info */}
            {activeWalk.route && activeWalk.route.length > 0 && (
              <View style={styles.routeInfo}>
                <Ionicons name="navigate" size={20} color={theme.colors.primary} />
                <Text style={[styles.routeInfoText, { color: theme.colors.onSurfaceVariant }]}>
                  נקודות מסלול: {activeWalk.route.length}
                </Text>
              </View>
            )}
            
            {/* Current Location */}
            {activeWalk.route && activeWalk.route.length > 0 && (
              <View style={styles.locationInfo}>
                <Text style={[styles.locationLabel, { color: theme.colors.onSurfaceVariant }]}>
                  מיקום נוכחי:
                </Text>
                <Text style={[styles.locationValue, { color: theme.colors.onSurface }]}>
                  {activeWalk.route[activeWalk.route.length - 1].lat.toFixed(6)}, {activeWalk.route[activeWalk.route.length - 1].lng.toFixed(6)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={[styles.controls, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.stopButton, { backgroundColor: theme.colors.error }]}
          onPress={handleStopWalk}
          disabled={isStopping}
        >
          {isStopping ? (
            <ActivityIndicator color={theme.colors.onError} />
          ) : (
            <>
              <Ionicons name="stop" size={24} color={theme.colors.onError} />
              <Text style={[styles.stopButtonText, { color: theme.colors.onError }]}>
                {t('walks.stop_walk')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingTop: 20 + (Constants.statusBarHeight || 0),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  mapFallbackText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  mapFallbackSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  routeInfoText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationInfo: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  controls: {
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default ActiveWalkScreen;
