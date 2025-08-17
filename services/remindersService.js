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
    console.log("🔔 Creating reminder with data:", {
      petId,
      title,
      description,
      date,
      time,
      repeatInterval,
      timezone,
    });

    const payload = {
      petId,
      title,
      description,
      date,
      time,
      repeatInterval,
      timezone,
    };

    console.log("📤 Sending payload to /reminders:", payload);
    console.log("📅 Date details:", {
      date: date,
      dateType: typeof date,
      dateLength: date?.length,
      time: time,
      timeType: typeof time
    });

    const { data } = await httpServices.post("/reminders", payload);

    console.log("✅ Reminder created successfully:", data);

    return data?.reminder;
  } catch (error) {
    console.error("❌ Error creating reminder:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    throw error;
  }
}

export async function updateReminder(reminderId, patch) {
  const { data } = await httpServices.put(`/reminders/${reminderId}`, patch);
  return data?.reminder;
}

export async function completeReminder(reminderId) {
  const { data } = await httpServices.patch(
    `/reminders/${reminderId}/complete`
  );
  return data?.reminder;
}

export async function deleteReminder(reminderId) {
  await httpServices.delete(`/reminders/${reminderId}`);
}
