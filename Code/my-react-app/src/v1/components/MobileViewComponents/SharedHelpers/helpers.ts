import tz_lookup from "tz-lookup";
import { customNavigatorTo } from "../../../helpers/HelperFunction";
import { useNavigationprop } from "../../../../MyProvider";
import { NavigateFunction } from "react-router";
import { useEffect } from "react";

export const getTimeZoneFromCoordinates = (lat: number, lon: number) => {
  if (lat && lon) {
    return tz_lookup(lat, lon); // Return the time zone string
  }
  return ""; // Return null if coordinates are not available
};

export const handleBackBtn = (
  navigation: NavigateFunction | null,
  route: string = "/feed/0"
) => {
  if (navigation) {
    navigation(route);
  } else {
    customNavigatorTo(route);
  }
};

export const BasicButtonStyle = {
  backgroundColor: "#1B8368",
  color: "white",
  borderRadius: "30px",
  ":hover": {
    backgroundColor: "#1B8368",
  },
  textTransform: "none",
};

//Function to disable scroll on number input field (diable mosue wheel event)
export const useDisableScrollOnNumberInput = (
  inputRef: React.RefObject<HTMLInputElement>
) => {
  useEffect(
    () => {
      const inputEl = inputRef.current;
      if (inputEl) {
        const preventScroll = (e: WheelEvent) => {
          e.preventDefault();
        };

        // Add wheel event listener
        inputEl.addEventListener("wheel", preventScroll);

        // Cleanup event listener
        return () => {
          inputEl.removeEventListener("wheel", preventScroll);
        };
      }
    },
    [inputRef]
  );
};
export function isNumber(value: any) {
  return typeof value === "number" && !isNaN(value);
}

export const roleRenamer = (role: string) => {
  if (!role) return role;
  else {
    const displayRole =
      role === "subadmin"
        ? "Masjid Admin"
        : role === "admin"
          ? "Data Entry"
          : role === "superadmin"
            ? "Super Admin"
            : role === "musaliadmin" ? "Musali Admin" : role;
    return displayRole.charAt(0).toUpperCase() + displayRole.slice(1);
  }
};
