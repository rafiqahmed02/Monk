import React from "react";
import { Button, CircularProgress, IconButton } from "@mui/material";

interface CustomButtonProps {
  text?: string; // Title of the button (optional for icon-only buttons)
  onClick: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void; // Button click handler
  iconSrc?: string; // Optional image source (URL or path to local image)
  isLoading?: boolean; // Whether the button is in loading state
  disabled?: boolean; // Whether the button is disabled
  className?: string; // Custom class name
  style?: React.CSSProperties; // Custom inline styles
  iconPosition?: "left" | "right"; // Position of the icon (left or right of the text)
  size?: "small" | "medium" | "large"; // Size of the button
  variant?: "text" | "outlined" | "contained"; // Button variant
  buttonStyle?: object; // Custom styles using the sx prop for MUI
  iconStyle?: object;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  onClick,
  iconSrc,
  isLoading = false,
  disabled = false,
  className = "",
  iconPosition = "left",
  size = "medium",
  variant = "contained",
  buttonStyle = {}, // sx prop for responsive styling
  iconStyle = {},
}) => {
  const icon = iconSrc ? (
    <img src={iconSrc} alt="icon" style={{ ...iconStyle }} />
  ) : null;

  // If no text is provided, use IconButton for an icon-only button
  if (!text) {
    return (
      <IconButton
        onClick={(e) => onClick(e)}
        disabled={disabled || isLoading}
        className={`custom-button ${className}`}
        data-testid="custom-icon-button"
        size={size}
        sx={buttonStyle}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : icon}
      </IconButton>
    );
  }

  // Otherwise, use Button with text and icon
  return (
    <Button
      data-testid="custom-button"
      onClick={(e) => onClick(e)}
      disabled={disabled || isLoading}
      className={`custom-button ${className}`}
      size={size}
      variant={variant}
      color="inherit" // Use "inherit" to allow custom textColor
      startIcon={icon && iconPosition === "left" ? icon : undefined}
      endIcon={icon && iconPosition === "right" ? icon : undefined}
      sx={{ ...buttonStyle }}
    >
      {isLoading ? <CircularProgress size={24} color="inherit" /> : text}
    </Button>
  );
};

export default CustomButton;
