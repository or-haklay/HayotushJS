import { SIZING, FONTS, COLORS } from "../../../theme/theme";

export default {
  quickAction: {
    flex: 1,
    borderRadius: SIZING.radius_md,
    padding: SIZING.padding,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: SIZING.base / 2,
    minHeight: 120,
    elevation: 2,
  },
  quickActionText: {
    ...FONTS.body,
    fontFamily: "Rubik",
    fontSize: 12,
    color: COLORS.white,
    marginTop: SIZING.base,
    textAlign: "center",
  },
};
