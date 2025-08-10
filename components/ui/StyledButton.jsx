import React from "react";
import { TouchableOpacity, Text } from "react-native";

const StyledButton = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
}) => {
  // הגדרת סגנונות בסיסיים
  const baseContainerClasses =
    "py-3 px-4 rounded-custom-sm items-center justify-center";
  const baseTextClasses = "font-poppins-bold text-base";

  // הגדרת סגנונות לפי סוג הכפתור (variant)
  const variantContainerClasses = {
    primary: "bg-primary",
    secondary: "bg-transparent border border-primary",
  };

  const variantTextClasses = {
    primary: "text-white",
    secondary: "text-primary",
  };

  // סגנון למצב מושבת (disabled)
  const disabledClasses = "bg-disabled border-disabled";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`
        ${baseContainerClasses}
        ${disabled ? disabledClasses : variantContainerClasses[variant]}
      `}
    >
      <Text
        className={`
          ${baseTextClasses}
          ${disabled ? "text-white" : variantTextClasses[variant]}
        `}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default StyledButton;
