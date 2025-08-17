import { StyleSheet } from "react-native";
import { SIZING, FONTS, COLORS } from "../../theme/theme";

export default StyleSheet.create({
  // Card styles
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZING.medium,
    marginBottom: SIZING.small,
  },
  variant_default: {
    backgroundColor: COLORS.surface,
  },
  variant_elevated: {
    backgroundColor: COLORS.surface,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  variant_outlined: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  // Card padding variants
  card_padding_small: {
    padding: SIZING.small,
  },
  card_padding_medium: {
    padding: SIZING.medium,
  },
  card_padding_large: {
    padding: SIZING.large,
  },

  // Button styles
  button: {
    borderRadius: SIZING.medium,
    paddingVertical: SIZING.small,
    paddingHorizontal: SIZING.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  button_primary: {
    backgroundColor: COLORS.primary,
  },
  button_secondary: {
    backgroundColor: COLORS.secondary,
  },
  button_outlined: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  button_text: {
    backgroundColor: "transparent",
  },
  button_small: {
    paddingVertical: SIZING.small / 2,
    paddingHorizontal: SIZING.small,
  },
  button_medium: {
    paddingVertical: SIZING.small,
    paddingHorizontal: SIZING.medium,
  },
  button_large: {
    paddingVertical: SIZING.medium,
    paddingHorizontal: SIZING.large,
  },
  button_disabled: {
    backgroundColor: COLORS.disabled,
    opacity: 0.6,
  },

  // Input styles
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZING.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZING.medium,
    paddingVertical: SIZING.small,
    fontSize: SIZING.medium,
    fontFamily: FONTS.regular.fontFamily,
    color: COLORS.text,
  },
  input_focused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  input_error: {
    borderColor: COLORS.error,
  },
  inputContainer: {
    marginBottom: SIZING.medium,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  input_withLeftIcon: {
    paddingLeft: SIZING.large,
  },
  input_withRightIcon: {
    paddingRight: SIZING.large,
  },
  leftIcon: {
    position: "absolute",
    left: SIZING.medium,
    zIndex: 1,
  },
  rightIcon: {
    position: "absolute",
    right: SIZING.medium,
    zIndex: 1,
  },
  helperText: {
    fontSize: SIZING.text_small,
    marginTop: SIZING.small,
  },

  // Text styles
  text: {
    color: COLORS.text,
    fontFamily: FONTS.regular.fontFamily,
  },
  text_primary: {
    color: COLORS.primary,
  },
  text_secondary: {
    color: COLORS.textSecondary,
  },
  text_error: {
    color: COLORS.error,
  },
  text_success: {
    color: COLORS.success,
  },
  text_disabled: {
    color: COLORS.disabled,
  },
  text_small: {
    fontSize: SIZING.small,
  },
  text_size_medium: {
    fontSize: SIZING.medium,
  },
  text_size_large: {
    fontSize: SIZING.large,
  },
  text_size_xlarge: {
    fontSize: SIZING.xlarge,
  },
  text_bold: {
    fontFamily: FONTS.bold.fontFamily,
    fontSize: FONTS.bold.fontSize,
    fontWeight: FONTS.bold.fontWeight,
  },
  text_semiBold: {
    fontFamily: FONTS.semiBold.fontFamily,
    fontSize: FONTS.semiBold.fontSize,
    fontWeight: FONTS.semiBold.fontWeight,
  },
  text_font_medium: {
    fontFamily: FONTS.medium.fontFamily,
    fontSize: FONTS.medium.fontSize,
    fontWeight: FONTS.medium.fontWeight,
  },
  text_font_regular: {
    fontFamily: FONTS.regular.fontFamily,
    fontSize: FONTS.regular.fontSize,
    fontWeight: FONTS.regular.fontWeight,
  },

  // Layout styles
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  column: {
    flexDirection: "column",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  spaceBetween: {
    justifyContent: "space-between",
  },
  spaceAround: {
    justifyContent: "space-around",
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  flex3: {
    flex: 3,
  },

  // Spacing styles
  margin_small: {
    margin: SIZING.small,
  },
  margin_medium: {
    margin: SIZING.medium,
  },
  margin_large: {
    margin: SIZING.large,
  },
  marginTop_small: {
    marginTop: SIZING.small,
  },
  marginTop_medium: {
    marginTop: SIZING.medium,
  },
  marginTop_large: {
    marginTop: SIZING.large,
  },
  marginBottom_small: {
    marginBottom: SIZING.small,
  },
  marginBottom_medium: {
    marginBottom: SIZING.medium,
  },
  marginBottom_large: {
    marginBottom: SIZING.large,
  },
  marginLeft_small: {
    marginLeft: SIZING.small,
  },
  marginLeft_medium: {
    marginLeft: SIZING.medium,
  },
  marginLeft_large: {
    marginLeft: SIZING.large,
  },
  marginRight_small: {
    marginRight: SIZING.small,
  },
  marginRight_medium: {
    marginRight: SIZING.medium,
  },
  marginRight_large: {
    marginRight: SIZING.large,
  },

  padding_small: {
    padding: SIZING.small,
  },
  padding_medium: {
    padding: SIZING.medium,
  },
  padding_large: {
    padding: SIZING.large,
  },
  paddingTop_small: {
    paddingTop: SIZING.small,
  },
  paddingTop_medium: {
    paddingTop: SIZING.medium,
  },
  paddingTop_large: {
    paddingTop: SIZING.large,
  },
  paddingBottom_small: {
    paddingBottom: SIZING.small,
  },
  paddingBottom_medium: {
    paddingBottom: SIZING.medium,
  },
  paddingBottom_large: {
    paddingBottom: SIZING.large,
  },
  paddingLeft_small: {
    paddingLeft: SIZING.small,
  },
  paddingLeft_medium: {
    paddingLeft: SIZING.medium,
  },
  paddingLeft_large: {
    paddingLeft: SIZING.large,
  },
  paddingRight_small: {
    paddingRight: SIZING.small,
  },
  paddingRight_medium: {
    paddingRight: SIZING.medium,
  },
  paddingRight_large: {
    paddingRight: SIZING.large,
  },
});
