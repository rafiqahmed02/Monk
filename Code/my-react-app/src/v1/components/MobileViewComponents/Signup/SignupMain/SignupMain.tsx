import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import SignUpForm from "../Signupform/SignUpForm";
import OtpModal from "../../Shared/OtpModal/OtpModal";
import SuccessCard from "../../Shared/OtpModal/SuccessCard/SuccessCard";
import { FormData } from "../utils/validation";
import { customNavigatorTo } from "../../../../helpers/HelperFunction";
import BackButton from "../../Shared/BackButton";
import { useNavigationprop } from "../../../../../MyProvider";
import CMlogo from "../../../../photos/Newuiphotos/CM Logo/cmlogo-new.svg";
import styles from "./SignupMain.module.css";
import { useDispatch } from "react-redux";
import { useSearchMasjids } from "../../../../graphql-api-calls/MasjidAPI/MasjidQuery/Masjid";
import { fetchUserLocation } from "../../../../helpers/HelperFunction/GoogleAPI/GoogleLocation";
import { useJsApiLoader } from "@react-google-maps/api";
import { Backdrop, debounce } from "@mui/material";
import { signUpEmail } from "../../../../redux/actions/AuthActions/SignUpFormAction";
import { MasjidOption } from "../../../../Types/MasjidTypes";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { UserRegister } from "../../../../redux/actions/RegisterAction/RegisterAction";
import { OtpVerify } from "../../../../redux/actions/OtpAction/OtpAction";
import { resendOtpAction } from "../../../../redux/actions/ResendOtp/ResendOtp";
import { fetchAdminDetails } from "../../../../redux/actions/AuthActions/fetchAdminDetails";
import ShareModal from "../../Services/Helpers/ShareButtons/ShareButtons";
import { Turnstile } from "@marsidev/react-turnstile";
import { handleSnackbar } from "../../../../helpers/SnackbarHelper/SnackbarHelper";

const libraries: any = ["places"];

const SignUpMain: React.FC = () => {
  const navigation = useNavigationprop();
  const dispatch = useAppDispatch();
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // State hooks
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isSignUpComplete, setIsSignUpComplete] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [masjidList, setMasjidList] = useState<Record<string, any>[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loadingOtp, otpSuccess, otpError } = useAppSelector(
    (state) => state.resendOtpReducer
  );

  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const storedCaptchaToken = sessionStorage.getItem("captchaToken");
  const turnstileRef = useRef();

  useEffect(() => {
    if (storedCaptchaToken) {
      setCaptchaToken(storedCaptchaToken);
      setCaptchaVerified(true);
    }
  }, [storedCaptchaToken]);

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const data = JSON.parse(decodeURIComponent(urlParams.get("data") || "{}"));

    // Update formData state with the parsed data
    setFormData((prevFormData) => ({
      ...prevFormData,
      ...data,
    }));
  }, []);

  console.log("formData", formData);

  // Fetch user location and set lat, lng from bounds
  useEffect(() => {
    let isMounted = true; // Flag to check if the component is mounted

    if (isLoaded) {
      const fetchLocation = async () => {
        try {
          const { bounds } = await fetchUserLocation(
            import.meta.env.VITE_GOOGLE_MAPS_API_KEY
          );
          if (bounds && isMounted) {
            const center = bounds.getCenter();
            setLocation({ lat: center.lat(), lng: center.lng() });
          }
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      };

      fetchLocation();
    }

    return () => {
      isMounted = false; // Cleanup function to prevent memory leaks
    };
  }, [isLoaded]); // Add isLoaded to the dependency array

  // Use the useSearchMasjids hook with query or location
  const { masjids, loading, error, refetch } = useSearchMasjids(searchQuery);

  useEffect(() => {
    setMasjidList([]);
    refetch();
  }, [searchQuery]);
  // Update masjidList when data is fetched
  useEffect(() => {
    if (masjids && !loading && !error) {
      setMasjidList(masjids); // Update the list with fetched masjids
    }
  }, [masjids]);

  // Handle masjid search based on query  // Debounce the search query function
  const debouncedSearchMasjids = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 300),
    [searchQuery]
  );

  const handleSearchMasjid = (query: string) => {
    debouncedSearchMasjids(query);
  };

  const handleSignUpSubmit = async () => {
    if (!formData.email || !formData.fullName || !formData.masjid) {
      toast.dismiss();
      toast.error("Please Fill in All Required Fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      toast.loading("Signing Up...");
      const userRegistrationInput = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        contact: formData.phone,
        masjidId: formData.masjidId,
      };

      await dispatch(UserRegister(userRegistrationInput));
      toast.dismiss();
      toast.success("Registration successful! Verify OTP.");
      setShowOtpModal(true);
    } catch (error) {
      console.error("Error sending email:", error);
      setIsSubmitting(false);
      toast.dismiss();
      toast.error(
        error.message || "Failed to Submit Signup. Please Try Again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP verification

  const handleOtpVerification = async (otp: string) => {
    const data = { email: formData.email, otp: otp }; // Make sure to get the correct email
    setIsSubmitting(true);
    toast.loading("Verifying OTP...");

    try {
      const response = await dispatch(OtpVerify(data));

      if (response.token) {
        // Store the token in localStorage
        localStorage.setItem("authTokens", JSON.stringify(response.token));

        // Success toast with a callback on close to reload the page
        toast.dismiss();
        toast.success("OTP Verified!");
        setShowOtpModal(false);
        setIsSignUpComplete(true);
      } else {
        // In case there is no token in the response, handle accordingly
        toast.dismiss();
        toast.error("Otp Verified but No Token Received. Please Try Again.");
      }
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      toast.dismiss();
      toast.error(error.response?.message || "Invalid OTP. Please Try Again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // this is not functional right now
  const handleResendOtp = async () => {
    setIsSubmitting(true); // Disable form interactions during the API call
    toast.dismiss(); // Dismiss any previous toasts

    try {
      // Dispatch the resend OTP action
      const response = await dispatch(
        resendOtpAction({ email: formData.email })
      );
      toast.dismiss();
      if (otpSuccess) {
        // If resend OTP was successful, show a success message
        toast.dismiss();
        toast.success("OTP Resent Successfully!");
      } else if (otpError) {
        // If there was an error, show the error message
        toast.dismiss();
        toast.error(otpError || "Failed to Resend Otp. Please Try Again.");
      }
    } catch (error) {
      // Catch any other unexpected errors
      console.error("Resend OTP Error:", error);
      toast.dismiss();
      toast.error("SOmething Went Wrong. Please Try Again.");
    } finally {
      setIsSubmitting(false); // Re-enable form interactions
    }
  };

  const handleNavigation = () => {
    // if (
    //   formData.existingRole === "subadmin" ||
    //   (formData.role === "subadmin" && formData.isVerified)
    // ) {
    //   if (navigation) {
    //     navigation("/");
    //   } else {
    //     customNavigatorTo("/");
    //   }

    //   return;
    // }
    // Fetch admin details after OTP verification and token storage
    dispatch(fetchAdminDetails())
      .then((result) => {
        if (result.message !== "Success") {
          // If fetching admin details fails, remove tokens and redirect to login
          localStorage.removeItem("authTokens");
          localStorage.removeItem("admin");
          toast.dismiss();
          toast.error(result.message);
          if (navigation) {
            navigation("/"); // Go back to login
          } else {
            customNavigatorTo("/");
          }
        } else if (formData.access === "I Just Want To Add A Masjid") {
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
          toast.success("Login Successful!");
          // Redirect to feed after logging;
          window.location.href = "/feed/0";
        }
      })
      .catch((error) => {
        console.error("Failed to fetch admin details:", error);
        toast.dismiss();
        toast.error("Failed to Log in. Please Try Again.");
      });
  };

  const handleCaptchaVerify = (token: string) => {
    console.log(token);
    sessionStorage.setItem("captchaToken", token);
    setCaptchaToken(token);
    setCaptchaVerified(true);
  };

  const handleCaptchaRetry = () => {
    setCaptchaVerified(false);
    if (turnstileRef.current) {
      turnstileRef.current?.reset(); // Reset the CAPTCHA for retry
    }
  };

  return (
    <div className={styles.container}>
      <Backdrop open={!captchaVerified} sx={{ zIndex: "10000" }}>
        {!captchaVerified && (
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Turnstile
              siteKey="0x4AAAAAAA6-NZibjmzsUmyi"
              style={{
                display: "flex",
                // alignItems: "left",
              }}
              options={{
                retryInterval: 2000,
                refreshExpired: "manual",
              }}
              onSuccess={handleCaptchaVerify}
              onError={() => {
                toast.dismiss();
                toast.error("Captcha Verification Failed. Retrying...");
              }}
            />
          </div>
        )}
      </Backdrop>

      <div
        className="header"
        style={{
          margin: 0,
          display: "flex",
        }}
      >
        {" "}
        {!isSignUpComplete && !showOtpModal && (
          <div
            className="goback sign-upflowback"
            style={{
              marginTop: "10px",
              width: "100px",
              position: "absolute",
              zIndex: "1",
              left: "-14px",
              top: "0",
              transform: "none",
            }}
          >
            <BackButton
              isBackOnly={true}
              handleBackBtn={() =>
                navigation ? navigation("/login") : customNavigatorTo("/login")
              }
            />
          </div>
        )}
        <div className={styles.logoContainer}>
          <img src={CMlogo} alt="Connect Masjid Logo" className={styles.logo} />
          <h3 className={styles.adminPortal}>
            <span className={styles.admin}>Admin</span>{" "}
            <span className={styles.portal}>Portal</span>
          </h3>
        </div>
      </div>
      {isSignUpComplete ? (
        <SuccessCard
          title="JazakAllah !"
          description={
            "Jazakallah Khair for completing your sign-up. We appreciate your commitment, and we're excited to have you on board!"
          }
          onClose={handleNavigation}
          signup={true}
        />
      ) : showOtpModal ? (
        <OtpModal
          email={formData.email}
          // onClose={() => setShowOtpModal(false)}
          onVerify={handleOtpVerification}
          verifying={loading}
          handleResendOtp={handleResendOtp}
        />
      ) : (
        <SignUpForm
          subtitle={"Sign Up As Admin"}
          onSubmit={handleSignUpSubmit}
          formData={formData as FormData}
          setFormData={setFormData}
          masjidsList={masjidList as MasjidOption[]}
          handleSearchMasjid={handleSearchMasjid}
          searching={loading}
          disabled={isSubmitting}
        />
      )}
    </div>
  );
};

export default SignUpMain;
