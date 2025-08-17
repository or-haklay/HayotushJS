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

    console.log("📋 Listing expenses with params:", params);
    console.log("🔍 Sort params:", { sort, order });
    console.log("🔍 Full params object:", params);

    const { data } = await httpServices.get(apiEndpoint, { params });
    console.log(
      "✅ Expenses listed successfully, count:",
      data.expenses?.length || 0
    );
    console.log("📊 First few expenses:", data.expenses?.slice(0, 3));
    return data.expenses || [];
  } catch (error) {
    console.error("❌ Error in listExpenses:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    throw error;
  }
}

export async function createExpense(expenseData) {
  try {
    console.log("📤 Sending expense data to server:", expenseData);
    console.log("📅 Date details:", {
      date: expenseData.date,
      dateType: typeof expenseData.date,
      dateLength: expenseData.date?.length,
    });

    const { data } = await httpServices.post(apiEndpoint, expenseData);
    console.log("✅ Expense created successfully:", data);
    return data.expense;
  } catch (error) {
    console.error("❌ Error in createExpense:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    throw error;
  }
}

export async function updateExpense(expenseId, patch) {
  try {
    console.log("📝 Updating expense:", expenseId, "with patch:", patch);
    const { data } = await httpServices.put(`${apiEndpoint}/${expenseId}`, patch);
    console.log("✅ Expense updated successfully:", data);
    return data.expense;
  } catch (error) {
    console.error("❌ Error in updateExpense:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    throw error;
  }
}

export async function deleteExpense(expenseId) {
  try {
    console.log("🗑️ Deleting expense:", expenseId);
    await httpServices.delete(`${apiEndpoint}/${expenseId}`);
    console.log("✅ Expense deleted successfully");
  } catch (error) {
    console.error("❌ Error in deleteExpense:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    throw error;
  }
}

export async function getExpenseById(expenseId) {
  try {
    console.log("🔍 Getting expense by ID:", expenseId);
    const { data } = await httpServices.get(`${apiEndpoint}/${expenseId}`);
    console.log("✅ Expense retrieved successfully:", data);
    return data.expense;
  } catch (error) {
    console.error("❌ Error in getExpenseById:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);
    throw error;
  }
}
