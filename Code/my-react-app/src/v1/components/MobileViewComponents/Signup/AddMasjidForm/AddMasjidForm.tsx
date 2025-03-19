import React, { useEffect, useState } from "react";
import styles from "./AddMasjidForm.module.css";
import { FaMapMarkerAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import CMlogo from "../../../../photos/Newuiphotos/CM Logo/cmlogo-new.svg";
import BackButton from "../../Shared/BackButton";
import { useNavigationprop } from "../../../../../MyProvider";
import { customNavigatorTo } from "../../../../helpers/HelperFunction";
import SignUpForm from "../Signupform/SignUpForm";
import OtpModal from "../../Shared/OtpModal/OtpModal";
import SuccessCard from "../../Shared/OtpModal/SuccessCard/SuccessCard";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import ReactPhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useRef } from "react";
import {
  fetchUserLocation,
  usePlaceDetails,
} from "../../../../helpers/HelperFunction/GoogleAPI/GoogleLocation";
import { useCreateMasjid } from "../../../../graphql-api-calls/MasjidAPI/MasjidMutation/MasjidMutation";
import { FormData } from "../utils/validation";
import { UserRegister } from "../../../../redux/actions/RegisterAction/RegisterAction";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { OtpVerify } from "../../../../redux/actions/OtpAction/OtpAction";
import { handleSnackbar } from "../../../../helpers/SnackbarHelper/SnackbarHelper";
import { authLogin } from "../../../../redux/actions/AuthActions/LoginAction";
import { FaSearch } from "react-icons/fa";
import { resendOtpAction } from "../../../../redux/actions/ResendOtp/ResendOtp";
import { fetchAdminDetails } from "../../../../redux/actions/AuthActions/fetchAdminDetails";
import { AdminInterFace } from "../../../../redux/Types";
import CloseIcon from "@mui/icons-material/Close";
import Dropdown from "../../../elements/Dropdown/basicDropdown/Dropdown";
import ShareModal from "../../Services/Helpers/ShareButtons/ShareButtons";
import { Backdrop } from "@mui/material";
import { Turnstile } from "@marsidev/react-turnstile";
import AutocompleteAddressInput from "./AutocompleteAddressInput";

const libraries: any = ["places"];
const AddMasjidForm: React.FC = () => {
  const [bounds, setBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [countryCode, setCountryCode] = useState<string>("us"); // Default country code
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [currentForm, setCurrentForm] = useState<"addMasjid" | "getAccess">(
    "addMasjid"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isSignUpComplete, setIsSignUpComplete] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    address: "",
    masjidContact: "",
    website: "",
    masjidName: "",
    access: "",
    role: "",
    fullName: "",
    email: "",
    phone: "",
    masjid: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [isShareVisible, setIsShareVisible] = useState(false);

  const navigation = useNavigationprop();
  const placesServiceRef = useRef<HTMLDivElement>(null);
  const { fetchDetails } = usePlaceDetails(placesServiceRef);
  const autocompleteRef = useRef<any>(null);
  const { createMasjid, loading, error } = useCreateMasjid();
  const [isAddressSelected, setIsAddressSelected] = useState(false);
  const [isAddressValidated, setIsAddressValidated] = useState(false);
  const inputRef = useRef(null);
  const labelRefMasjid = useRef(null);
  const labelRefUser = useRef(null);

  const [captchaVerified, setCaptchaVerified] = useState(false);
  const storedCaptchaToken = sessionStorage.getItem("captchaToken");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const { loadingOtp, otpSuccess, otpError } = useAppSelector(
    (state) => state.resendOtpReducer
  );

  const adminString = localStorage.getItem("admin");
  const admin: AdminInterFace | null = adminString
    ? JSON.parse(adminString)
    : null;

  const turnstileRef = useRef(null);

  useEffect(() => {
    if (storedCaptchaToken) {
      setCaptchaToken(storedCaptchaToken);
      setCaptchaVerified(true);
    }
  }, [storedCaptchaToken]);

  // Fetch user location using Google's Geolocation API (IP-based location)
  useEffect(() => {
    const fetchLocation = async () => {
      const { bounds, countryCode } = await fetchUserLocation(
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      );
      setBounds(bounds || null);
      setCountryCode(countryCode);
    };

    fetchLocation();
  }, []);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onPlacesLoad = (ref: any) => {
    autocompleteRef.current = ref;
  };

  let geocoder: google.maps.Geocoder | null = null;
  const isDropdownSelection = useRef(false);

  const validateAddress = async (
    source: google.maps.places.PlaceResult | string
  ) => {
    try {
      // Common validation logic
      let result: google.maps.GeocoderResult | undefined;
      let isMasjid = false;
      // Handle dropdown selections

      // toast.loading("Validating address...");
      if (typeof source === "object" && source.name && !source.place_id) {
        // Treat it as a manually entered address
        source = source.name;
      }

      if (typeof source !== "string" && source?.place_id) {
        setErrors((prev) => ({
          ...prev,
          address: false,
        }));
        const place = source;
        isDropdownSelection.current = true; // Mark as dropdown selection

        // Validate place type
        console.log(place);
        isMasjid = place.types?.includes("mosque") || false;
        // Fetch details for places from dropdown
        const details = await fetchDetails(place.place_id);
        console.log(details);
        toast.dismiss();
        if (!details) return;

        // Update form data
        setFormData((prev) => ({
          ...prev,
          // masjidName: isMasjid ? details.masjidName : "",
          address: details.formattedAddress,
          lat: details.lat,
          lng: details.lng,
          // masjidContact: details.masjidContact,
          // website: details.website,
        }));
        setIsAddressSelected(true);
      }
      // Handle manual input validation
      else {
        // if (isAddressValidated) return;
        // console.log(source);
        // const address = source;
        // if (!geocoder) geocoder = new google.maps.Geocoder();
        // // Geocode manual input
        // const response = await new Promise<google.maps.GeocoderResponse>(
        //   (resolve, reject) => {
        //     geocoder!.geocode({ address }, (results, status) => {
        //       status === "OK" ? resolve({ results, status }) : reject(status);
        //     });
        //   }
        // );
        // result = response.results?.[0];
        // setIsAddressValidating(false);
        // toast.dismiss();
        // if (!result) throw new Error("Invalid address");
        // isMasjid = result.types?.includes("place_of_worship") || false;
        // // Update form data
        // setFormData((prev) => ({
        //   ...prev,
        //   address: result?.formatted_address,
        //   lat: result?.geometry.location.lat(),
        //   lng: result?.geometry.location.lng(),
        // }));
      }

      // setIsAddressSelected(true);
      // setIsAddressValidating(false);

      toast.dismiss();
      // toast.success(isMasjid ? "Mosque validated" : "Address validated");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        address: true,
      }));
      toast.dismiss();
      toast.error("Invalid Address");

      // resetSearchInput();
    } finally {
      if (
        !(typeof source !== "string" && source?.place_id) ||
        (typeof source === "object" && source.name && !source.place_id)
      ) {
        setIsAddressValidated(true);
      }
    }
  };

  const resetSearchInput = () => {
    if (inputRef.current) {
      (inputRef.current as HTMLInputElement).value = ""; // Directly reset the input field's value
    }
    setFormData((prev) => ({
      ...prev,
      address: "",
    }));
    setIsAddressSelected(false); // Update state to reflect no valid address selected
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear the error for the specific field
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleDropdownSelect = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      access: value,
    }));
    setErrors((prev) => ({ ...prev, access: false })); // Clear masjid error

    // Reset optional fields when switching roles

    if (value === "I Just Want To Add A Masjid") {
      setCurrentForm("addMasjid"); // Stay on the same form but add sign-up fields
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      setErrors(() => ({}));
    } else if (value === "I Want To Handle A Masjid") {
      setCurrentForm("getAccess");
    }
  };

  const handleAddMasjid = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, boolean> = {};

    if (!formData.address) errors.address = true;
    if (!formData.masjidName) errors.masjidName = true;
    if (!formData.access) errors.access = true;

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      toast.dismiss();

      const missingFields = Object.keys(errors)
        .map((field) => {
          switch (field) {
            case "address":
              return "Address";
            case "masjidName":
              return "Masjid Name";
            case "access":
              return "Purpose";
            default:
              return "";
          }
        })
        .filter(Boolean);

      toast.error(
        `${missingFields.join(", ")} ${
          missingFields.length > 1 ? "are" : "is"
        } required.`
      );

      return;
    }
    if (!formData.lng && !formData.lat) return;

    setIsSubmitting(true);

    const masjidInput = {
      masjidName: formData.masjidName,
      description: "",
      address: formData.address,
      location: {
        type: "Point",
        coordinates: [formData.lng, formData.lat],
      },
      contact: formData.masjidContact,
      externalLinks: formData.website
        ? [{ name: "Website", url: formData.website }]
        : [],
      tempUser:
        formData.access === "I Just Want To Add A Masjid"
          ? {
              name: formData.fullName,
              email: formData.email,
              phoneNumber: formData.phone,
            }
          : undefined,
    };

    try {
      let masjidId = formData.masjidId;

      if (!masjidId) {
        toast.dismiss();
        toast.loading("Submitting Details...");
        const masjidResponse = await createMasjid(masjidInput);
        if (masjidResponse && masjidResponse._id) {
          masjidId = masjidResponse._id;
          setFormData((prev) => ({ ...prev, masjidId }));
        }
        toast.dismiss();
        toast.success("Masjid Added Successfully!");
      }
      if (formData.access !== "I Just Want To Add A Masjid") {
        setErrors({});
        setCurrentForm("getAccess");
      } else {
        setIsSignUpComplete(true);
      }
    } catch (error: any) {
      console.error("Error Adding Masjid", error);
      toast.dismiss();
      const errormsg = ["address already exists", "duplicate key error"];
      const errorMessage = error.message.includes("duplicate key error")
        ? "A Masjid Already Exists."
        : error.userFriendlyMessage === "Coordinates Already Exists"
        ? "Masjid With Same Address Already Exists."
        : error.message;
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      if (data.access !== "I Just Want To Add A Masjid") {
        toast.loading("Signing Up...");

        // Proceed with user registration if needed
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
        toast.success("Registration Successful! Verify OTP.");
        setShowOtpModal(true);
      } else {
        setIsSignUpComplete(true);
        toast.success("Masjid Added Successfully!");
      }
    } catch (error: any) {
      console.error("Error Registering User:", error);
      toast.dismiss();
      toast.error(error.message || "Registration Failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        toast.error(otpError || "Failed to Resend OTP. Please Try Again.");
      }
    } catch (error) {
      // Catch any other unexpected errors
      console.error("Resend OTP Error:", error);
      toast.dismiss();
      toast.error("Something Went Wrong. Please Try Again.");
    } finally {
      setIsSubmitting(false); // Re-enable form interactions
    }
  };

  const handleNavigation = () => {
    if (formData.access === "I Just Want To Add A Masjid") {
      if (navigation) {
        navigation("/");
      } else {
        customNavigatorTo("/");
      }

      return;
    }
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

  function handleFocus(e: any) {
    const label = e.target.parentNode.querySelector(`.${styles.floatingLabel}`);
    label.classList.add(styles.active); // Use styles.active for modular CSS
  }

  function handleBlur(e: any) {
    const label = e.target.parentNode.querySelector(`.${styles.floatingLabel}`);
    console.log("remove", e.target);
    if (e.target.value === "") {
      label.classList.remove(styles.active); // Use styles.active for modular CSS
    }
  }

  function handlePhoneFocus(ref: React.RefObject<HTMLLabelElement>) {
    if (ref.current) {
      ref.current.classList.add(styles.active2);
    }
  }

  function handlePhoneBlur(
    ref: React.RefObject<HTMLLabelElement>,
    value: string
  ) {
    if (ref.current && !value) {
      ref.current.classList.remove(styles.active2);
    }
  }

  const shareMasjid = () => {
    setIsShareVisible(true);
  };

  const handleCaptchaVerify = (token: string) => {
    sessionStorage.setItem("captchaToken", token);
    setCaptchaToken(token); // Store captcha token on success
    setCaptchaVerified(true);
  };

  const handleCaptchaRetry = () => {
    setCaptchaVerified(false);
    if (turnstileRef.current) {
      turnstileRef.current.reset(); // Reset the CAPTCHA for retry
    }
  };

  console.log("formData", formData);

  return (
    <div className={styles.pageContainer}>
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
      <ShareModal
        isOpen={isShareVisible}
        onClose={() => {
          setIsShareVisible(false);
        }}
        assetType="shareMasjid"
        masjidUrl={`https://app.connectmazjid.com/share?type=masjid&key=${
          formData.masjidId
        }&utm_source=cm_masjid_portal&utm_medium=show&utm_campaign=${encodeURIComponent(
          formData.masjidName
        )}`}
      />
      <div ref={placesServiceRef} style={{ display: "none" }}></div>
      <div
        className="header"
        style={{
          margin: 0,
          display: "flex",
        }}
      >
        {!showOtpModal && !isSignUpComplete && (
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
                currentForm === "addMasjid"
                  ? navigation
                    ? navigation("/signup")
                    : customNavigatorTo("/signup")
                  : setCurrentForm("addMasjid")
              }
            />
          </div>
        )}

        <div className={styles.logoContainer}>
          <img src={CMlogo} alt="Connect Masjid Logo" className={styles.logo} />
          <h3 className={styles.adminPortal}>
            <span className={styles.admin}>Admin</span>
            <span className={styles.portal}>Portal</span>
          </h3>
        </div>
      </div>
      {isSignUpComplete ? (
        <SuccessCard
          title="JazakAllah!"
          description={
            formData.access === "I Just Want To Add A Masjid"
              ? "Thank you for adding a Masjid to ConnectMazjid. Your contribution helps strengthen our community and brings us closer to our Deen. May Allah reward your efforts abundantly!"
              : "Jazakallah Khair for completing your sign-up. We appreciate your commitment, and we're excited to have you on board!"
          }
          onClose={handleNavigation}
          signup={
            formData.access === "I Just Want To Add A Masjid" ? false : true
          }
          shareMasjid={shareMasjid}
        />
      ) : showOtpModal ? (
        <OtpModal
          email={formData.email}
          // onClose={() => setShowOtpModal(false)}
          onVerify={handleOtpVerification}
          verifying={isSubmitting}
          handleResendOtp={handleResendOtp}
          text={"Your Masjid Was Added Successfully."}
        />
      ) : currentForm === "addMasjid" ? (
        <div className={styles.formContainer}>
          <div className={styles.container}>
            <h1 className={styles.title}>Welcome On Board</h1>
            <h2 className={styles.subtitle}>Add New Masjid Details</h2>
            <form className={styles.form} onSubmit={handleAddMasjid}>
              <AutocompleteAddressInput
                isLoaded={isLoaded}
                bounds={bounds}
                onAddressChange={({ address, lat, lng, isValid }) => {
                  setFormData((prev) => ({
                    ...prev,
                    address,
                    lat,
                    lng,
                  }));
                  setIsAddressSelected(!!address);
                }}
                initialAddress={""}
                initialLat={""}
                initialLng={""}
              ></AutocompleteAddressInput>
              <div className={styles.inputWrapper}>
                <label
                  className={`${styles.floatingLabel}  ${
                    formData.masjidName ? styles.active : ""
                  }`}
                >
                  Enter Masjid Name*
                </label>
                <input
                  type="text"
                  name="masjidName"
                  // placeholder="Enter Masjid Name"
                  value={formData.masjidName}
                  onChange={handleInputChange}
                  className={`${styles.input} ${
                    errors.masjidName ? styles.inputError : ""
                  }`}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <div className={styles.inputWrapper}>
                <label
                  className={`${styles.floatingLabel}  ${
                    formData.masjidContact ? styles.active : ""
                  }`}
                  ref={labelRefMasjid}
                  style={{ left: "35px" }}
                >
                  Masjid Contact Number (Optional)
                </label>
                <div
                  onFocus={() => handlePhoneFocus(labelRefMasjid)}
                  onBlur={() =>
                    handlePhoneBlur(labelRefMasjid, formData.masjidContact)
                  }
                  tabIndex={-1} // Make the div focusable
                >
                  <ReactPhoneInput
                    country={countryCode}
                    placeholder="Enter Masjid Contact Number"
                    value={formData.masjidContact}
                    onChange={(masjidContact) => {
                      setFormData((prev) => ({ ...prev, masjidContact }));
                      setErrors((prev) => ({ ...prev, masjidContact: false })); // Clear phone error
                    }}
                    inputProps={{
                      name: "masjidContact",
                      required: false,
                    }}
                    containerClass={styles.phoneContainer}
                    inputClass={`${styles.phoneInput}`}
                    inputStyle={{
                      border: errors.phone
                        ? "1px solid red"
                        : "1px solid #545454",
                      borderRadius: "20px",
                    }}
                    buttonClass={styles.flagButton}
                    dropdownClass={styles.dropdown}
                  />
                </div>
              </div>
              <div className={styles.inputWrapper}>
                <label
                  className={`${styles.floatingLabel}  ${
                    formData.website ? styles.active : ""
                  }`}
                >
                  Masjid Website (Optional)
                </label>
                <input
                  type="text"
                  name="website"
                  placeholder="Enter Masjid Website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className={styles.input}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>{" "}
              <Dropdown
                label="Purpose"
                placeholder="Purpose of Adding"
                options={[
                  {
                    label: "I Just Want To Add A Masjid",
                  },
                  {
                    label: "I Want To Handle/Update This Masjid Information",
                  },
                ]}
                onSelect={handleDropdownSelect}
                error={errors.access}
                selectedValue={formData.access}
              />
              {formData.access === "I Just Want To Add A Masjid" && (
                <>
                  <div className={styles.inputWrapper}>
                    <label
                      className={`${styles.floatingLabel} 
                      ${formData.fullName ? styles.active : ""}
                        `}
                    >
                      Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      placeholder="Your Name"
                      onChange={handleInputChange}
                      className={styles.input}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </div>
                  <div className={styles.inputWrapper}>
                    <label
                      className={`${styles.floatingLabel} ${
                        formData.email ? styles.active : ""
                      }`}
                    >
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      placeholder="Your Email Address"
                      onChange={handleInputChange}
                      className={styles.input}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </div>

                  <div className={styles.inputWrapper}>
                    <label
                      className={`${styles.floatingLabel}  ${
                        formData.phone ? styles.active : ""
                      }`}
                      ref={labelRefUser}
                      style={{ left: "35px" }}
                    >
                      Contact Number (Optional)
                    </label>
                    <div
                      onFocus={() => handlePhoneFocus(labelRefUser)}
                      onBlur={() =>
                        handlePhoneBlur(labelRefUser, formData.phone)
                      }
                      tabIndex={-1} // Make the div focusable
                    >
                      <ReactPhoneInput
                        country={countryCode}
                        placeholder="Your Contact Number"
                        value={formData.phone}
                        onChange={(phone) => {
                          setFormData((prev) => ({ ...prev, phone }));
                          setErrors((prev) => ({ ...prev, phone: false })); // Clear phone error
                        }}
                        inputProps={{
                          name: "phone",
                          required: false,
                        }}
                        containerClass={styles.phoneContainer}
                        inputClass={`${styles.phoneInput}`}
                        inputStyle={{
                          border: errors.phone
                            ? "1px solid red"
                            : "1px solid #545454",
                          borderRadius: "20px",
                        }}
                        buttonClass={styles.flagButton}
                        dropdownClass={styles.dropdown}
                      />
                    </div>
                  </div>
                </>
              )}
              <button
                type="submit"
                className={styles.button}
                disabled={isSubmitting || !isAddressSelected}
                style={
                  isSubmitting || !isAddressSelected
                    ? { cursor: "not-allowed", backgroundColor: "gray" }
                    : {}
                }
              >
                {formData.access === "I Just Want To Add A Masjid"
                  ? "Add Masjid"
                  : "Add and Continue"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className={styles.formContainer}>
          <SignUpForm
            subtitle="Get Access Of The Masjid"
            onSubmit={handleSignUpSubmit}
            formData={formData as FormData}
            setFormData={setFormData}
            disabled={isSubmitting}
          />
        </div>
      )}
    </div>
  );
};

export default AddMasjidForm;
