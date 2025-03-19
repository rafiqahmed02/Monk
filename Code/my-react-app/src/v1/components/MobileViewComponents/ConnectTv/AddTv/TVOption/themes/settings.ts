export type SettingType = "prayer-times" | "events" | "salah+events";

export interface ColorOption {
  name: string;
  value: string;
}

export const EVENT_COLORS: ColorOption[] = [
  { name: "Rose White", value: "#FFF1F1" },
  { name: "Palm Green", value: "#2E4E37" },
];
