// usePlaceDetails.ts
import { RefObject, useCallback } from "react";

interface PlaceDetails {
  formattedAddress: string;
  lat: number;
  lng: number;
  masjidName: string;
  masjidContact?: string;
  website?: string;
}

export const usePlaceDetails = (
  placesServiceRef: RefObject<HTMLDivElement>
) => {
  const fetchDetails = useCallback(
    (placeId: string): Promise<PlaceDetails | null> => {
      return new Promise((resolve, reject) => {
        if (placesServiceRef.current) {
          const service = new window.google.maps.places.PlacesService(
            placesServiceRef.current
          );
          service.getDetails(
            {
              placeId,
              fields: [
                "formatted_address",
                "geometry",
                "name",
                "international_phone_number",
                "website",
              ],
            },
            (place, status) => {
              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                place
              ) {
                const details: PlaceDetails = {
                  formattedAddress: place.formatted_address || "",
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0,
                  masjidName: place.name || "",
                  masjidContact: place.international_phone_number,
                  website: place.website,
                };
                resolve(details);
              } else {
                console.error("Failed to fetch place details:", status);
                resolve(null);
              }
            }
          );
        } else {
          console.error("PlacesServiceRef is not attached to a DOM element.");
          resolve(null);
        }
      });
    },
    [placesServiceRef]
  );

  return { fetchDetails };
};

export interface LocationData {
  bounds: google.maps.LatLngBounds | undefined;
  countryCode: string;
}

// Utility function to fetch user location and reverse geocode to get country code
export const fetchUserLocation = async (
  googleMapsApiKey: string
): Promise<LocationData> => {
  try {
    // Fetch approximate user location (IP-based)
    const geolocationResponse = await fetch(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${googleMapsApiKey}`,
      { method: "POST" }
    );
    const geoData = await geolocationResponse.json();

    if (geoData?.location && window.google?.maps) {
      const { lat, lng } = geoData.location;

      // Create bounds based on the user's location
      const userLatLng = new window.google.maps.LatLng(lat, lng);
      const userBounds = new window.google.maps.LatLngBounds();
      userBounds.extend(userLatLng);

      // Reverse geocode to fetch country code
      const reverseGeocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`
      );
      const reverseData = await reverseGeocodeResponse.json();

      const addressComponents = reverseData.results[0]?.address_components;
      const countryComponent = addressComponents?.find((component: any) =>
        component.types.includes("country")
      );
      const countryCode = countryComponent?.short_name?.toLowerCase() || "us";

      return { bounds: userBounds, countryCode };
    }

    console.error("Google Maps API is not loaded.");
    return { bounds: undefined, countryCode: "us" };
  } catch (error) {
    console.error("Error fetching user location:", error);
    return { bounds: undefined, countryCode: "us" };
  }
};


export const validateAddress = async (
  googleMapsApiKey: string,address:string
): Promise<{ address: string; latitude: number; longitude: number } | null> => {  
  try {
    console.log("validating address", address); 
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    // Means Google did not return any valid geocoding results
    return null;
  }
  const result = data.results[0];
  const { types, formatted_address, geometry, partial_match } = result;
  const isStreetAddress =
      types.includes('street_address') ||
      types.includes('premise') ||
      types.includes('subpremise')

    // If partial_match is true, Google guessed part of it
    if (!isStreetAddress || partial_match) {
      return null;
    }
    const { lat, lng } = geometry.location;

    // Return the validated address info
    return {
      address: formatted_address,
      latitude: lat,
      longitude: lng,
    };
  } catch (error) {
    console.error('Error in validateAddressAndGetCoordinates:', error);
    return null;
  }
};
