import React, { useEffect, useRef, useState } from "react";
import styles from "./SignUpForm.module.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SearchDropdown from "../../../elements/Dropdown/SearchDropdown/SearchDropdown";
import Dropdown from "../../../elements/Dropdown/basicDropdown/Dropdown";
import ReactPhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import {
  validateForm,
  validateTermsAccepted,
  FormData,
} from "../utils/validation";
import toast from "react-hot-toast";
import { fetchUserLocation } from "../../../../helpers/HelperFunction/GoogleAPI/GoogleLocation";
import { MasjidOption } from "../../../../Types/MasjidTypes";
import CircularProgress from "@mui/material/CircularProgress";
import { customNavigatorTo } from "../../../../helpers/HelperFunction";
import { useNavigationprop } from "../../../../../MyProvider";
import TermAndConditions from "../../Shared/TermsAndCondition/TermAndConditions";

interface SignUpFormProps {
  subtitle: string;
  onSubmit: (formData: Record<string, any>) => void;
  disabled?: boolean;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  masjidsList?: MasjidOption[];
  handleSearchMasjid?: (query: string) => void;
  searching?: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  subtitle,
  onSubmit,
  disabled = false,
  formData,
  setFormData,
  masjidsList,
  handleSearchMasjid,
  searching,
}) => {
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false); // Manage password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Manage confirm password visibility
  const [countryCode, setCountryCode] = useState("");
  const [tmConOpener, setTmConOpener] = useState(false);
  const [assignedUserRole, setAssignedUserRole] = useState<string | null>(null);
  const navigation = useNavigationprop();

  useEffect(() => {
    if (formData.existingRole === "subadmin") {
      setAssignedUserRole(formData.existingRole);
    }
  }, [formData.existingRole]);

  // Fetch user location using Google's Geolocation API (IP-based location)
  useEffect(() => {
    const fetchLocation = async () => {
      const { countryCode } = await fetchUserLocation(
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      );
      setCountryCode(countryCode);
    };

    if (!formData.phone) {
      fetchLocation();
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the error for the specific field
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      termsAccepted: e.target.checked,
    }));
  };

  const handleMasjidSelection = (masjid: any) => {
    const assignedRole = masjid?.assignedUser[0]?.role || null; // Check if there is a subadmin
    setAssignedUserRole(assignedRole); // Store the assigned role
    setFormData((prev) => ({
      ...prev,
      masjid: masjid.masjidName,
      address: masjid.address,
      masjidId: masjid._id,
      masjidContact: masjid.contact,
      existingRole: assignedRole,
      isVerified: masjid.isVerified,
    }));
    setErrors((prev) => ({ ...prev, masjid: false })); // Clear masjid error
    if (assignedRole === "subadmin") {
      setFormData((prev) => ({
        ...prev,
        role: "subadmin",
      }));
    }
  };

  const clearData = () => {
    setAssignedUserRole(""); // Store the assigned role
    setFormData((prev) => ({
      ...prev,
      masjid: "",
      address: "",
      masjidId: "",
      masjidContact: "",
    }));
  };

  const handleRoleSelection = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
    setErrors((prev) => ({ ...prev, role: false })); // Clear role error
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const {
      isValid,
      errors: validationErrors,
      errorMessages,
    } = validateForm(formData, masjidsList === undefined);
    setErrors(validationErrors);

    if (!isValid) {
      if (errorMessages.length > 1) {
        toast.dismiss();
        toast.error("Please fill all the fields.");
      } else if (errorMessages.length === 1) {
        toast.dismiss();
        toast.error(errorMessages[0]);
      }
      return;
    }

    const termsError = validateTermsAccepted(
      formData.termsAccepted,
      formData.access
    );
    if (termsError) {
      toast.dismiss();
      toast.error(termsError);
      return;
    }
    onSubmit(formData);
  };

  function handleFocus(e: any) {
    const label = e.target.parentNode.querySelector(`.${styles.floatingLabel}`);
    label.classList.add(styles.active); // Use styles.active for modular CSS
  }

  function handleBlur(e: any) {
    const label = e.target.parentNode.querySelector(`.${styles.floatingLabel}`);
    if (e.target.value === "") {
      label.classList.remove(styles.active); // Use styles.active for modular CSS
    }
  }

  const labelRef = useRef(null);

  function handlePhoneFocus() {
    if (labelRef.current) {
      labelRef.current.classList.add(styles.active2);
    }
  }

  function handlePhoneBlur() {
    if (labelRef.current && !formData.phone) {
      labelRef.current.classList.remove(styles.active2);
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome On Board</h1>
      <h2 className={styles.subtitle}>{subtitle}</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        {masjidsList && (
          <SearchDropdown
            options={masjidsList || []}
            placeholder="Type To Search Masjid."
            onInputChange={(query) => {
              if (query === "") {
                setFormData((prev) => ({
                  ...prev,
                  masjid: "",
                }));
                setErrors((prev) => ({ ...prev, masjid: false }));
              }
              handleSearchMasjid?.(query);
            }} // Call the search function
            onSelect={(selectedOption: any) => {
              handleMasjidSelection(selectedOption);
            }}
            error={errors.masjid}
            selectedValue={formData.masjid}
            loading={searching}
            clearData={clearData}
            onBlur={(e) => {
              if (!e.target.value) {
                setErrors((prev) => ({ ...prev, masjid: false }));
              } else if (!formData.masjid) {
                setErrors((prev) => ({ ...prev, masjid: true }));
              }
            }}
            onFocus={(e) => {
              // if (e.target.value) {
              setErrors((prev) => ({ ...prev, masjid: false }));
              // }
            }}
          >
            {errors.masjid && (
              // <div
              //   style={{
              //     color: "red",
              //     fontSize: "0.75rem",
              //     marginLeft: "10px",
              //   }}
              // >
              //   Invalid Masjid Name!
              // </div>
              <div className={styles.footer} style={{ marginLeft: "10px" }}>
                <span
                  style={{
                    color: "red",
                    fontSize: "0.75rem",
                    textDecoration: "none",
                    border: "none",
                  }}
                >
                  Couldn’t Find Masjid Name?
                </span>
                <a
                  className={styles.addMasjidLink}
                  onClick={() =>
                    navigation
                      ? navigation("/add-masjid")
                      : customNavigatorTo("/add-masjid")
                  }
                >
                  Add Masjid Now
                </a>
              </div>
            )}
          </SearchDropdown>
        )}

        {formData.access !== "I Just Want To Add A Masjid" && (
          <Dropdown
            label="Who I am"
            placeholder="Select Role"
            options={[
              {
                label: "Musali Admin : Going This masjid daily",
                value: "musaliadmin",
                disabled: assignedUserRole === "subadmin", // Disable if subadmin
              },
              {
                label: "Masjid Admin : Official Representative of Masjid",
                value: "subadmin",
              },
            ]}
            onSelect={handleRoleSelection}
            error={errors.role}
            selectedValue={formData.role}
            toastMessage="Masjid is Already Assigned to Admin. You Can Only Sign Up as Masjid Admin."
          />
        )}

        <div className={styles.inputWrapper}>
          <label
            className={`${styles.floatingLabel} ${
              formData.fullName ? styles.active : ""
            }`}
          >
            {formData.access !== "I Just Want To Add A Masjid"
              ? "Full Name*"
              : "Full Name"}
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`${styles.input} ${
              errors.fullName ? styles.inputError : ""
            }`}
          />
        </div>

        <div className={styles.inputWrapper}>
          <label
            className={`${styles.floatingLabel} ${
              formData.email ? styles.active : ""
            }`}
          >{`${
            masjidsList
              ? formData.role === "subadmin"
                ? "Enter Official Masjid Email*"
                : "Your Email Address*"
              : formData.access === "I Just Want To Add A Masjid"
              ? "Your Email Address (Optional)"
              : formData.role === "subadmin"
              ? "Enter Official Masjid Email*"
              : "Your Email Address"
          }`}</label>
          <input
            type="email"
            name="email"
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={formData.email}
            onChange={handleInputChange}
            className={`${styles.input} ${
              errors.email ? styles.inputError : ""
            }`}
            autoComplete="off"
          />
        </div>

        <div className={styles.inputWrapper}>
          <label
            ref={labelRef}
            className={`${styles.floatingLabel} ${
              formData.phone ? styles.active : ""
            }`}
            style={{ left: "35px" }}
          >
            {formData.access !== "I Just Want To Add A Masjid"
              ? "Contact Number*"
              : "Contact Number"}
          </label>
          <div
            onFocus={() => handlePhoneFocus()}
            onBlur={() => handlePhoneBlur()}
            tabIndex={-1} // Make the div focusable
          >
            <ReactPhoneInput
              placeholder=""
              country={countryCode}
              value={formData.phone}
              onChange={(value, countryData, event, formattedValue) => {
                setFormData((prev) => ({ ...prev, phone: formattedValue }));
                setErrors((prev) => ({ ...prev, phone: false }));
              }}
              inputProps={{
                name: "phone",
                required: formData.access !== "I Just Want To Add A Masjid",
                className: `${styles.phoneInput}`, // Apply focus and blur styles here
              }}
              containerClass={styles.phoneContainer}
              inputStyle={{
                border: errors.phone ? "1px solid red" : "1px solid #545454",
                borderRadius: "20px",
              }}
              buttonClass={styles.flagButton}
              dropdownClass={styles.dropdown}
            />
          </div>
        </div>

        {formData.access !== "I Just Want To Add A Masjid" && (
          // formData.existingRole !== "subadmin" && (
          <>
            <div className={styles.inputGroup}>
              <label className={styles.floatingLabel}>Password*</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                // placeholder="Enter New Password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles.input} ${
                  errors.password ? styles.inputError : ""
                }`}
                autoComplete="new-password"
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {showPassword ? (
                <VisibilityIcon
                  className={styles.icon}
                  onClick={handleTogglePassword}
                  sx={{
                    fontSize: "18px",
                  }}
                />
              ) : (
                <VisibilityOffIcon
                  className={styles.icon}
                  onClick={handleTogglePassword}
                  sx={{
                    fontSize: "18px",
                  }}
                />
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.floatingLabel}>Confirm Password*</label>

              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                // placeholder="Confirm Your Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`${styles.input} ${
                  errors.confirmPassword ? styles.inputError : ""
                }`}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {showConfirmPassword ? (
                <VisibilityIcon
                  className={styles.icon}
                  onClick={handleToggleConfirmPassword}
                  sx={{
                    fontSize: "18px",
                  }}
                />
              ) : (
                <VisibilityOffIcon
                  className={styles.icon}
                  onClick={handleToggleConfirmPassword}
                  sx={{
                    fontSize: "18px",
                  }}
                />
              )}
            </div>
          </>
        )}

        <div className={styles.buttonContainer}>
          {formData.access !== "I Just Want To Add A Masjid" && (
            <div className={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="terms"
                checked={formData.termsAccepted}
                onChange={handleCheckboxChange}
              />
              <label
                htmlFor="terms"
                className={styles.checkboxLabel}
                onClick={() => setTmConOpener(true)}
              >
                Terms & Conditions
              </label>
            </div>
          )}
          <button
            type="submit"
            className={`${styles.button} ${disabled ? styles.disabled : ""}`}
            disabled={disabled}
          >
            {!disabled &&
              (!masjidsList
                ? formData.access !== "I Just Want To Add A Masjid"
                  ? "Add Masjid And Sign Up"
                  : "Sign Up"
                : "Sign Up")}
            {disabled && (
              <CircularProgress
                size={20}
                className={styles.circularLoader}
                color="inherit"
              />
            )}
          </button>
          <p className={styles.loginText}>
            Already have account?{" "}
            <a
              onClick={() =>
                navigation ? navigation("/login") : customNavigatorTo("/login")
              }
              style={{ cursor: "pointer" }}
            >
              Log In
            </a>
          </p>
        </div>
      </form>

      <TermAndConditions
        tmConOpener={tmConOpener}
        setTmConOpener={setTmConOpener}
      />
    </div>
  );
};

export default SignUpForm;
