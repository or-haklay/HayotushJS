import httpServices from "./httpServices";

export async function sendMessage(message) {
  const { data } = await httpServices.post("/chat", { prompt: message });
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
