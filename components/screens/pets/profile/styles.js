import { StyleSheet } from "react-native";
import { COLORS, FONTS } from "../../../../theme/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  cardCover: {
    height: 200,
    backgroundColor: COLORS.white,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardContent: {
    gap: 8,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  notes: {
    ...FONTS.body,
    marginTop: 4,
    color: COLORS.neutral,
  },
  quickActions: {
    marginTop: 12,
    gap: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  halfButton: {
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  listDivider: {
    marginVertical: 8,
  },
  monthTotal: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  yearTotal: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  snackbar: {
    backgroundColor: COLORS.error,
  },
});
