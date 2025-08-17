import { SIZING, COLORS } from "../../../theme/theme";

export default {
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZING.padding,
    paddingVertical: SIZING.base,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: SIZING.radius_lg,
    paddingHorizontal: SIZING.base,
  },
  searchIcon: {
    marginRight: SIZING.base,
    color: COLORS.disabled,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SIZING.base,
    fontFamily: "Rubik",
    fontSize: 16,
    color: COLORS.neutral,
  },
  clearButton: {
    margin: 0,
    color: COLORS.disabled,
  },
  filterButton: {
    marginLeft: SIZING.base,
    color: COLORS.accent,
  },
  placeholder: {
    color: COLORS.disabled,
  },
};
