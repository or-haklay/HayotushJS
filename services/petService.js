import httpServices from "./httpServices";

const apiEndpoint = "/pets";

/**
 * מביא את כל חיות המחמד של המשתמש המחובר
 * GET /api/pets
 */
async function getMyPets() {
  try {
    const response = await httpServices.get(`${apiEndpoint}/my-pets`);

    return response.data.pets;
  } catch (error) {
    throw error;
  }
}

/**
 * מביא חיית מחמד ספציפית לפי ID
 * GET /api/pets/:petId
 */
async function getPetById(petId) {
  const { data } = await httpServices.get(`${apiEndpoint}/${petId}`);
  return data.pet;
}

/**
 * יוצר חיית מחמד חדשה
 * POST /api/pets
 */
async function createPet(petData) {
  try {
    console.log("🐾 Creating pet with data:", petData);
    console.log("🐾 API endpoint:", `${apiEndpoint}`);
    console.log("🐾 Full request data:", JSON.stringify(petData, null, 2));
    
    const { data } = await httpServices.post(apiEndpoint, petData);
    
    console.log("✅ Pet created successfully:", data);
    return data.pet;
  } catch (error) {
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
async function updatePet(petId, petData) {
  try {
    const { data } = await httpServices.put(`${apiEndpoint}/${petId}`, petData);
    return data.pet;
  } catch (error) {
    console.error("Error updating pet:", error);
    throw error;
  }
}

/**
 * מעדכן תמונת פרופיל של חיית מחמד
 * PUT /api/pets/:petId
 */
async function updatePetProfilePicture(petId, profilePictureUrl) {
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
  } catch (error) {
    console.error("Error updating pet profile picture:", error);
    throw error;
  }
}

/**
 * מעדכן תמונת רקע של חיית מחמד
 * PUT /api/pets/:petId
 */
async function updatePetCoverPicture(petId, coverPictureUrl) {
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
  } catch (error) {
    console.error("Error updating pet cover picture:", error);
    throw error;
  }
}

/**
 * מוחק חיית מחמד
 * DELETE /api/pets/:petId
 */
async function deletePet(petId) {
  await httpServices.delete(`${apiEndpoint}/${petId}`);
}

const petService = {
  getMyPets,
  getPetById,
  createPet,
  updatePet,
  updatePetProfilePicture,
  updatePetCoverPicture,
  deletePet,
};

export default petService;
