const initialState = {
  user: null,
  token: null,
  error: null,
};

export const UserReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case "REGISTER_SUCCESS":
      return {
        ...state,
        user: action.payload,
        error: null,
      };
    case "REGISTER_FAILURE":
      return {
        ...state,
        error: action.error,
      };
    case "VERIFY_OTP_SUCCESS":
      return {
        ...state,
        token: action.payload.token,
        error: null,
      };
    case "VERIFY_OTP_FAILURE":
      return {
        ...state,
        error: action.error,
      };
    default:
      return state;
  }
};
