export type SettingType = "prayer-times" | "events" | "salah+events";

export interface ColorOption {
  name: string;
  value: string;
}

export interface Theme {
  name: string;
  colors: ColorOption[];
  orientations: string[];
}

export const PRAYER_TIMINGS_THEMES: { [key: string]: Theme } = {
  PEACEFUL_DAWN: {
    name: "Peaceful Dawn Theme",
    colors: [
      { name: "Rose White", value: "#FFF1F1" },
      { name: "Palm Green", value: "#2E4E37" },
    ],
    orientations: ["landscape", "portrait"],
  },
  LUMINOUS: {
    name: "Luminous Theme",
    colors: [
      { name: "Rose White", value: "#FFF1F1" },
      { name: "Pansy Purple", value: "#6B1B47" },
      { name: "Palm Green", value: "#2E4E37" },
      { name: "Downriver", value: "#092147" },
      { name: "Deep Violet", value: "#32004F" },
      { name: "Debian Red", value: "#D70A53" },
      { name: "Limed Spruce", value: "#3C4B4D" },
      { name: "Black Pearl", value: "#001B29" },
      { name: "Lime Green", value: "#36B536" },
    ],
    orientations: ["landscape", "portrait"],
  },
};

export const EVENT_THEMES: { [key: string]: Theme } = {
  EVENT_DEFAULT: {
    name: "Default Event Theme",
    colors: [
      { name: "Rose White", value: "#FFF1F1" },
      { name: "Palm Green", value: "#2E4E37" },
    ],
    orientations: ["landscape"],
  },
};

export const SALAH_EVENTS_THEMES: { [key: string]: Theme } = {
  SALAH_EVENTS_DEFAULT: {
    name: "Salah + Events Theme",
    colors: [
      { name: "Rose White", value: "#FFF1F1" },
      { name: "Pansy Purple", value: "#6B1B47" },
      { name: "Palm Green", value: "#2E4E37" },
      { name: "Debian Red", value: "#D70A53" },
      { name: "Deep Violet", value: "#32004F" },
      { name: "Black Pearl", value: "#001B29" },
      { name: "Limed Spruce", value: "#C4D2D8" },
      { name: "tuna", value: "#35374B" },
      { name: "Nile Blue", value: "#213555" },
      // { name: "Palm Leaf", value: "#1C2E14" },
    ],
    orientations: ["landscape"],
  },
};

/**
 * Centralized theme handler function.
 * @param settingType - The current setting type ('prayer-timings', 'events', or 'salah+events').
 * @param themeKey - The selected theme key (optional for 'salah+events').
 * @returns An object containing the colors and orientations for the selected setting.
 */
export const getThemeForSetting = (
  settingType: SettingType,
  themeKey: string
): Theme => {
  switch (settingType) {
    case "prayer-times":
      return themeKey && PRAYER_TIMINGS_THEMES[themeKey]
        ? PRAYER_TIMINGS_THEMES[themeKey]
        : PRAYER_TIMINGS_THEMES["PEACEFUL_DAWN"];

    case "events":
      return themeKey && EVENT_THEMES[themeKey]
        ? EVENT_THEMES[themeKey]
        : EVENT_THEMES.EVENT_DEFAULT; // Default event theme

    case "salah+events":
      return themeKey && SALAH_EVENTS_THEMES[themeKey]
        ? SALAH_EVENTS_THEMES[themeKey]
        : SALAH_EVENTS_THEMES.SALAH_EVENTS_DEFAULT;

    default:
      return themeKey && PRAYER_TIMINGS_THEMES[themeKey]
        ? PRAYER_TIMINGS_THEMES[themeKey]
        : PRAYER_TIMINGS_THEMES["PEACEFUL_DAWN"];
  }
};

export const getThemesByCategory = (
  settingType: SettingType
): Record<string, Theme> => {
  switch (settingType) {
    case "prayer-times":
      return PRAYER_TIMINGS_THEMES;
    case "events":
      return EVENT_THEMES;
    case "salah+events":
      return SALAH_EVENTS_THEMES;
    default:
      return {}; // Return an empty object if the category is invalid
  }
};

export const getDefaultThemeKeyForSetting = (
  settingType: SettingType
): string => {
  const themes = getThemesByCategory(settingType);
  return Object.keys(themes)[0] || "PEACEFUL_DAWN"; // ✅ Return the first key or fallback
};

export const THEMES = {
  PEACEFUL_DAWN: {
    name: "Peaceful Dawn Theme",
    colors: [
      { name: "Rose White", value: "#FFF1F1" },
      { name: "Palm Green", value: "#2E4E37" },
    ],
    orientations: ["landscape"],
  },
  LUMINOUS: {
    name: "Luminous Theme",
    colors: [
      { name: "Rose White", value: "#FFF1F1" },
      { name: "Pansy Purple", value: "#6B1B47" },
      { name: "Palm Green", value: "#2E4E37" },
      { name: "Downriver", value: "#092147" },
      { name: "Deep Violet", value: "#32004F" },
      { name: "Debian Red", value: "#D70A53" },
      { name: "Limed Spruce", value: "#3C4B4D" },
      { name: "Black Pearl", value: "#001B29" },
      { name: "Lime Green", value: "#36B536" },
    ],
    orientations: ["landscape", "portrait"],
  },
} as const;

export type ThemeKey = keyof typeof THEMES;
