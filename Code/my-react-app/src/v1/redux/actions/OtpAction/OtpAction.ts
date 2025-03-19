import { Dispatch } from "react";
import { verifyOtp } from "../../../api-calls";

export const OtpVerify =
  (data: { email: string; otp: string }) => async (dispatch: Dispatch<any>) => {
    try {
      const response = await verifyOtp(data);

      if (response.status === 200) {
        dispatch({ type: "VERIFY_OTP_SUCCESS", payload: response.data });
        return response.data; // Return user details and token
      } else {
        throw response; // Throwing the response to be caught in the catch block
      }
    } catch (error: any) {
      dispatch({
        type: "VERIFY_OTP_FAILURE",
        error: error.message || "OTP verification failed",
      });
      throw error; // Rethrow the error to be caught by the component
    }
  };
