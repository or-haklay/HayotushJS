import { SIZING, FONTS, COLORS } from "../../../theme/theme";

export default {
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZING.padding,
    paddingVertical: SIZING.base,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: SIZING.base,
    color: COLORS.neutral,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  logoText: {
    ...FONTS.h3,
    fontFamily: "Rubik",
    color: COLORS.neutral,
    marginLeft: SIZING.base,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.neutral,
    flex: 1,
  },
  rightIcon: {
    color: COLORS.accent,
  },
};
