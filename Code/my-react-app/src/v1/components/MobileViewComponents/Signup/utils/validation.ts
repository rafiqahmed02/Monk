import PasswordInput from "../../../../pages/Shared/PasswordInput/PasswordInput";

export interface FormData {
  address: string;
  masjidContact: string;
  website: string;
  masjidName: string;
  masjid: string;
  access: string;
  role: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  existingRole?: string;
}

export const validateForm = (formData: FormData, AddAndSignup: boolean) => {
  const errors: Record<string, boolean> = {};
  const errorMessages: string[] = [];
  let isValid = true;

  // Validate access type
  // if (showAccessDropdown && !formData.access) {
  //   errors.access = true;
  //   errorMessages.push("Please select the access type.");
  //   isValid = false;
  // }

  // Check if the user selected "I Just Want To Add A Masjid"
  const isAddMasjidOnly = formData.access === "I Just Want To Add A Masjid";
  // Validate masjid field
  if (!AddAndSignup && !formData.masjid && !isAddMasjidOnly) {
    console.log(formData);
    errors.masjid = true;
    errorMessages.push(
      "Please Select From the Available Masjids or Add a New One."
    );
    isValid = false;
  }

  // Validate role only if not "I Just Want To Add A Masjid"
  if (!formData.role && !isAddMasjidOnly) {
    errors.role = true;
    errorMessages.push("Please Select Your Role.");
    isValid = false;
  }

  // Validate full name
  if (!formData.fullName && !isAddMasjidOnly) {
    errors.fullName = true;
    errorMessages.push("Please Fill the Name Field.");
    isValid = false;
  }

  // Validate email
  if (!formData.email && !isAddMasjidOnly) {
    errors.email = true;
    errorMessages.push("Please Fill the Email Field.");
    isValid = false;
  } else if (
    !isAddMasjidOnly &&
    formData.email &&
    !/^\S+@\S+\.\S+$/.test(formData.email)
  ) {
    errors.email = true;
    errorMessages.push("Email Format is Wrong.");
    isValid = false;
  }

  // Validate phone
  if (!formData.phone && !isAddMasjidOnly) {
    errors.phone = true;
    errorMessages.push("Please Fill the Phone Number Field.");
    isValid = false;
  }

  // Validate password and confirm password only if not "I Just Want To Add A Masjid"
  if (
    !formData.password &&
    !isAddMasjidOnly
    // formData.existingRole !== "subadmin"
  ) {
    errors.password = true;
    errorMessages.push("Please Fill the Password Field.");
    isValid = false;
  }
  if (
    !formData.confirmPassword &&
    !isAddMasjidOnly
    // formData.existingRole !== "subadmin"
  ) {
    errors.confirmPassword = true;
    errorMessages.push("Please Fill the Confirm Password Field.");
    isValid = false;
  } else if (
    !isAddMasjidOnly &&
    formData.password &&
    formData.password !== formData.confirmPassword
  ) {
    errors.password = true;
    errors.confirmPassword = true;
    errorMessages.push("Passwords do not match.");
    isValid = false;
  }

  return { isValid, errors, errorMessages };
};

export const validateTermsAccepted = (
  termsAccepted: boolean,
  access: string
) => {
  // Validate terms only if access is NOT "I Just Want To Add A Masjid"
  if (!termsAccepted && access !== "I Just Want To Add A Masjid") {
    return "Please Accept the Terms & Conditions.";
  }
  return null;
};
