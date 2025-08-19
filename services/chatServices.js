import httpServices from "./httpServices";

export async function sendMessage(message, petInfo = null) {
  const payload = { prompt: message };
  
  // אם יש מידע על חיית המחמד, נוסיף אותו לשליחה
  if (petInfo) {
    payload.petInfo = {
      name: petInfo.name,
      species: petInfo.species,
      breed: petInfo.breed,
      sex: petInfo.sex,
      weightKg: petInfo.weightKg,
      color: petInfo.color,
      birthDate: petInfo.birthDate,
      notes: petInfo.notes
    };
  }
  
  const { data } = await httpServices.post("/chat", payload);
  return data?.reply;
}

export async function getChatHistory(limit = 50) {
  const { data } = await httpServices.get("/chat/messages", {
    params: { limit },
  });
  return data?.messages ?? [];
}

export async function markAsRead(messageId) {
  const { data } = await httpServices.patch(`/chat/messages/${messageId}/read`);
  return data?.message;
}

export async function resetConversation() {
  const { data } = await httpServices.post("/chat/reset");
  return data?.message;
}
