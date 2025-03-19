// validation.js
import moment from "moment";
import toast from "react-hot-toast";
import { parseTime } from "./datetime"; // Import parseTime function if needed

export const validateTime = (
  formData: any,
  setTimingError: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // if (!formData.startTime || !formData.endTime) {
  //   setTimingError(false);
  //   return;
  // }
  const noneTypeStrDate = moment(formData.startDate);
  const noneTypeEndDate = moment(formData.endDate);
  const isSameDate = noneTypeStrDate.isSame(noneTypeEndDate, "day");

  // Check if recurrenceType is "none" and validate the date logic
  if (formData.recurrenceType.toLowerCase() === "none") {
    if (formData.startDate && formData.endDate && !isSameDate) {
      setTimingError(false); // valid completely no need to check time for "none" in this case
      return true;
    }
    if (!formData.startDate || !formData.endDate) {
      setTimingError(false);
      return true; // valid for now since no dates entered
    }
    if (isSameDate && formData.startTime && formData.endTime) {
      const startTime = parseTime(formData.startTime);
      const endTime = parseTime(formData.endTime);

      if (startTime > endTime) {
        setTimingError(true);
        return false; // Invalid if start time is greater than end time on same date
      } else {
        setTimingError(false);
        return true; // valid completely if the dates are same and start time is <=endTime
      }
    } else if (!formData.startTime || !formData.endTime) {
      setTimingError(false);
      return false; // its not valid for form validation but no error in case any of them are blank
    } else {
      setTimingError(false); // valid
      return true;
    }
  } else {
    // When recurrenceType is not "None", only check the timing
    if (!formData.startTime || !formData.endTime) {
      setTimingError(false);
      return false;
    }
    if (formData.startTime && formData.endTime) {
      const startTime = parseTime(formData.startTime);
      const endTime = parseTime(formData.endTime);

      if (startTime > endTime) {
        // const errorMsg = "Start time cannot be greater than end time";
        setTimingError(true);
        // toast.dismiss();
        // toast.error(errorMsg);
        return false;
      } else {
        setTimingError(false);
        return true;
      }
    }
  }

  return true; // Return true if no validation errors
};
export const validateForm = (
  formData: any,
  setStartTimeError: any,
  setEndTimeError: any
) => {
  const fieldErrors = {
    eventName: true,
    cost: true,
    category: true,
    description: true,
    latitude: true,
    longitude: true,
    recurrenceType: true,
    startDate: true,
    endDate: true,
    startTime: true,
    endTime: true,
    address: true,
    capacity: true,
    registrationOption: true,
    registrationRequired: true,
    addressDifferentChecked: true,
    dates: true,
  };

  // Validate eventName (required)
  if (!formData.eventName) {
    fieldErrors.eventName = false;
  }

  // Validate cost (required if registrationOption is "paid" and > 0)
  if (
    formData.registrationOption === "paid" &&
    (!formData.cost || formData.cost <= 0)
  ) {
    fieldErrors.cost = false;
  }

  // Validate category (required)
  if (!formData.category) {
    fieldErrors.category = false;
  }

  // Validate description (required)
  if (!formData.description) {
    fieldErrors.description = false;
  }

  // Validate latitude (required)
  if (!formData.latitude) {
    fieldErrors.latitude = false;
  }

  // Validate longitude (required)
  if (!formData.longitude) {
    fieldErrors.longitude = false;
  }

  // Validate recurrenceType (required)
  if (!formData.recurrenceType) {
    fieldErrors.recurrenceType = false;
  }

  // Validate address (required)
  if (!formData.address) {
    fieldErrors.address = false;
  }

  // Validate capacity (required and > 0)
  if (!formData.capacity || formData.capacity <= 0) {
    fieldErrors.capacity = false;
  }

  // Validate registrationOption (required)
  if (!formData.registrationOption) {
    fieldErrors.registrationOption = false;
  }
  return fieldErrors; // Return the object containing validation status for each field
};
