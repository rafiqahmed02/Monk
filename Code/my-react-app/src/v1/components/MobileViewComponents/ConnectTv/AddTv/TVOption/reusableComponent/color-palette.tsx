import { Box, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

interface ColorOption {
  name: string;
  value: string;
}

interface ColorPaletteProps {
  colors: readonly ColorOption[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export function ColorPalette({
  colors,
  selectedColor,
  onColorSelect,
}: ColorPaletteProps) {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="caption"
        sx={{
          mb: 1,
          display: "block",
          color: "#666",
        }}
      >
        Select Color
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            colors.length <= 4
              ? "repeat(auto-fit, 50px)" // Fixed size for ≤ 4 colors
              : "repeat(auto-fit, minmax(50px, 1fr))", // Adaptive layout for > 4 colors
          gap: 1,
          mt: 1,
          justifyItems: "center",
        }}
      >
        {colors.map((color) => (
          <Box
            key={color.name}
            onClick={() => onColorSelect(color.name)}
            sx={{
              width: "100%",
              aspectRatio: "1.6",
              backgroundColor: color.value,
              borderRadius: 2,
              cursor: "pointer",
              border: "2px solid",
              borderColor:
                selectedColor === color.name ? "primary.main" : "transparent",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                transform: "scale(1.10)",
              },
            }}
          >
            {selectedColor === color.name && (
              <CheckIcon
                sx={{
                  color: color.name === "Rose White" ? "black" : "white",
                  fontSize: 20,
                }}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
