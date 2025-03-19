import React, { useEffect, useRef, useState } from "react";
import styles from "./Login.module.css";
import LogoMain from "../../../photos/Newuiphotos/CM Logo/CM Logo.svg";
import { resources } from "../../../resources/resources";
import { useNavigationprop } from "../../../../MyProvider";
import { handleSnackbar } from "../../../helpers/SnackbarHelper/SnackbarHelper";
import { useAppSelector, useAppThunkDispatch } from "../../../redux/hooks";
import { authLogin } from "../../../redux/actions/AuthActions/LoginAction";
import { toast } from "react-hot-toast";
import { resendOtpAction } from "../../../redux/actions/ResendOtp/ResendOtp";
import { customNavigatorTo } from "../../../helpers/HelperFunction";
import { fetchAdminDetails } from "../../../redux/actions/AuthActions/fetchAdminDetails";
import { OtpVerify } from "../../../redux/actions/OtpAction/OtpAction";
import OtpModal from "../../../components/MobileViewComponents/Shared/OtpModal/OtpModal";
import { CircularProgress } from "@material-ui/core";
import { Turnstile } from "@marsidev/react-turnstile";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

interface ResultType {
  success: boolean;
  TwoFAUser: boolean;
  adminId: string;
  message: string;
}

const Login: React.FC = () => {
  const language = resources["en"];
  const { loadingOtp, otpSuccess, otpError } = useAppSelector(
    (state) => state.resendOtpReducer
  );

  const [captchaRetryCount, setCaptchaRetryCount] = useState(0);
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const navigation = useNavigationprop();
  const dispatch = useAppThunkDispatch();

  const storedCaptchaToken = sessionStorage.getItem("captchaToken");

  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const turnstileRef = useRef(null);

  useEffect(() => {
    if (storedCaptchaToken) {
      setCaptchaVerified(true); // Mark as verified
    }
  }, [storedCaptchaToken]);

  const handleCaptchaRetry = () => {
    if (captchaRetryCount >= 3) {
      toast.dismiss();
      toast.error(
        "Captcha verification failed multiple times. Please refresh the page"
      );
      return;
    }

    setCaptchaRetryCount((prev) => prev + 1);
    setCaptchaVerified(false);
    if (turnstileRef.current) {
      turnstileRef.current.reset(); // Reset the CAPTCHA for retry
    }
  };

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!captchaVerified) {
      // toast.error(captchaToken);
      // handleSnackbar(true, "warning", "Please complete the captcha", dispatch);
      toast.dismiss();
      toast.error("Please complete the captcha");
      return;
    }

    if (emailId && password) {
      setEmailId(emailId);

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
        console.log(result);
        if (result.success) {
          // handleSnackbar(true, "success", "Logged in successfully", dispatch);
          toast.dismiss();
          toast.success("Logged in successfully");
        } else {
          if (result.message === "Your account is not verified\n") {
            setIsSubmitting(false);
            setShowOtpModal(true);
            handleResendOtp();
          } else {
            setIsSubmitting(false);
            sessionStorage.clear();
            setCaptchaVerified(false);
            handleCaptchaRetry();
          }

          toast.dismiss();
          toast.error(`Failed to Login: ${result.message}`);
          // Set localStorage if login fails
          // handleSnackbar(
          //   true,
          //   "error",
          //   `Failed to Login: ${result.message}`,
          //   dispatch
          // );
          sessionStorage.clear();
        }
        setIsSubmitting(false);
      });
    }
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

  const handleCaptchaVerify = (token: string) => {
    console.log(token);
    toast.dismiss();
    sessionStorage.setItem("captchaToken", token);
    setCaptchaToken(token); // Store captcha token on success
    console.log("captchaVerified", captchaVerified);
    // setTimeout(() => {
    //   setCaptchaVerified(true);
    // }, 5000);
  };

  return (
    <div className={styles.root}>
      {showOtpModal ? (
        <OtpModal
          email={emailId ?? ""}
          onClose={() => setShowOtpModal(false)}
          onVerify={handleOtpVerification}
          verifying={isSubmitting}
          handleResendOtp={handleResendOtp}
        />
      ) : (
        <div className={styles.formContainer}>
          {/* Replace this div with your logo if needed */}
          <div className="LoginLogoHeadContainer">
            <img src={LogoMain} alt="mymasjidicon" style={{ width: "130px" }} />
          </div>
          <div className={styles.titleContainer}>
            <b className={`${styles.title} ${styles.firstTitle}`}>Admin</b>
            <b className={`${styles.title} ${styles.secondTitle}`}> Portal</b>
          </div>
          <form onSubmit={handleLoginSubmit}>
            <input
              type="email"
              placeholder="Email"
              className={styles.input}
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              required
            />
            <div className={styles.passwordInput}>
              <input
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {isPasswordVisible ? (
                <AiFillEye
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className={styles.ShowPasswordLogin}
                  role="button"
                  data-testid="hide-password"
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <AiFillEyeInvisible
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className={styles.ShowPasswordLogin}
                  role="button"
                  data-testid="show-password"
                  style={{ cursor: "pointer" }}
                />
              )}
            </div>

            {(!captchaVerified || captchaToken) && (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Turnstile
                  ref={turnstileRef}
                  siteKey="0x4AAAAAAA6-NZibjmzsUmyi"
                  style={{
                    display: "flex",
                  }}
                  options={{
                    retryInterval: 2000,
                    refreshExpired: "manual",
                  }}
                  onSuccess={handleCaptchaVerify}
                  onError={() => {
                    toast.dismiss();
                    console.log(captchaRetryCount);
                    if (captchaRetryCount < 3) {
                      console.log(captchaRetryCount);
                      setCaptchaRetryCount(captchaRetryCount + 1);
                      toast.error("Captcha failed. Retrying...");
                    } else {
                      console.log(captchaRetryCount);
                      toast.error(
                        "Too many failed attempts. Please refresh the page."
                      );
                    }
                  }}
                />
              </div>
            )}
            {/* <p className={styles.captchaText}>
              {!captchaVerified ? "Verifing Captcha...." : ""}
            </p> */}

            <button
              type="submit"
              className={styles.loginButton}
              // disabled={!captchaVerified}
            >
              {isSubmitting ? (
                <CircularProgress size="20px" style={{ color: "white" }} />
              ) : (
                <>{language.LOGIN.BUTTON_SUBMIT}</>
              )}
            </button>
          </form>
          <div className={styles.linkContainer}>
            <a
              onClick={() =>
                navigation
                  ? navigation("/signup")
                  : customNavigatorTo("/signup")
              }
              className={styles.link}
            >
              {language.SIGNUP.HEADING_SIGNUP}
            </a>
            <a
              onClick={() =>
                navigation
                  ? navigation("/forgotpassword")
                  : customNavigatorTo("/forgotpassword")
              }
              className={styles.link}
            >
              {language.LOGIN.BUTTON_REDIRECT}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
