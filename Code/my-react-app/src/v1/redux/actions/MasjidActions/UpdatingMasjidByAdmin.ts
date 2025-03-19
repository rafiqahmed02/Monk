
import { Dispatch } from "redux";
import { client } from "../../../../App"; // Import your configured Apollo Client
import { FETCH_ADMIN_MASJID } from "../../actiontype";
import { UPDATE_MASJID } from "../../../graphql-api-calls/mutation";

export const updateAdminMasjid =
  (id: string, formData: any) => async (dispatch: Dispatch) => {
    try {
      console.log(formData);
      // Execute the GraphQL mutation
      const { data } = await client.mutate({
        mutation: UPDATE_MASJID,
        variables: {
          id,
          input: formData,
        },
      });

      if (data && data.updateMasjid) {
        console.log(data.updateMasjid);
        // Dispatch the updated data to Redux
        dispatch({ type: FETCH_ADMIN_MASJID, payload: data.updateMasjid });

        return {
          message: "Success",
          data: data.updateMasjid,
        };
      } else {
        throw new Error("Failed to update masjid");
      }
    } catch (error: any) {
      console.error("Error updating masjid:", error);

      return {
        success: false,
        message:
          error?.message || "Failed To Update Masjid: Something Went Wrong",
      };
    }
  };
