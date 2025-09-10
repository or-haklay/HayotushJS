import httpServices from "./httpServices";

const apiEndpoint = "/expenses";

export async function listExpenses({
  petId,
  from,
  to,
  limit,
  sort,
  order,
} = {}) {
  try {
    const params = {};
    if (petId) params.petId = petId;
    if (from) params.from = from;
    if (to) params.to = to;
    if (limit) params.limit = limit;
    if (sort) params.sort = sort;
    if (order) params.order = order;

    const { data } = await httpServices.get(apiEndpoint, { params });
    return data.expenses || [];
  } catch (error) {
    console.error("❌ Error in listExpenses:", error);
    throw error;
  }
}

export async function createExpense(expenseData) {
  try {
    const { data } = await httpServices.post(apiEndpoint, expenseData);
    return { expense: data.expense, pointsAdded: data.pointsAdded || 0 };
  } catch (error) {
    console.error("❌ Error in createExpense:", error);
    throw error;
  }
}

export async function updateExpense(expenseId, patch) {
  try {
    const { data } = await httpServices.put(
      `${apiEndpoint}/${expenseId}`,
      patch
    );
    return data.expense;
  } catch (error) {
    console.error("❌ Error in updateExpense:", error);
    throw error;
  }
}

export async function deleteExpense(expenseId) {
  try {
    await httpServices.delete(`${apiEndpoint}/${expenseId}`);
  } catch (error) {
    console.error("❌ Error in deleteExpense:", error);
    throw error;
  }
}

export async function getExpenseById(expenseId) {
  try {
    const { data } = await httpServices.get(`${apiEndpoint}/${expenseId}`);
    return data.expense;
  } catch (error) {
    console.error("❌ Error in getExpenseById:", error);
    throw error;
  }
}
