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
  const { data } = await httpServices.post(apiEndpoint, petData);
  return data.pet;
}

/**
 * מעדכן חיית מחמד קיימת
 * PUT /api/pets/:petId
 */
async function updatePet(petId, petData) {
  const { data } = await httpServices.put(`${apiEndpoint}/${petId}`, petData);
  return data.pet;
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
  deletePet,
};

export default petService;
