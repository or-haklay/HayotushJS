import httpServices from "./httpServices";

export async function listReminders({
  petId,
  onlyUpcoming = true,
  sort = "date",
  order = "asc",
  limit,
} = {}) {
  const params = { onlyUpcoming: onlyUpcoming ? 1 : 0, sort, order };
  if (limit) params.limit = limit;
  if (petId) params.petId = petId;
  const { data } = await httpServices.get("/reminders", { params });
  return data?.reminders ?? [];
}

export async function createReminder({
  petId,
  title,
  description,
  date,
  time,
  repeatInterval = "none",
  timezone = "Asia/Jerusalem",
}) {
  try {
    const payload = {
      petId,
      title,
      description,
      date,
      time,
      repeatInterval,
      timezone,
    };

    const { data } = await httpServices.post("/reminders", payload);
    return { reminder: data?.reminder, pointsAdded: data?.pointsAdded || 0 };
  } catch (error) {
    console.error("❌ Error creating reminder:", error);
    throw error;
  }
}

export async function updateReminder(reminderId, patch) {
  const { data } = await httpServices.put(`/reminders/${reminderId}`, patch);
  return data?.reminder;
}

export async function completeReminder(reminderId, isCompleted = true) {
  const { data } = await httpServices.patch(
    `/reminders/${reminderId}/complete`,
    { isCompleted }
  );
  return data?.reminder;
}

export async function deleteReminder(reminderId) {
  await httpServices.delete(`/reminders/${reminderId}`);
}
