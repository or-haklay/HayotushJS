import { StyleSheet } from "react-native";
import { COLORS, FONTS } from "../../../../theme/theme";

export const styles = StyleSheet.create({
  // ExpenseFormScreen styles
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
  },
  title: {
    ...FONTS.h2,
  },
  descriptionInput: {
    marginTop: 12,
  },
  amountInput: {
    marginTop: -8,
  },
  categoryContainer: {
    marginTop: 12,
  },
  segmentedButtons: {
    backgroundColor: COLORS.white,
  },
  vendorInput: {
    marginTop: 12,
  },
  dateButton: {
    marginTop: 12,
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
  },
  snackbar: {
    backgroundColor: COLORS.error,
  },

  // ExpensesListScreen styles
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sortContainer: {
    marginTop: 8,
  },
  orderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  summaryContainer: {
    marginTop: 8,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalText: {
    ...FONTS.body,
  },
  listContent: {
    padding: 8,
    paddingBottom: 96,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountBadge: {
    marginRight: 8,
  },
  itemSeparator: {
    height: 8,
  },
  emptyContainer: {
    padding: 24,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    backgroundColor: COLORS.primary,
  },
  chartButton: {
    position: "absolute",
    right: 16,
    bottom: 80,
  },

  // ExpensesSummaryScreen styles
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    ...FONTS.h2,
  },
  yearControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  modeSelector: {
    marginTop: 8,
  },
  chartCard: {
    marginTop: 12,
    borderRadius: 12,
  },
  totalAmount: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  divider: {
    marginVertical: 8,
  },
  loader: {
    marginTop: 16,
  },
  noData: {
    marginTop: 8,
  },
});
