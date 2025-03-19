import { createTheme } from "@material-ui/core/styles";

const Theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 768, // Custom breakpoint for 768px and up
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    common: {
      white: "#ffffff",
    },
    grey: {
      500: "#9e9e9e", // Define grey color
    },
  },
});

export default Theme;
