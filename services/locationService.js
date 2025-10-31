import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WALK_DATA_KEY = 'active_walk_data';

/**
 * Request location permissions
 * @returns {Promise<boolean>} True if permissions granted
 */
export const requestLocationPermissions = async () => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.log('Foreground location permission denied');
      return false;
    }

    // Request background permissions for production builds
    try {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission not granted - tracking will work in foreground only');
      } else {
        console.log('Background location permission granted');
      }
    } catch (backgroundError) {
      // Background permissions might not be available in Expo Go
      console.warn('Background location permission not available:', backgroundError.message);
    }

    console.log('Location permissions granted');
    return true;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Check if current location is near start point
 * @param {Object} currentLocation - Current location
 * @param {Object} startLocation - Start location
 * @param {number} radius - Radius in meters (default: 30)
 * @returns {boolean} True if near start point
 */
export const detectReturnToStart = (currentLocation, startLocation, radius = 30) => {
  if (!currentLocation || !startLocation) return false;
  
  const distance = calculateDistance(
    currentLocation.lat,
    currentLocation.lng,
    startLocation.lat,
    startLocation.lng
  );
  
  return distance <= radius;
};

/**
 * Check if stopped for duration
 * @param {Array} route - Route points
 * @param {Object} location - Location to check
 * @param {number} duration - Duration in seconds (default: 300)
 * @param {number} radius - Radius in meters (default: 30)
 * @returns {boolean} True if stopped for duration
 */
export const isStoppedForDuration = (route, location, duration = 300, radius = 30) => {
  if (!route || route.length < 2) return false;

  const lastPoint = route[route.length - 1];
  if (!detectReturnToStart(lastPoint, location, radius)) return false;

  let stopStartTime = lastPoint.timestamp;
  for (let i = route.length - 2; i >= 0; i--) {
    const point = route[i];
    if (detectReturnToStart(point, location, radius)) {
      stopStartTime = point.timestamp;
    } else {
      break;
    }
  }

  const stoppedTime = (lastPoint.timestamp.getTime() - stopStartTime.getTime()) / 1000;
  return stoppedTime >= duration;
};

/**
 * Get walk duration in seconds
 * @param {Array} route - Route points
 * @returns {number} Duration in seconds
 */
export const getWalkDuration = (route) => {
  if (!route || route.length < 2) return 0;
  const startTime = new Date(route[0].timestamp);
  const endTime = new Date(route[route.length - 1].timestamp);
  return (endTime.getTime() - startTime.getTime()) / 1000;
};

/**
 * Get walk distance in meters
 * @param {Array} route - Route points
 * @returns {number} Distance in meters
 */
export const getWalkDistance = (route) => {
  let totalDistance = 0;
  if (route && route.length > 1) {
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += calculateDistance(
        route[i].lat,
        route[i].lng,
        route[i + 1].lat,
        route[i + 1].lng
      );
    }
  }
  return totalDistance;
};

/**
 * Get walk speed in m/s
 * @param {Array} route - Route points
 * @returns {number} Speed in m/s
 */
export const getWalkSpeed = (route) => {
  const distance = getWalkDistance(route);
  const duration = getWalkDuration(route);
  return duration > 0 ? distance / duration : 0;
};

/**
 * Start location tracking (foreground only for Expo Go compatibility)
 * @param {Object} options - Tracking options
 * @returns {Promise<boolean>} True if started successfully
 */
export const startLocationTracking = async (options = {}) => {
  try {
    console.log('Location tracking started (foreground mode)');
    return true;
  } catch (error) {
    console.error('Error starting location tracking:', error);
    return false;
  }
};

/**
 * Stop location tracking
 * @returns {Promise<boolean>} True if stopped successfully
 */
export const stopLocationTracking = async () => {
  try {
    console.log('Location tracking stopped');
    return true;
  } catch (error) {
    console.error('Error stopping location tracking:', error);
    return false;
  }
};

/**
 * Watch position with callback
 * @param {Function} callback - Callback function for location updates
 * @returns {Promise<number>} Watch ID
 */
export const watchPosition = async (callback) => {
  try {
    // Use faster updates for better tracking
    const watchId = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // 5 seconds (was 10)
        distanceInterval: 5, // 5 meters (was 10)
      },
      callback
    );
    return watchId;
  } catch (error) {
    console.error('Error watching position:', error);
    return null;
  }
};

/**
 * Get stored walk data from AsyncStorage
 * @returns {Promise<Object|null>} Stored walk data
 */
export const getStoredWalkData = async () => {
  try {
    const data = await AsyncStorage.getItem(WALK_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting stored walk data:', error);
    return null;
  }
};

/**
 * Store walk data to AsyncStorage
 * @param {Object} walkData - Walk data to store
 * @returns {Promise<boolean>} True if stored successfully
 */
export const storeWalkData = async (walkData) => {
  try {
    await AsyncStorage.setItem(WALK_DATA_KEY, JSON.stringify(walkData));
    return true;
  } catch (error) {
    console.error('Error storing walk data:', error);
    return false;
  }
};

/**
 * Clear stored walk data from AsyncStorage
 * @returns {Promise<boolean>} True if cleared successfully
 */
export const clearStoredWalkData = async () => {
  try {
    await AsyncStorage.removeItem(WALK_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing stored walk data:', error);
    return false;
  }
};

/**
 * Detect POIs near a location using Google Places API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in meters (default: 100)
 * @returns {Promise<Array>} Array of POIs
 */
export const detectPOIs = async (lat, lng, radius = 100) => {
  try {
    // Call backend API to detect POIs using fetch (no auth needed for this public endpoint)
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.141:3000/api';
    
    const response = await fetch(`${API_URL}/places/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.pois || [];
    } else {
      console.warn('Failed to fetch POIs from backend, returning empty array');
      return [];
    }
  } catch (error) {
    console.error('Error detecting POIs:', error);
    // Return empty array on error - better than mock data
    return [];
  }
};

/**
 * Check if user stopped near a POI for minimum duration
 * @param {Array} route - Route points
 * @param {Object} poi - POI object
 * @param {number} minDuration - Minimum duration in seconds (default: 180)
 * @param {number} radius - Radius in meters (default: 50)
 * @returns {boolean} True if stopped near POI
 */
export const isStoppedNearPOI = (route, poi, minDuration = 180, radius = 50) => {
  if (!route || route.length < 2 || !poi) return false;
  
  return isStoppedForDuration(route, poi.location, minDuration, radius);
};

export default {
  requestLocationPermissions,
  calculateDistance,
  detectReturnToStart,
  isStoppedForDuration,
  getWalkDuration,
  getWalkDistance,
  getWalkSpeed,
  startLocationTracking,
  stopLocationTracking,
  watchPosition,
  getStoredWalkData,
  storeWalkData,
  clearStoredWalkData,
  detectPOIs,
  isStoppedNearPOI,
};
