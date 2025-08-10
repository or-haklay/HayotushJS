import httpServices from "./httpServices";

const apiEndpoint = "/pets";

/**
 * מביא את כל חיות המחמד של המשתמש המחובר
 * GET /api/pets
 */
export async function getMyPets() {
  const { data } = await httpServices.get(`${apiEndpoint}/my-pets`);
  return data.pets;
}

/**
 * מביא חיית מחמד ספציפית לפי ID
 * GET /api/pets/:petId
 */
export async function getPetById(petId) {
  const { data } = await httpServices.get(`${apiEndpoint}/${petId}`);
  return data.pet;
}

/**
 * יוצר חיית מחמד חדשה
 * POST /api/pets
 */
export async function createPet(petData) {
  const { data } = await httpServices.post(apiEndpoint, petData);
  return data.pet;
}

/**
 * מעדכן חיית מחמד קיימת
 * PUT /api/pets/:petId
 */
export async function updatePet(petId, petData) {
  const { data } = await httpServices.put(`${apiEndpoint}/${petId}`, petData);
  return data.pet;
}

/**
 * מוחק חיית מחמד
 * DELETE /api/pets/:petId
 */
export async function deletePet(petId) {
  const { data } = await httpServices.delete(`${apiEndpoint}/${petId}`);
  return data;
}

const petService = {
  getMyPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
};

export default petService;
