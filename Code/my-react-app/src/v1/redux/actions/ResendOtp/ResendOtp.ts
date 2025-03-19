// actions.ts
import { Dispatch } from "redux";
import { reSendOtp } from "../../../api-calls";

export const resendOtpAction =
  (data: { email: string }) => async (dispatch: Dispatch) => {
    dispatch({ type: "RESEND_OTP_REQUEST" });

    try {
      const response = await reSendOtp(data);
      dispatch({
        type: "RESEND_OTP_SUCCESS",
        payload: response.data, // Assuming response has data here
      });
    } catch (error: any) {
      dispatch({
        type: "RESEND_OTP_FAILURE",
        payload: error.message || "Failed to resend OTP",
      });
    }
  };
