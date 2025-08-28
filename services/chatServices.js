import httpServices from "./httpServices";

export async function sendMessage(message, petInfo = null) {
  const payload = { prompt: message };

  // אם יש מידע על חיית המחמד, נוסיף את כל המידע האפשרי
  if (petInfo) {
    payload.petInfo = {
      // מידע בסיסי
      name: petInfo.name,
      species: petInfo.species,
      breed: petInfo.breed,
      sex: petInfo.sex,
      weightKg: petInfo.weightKg,
      color: petInfo.color,
      chipNumber: petInfo.chipNumber,
      notes: petInfo.notes,
      birthDate: petInfo.birthDate,

      // תמונות
      profilePictureUrl: petInfo.profilePictureUrl,
      coverPictureUrl: petInfo.coverPictureUrl,

      // מידע נוסף אם קיים
      owner: petInfo.owner,
      createdAt: petInfo.createdAt,
      updatedAt: petInfo.updatedAt,

      // שדות נוספים שעשויים להיות רלוונטיים לצ'אט
      age: petInfo.age,
      lastVaccination: petInfo.lastVaccination,
      medicalConditions: petInfo.medicalConditions,
      dietaryRestrictions: petInfo.dietaryRestrictions,
      behavioralNotes: petInfo.behavioralNotes,

      // מידע על בעלים אם קיים
      ownerName: petInfo.ownerName,
      ownerPhone: petInfo.ownerPhone,
      ownerEmail: petInfo.ownerEmail,

      // מיקום אם קיים
      location: petInfo.location,
      address: petInfo.address,

      // הערות נוספות
      emergencyContact: petInfo.emergencyContact,
      vetInfo: petInfo.vetInfo,
      insuranceInfo: petInfo.insuranceInfo,
    };

    // ניקוי שדות ריקים או undefined
    Object.keys(payload.petInfo).forEach((key) => {
      if (
        payload.petInfo[key] === null ||
        payload.petInfo[key] === undefined ||
        payload.petInfo[key] === ""
      ) {
        delete payload.petInfo[key];
      }
    });
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
