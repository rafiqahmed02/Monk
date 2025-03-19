// hooks/useCalendarLogic.ts
import { useEffect, useState } from "react";
import moment from "moment-timezone";
import {
  UtcDateConverter,
  dateFormatter,
  dateReverter,
} from "../../../../../helpers/HelperFunction";

export const useCalendarLogic = (
  initialTZone: string,
  formData: any,
  setFormData: Function,
  checkNextField?: Function
) => {
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState("");
  const [startDateError, setStartDateError] = useState<string>("");
  const [endDateError, setEndDateError] = useState<string>("");

  const handleToggleCalendar = (dateType: "startDate" | "endDate") => {
    console.log(dateType, isCalendarVisible);
    setIsCalendarVisible(!isCalendarVisible);
    setSelectedDateField(dateType);
  };
  useEffect(
    () => {
      if (
        !isCalendarVisible &&
        formData[selectedDateField] &&
        !formData[
          selectedDateField === "startDate" ? "endDate" : "startDate"
        ] &&
        checkNextField
      ) {
        checkNextField &&
          checkNextField(
            selectedDateField === "startDate" ? "endDate" : "startDate"
          );
      }
    },
    [isCalendarVisible, selectedDateField]
  );
  const handleDateSelect = (date: Date) => {
    console.log(date);
    const formattedDate = moment(date).format("YYYY-MM-DD");
    console.log("formattedDate", formattedDate);

    if (selectedDateField === "startDate") {
      console.log("startDate");

      const otherDate = formData.endDate;
      console.log("otherDate", !!otherDate);
      if (otherDate && new Date(formattedDate) > new Date(otherDate)) {
        setFormData({
          ...formData,
          startDate: formattedDate,
          endDate: formattedDate,
        });
        setIsCalendarVisible(false);
        return;
      }

      setFormData({
        ...formData,
        startDate: formattedDate,
      });
      setIsCalendarVisible(false);
      checkNextField && checkNextField("endDate");
      // if (otherDate && new Date(formattedDate) > new Date(otherDate)) {
      //   setStartDateError("Start date is greater than end date");
      //   setEndDateError("");
      //   setIsCalendarVisible(false);
      //   return;
      // }else{
      //   setStartDateError("");
      //   setEndDateError("");
      //   setIsCalendarVisible(false);
      // }
    } else if (selectedDateField === "endDate") {
      console.log("endDate.....");
      const otherDate = formData.startDate;

      if (otherDate && new Date(formattedDate) < new Date(otherDate)) {
        setEndDateError("End date is less than start date");
        setStartDateError("");
        setIsCalendarVisible(false);
        return;
      }

      setFormData({
        ...formData,
        endDate: formattedDate,
      });
    }

    setTimeout(() => {
      setIsCalendarVisible(false);
    }, 300);
  };

  const clearDateErrors = () => {
    setStartDateError("");
    setEndDateError("");
  };

  return {
    isCalendarVisible,
    handleToggleCalendar,
    handleDateSelect,
    selectedDateField,
    startDateError,
    endDateError,

    clearDateErrors,
  };
};
