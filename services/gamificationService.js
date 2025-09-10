import httpServices from "./httpServices";

export async function getSummary() {
  const { data } = await httpServices.get("/gamification/summary");
  return data;
}

export async function sendEvent(eventKey, targetId) {
  const { data } = await httpServices.post("/gamification/event", {
    eventKey,
    targetId,
  });
  return data;
}

export default { getSummary, sendEvent };
