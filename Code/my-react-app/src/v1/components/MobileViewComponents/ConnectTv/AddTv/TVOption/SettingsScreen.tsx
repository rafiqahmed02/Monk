import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Select,
  MenuItem,
  FormControl,
  Button,
  InputLabel,
  Backdrop,
  OutlinedInput,
  styled,
} from "@mui/material";
import { SettingType } from "./themes/settings";
import {
  getDefaultThemeKeyForSetting,
  getThemeForSetting,
  getThemesByCategory,
  ThemeKey,
} from "./themes/themes";
import { ColorPalette } from "./reusableComponent/color-palette";
import { Header } from "./reusableComponent/header";
import styles from "./Option.module.css";
import { getImagePath2 } from "../../helperfunc";
import unlinkIcon from "../../TV-Photos/unlickIcon.svg";

interface SettingsScreenProps {
  type: SettingType;
  onBack: () => void;
  onSave: (settings: any) => void;
  onCancel: () => void;
  isLive: boolean;
  handleokay: () => void;
  connectedTvData?: any; // Optional: Contains existing settings
  tvName?: string;
  onUnlink?: (id?: string) => void;
}

const typeOptions = ["Salah Timings", "Events", "Salah Timings + Event"];
const typeMapping: { [key: string]: string } = {
  "Salah Timings": "prayer-times",
  Events: "events",
  "Salah Timings + Event": "salah+events",
};

const ButtonContainer = styled(Box)({
  display: "flex",
  gap: "12px",
  marginTop: "auto",
  justifyContent: "center",
  alignItems: "center",
});

const UnlinkButton = styled(Button)({
  backgroundColor: "white",
  border: "2px solid #FF7272",
  color: "#FF6B6B",
  textTransform: "none",
  borderRadius: "25px",
  padding: "3px 10px",
  marginTop: "10px",
  "&:hover": {
    backgroundColor: "#FFF0F0",
  },
});

export function SettingsScreen({
  onSave,
  onCancel,
  isLive,
  handleokay,
  connectedTvData,
  tvName,
  onUnlink,
}: SettingsScreenProps) {
  const defaultTheme =
    connectedTvData?.theme === "none"
      ? "PEACEFUL_DAWN"
      : connectedTvData?.theme?.toUpperCase() || "PEACEFUL_DAWN";
  const defaultOrientation = connectedTvData?.orientation || "landscape";

  const initialType =
    connectedTvData?.type === "prayer-times"
      ? "Salah Timings"
      : connectedTvData?.type === "salah+events"
      ? "Salah Timings + Event"
      : connectedTvData?.type === "events"
      ? "Events"
      : "Salah Timings";

  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>(defaultTheme);
  const [orientation, setOrientation] = useState(defaultOrientation);

  // const currentSetting: SettingType = type;
  // const ThemesByCategory = getThemesByCategory(type);
  // const CurrentTheme = getThemeForSetting(
  //   currentSetting,
  //   selectedTheme || "PEACEFUL_DAWN"
  // );
  const internalType = typeMapping[selectedType];
  const ThemesByCategory = getThemesByCategory(internalType as SettingType);
  const CurrentTheme = getThemeForSetting(
    internalType as SettingType,
    selectedTheme || "PEACEFUL_DAWN"
  );

  const [selectedColor, setSelectedColor] = useState(
    connectedTvData?.color || CurrentTheme?.colors[0].name
  );

  // Reset orientation and color when theme changes (for salah settings only)
  useEffect(() => {
    // const theme = THEMES[selectedTheme];
    if (connectedTvData.type === "prayer-times" && !connectedTvData) {
      setOrientation(CurrentTheme?.orientations[0]);
      setSelectedColor(CurrentTheme?.colors[0].name);
    } else if (
      connectedTvData &&
      connectedTvData.type === "prayer-times" &&
      selectedTheme !== connectedTvData?.theme?.toUpperCase()
    ) {
      setOrientation(CurrentTheme?.orientations[0]);
      setSelectedColor(CurrentTheme?.colors[0].name);
    } else if (internalType !== connectedTvData?.type) {
      setSelectedColor(CurrentTheme?.colors[0].name);
      setOrientation(CurrentTheme?.orientations[0]);
    }
  }, [selectedTheme, connectedTvData, internalType]);

  useEffect(() => {
    if (internalType !== connectedTvData?.type) {
      const defaultThemeKey: any = getDefaultThemeKeyForSetting(
        internalType as SettingType
      );
      setSelectedColor(CurrentTheme?.colors[0].name);
      setOrientation(CurrentTheme?.orientations[0]);
      setSelectedTheme(defaultThemeKey);
    }
  }, [internalType, connectedTvData]);

  console.log(selectedTheme, selectedColor, orientation, internalType);

  const handleSave = () => {
    const updatedSettings = {
      _id: connectedTvData?._id || "",
      name: connectedTvData?.name || tvName,
      theme: selectedTheme,
      color: selectedColor,
      orientation,
      type: internalType,
    };
    onSave(updatedSettings);
  };

  const renderContent = (children: React.ReactNode) => {
    if (selectedType === "Events" || selectedType === "Salah Timings + Event") {
      return (
        <>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                my: 3,
                mt: 2,
              }}
            >
              <img
                src={
                  getImagePath2(
                    internalType as SettingType,
                    "",
                    "",
                    selectedColor
                  ) || "/placeholder.svg"
                }
                alt="Events Display"
                width={400}
                height={200}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </Box>
          </Box>
          {children}
          <Box sx={{ mb: 3 }}>
            <ColorPalette
              colors={CurrentTheme?.colors}
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
            />
          </Box>
        </>
      );
    }

    return (
      <>
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              mb: 3,
              mt: 2,
            }}
          >
            <img
              src={
                getImagePath2(
                  "prayer-times",
                  selectedTheme,
                  orientation,
                  selectedColor
                ) || "/placeholder.svg"
              }
              alt="Prayer Times Display"
              width={400}
              height={200}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          </Box>
        </Box>
        {children}

        {/* {THEMES[selectedTheme].orientations.length > 1 && ( */}

        {/* )} */}

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel
              id="theme-label"
              sx={{
                fontSize: {
                  xs: "14px",
                  sm: "14px",
                  md: "16px",
                },
                color: "#545454",
              }}
            >
              Select Theme
            </InputLabel>
            <Select
              labelId="theme-label"
              value={selectedTheme}
              label="Select Theme"
              onChange={(e) => setSelectedTheme(e.target.value as ThemeKey)}
              sx={{
                borderRadius: 10,
                fontSize: {
                  xs: "13px",
                  sm: "14px",
                  md: "16px",
                },
                textAlign: "left",

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#545454",
                  py: 1,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: 3,
                    mt: 1,
                    py: 0,
                  },
                },
                MenuListProps: {
                  sx: {
                    py: 0,
                  },
                },
              }}
            >
              {Object.entries(ThemesByCategory).map(([key, theme]) => (
                <MenuItem key={key} value={key}>
                  {theme.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ mb: 3, mt: 3 }}>
          {CurrentTheme?.orientations.length > 1 ? (
            <FormControl fullWidth>
              <InputLabel
                id="orientation-label"
                sx={{
                  fontSize: { xs: "14px", sm: "14px", md: "16px" },
                  color: "#545454",
                }}
              >
                Orientation
              </InputLabel>
              <Select
                labelId="orientation-label"
                value={orientation}
                label="Orientation"
                onChange={(e) => setOrientation(e.target.value)}
                sx={{
                  borderRadius: 10,
                  fontSize: { xs: "13px", sm: "14px", md: "16px" },
                  textAlign: "left",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 10,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#545454",
                    py: 1,
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: 3,
                      mt: 1,
                    },
                  },
                  MenuListProps: {
                    sx: {
                      py: 0,
                    },
                  },
                }}
              >
                {CurrentTheme?.orientations.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth>
              <InputLabel
                id="orientation-label"
                shrink // Ensures correct positioning like a Select component
                sx={{
                  fontSize: { xs: "14px", sm: "14px", md: "16px" },
                  color: "#545454",
                  backgroundColor: "white", // Prevents cutting through the border
                }}
              >
                Orientation
              </InputLabel>
              <OutlinedInput
                label="Orientation"
                value={CurrentTheme?.orientations[0].replace(/^\w/, (c) =>
                  c.toUpperCase()
                )}
                readOnly
                sx={{
                  borderRadius: 10,
                  fontSize: { xs: "13px", sm: "14px", md: "16px" },
                  textAlign: "left",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 10,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#545454",
                    py: 1,
                  },
                  "& input": {
                    cursor: "default", // Prevent text selection
                    paddingLeft: "14px", // Aligns text properly like Select
                  },
                  "& .MuiSvgIcon-root": {
                    display: "none", // Hides dropdown arrow
                  },
                }}
              />
            </FormControl>
          )}
        </Box>
        <Box sx={{ mb: 4 }}>
          <ColorPalette
            colors={CurrentTheme?.colors}
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
          />
        </Box>
      </>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        p: 3,
        maxWidth: "350px",
      }}
      className={styles.settingsScreen}
    >
      <Header name={connectedTvData?.name || tvName}>
        {onUnlink && (
          <ButtonContainer>
            <UnlinkButton onClick={() => onUnlink(connectedTvData._id)}>
              <img
                src={unlinkIcon}
                alt=""
                style={{
                  width: "15px",
                  height: "15px",
                  marginRight: "5px",
                }}
              />{" "}
              Delink Device
            </UnlinkButton>
          </ButtonContainer>
        )}
      </Header>

      {renderContent(
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel
              id="type-select-label"
              sx={{
                fontSize: { xs: "14px", sm: "14px", md: "16px" },
                color: "#545454",
              }}
            >
              Select Option To Display On TV
            </InputLabel>
            <Select
              labelId="type-select-label"
              value={selectedType}
              label="Select Option To Display On TV  " // Label matching the InputLabel
              onChange={(e) => setSelectedType(e.target.value)}
              sx={{
                borderRadius: 10,
                fontSize: { xs: "13px", sm: "14px", md: "16px" },
                textAlign: "left",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#545454",
                },
              }}
              MenuProps={{
                PaperProps: { sx: { borderRadius: 3, mt: 1, py: 0 } },
                MenuListProps: { sx: { py: 0 } },
              }}
              notched // Notch for proper label spacing
            >
              {typeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Dropdown for type selection */}

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 4,
        }}
      >
        <Button
          variant="outlined"
          fullWidth
          onClick={onCancel}
          sx={{
            borderRadius: 10,
            py: 1,
            borderColor: "#FF6B6B",
            color: "#FF6B6B",
            textTransform: "none",
            "&:hover": {
              borderColor: "#FF5252",
              backgroundColor: "rgba(255,107,107,0.04)",
            },
          }}
          disabled={
            connectedTvData.theme === "none" ||
            !connectedTvData?.permissions ||
            connectedTvData?.permissions?.length === 0
          }
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={handleSave}
          sx={{
            borderRadius: 10,
            py: 1,
            backgroundColor: "#1B8368",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#1B5E20",
            },
          }}
        >
          Save
        </Button>
      </Box>
      <Backdrop open={isLive} style={{ zIndex: "10" }}>
        <div className={`${styles.pairingpopup} ${styles.restarttv}`}>
          <b style={{ color: "#1B8368" }}>
            {" "}
            {` ${selectedType} is Active Now `}
          </b>
          <img
            src={getImagePath2(
              internalType as SettingType,
              selectedTheme,
              orientation,
              selectedColor
            )}
            alt=""
            style={{ width: "100%" }}
          />

          <button style={{ background: "#1B8368" }} onClick={handleokay}>
            Okay
          </button>
        </div>
      </Backdrop>
    </Paper>
  );
}
