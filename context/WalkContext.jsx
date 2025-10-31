import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import walkService from '../services/walkService';
import petService from '../services/petService';
import { 
  getStoredWalkData, 
  storeWalkData, 
  clearStoredWalkData,
  calculateDistance,
  detectReturnToStart,
  isStoppedForDuration,
  detectPOIs,
  isStoppedNearPOI
} from '../services/locationService';

const WalkContext = createContext();

const initialState = {
  // Active walk state
  activeWalk: null,
  isTracking: false,
  isLoading: false,
  error: null,
  
  // Pets state
  pets: [],
  isLoadingPets: false,
  errorLoadingPets: null,
  
  // Walk history state
  walks: [],
  isLoadingWalks: false,
  errorLoadingWalks: null,
  
  // UI state
  isRefreshing: false,
};

const walkReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_ACTIVE_WALK':
      return { ...state, activeWalk: action.payload };
    
    case 'SET_TRACKING':
      return { ...state, isTracking: action.payload };
    
    case 'ADD_LOCATION_POINT':
      if (!state.activeWalk) return state;
      return {
        ...state,
        activeWalk: {
          ...state.activeWalk,
          route: [...state.activeWalk.route, action.payload],
          distance: calculateTotalDistance([...state.activeWalk.route, action.payload]),
          duration: calculateTotalDuration([...state.activeWalk.route, action.payload], state.activeWalk.startTime),
        },
      };
    
    case 'UPDATE_DURATION':
      if (!state.activeWalk) return state;
      // Calculate duration from startTime to now
      const elapsedDuration = calculateTotalDuration(state.activeWalk.route, state.activeWalk.startTime);
      return {
        ...state,
        activeWalk: {
          ...state.activeWalk,
          duration: elapsedDuration,
        },
      };
    
    case 'UPDATE_WALK_STATS':
      if (!state.activeWalk) return state;
      return {
        ...state,
        activeWalk: {
          ...state.activeWalk,
          ...action.payload,
        },
      };
    
    case 'SET_PETS':
      return { ...state, pets: action.payload };
    
    case 'SET_LOADING_PETS':
      return { ...state, isLoadingPets: action.payload };
    
    case 'SET_ERROR_LOADING_PETS':
      return { ...state, errorLoadingPets: action.payload };
    
    case 'SET_WALKS':
      return { ...state, walks: action.payload };
    
    case 'SET_LOADING_WALKS':
      return { ...state, isLoadingWalks: action.payload };
    
    case 'SET_ERROR_LOADING_WALKS':
      return { ...state, errorLoadingWalks: action.payload };
    
    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };
    
    case 'ADD_POI':
      if (!state.activeWalk) return state;
      return {
        ...state,
        activeWalk: {
          ...state.activeWalk,
          pois: [...state.activeWalk.pois, action.payload],
        },
      };
    
    case 'CLEAR_WALK':
      return { ...state, activeWalk: null, isTracking: false };
    
    default:
      return state;
  }
};

// Helper functions
const calculateTotalDistance = (route) => {
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

const calculateTotalDuration = (route, startTime) => {
  if (!route || route.length < 2) {
    // If no route yet, calculate from startTime to now
    if (startTime) {
      return (Date.now() - new Date(startTime).getTime()) / 1000;
    }
    return 0;
  }
  const routeStartTime = new Date(route[0].timestamp);
  const routeEndTime = new Date(route[route.length - 1].timestamp);
  
  // Use startTime if provided, otherwise use route start
  const actualStartTime = startTime ? new Date(startTime) : routeStartTime;
  
  return (routeEndTime.getTime() - actualStartTime.getTime()) / 1000;
};

export const WalkProvider = ({ children }) => {
  const [state, dispatch] = useReducer(walkReducer, initialState);
  const { user } = useAuth();

  // Load stored walk data on mount
  useEffect(() => {
    loadStoredWalkData();
  }, []);

  const loadStoredWalkData = async () => {
    try {
      const storedData = await getStoredWalkData();
      if (storedData) {
        dispatch({ type: 'SET_ACTIVE_WALK', payload: storedData });
        dispatch({ type: 'SET_TRACKING', payload: true });
      }
    } catch (error) {
      console.error('Error loading stored walk data:', error);
    }
  };

  const loadPets = async () => {
    if (!user) {
      dispatch({ type: 'SET_PETS', payload: [] });
      dispatch({ type: 'SET_LOADING_PETS', payload: false });
      return;
    }
    
    dispatch({ type: 'SET_LOADING_PETS', payload: true });
    dispatch({ type: 'SET_ERROR_LOADING_PETS', payload: null });
    
    try {
      let pets = [];
      const WALKS_PETS_KEY = 'walks_user_pets';
      
      // First try walks-specific storage
      try {
        const walksPetsJson = await AsyncStorage.getItem(WALKS_PETS_KEY);
        if (walksPetsJson) {
          const parsed = JSON.parse(walksPetsJson);
          if (Array.isArray(parsed)) {
            pets = parsed;
          } else if (parsed.pets && Array.isArray(parsed.pets)) {
            pets = parsed.pets;
          }
          if (pets.length > 0) {
            dispatch({ type: 'SET_PETS', payload: pets });
            dispatch({ type: 'SET_LOADING_PETS', payload: false });
            return;
          }
        }
      } catch (e) {
        console.warn('Error reading walks pets from storage:', e);
      }
      
      // Try common storage keys
      const storageKeys = [
        'my_pets',
        'pets_data',
        'user_pets',
        'local_pets_data',
        'cached_pets'
      ];
      
      for (const key of storageKeys) {
        try {
          const petsJson = await AsyncStorage.getItem(key);
          if (petsJson) {
            const parsed = JSON.parse(petsJson);
            if (Array.isArray(parsed)) {
              pets = parsed;
              break;
            } else if (parsed.pets && Array.isArray(parsed.pets)) {
              pets = parsed.pets;
              break;
            }
          }
        } catch (e) {
          // Continue to next key
        }
      }
      
      // If still no pets found, try to fetch from server once (if user allows)
      // This will be saved locally for future use
      if (pets.length === 0) {
        try {
          const serverPets = await petService.getMyPets();
          
          if (Array.isArray(serverPets) && serverPets.length > 0) {
            pets = serverPets;
            // Save to local storage for future offline use
            await AsyncStorage.setItem(WALKS_PETS_KEY, JSON.stringify(pets));
          }
        } catch (serverError) {
          console.error('Could not fetch pets from server:', serverError);
          // Continue with empty array - user can add pets manually
        }
      } else {
        // Save found pets to walks-specific storage for future use
        try {
          await AsyncStorage.setItem(WALKS_PETS_KEY, JSON.stringify(pets));
        } catch (e) {
          console.warn('Could not save pets to walks storage:', e);
        }
      }
      dispatch({ type: 'SET_PETS', payload: pets });
    } catch (error) {
      console.error('Error loading pets:', error);
      // Don't show error, just use empty array - user can still create walks
      dispatch({ type: 'SET_PETS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING_PETS', payload: false });
    }
  };

  const startWalk = async (pet) => {
    if (!user || !pet) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const walkData = {
        petId: pet._id,
        pet: pet,
        startTime: new Date(),
        route: [],
        pois: [],
        distance: 0,
        duration: 0,
        isAutoCompleted: false,
      };
      
      dispatch({ type: 'SET_ACTIVE_WALK', payload: walkData });
      dispatch({ type: 'SET_TRACKING', payload: true });
      
      // Store to AsyncStorage
      await storeWalkData(walkData);
      
    } catch (error) {
      console.error('Error starting walk:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const detectAndAddPOIs = async (locationPoint) => {
    try {
      const pois = await detectPOIs(locationPoint.lat, locationPoint.lng, 100);
      
      for (const poi of pois) {
        // Check if this POI is already in the walk
        const existingPoi = state.activeWalk.pois.find(p => p.placeId === poi.placeId);
        
        if (!existingPoi) {
          // Check if user stopped near this POI
          const isStopped = isStoppedNearPOI(
            [...state.activeWalk.route, locationPoint],
            poi,
            180, // 3 minutes
            50   // 50 meters
          );
          
          if (isStopped) {
            dispatch({ type: 'ADD_POI', payload: poi });
          }
        }
      }
    } catch (error) {
      console.error('Error detecting POIs:', error);
    }
  };

  const addLocationPoint = async (locationPoint) => {
    if (!state.activeWalk) return;
    
    dispatch({ type: 'ADD_LOCATION_POINT', payload: locationPoint });
    
    // Check for POI detection every 5 points
    if (state.activeWalk.route.length % 5 === 0) {
      await detectAndAddPOIs(locationPoint);
    }
    
    // Check for auto-stop
    if (state.activeWalk.route.length > 10) {
      const startLocation = state.activeWalk.route[0];
      const isNearStart = detectReturnToStart(locationPoint, startLocation, 30);
      const isStopped = isStoppedForDuration(
        [...state.activeWalk.route, locationPoint],
        startLocation,
        300, // 5 minutes
        30   // 30 meters
      );
      
      if (isNearStart && isStopped) {
        await stopWalk(true); // Auto-stop
      }
    }
    
    // Update stored data
    const updatedWalk = {
      ...state.activeWalk,
      route: [...state.activeWalk.route, locationPoint],
      distance: calculateTotalDistance([...state.activeWalk.route, locationPoint]),
      duration: calculateTotalDuration([...state.activeWalk.route, locationPoint]),
    };
    await storeWalkData(updatedWalk);
  };

  const stopWalk = async (isAutoCompleted = false) => {
    if (!state.activeWalk || !user) {
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const walkData = {
        ...state.activeWalk,
        endTime: new Date(),
        isAutoCompleted,
      };
      
      // Save locally (no server call)
      const savedWalk = await walkService.createWalk(walkData);
      
      // Clear active walk storage
      await clearStoredWalkData();
      
      dispatch({ type: 'CLEAR_WALK' });
      
      return savedWalk;
    } catch (error) {
      console.error('Error stopping walk:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearWalk = async () => {
    try {
      await clearStoredWalkData();
      dispatch({ type: 'CLEAR_WALK' });
    } catch (error) {
      console.error('Error clearing walk:', error);
    }
  };

  const loadWalks = async (petId) => {
    if (!user || !petId) return;
    
    dispatch({ type: 'SET_LOADING_WALKS', payload: true });
    dispatch({ type: 'SET_ERROR_LOADING_WALKS', payload: null });
    
    try {
      const walks = await walkService.getWalksByPetId(petId);
      dispatch({ type: 'SET_WALKS', payload: walks });
    } catch (error) {
      console.error('Error loading walks:', error);
      dispatch({ type: 'SET_ERROR_LOADING_WALKS', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING_WALKS', payload: false });
    }
  };

  const refreshWalks = async (petId) => {
    dispatch({ type: 'SET_REFRESHING', payload: true });
    await loadWalks(petId);
    dispatch({ type: 'SET_REFRESHING', payload: false });
  };

  const value = {
    // State
    ...state,
    
    // Actions
    loadPets,
    startWalk,
    stopWalk,
    clearWalk,
    addLocationPoint,
    loadWalks,
    refreshWalks,
    dispatch, // Expose dispatch for duration updates
  };

  return (
    <WalkContext.Provider value={value}>
      {children}
    </WalkContext.Provider>
  );
};

export const useWalk = () => {
  const context = useContext(WalkContext);
  if (!context) {
    throw new Error('useWalk must be used within a WalkProvider');
  }
  return context;
};

export default WalkContext;