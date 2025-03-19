interface State {
  loadingOtp: boolean;
  otpSuccess: boolean;
  otpError: string | null;
}

const initialState: State = {
  loadingOtp: false,
  otpSuccess: false,
  otpError: null,
};

export const resendOtpReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case "RESEND_OTP_REQUEST":
      return {
        ...state,
        loadingOtp: true,
        otpSuccess: false,
        otpError: null,
      };
    case "RESEND_OTP_SUCCESS":
      return {
        ...state,
        loadingOtp: false,
        otpSuccess: true,
        otpError: null,
      };
    case "RESEND_OTP_FAILURE":
      return {
        ...state,
        loadingOtp: false,
        otpSuccess: false,
        otpError: action.payload,
      };
    default:
      return state;
  }
};
