import { Dispatch } from "redux";
import * as api from "../../../api-calls/index";
import { UserActionType } from "../../Types";
import { AUTH_LOGIN } from "../../actiontype";
type formDataType = {
  email: string;
  password: string;
};
export const authLogin =
  (formData: formDataType, CaptchaValue: string) =>
  async (dispatch: Dispatch<UserActionType>) => {
    try {
      const response = await api.LoginAdmin(formData, CaptchaValue);

      if (response.status === 200) {
        if (response.data.isTwoFactorAuthentication) {
          let isTwoFAUser = {
            success: true,
            TwoFAUser: true,
            adminId: response.data.id,
          };

          return isTwoFAUser;
        } else {
          let isTwoFAUser = {
            success: true,
            TwoFAUser: false,
            adminId: response.data.id,
          };
          localStorage.setItem(
            "authTokens",
            JSON.stringify(response.data.token)
          );

          dispatch({ type: "AUTH_LOGIN", payload: response.data.user });
          setTimeout(() => {
            window.location.reload();
          }, 500);
          return isTwoFAUser;
        }
      }

      return response.data;
    } catch (error: any) {
      console.log(error);
      let isTwoFAUser = {
        success: false,
        TwoFAUser: false,
        error: `Failed to Login`,
        message: error.response.data,
      };
      return isTwoFAUser;
    }
  };
