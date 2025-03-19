import React, { FC, useEffect, useRef, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { FaSearch } from "react-icons/fa";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./AddMasjidForm.module.css"; // Ensure correct CSS path
import toast from "react-hot-toast";

// Optionally define a callback type so parent can capture changes if it wishes
type OnAddressChangeType = (data: {
  address: string;
  lat: string;
  lng: string;
  isValid: boolean;
}) => void;

interface AutocompleteAddressInputProps {
  isLoaded: boolean;
  bounds: google.maps.LatLngBounds | null;

  /**
   * If your parent needs to know when the address/lat/lng is updated
   * or if the address is valid, provide this callback. It's optional.
   */
  onAddressChange?: OnAddressChangeType;

  /**
   * If you want to optionally prefill an initial address, lat, and lng.
   * Otherwise, they start empty.
   */
  initialAddress?: string;
  initialLat?: string;
  initialLng?: string;
  disabled?: boolean;
  disabledMsg?: string;
}

/**
 * This component manages its own `address`, `lat`, and `lng` states and
 * does validation of the Google place selection internally. The parent
 * can receive updates through the `onAddressChange` prop if needed.
 */
const AutocompleteAddressInput: FC<AutocompleteAddressInputProps> = ({
  isLoaded,
  bounds,
  onAddressChange,
  initialAddress,
  initialLat,
  initialLng,
  disabled = false,
  disabledMsg = "",
}) => {
  // Local states for address, lat, and lng
  const [address, setAddress] = useState<string>();
  const [lat, setLat] = useState<string>(initialLat || "");
  const [lng, setLng] = useState<string>(initialLng || "");
  // Basic error state: if the user typed or selected an invalid address

  const [hasAddressError, setHasAddressError] = useState(false);

  // If user picks an address, we hide the input & show the address
  const [isAddressSelected, setIsAddressSelected] = useState<boolean>(
    !!initialAddress
  ); // Refs
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setAddress(initialAddress);
    setLat(initialLat || "");
    setLng(initialLng || "");
    setIsAddressSelected(!!initialAddress);
  }, [initialAddress, initialLat, initialLng]);

  // This fires when the user picks a place from the Google dropdown
  const handlePlaceChanged = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (!place || !place.geometry || !place.geometry.location) {
      // No geometry => invalid selection
      setHasAddressError(true);
      setIsAddressSelected(false);
      setAddress("");
      setLat("");
      setLng("");
      // Let parent know we've effectively cleared or invalidated
      onAddressChange?.({ address: "", lat: "", lng: "", isValid: false });
      return;
    }

    // We have a valid place with geometry
    const selectedAddress = place.formatted_address || place.name || "";
    const latitude = place.geometry.location.lat().toString();
    const longitude = place.geometry.location.lng().toString();

    setAddress(selectedAddress);
    setLat(latitude);
    setLng(longitude);
    setHasAddressError(false);
    setIsAddressSelected(true);

    // Notify parent
    onAddressChange?.({
      address: selectedAddress,
      lat: latitude,
      lng: longitude,
      isValid: true,
    });
  };
  function handleFocus(e: any) {
    const label = e.target.parentNode.querySelector(`.${styles.floatingLabel}`);
    label.classList.add(styles.active); // Use styles.active for modular CSS
  }
  function handleBlur(e: any) {
    const label = e.target.parentNode.querySelector(`.${styles.floatingLabel}`);
    console.log("remove", e.target);
    if (e.target.value === "") {
      label.classList.remove(styles.active); // Use styles.active for modular CSS
    }
  }
  // Called when user types directly in the input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If the user modifies the text, then we consider the address unselected
    setIsAddressSelected(false);

    const value = e.target.value;

    setAddress(value);

    // If user empties the field, remove the error
    if (!value.trim()) {
      setHasAddressError(false);
    } else {
      setHasAddressError(true);
    }
  };

  // "Clear" function to reset everything
  const clearAddress = () => {
    if (disabled) {
      toast.dismiss();
      toast.error(disabledMsg);
      return;
    }
    setAddress("");
    setLat("");
    setLng("");
    setIsAddressSelected(false);
    setHasAddressError(false);
    onAddressChange?.({ address: "", lat: "", lng: "", isValid: false });
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        ...(disabled ? { WebkitTextFillColor: "rgba(0, 0, 0, 0.38)" } : {}),
      }}
    >
      {isLoaded ? (
        <div
          style={{ position: "relative" }}
          onClick={() => {
            if (disabled) {
              toast.dismiss();
              toast.error(disabledMsg);
              return;
            }
          }}
        >
          {/* Our icon */}
          <FaSearch className={styles.icon} />

          {/* Google Autocomplete */}
          <Autocomplete
            onLoad={(ref) => {
              autocompleteRef.current = ref;
            }}
            onPlaceChanged={handlePlaceChanged}
            bounds={bounds || undefined}
            options={{
              types: ["address"],
              fields: [
                "name",
                "formatted_address",
                "place_id",
                "geometry",
                "types",
              ],
            }}
          >
            <>
              <label
                className={`${styles.floatingLabel} ${
                  address ? styles.active : ""
                }`}
                style={{ left: "35px" }}
              >
                Enter or Search Address*
              </label>
              <input
                ref={inputRef}
                type="text"
                className={`${styles.input} ${
                  hasAddressError ? styles.inputError : ""
                }`}
                style={{
                  // If an address is selected, we hide the input.
                  display: isAddressSelected ? "none" : "block",
                  width: "100%",
                  padding: "10px 40px",
                  boxSizing: "border-box",
                }}
                placeholder="Type address here..."
                value={address}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  // prevent form submission on Enter
                  if (e.key === "Enter") e.preventDefault();
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={disabled}
              />
            </>
          </Autocomplete>

          {/* If we do have a selected address, show it in "read-only" style 
              plus the "X" to clear. */}
          {isAddressSelected && address && (
            <div className={styles.selectedAddress}>
              {address}
              <span className={styles.dropdownIcon} onClick={clearAddress}>
                <CloseIcon
                  sx={{
                    fontSize: 20,
                    color: disabled ? "rgba(0, 0, 0, 0.38)" : "inherit",
                  }}
                />
              </span>
            </div>
          )}
        </div>
      ) : (
        <p>Loading Google Maps...</p>
      )}

      {/* Error message if no valid address has been selected */}
      {hasAddressError && (
        <div
          style={{
            color: "red",
            fontSize: "0.75rem",
            marginLeft: "10px",
            marginTop: "3px",
          }}
        >
          Invalid Address. Please select a valid address from the dropdown.
        </div>
      )}
    </div>
  );
};

export default AutocompleteAddressInput;
