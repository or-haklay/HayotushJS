import { SIZING, FONTS, COLORS } from "../../../theme/theme";

export default {
  reminderCard: {
    padding: SIZING.padding,
    borderRadius: SIZING.radius_lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZING.margin * 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderText: {
    ...FONTS.body,
    fontFamily: "Rubik",
    fontSize: 16,
    color: COLORS.white,
  },
  reminderPetName: {
    ...FONTS.h3,
    color: COLORS.white,
    marginVertical: SIZING.base / 2,
  },
  reminderButton: {
    paddingVertical: SIZING.base,
    paddingHorizontal: SIZING.padding,
    borderRadius: SIZING.radius_md,
    elevation: 2,
    alignSelf: "flex-end",
    backgroundColor: COLORS.accent,
  },
  reminderButtonText: {
    ...FONTS.body,
    fontFamily: "Rubik",
    color: COLORS.primary,
    fontWeight: "bold",
  },
};
