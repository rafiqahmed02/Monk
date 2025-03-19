export const validateEmailAndPhone = (email?: string, phone?: string) => {
  const errors: { message?: string } = {};

  let emailError = "";
  let phoneError = "";

  // Email Validation
  if (
    email &&
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
  ) {
    emailError = "Invalid email";
  }

  // Phone Validation (International Format)
  if (phone) {
    const numericPhone = phone.replace(/\D/g, ""); // Remove non-numeric characters
    if (!/^\+?[0-9\s-]+$/.test(phone)) {
      phoneError = "Invalid phone number";
    } else if (numericPhone.length < 6 || numericPhone.length > 15) {
      phoneError = "The phone number should be between 6 and 15 digits";
    }
  }

  // Construct a single user-friendly error message
  if (emailError && phoneError) {
    errors.message = "Invalid email and phone number";
  } else if (emailError) {
    errors.message = emailError + ".";
  } else if (phoneError) {
    errors.message = phoneError + ".";
  }

  return errors;
};
