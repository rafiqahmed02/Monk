import React, { useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { CircularProgress } from "@material-ui/core";
import { resources } from "../../../resources/resources";
import { authLogin } from "../../../redux/actions/AuthActions/LoginAction";
import { VerifyingTwoFactorAuth } from "../../../redux/actions/AuthActions/VerifyingTwoFactorAuthAction";
import { handleSnackbar } from "../../../helpers/SnackbarHelper/SnackbarHelper";
import "./Login.css";
import LogoMain from "../../../photos/Newuiphotos/CM Logo/CM Logo.svg";
import ReCAPTCHA from "react-google-recaptcha";
import PasswordInput from "../../Shared/PasswordInput/PasswordInput";
import { useAppSelector, useAppThunkDispatch } from "../../../redux/hooks";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Box, Tooltip } from "@mui/material";
import { getHcaptchaKey } from "../../../helpers/ApiSetter/GraphQlApiSetter";
import OtpModal from "../../../components/MobileViewComponents/Shared/OtpModal/OtpModal";
import { toast, Toaster } from "react-hot-toast";
import { OtpVerify } from "../../../redux/actions/OtpAction/OtpAction";
import { resendOtpAction } from "../../../redux/actions/ResendOtp/ResendOtp";
import { fetchAdminDetails } from "../../../redux/actions/AuthActions/fetchAdminDetails";
import { customNavigatorTo } from "../../../helpers/HelperFunction";
import { useNavigationprop } from "../../../../MyProvider";
import { Turnstile } from "@marsidev/react-turnstile";

interface ResultType {
  success: boolean;
  TwoFAUser: boolean;
  adminId: string;
  message: string;
}
const Login = () => {
  const capchaKey = getHcaptchaKey();
  const captchaRef = useRef<HCaptcha>(null); // Ref to handle manual trigger
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const tokenRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppThunkDispatch();
  const { loadingOtp, otpSuccess, otpError } = useAppSelector(
    (state) => state.resendOtpReducer
  );
  const [adminId, setadminId] = useState("");
  // const [CaptchaValue, setCaptchaValue] = useState(false);
  const [Captcha, setCaptcha] = useState("");
  const language = resources["en"];
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const navigation = useNavigationprop();
  const failedLoginAttempt = localStorage.getItem("failedLogin");
  const [isExecutingCaptcha, setIsExecutingCaptcha] = useState(
    failedLoginAttempt !== null
  );
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleCloseTwoFactorModal = () => {
    setIsTwoFactorModalOpen(false);
    setIsSubmitting(false);
  };

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (failedLoginAttempt && !captchaVerified) {
      handleSnackbar(true, "warning", "Please complete the captcha", dispatch);
      return;
    }

    if (emailId && password) {
      setEmailId(emailId);
      // Check if the user has already failed login once

      // if (isExecutingCaptcha || failedLoginAttempt) {
      //   // Show captcha if failed login attempt exists or is executing captcha
      //   // captchaRef.current?.execute();
      //   setIsExecutingCaptcha(true);
      //   setIsSubmitting(true);
      // } else {
      setIsSubmitting(true);
      const res = dispatch(
        authLogin(
          {
            email: emailId,
            password: password,
          },
          "" // Send captcha token
        )
      );

      res.then((result: ResultType) => {
        if (result.success) {
          handleSnackbar(true, "success", "Logged in successfully", dispatch);
        } else {
          if (result.message === "Your account is not verified") {
            setIsSubmitting(false);
            setShowOtpModal(true);
            handleResendOtp();
          } else {
            setIsSubmitting(false);
            localStorage.setItem("failedLogin", "true");
            setIsExecutingCaptcha(true);
          }
          // Set localStorage if login fails
          handleSnackbar(
            true,
            "error",
            `Failed to Login: ${result.message}`,
            dispatch
          );
        }
        setIsSubmitting(false);
      });
    }
    // } else {
    //   handleSnackbar(
    //     true,
    //     "warning",
    //     "Please provide the credentials to login",
    //     dispatch
    //   );
    // }
  };

  const handleCaptchaVerify = (token: string) => {
    console.log(token);
    toast.dismiss();
    setCaptchaToken(token); // Store captcha token on success
    setCaptchaVerified(true);
    setIsExecutingCaptcha(false);
    localStorage.removeItem("failedLogin");
  };

  // const handleCaptchaVerify = (token: string) => {
  //   toast.dismiss();
  //   setCaptchaToken(token); // Save the token once captcha is successful
  //   setCaptchaVerified(true);
  //   // Now, perform the login action with credentials and captcha token
  //   if (emailId && password) {
  //     const res = dispatch(
  //       authLogin(
  //         {
  //           email: emailId,
  //           password: password,
  //         },
  //         token // Send captcha token
  //       )
  //     );
  //     res.then((result: ResultType) => {
  //       if (result.success) {
  //         if (result.TwoFAUser) {
  //           setIsTwoFactorModalOpen(true);
  //           setadminId(result?.adminId);
  //         } else {
  //           setadminId(result.adminId);
  //           handleSnackbar(true, "success", "Logged in successfully", dispatch);
  //         }
  //         setIsSubmitting(false);
  //       } else {
  //         handleSnackbar(
  //           true,
  //           "error",
  //           `Failed to Login: ${result.message}`,
  //           dispatch
  //         );
  //         setIsSubmitting(false);
  //       }
  //     });
  //   }
  // };

  const handleTwoFactorAuthSubmit = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    setIsSubmitting(true);
    e.preventDefault();
    let formData = {
      // token: token.current.value,
      // password: password.current.value,
      // userId: adminId,
      userId: adminId,
      token: tokenRef.current?.value ?? "",
      password: password ?? "",
    };

    const res = dispatch(VerifyingTwoFactorAuth(formData)); //,navigate
    res.then((result: ResultType) => {
      if (result.success) {
        // console.log(result.success)
        handleSnackbar(true, "success", "Logged In Successfully", dispatch);
        setIsSubmitting(false);
        setIsTwoFactorModalOpen(false);
      } else {
        handleSnackbar(
          true,
          "error",
          `Failed To LogIn :Invalid token`,
          dispatch
        );
        setIsSubmitting(false);
      }
    });
  };

  const handleOtpVerification = async (otp: string) => {
    const data = { email: emailId, otp: otp }; // Make sure to get the correct email
    setIsSubmitting(true);
    toast.loading("Verifying OTP...");

    try {
      const response = await dispatch(OtpVerify(data));

      if (response.token) {
        // Store the token in localStorage
        localStorage.setItem("authTokens", JSON.stringify(response.token));

        // Success toast with a callback on close to reload the page
        toast.dismiss();
        toast.success("Account verification Completed!");
        // setShowOtpModal(false);
        // setIsSignUpComplete(true);

        dispatch(fetchAdminDetails())
          .then((result) => {
            if (result.message !== "Success") {
              // If fetching admin details fails, remove tokens and redirect to login
              localStorage.removeItem("authTokens");
              localStorage.removeItem("admin");
              toast.dismiss();
              toast.error(result.message);
              setIsSubmitting(false);
              if (navigation) {
                navigation("/"); // Go back to login
              } else {
                customNavigatorTo("/");
              }
            } else {
              toast.dismiss();
              toast.loading("Logging In...");
              // If successful, set admin details in localStorage
              localStorage.setItem("admin", JSON.stringify(result));
              toast.dismiss();
              toast.success("Login successful!");
              // Redirect to feed after logging;
              window.location.href = "/feed/0";
            }
          })
          .catch((error) => {
            setIsSubmitting(false);
            console.error("Failed to fetch admin details:", error);
            toast.dismiss();
            toast.error("Failed to log in. Please try again.");
          });
      } else {
        // In case there is no token in the response, handle accordingly
        setIsSubmitting(false);
        toast.dismiss();
        toast.error("OTP verified but no token received. Please try again.");
      }
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      setIsSubmitting(false);
      toast.dismiss();
      toast.error(error.response?.message || "Invalid OTP. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    setIsSubmitting(true); // Disable form interactions during the API call
    toast.dismiss(); // Dismiss any previous toasts

    try {
      // Dispatch the resend OTP action
      const response = await dispatch(resendOtpAction({ email: emailId }));
      if (otpSuccess) {
        // If resend OTP was successful, show a success message
        toast.dismiss();
        toast.success("OTP resent successfully!");
      } else if (otpError) {
        // If there was an error, show the error message
        toast.dismiss();
        toast.error(otpError || "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      // Catch any other unexpected errors
      console.error("Resend OTP Error:", error);
      toast.dismiss();
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false); // Re-enable form interactions
    }
  };

  return (
    <div className="LoginMainContainer">
      {showOtpModal ? (
        <OtpModal
          email={emailId ?? ""}
          onClose={() => setShowOtpModal(false)}
          onVerify={handleOtpVerification}
          verifying={isSubmitting}
          handleResendOtp={handleResendOtp}
        />
      ) : (
        <div className="LoginHeadContainer">
          <div className="LoginLeftContainer">
            <div className="BannerPoppupMain">
              <Dialog open={isTwoFactorModalOpen}>
                <DialogTitle> {language.MODAL.MODAL_TITLE}</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="OTP"
                    sx={{ marginLeft: 10, marginTop: 2 }}
                    type="number"
                    inputRef={tokenRef}
                    variant="outlined"
                  />
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handleCloseTwoFactorModal}
                    style={{ color: "grey" }}
                  >
                    {language.MODAL.MODAL_CANCEL}
                  </Button>
                  <Button onClick={handleTwoFactorAuthSubmit}>
                    {language.MODAL.MODAL_SUBMIT}{" "}
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
            <div className="LoginLogoHeadContainer">
              <img
                src={LogoMain}
                alt="mymasjidicon"
                // className="LogoMainIcon"
                style={{ width: "120px" }}
              />
            </div>
            <div className="LoginLogoBottomContainer">
              <span className="SiteName">
                <p style={{ fontSize: "18px" }}>
                  {language.BANER.INPUT_PLACEHOLDER_FIRST_NAME}
                </p>
              </span>
              <span className="SiteNameEnd" style={{ marginLeft: "3px" }}>
                <p style={{ fontSize: "18px" }}>
                  {language.BANER.INPUT_PLACEHOLDER_SECOND_NAME}
                </p>
              </span>
            </div>
          </div>
          <div className="LoginrightContainer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLoginSubmit(e);
              }}
              className="loginBox"
            >
              <input
                placeholder={language.LOGIN.INPUT_PLACEHOLDER_EMAIL}
                type="email"
                value={emailId}
                required
                className="loginInput"
                onChange={(e) => setEmailId(e.target.value)}
              />

              <div className="InputFields">
                <input
                  placeholder={"Password"}
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="ResetPasswordInput"
                />
                {isPasswordVisible ? (
                  <AiFillEye
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="ShowPasswordLogin"
                    role="button"
                    data-testid="show-password"
                  />
                ) : (
                  <AiFillEyeInvisible
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="ShowPasswordLogin"
                    role="button"
                    data-testid="hide-password"
                  />
                )}
              </div>
              {isExecutingCaptcha && (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Turnstile
                    siteKey="0x4AAAAAAA4f07OMk0P3v4wi"
                    style={{
                      margin: "10px",
                      display: "flex",
                      alignItems: "left",
                      width: "min-content",
                      height: "min-content",
                    }}
                    onSuccess={handleCaptchaVerify}
                    onError={() =>
                      handleSnackbar(true, "error", "Captcha failed", dispatch)
                    }
                  />
                </div>
              )}
              <button
                className="loginButton"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <CircularProgress size="20px" style={{ color: "white" }} />
                ) : (
                  <>{language.LOGIN.BUTTON_SUBMIT}</>
                )}
              </button>
              {/* <Tooltip title="Solve the captcha to verify you are not a robot.">
                <div>
                  <HCaptcha
                    onClose={() => {
                      setIsSubmitting(false);
                    }}
                    sitekey={capchaKey}
                    ref={captchaRef}
                    size="invisible"
                    onVerify={handleCaptchaVerify}
                    onError={() => {
                      handleSnackbar(true, "error", "Captcha error", dispatch);
                    }}
                  />
                </div>
              </Tooltip> */}
              <div className="links">
                <span className="loginForgot">
                  <Link to="/signup">{language.SIGNUP.HEADING_SIGNUP}</Link>
                </span>
                <span className="loginForgot">
                  <Link to="/forgotpassword">
                    {language.LOGIN.BUTTON_REDIRECT}
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
