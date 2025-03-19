import { Dispatch } from "redux";
import { client } from "../../../../App"; // Import your configured Apollo Client
import { gql } from "@apollo/client";
import tz_lookup from "tz-lookup";
import { GET_MASJID_BY_ID } from "../../../graphql-api-calls/query";

export const fetchMasjidById =
  (id: string) => async (dispatch: Dispatch<any>) => {
    try {
      // Execute the GraphQL query
      const { data } = await client.query({
        query: GET_MASJID_BY_ID,
        variables: { id },
        fetchPolicy: "network-only",
      });

      if (data && data.getMasjidById) {
        // Clone the data to avoid modifying the original object
        const masjidData = { ...data.getMasjidById };

        // Add timezone information using tz_lookup
        const longitude = masjidData.location.coordinates[0];
        const latitude = masjidData.location.coordinates[1];
        const timezone = tz_lookup(latitude, longitude);
        masjidData.location = { ...masjidData.location, timezone };

        // Dispatch the data to the Redux store
        dispatch({ type: "FETCH_ADMIN_MASJID", payload: masjidData });

        return masjidData;
      } else {
        throw new Error("Masjid not found");
      }
    } catch (error: any) {
      console.error("Error fetching masjid data:", error);
      return error.response;
    }
  };
