import httpServices from "./httpServices";

const apiEndpoint = "/pets";

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed?: string;
  sex?: string;
  weightKg?: number;
  color?: string;
  chipNumber?: string;
  notes?: string;
  birthDate?: string;
  profilePictureUrl?: string;
  coverPictureUrl?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

interface CreatePetData {
  name: string;
  species: string;
  breed?: string;
  sex?: string;
  weightKg?: number;
  color?: string;
  chipNumber?: string;
  notes?: string;
  birthDate?: string;
}

interface UpdatePetData {
  name?: string;
  species?: string;
  breed?: string;
  sex?: string;
  weightKg?: number;
  color?: string;
  chipNumber?: string;
  notes?: string;
  birthDate?: string;
  profilePictureUrl?: string;
  coverPictureUrl?: string;
}

/**
 * מביא את כל חיות המחמד של המשתמש המחובר
 * GET /api/pets
 */
async function getMyPets(): Promise<Pet[]> {
  try {
    const response = await httpServices.get(`${apiEndpoint}/my-pets`);
    return response.data.pets || [];
  } catch (error: any) {
    console.error("Error fetching pets:", error);
    // Return empty array instead of throwing error for 404 cases
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * מביא חיית מחמד ספציפית לפי ID
 * GET /api/pets/:petId
 */
async function getPetById(petId: string): Promise<Pet> {
  const { data } = await httpServices.get(`${apiEndpoint}/${petId}`);
  return data.pet;
}

/**
 * יוצר חיית מחמד חדשה
 * POST /api/pets
 */
async function createPet(petData: CreatePetData): Promise<Pet> {
  try {
    const { data } = await httpServices.post(apiEndpoint, petData);
    return data.pet;
  } catch (error: any) {
    console.error("❌ Error creating pet:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    throw error;
  }
}

/**
 * מעדכן חיית מחמד קיימת
 * PUT /api/pets/:petId
 */
async function updatePet(petId: string, petData: UpdatePetData): Promise<Pet> {
  try {
    const { data } = await httpServices.put(`${apiEndpoint}/${petId}`, petData);
    return data.pet;
  } catch (error: any) {
    console.error("Error updating pet:", error);
    throw error;
  }
}

/**
 * מעדכן תמונת פרופיל של חיית מחמד
 * PUT /api/pets/:petId
 */
async function updatePetProfilePicture(
  petId: string,
  profilePictureUrl: string | null
): Promise<Pet> {
  try {
    const updateData =
      profilePictureUrl === null
        ? { profilePictureUrl: null }
        : { profilePictureUrl };
    const { data } = await httpServices.put(
      `${apiEndpoint}/${petId}`,
      updateData
    );
    return data.pet;
  } catch (error: any) {
    console.error("Error updating pet profile picture:", error);
    throw error;
  }
}

/**
 * מעדכן תמונת רקע של חיית מחמד
 * PUT /api/pets/:petId
 */
async function updatePetCoverPicture(
  petId: string,
  coverPictureUrl: string | null
): Promise<Pet> {
  try {
    const updateData =
      coverPictureUrl === null
        ? { coverPictureUrl: null }
        : { coverPictureUrl };
    const { data } = await httpServices.put(
      `${apiEndpoint}/${petId}`,
      updateData
    );
    return data.pet;
  } catch (error: any) {
    console.error("Error updating pet cover picture:", error);
    throw error;
  }
}

/**
 * מוחק חיית מחמד
 * DELETE /api/pets/:petId
 */
async function deletePet(petId: string): Promise<void> {
  try {
    await httpServices.delete(`${apiEndpoint}/${petId}`);
  } catch (error: any) {
    console.error("Error deleting pet:", error);
    throw error;
  }
}

export default {
  getMyPets,
  getPetById,
  createPet,
  updatePet,
  updatePetProfilePicture,
  updatePetCoverPicture,
  deletePet,
};

export type { Pet, CreatePetData, UpdatePetData };

