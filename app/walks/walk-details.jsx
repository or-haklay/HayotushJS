import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import walkService from '../../services/walkService';

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

const { width, height } = Dimensions.get('window');

const WalkDetailsScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { walkId } = useLocalSearchParams();
  
  const [walk, setWalk] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (walkId) {
      loadWalkDetails();
    }
  }, [walkId]);

  const loadWalkDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const walkData = await walkService.getWalkById(walkId);
      setWalk(walkData);
    } catch (err) {
      console.error('Error loading walk details:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const getPOIIcon = (type) => {
    switch (type) {
      case 'park':
        return 'leaf';
      case 'water':
        return 'water';
      case 'vet':
        return 'medical';
      case 'pet_store':
        return 'storefront';
      case 'groomer':
        return 'cut';
      case 'boarding':
        return 'home';
      default:
        return 'location';
    }
  };

  const getPOIColor = (type) => {
    switch (type) {
      case 'park':
        return '#4CAF50';
      case 'water':
        return '#2196F3';
      case 'vet':
        return '#F44336';
      case 'pet_store':
        return '#FF9800';
      case 'groomer':
        return '#9C27B0';
      case 'boarding':
        return '#607D8B';
      default:
        return '#757575';
    }
  };

  const getRouteCoordinates = () => {
    if (!walk?.route || walk.route.length === 0) return [];
    
    return walk.route.map(point => ({
      latitude: point.lat,
      longitude: point.lng,
    }));
  };

  const getMapRegion = () => {
    if (!walk?.route || walk.route.length === 0) {
      return {
        latitude: 32.0853,
        longitude: 34.7818,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const route = walk.route;
    const latitudes = route.map(point => point.lat);
    const longitudes = route.map(point => point.lng);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const latDelta = (maxLat - minLat) * 1.2;
    const lngDelta = (maxLng - minLng) * 1.2;
    
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  };

  const handleShare = () => {
    Alert.alert(t('walks.share'), t('walks.share_coming_soon'));
  };

  const handleDelete = () => {
    Alert.alert(
      t('walks.delete_walk'),
      t('walks.delete_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(t('walks.delete_walk'), t('walks.delete_coming_soon'));
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          {t('walks.loading_walk_details')}
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={[styles.errorTitle, { color: theme.colors.onSurface }]}>
          {t('walks.error_loading_details')}
        </Text>
        <Text style={[styles.errorSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={loadWalkDetails}
        >
          <Ionicons name="refresh" size={24} color={theme.colors.onPrimary} />
          <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary }]}>
            {t('common.retry')}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!walk) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorTitle, { color: theme.colors.onSurface }]}>
          {t('walks.walk_not_found')}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          {walk.title || `${t('walks.walk_with')} ${walk.pet?.name || t('common.your_pet')}`}
        </Text>
        
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            Alert.alert(
              t('walks.options'),
              '',
              [
                { text: t('walks.share'), onPress: handleShare },
                { text: t('common.delete'), onPress: handleDelete, style: 'destructive' },
                { text: t('common.cancel'), style: 'cancel' },
              ]
            );
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statItem}>
            <Ionicons name="walk" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
              {formatDistance(walk.distance)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('walks.distance')}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="time" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
              {formatDuration(walk.duration)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('walks.duration')}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="location" size={24} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
              {walk.pois?.length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('walks.pois')}
            </Text>
          </View>
        </View>

        {/* Map */}
        <View style={[styles.mapCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            {t('walks.route')}
          </Text>
          <View style={styles.mapContainer}>
            {(MapView && MAPS_ENABLED) && typeof MapView !== 'undefined' ? (
              <MapView
                style={styles.map}
                region={getMapRegion()}
                scrollEnabled={true}
                zoomEnabled={true}
              >
              {/* Route */}
              {getRouteCoordinates().length > 1 && Polyline && (
                <Polyline
                  coordinates={getRouteCoordinates()}
                  strokeColor={theme.colors.primary}
                  strokeWidth={4}
                />
              )}
              
              {/* Start Marker */}
              {walk.route && walk.route.length > 0 && Marker && (
                <Marker
                  coordinate={{
                    latitude: walk.route[0].lat,
                    longitude: walk.route[0].lng,
                  }}
                  title={t('walks.start_point')}
                  pinColor="green"
                />
              )}
              
              {/* End Marker */}
              {walk.route && walk.route.length > 0 && Marker && (
                <Marker
                  coordinate={{
                    latitude: walk.route[walk.route.length - 1].lat,
                    longitude: walk.route[walk.route.length - 1].lng,
                  }}
                  title={t('walks.end_point')}
                  pinColor="red"
                />
              )}
              
              {/* POI Markers */}
              {walk.pois?.map((poi, index) => (
                Marker && (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: poi.location.lat,
                      longitude: poi.location.lng,
                    }}
                    title={poi.name}
                    description={t(`walks.poi_type.${poi.type}`)}
                    pinColor={getPOIColor(poi.type)}
                  />
                )
              ))}
              </MapView>
            ) : (
              <View style={[styles.mapFallback, { backgroundColor: theme.colors.surface }]}>
                <Ionicons name="map" size={48} color={theme.colors.primary} />
                <Text style={[styles.mapFallbackText, { color: theme.colors.onSurface }]}>
                  {isExpoGo 
                    ? t('walks.map_expo_go_message') || 'המפה תהיה זמינה בבנייה מותאמת אישית'
                    : t('walks.map_unavailable') || 'המפה לא זמינה - יש להגדיר Google Maps API Key'
                  }
                </Text>
                {walk.route && walk.route.length > 0 && (
                  <Text style={[styles.mapFallbackSubtext, { color: theme.colors.onSurfaceVariant }]}>
                    נקודות מסלול: {walk.route.length}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* POIs */}
        {walk.pois && walk.pois.length > 0 && (
          <View style={[styles.poisCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              {t('walks.visited_pois')} ({walk.pois.length})
            </Text>
            {walk.pois.map((poi, index) => (
              <View key={index} style={styles.poiItem}>
                <View style={[styles.poiIcon, { backgroundColor: getPOIColor(poi.type) + '20' }]}>
                  <Ionicons 
                    name={getPOIIcon(poi.type)} 
                    size={20} 
                    color={getPOIColor(poi.type)} 
                  />
                </View>
                <View style={styles.poiInfo}>
                  <Text style={[styles.poiName, { color: theme.colors.onSurface }]}>
                    {poi.name}
                  </Text>
                  <Text style={[styles.poiType, { color: theme.colors.onSurfaceVariant }]}>
                    {t(`walks.poi_type.${poi.type}`)}
                  </Text>
                </View>
                <Text style={[styles.poiDuration, { color: theme.colors.onSurfaceVariant }]}>
                  {Math.round(poi.stoppedDuration / 60)}m
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Details */}
        <View style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
            {t('walks.details')}
          </Text>
          
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('walks.start_time')}:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {formatDate(walk.startTime)}
            </Text>
          </View>
          
          {walk.endTime && (
            <View style={styles.detailItem}>
              <Ionicons name="stop-circle" size={20} color={theme.colors.primary} />
              <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('walks.end_time')}:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                {formatDate(walk.endTime)}
              </Text>
            </View>
          )}
          
          {walk.isAutoCompleted && (
            <View style={styles.detailItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('walks.status')}:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.primary }]}>
                {t('walks.auto_completed')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  mapCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  poisCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  poiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  poiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  poiInfo: {
    flex: 1,
  },
  poiName: {
    fontSize: 16,
    fontWeight: '600',
  },
  poiType: {
    fontSize: 14,
    marginTop: 2,
  },
  poiDuration: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 32,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    marginLeft: 12,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 200,
  },
  mapFallbackText: {
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  mapFallbackSubtext: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default WalkDetailsScreen;

