import httpServices from "./httpServices";

export async function listMedicalRecords({
  petId,
  sort = "date",
  order = "desc",
  limit,
  from,
  to,
} = {}) {
  const params = { sort, order };
  if (limit) params.limit = limit;
  if (from) params.from = from;
  if (to) params.to = to;
  if (petId) params.petId = petId;
  const { data } = await httpServices.get("/medical-records", { params });
  return data?.records ?? [];
}

export async function createMedicalRecord(payload) {
  const { data } = await httpServices.post("/medical-records", payload);
  return data?.record;
}

export async function updateMedicalRecord(recordId, patch) {
  const { data } = await httpServices.put(`/medical-records/${recordId}`, patch);
  return data?.record;
}

export async function deleteMedicalRecord(recordId) {
  await httpServices.delete(`/medical-records/${recordId}`);
}
