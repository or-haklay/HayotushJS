import { StyleSheet } from "react-native";
import { COLORS, SIZING, FONTS } from "../../../../theme/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: 16,
  },
  title: { 
    ...FONTS.h2, 
    marginBottom: SIZING.margin 
  },
  listContainer: { 
    paddingHorizontal: 8, 
    paddingBottom: 96 
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    backgroundColor: COLORS.primary,
  },
  fabText: {
    color: COLORS.white,
  },
  snackbar: { 
    backgroundColor: COLORS.error 
  },
  // Styles for NewMedicalRecord
  input: { 
    marginTop: 12 
  },
  dateButton: { 
    marginTop: 12 
  },
  saveButton: { 
    marginTop: 16, 
    backgroundColor: COLORS.primary 
  },
});
