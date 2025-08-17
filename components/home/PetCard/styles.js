import { SIZING, FONTS, COLORS } from "../../../theme/theme";

export default {
  petCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZING.radius_md,
    padding: SIZING.padding,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZING.margin * 2,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: "100%",
    marginRight: SIZING.margin,
  },
  petImage: {
    width: 70,
    height: 70,
    borderRadius: SIZING.radius_xl,
    marginRight: SIZING.margin,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    ...FONTS.h3,
    color: COLORS.neutral,
  },
  petType: {
    ...FONTS.body,
    color: COLORS.neutral,
  },
  chevron: {
    color: COLORS.disabled,
  },
};
