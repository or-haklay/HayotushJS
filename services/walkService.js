import AsyncStorage from '@react-native-async-storage/async-storage';

const WALKS_STORAGE_KEY = 'walks_data';
const WALK_COUNTER_KEY = 'walk_id_counter';

// Helper to get next walk ID
const getNextWalkId = async () => {
  try {
    const counter = await AsyncStorage.getItem(WALK_COUNTER_KEY);
    const nextId = counter ? parseInt(counter, 10) + 1 : 1;
    await AsyncStorage.setItem(WALK_COUNTER_KEY, nextId.toString());
    return nextId.toString();
  } catch (error) {
    console.error('Error getting next walk ID:', error);
    return Date.now().toString(); // Fallback to timestamp
  }
};

// Helper to get all walks from storage
const getWalksFromStorage = async () => {
  try {
    const walksJson = await AsyncStorage.getItem(WALKS_STORAGE_KEY);
    return walksJson ? JSON.parse(walksJson) : [];
  } catch (error) {
    console.error('Error getting walks from storage:', error);
    return [];
  }
};

// Helper to save all walks to storage
const saveWalksToStorage = async (walks) => {
  try {
    await AsyncStorage.setItem(WALKS_STORAGE_KEY, JSON.stringify(walks));
  } catch (error) {
    console.error('Error saving walks to storage:', error);
    throw error;
  }
};

export const createWalk = async (walkData) => {
  try {
    console.log('📝 Creating walk locally (NO SERVER CALL):', {
      petId: walkData.petId,
      petName: walkData.pet?.name,
      isTempPet: walkData.petId?.startsWith('temp_')
    });
    
    const walks = await getWalksFromStorage();
    const walkId = await getNextWalkId();
    
    // Ensure petId is stored as-is (can be temp_* for manual pets)
    const newWalk = {
      ...walkData,
      _id: walkId,
      // Keep petId as string (even if temp_), don't try to convert
      petId: walkData.petId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    walks.push(newWalk);
    await saveWalksToStorage(walks);
    
    return newWalk;
  } catch (error) {
    console.error('Error creating walk:', error);
    throw error;
  }
};

export const updateWalk = async (walkId, walkData) => {
  try {
    const walks = await getWalksFromStorage();
    const index = walks.findIndex(w => w._id === walkId);
    
    if (index === -1) {
      throw new Error('Walk not found');
    }
    
    walks[index] = {
      ...walks[index],
      ...walkData,
      _id: walkId,
      updatedAt: new Date().toISOString(),
    };
    
    await saveWalksToStorage(walks);
    return walks[index];
  } catch (error) {
    console.error('Error updating walk:', error);
    throw error;
  }
};

export const getWalkById = async (walkId) => {
  try {
    const walks = await getWalksFromStorage();
    const walk = walks.find(w => w._id === walkId);
    
    if (!walk) {
      throw new Error('Walk not found');
    }
    
    return walk;
  } catch (error) {
    console.error('Error getting walk by ID:', error);
    throw error;
  }
};

export const getWalksByPetId = async (petId) => {
  try {
    const walks = await getWalksFromStorage();
    return walks.filter(w => w.petId === petId || w.pet?._id === petId).reverse(); // Most recent first
  } catch (error) {
    console.error('Error getting walks by pet ID:', error);
    return [];
  }
};

export const getAllWalks = async () => {
  try {
    return await getWalksFromStorage();
  } catch (error) {
    console.error('Error getting all walks:', error);
    return [];
  }
};

export const deleteWalk = async (walkId) => {
  try {
    const walks = await getWalksFromStorage();
    const filteredWalks = walks.filter(w => w._id !== walkId);
    await saveWalksToStorage(filteredWalks);
  } catch (error) {
    console.error('Error deleting walk:', error);
    throw error;
  }
};

// Sync walk to server if it doesn't exist
export const syncWalkToServer = async (walkId) => {
  try {
    const walks = await getWalksFromStorage();
    const walk = walks.find(w => w._id === walkId);
    
    if (!walk) {
      throw new Error('Walk not found in local storage');
    }
    
    // Try to sync to server
    try {
      const httpServices = (await import('./httpServices')).default;
      
      // Check if walk exists on server
      try {
        await httpServices.get(`/walks/walk/${walkId}`);
        // Walk exists on server
        return walkId;
      } catch (getError) {
        // Walk doesn't exist on server, create it
        console.log('Walk not found on server, syncing...');
        const { petId, pet, startTime, route, pois, title, distance, duration, endTime, isAutoCompleted, isShared } = walk;
        
        const response = await httpServices.post('/walks', {
          petId: petId?.startsWith('temp_') ? null : petId, // Don't send temp pets
          pet,
          startTime,
          route,
          pois,
          title,
          distance,
          duration,
          endTime,
          isAutoCompleted,
          isShared,
        });
        
        // Update local walk with server ID
        const serverWalkId = response.data?._id || response._id;
        if (serverWalkId && serverWalkId !== walkId) {
          const index = walks.findIndex(w => w._id === walkId);
          if (index !== -1) {
            walks[index] = {
              ...walks[index],
              _id: serverWalkId,
              serverSynced: true,
            };
            await saveWalksToStorage(walks);
            return serverWalkId;
          }
        }
        
        return serverWalkId || walkId;
      }
    } catch (apiError) {
      console.log('Failed to sync walk to server:', apiError.message);
      // Return local ID as fallback
      return walkId;
    }
  } catch (error) {
    console.error('Error syncing walk to server:', error);
    throw error;
  }
};

export const updateWalkShareStatus = async (walkId, isShared) => {
  try {
    // First, try to sync walk to server
    const syncedWalkId = await syncWalkToServer(walkId);
    
    // Try to update via API first (if backend is available)
    try {
      const httpServices = (await import('./httpServices')).default;
      const response = await httpServices.patch(`/walks/${syncedWalkId}`, { isShared });
      const updatedWalk = response.data || response;
      
      // Update local storage with server response
      const walks = await getWalksFromStorage();
      const index = walks.findIndex(w => w._id === walkId || w._id === syncedWalkId);
      if (index !== -1) {
        walks[index] = {
          ...walks[index],
          ...updatedWalk,
          isShared,
          updatedAt: new Date().toISOString(),
        };
        await saveWalksToStorage(walks);
      }
      
      return updatedWalk;
    } catch (apiError) {
      // If API call fails, update local storage
      console.log('API update failed, updating local storage:', apiError.message);
      const walks = await getWalksFromStorage();
      const index = walks.findIndex(w => w._id === walkId || w._id === syncedWalkId);
      
      if (index === -1) {
        throw new Error('Walk not found');
      }
      
      walks[index] = {
        ...walks[index],
        isShared,
        updatedAt: new Date().toISOString(),
      };
      
      await saveWalksToStorage(walks);
      return walks[index];
    }
  } catch (error) {
    console.error('Error updating walk share status:', error);
    throw error;
  }
};

export default {
  createWalk,
  updateWalk,
  getWalkById,
  getWalksByPetId,
  getAllWalks,
  deleteWalk,
  updateWalkShareStatus,
  syncWalkToServer,
};