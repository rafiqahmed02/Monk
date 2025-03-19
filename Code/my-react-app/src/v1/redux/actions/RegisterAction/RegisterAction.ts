import { Dispatch } from "react";
import { registerUser } from "../../../api-calls/index";

export const UserRegister =
  (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    contact?: string;
    masjidId?: string;
  }) =>
  async (dispatch: Dispatch<any>) => {
    try {
      const response = await registerUser(data);

      if (response.status === 201) {
        dispatch({ type: "REGISTER_SUCCESS", payload: response.data });
        return response.data; // Return the registration details (id, sentOTP)
      } else {
        // Handle non-201 status by extracting the server's error message
        const errorMessage = response.data.error || "Unexpected error occurred";
        dispatch({ type: "REGISTER_FAILURE", payload: errorMessage });
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Registration Error:", error);
      let errorMessage = "Registration failed"; // Default error message

      if (error.response && error.response.data) {
        // Check if server responded with a more specific error message
        errorMessage = error.response.data.error || error.response.data;
      }

      dispatch({ type: "REGISTER_FAILURE", payload: errorMessage });
      throw new Error(errorMessage);
    }
  };
