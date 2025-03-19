import { Dispatch } from "redux";
import { client } from "../../../../App"; // Import your configured Apollo Client
import { FETCH_ADMIN_MASJID } from "../../actiontype";
import { UPDATE_MASJID_META } from "../../../graphql-api-calls/Salah/queries";

export const updateMasjidMeta =
  (id: string, input: any) => async (dispatch: Dispatch) => {
    try {
      // Execute the GraphQL mutation
      const { data } = await client.mutate({
        mutation: UPDATE_MASJID_META,
        variables: {
          id,
          input,
        },
      });

      if (data && data.updateMasjidMeta) {
        return {
          message: "Success",
          data: data.updateMasjidMeta,
        };
      } else {
        throw new Error("Failed to update Salah Method and Jurisdiction");
      }
    } catch (error: any) {
      console.error("Error updating  Salah Method and Jurisdiction:", error);

      return {
        success: false,
        message:
          error?.message ||
          "Failed To Update Salah Method and Jurisdiction: Something Went Wrong",
      };
    }
  };
