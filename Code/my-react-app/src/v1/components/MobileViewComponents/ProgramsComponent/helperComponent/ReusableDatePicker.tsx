import React, { ChangeEvent, useEffect, useState } from "react";
import DatePicker, {
  getAllDatesInRange,
  DateObject,
} from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import left_arrow from "../../../../photos/Newuiphotos/Common/left_arrow.svg";
import right_arrow from "../../../../photos/Newuiphotos/Common/right_arrow.svg";
import calenderIcon from "../../../../photos/Newuiphotos/OtherSalah/cal.svg";
import DaySelection from "./DaySelection/DaySelection";
import "react-multi-date-picker/styles/colors/green.css";
import "./ReusableDatePicker.css";
import moment from "moment";
import {
  dateFormatter,
  LocationBasedToday,
  UtcDateConverter,
} from "../../../../helpers/HelperFunction";
import ClockInput from "../../OtherSalah/helperComponent/ClockInput";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import {
  Checkbox,
  FormControl,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import styles from "./ReusableDatePicker.module.css";
import { CustomSelect } from "../../Programs/Main/ProgramForm/StyledButtons";
import { parseTime } from "../Helper/Functions/datetime";
import { validateTime } from "../Helper/Functions/validation";
import useMasjidData from "../../SharedHooks/useMasjidData";
import { EventFormData } from "../../../../redux/Types";
import { RecurrenceType } from "../enums/enums";
interface ReusableDatePickerProps {
  formData: any;
  handleChange: (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | SelectChangeEvent<unknown>
  ) => void;
  handleToggleCalendar: (dateType: "startDate" | "endDate") => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  timingError: boolean;
  setTimingError: React.Dispatch<React.SetStateAction<boolean>>;
  inputChecker: (value: any, condition?: boolean) => string;
  consumerMasjidId: string;
  isEditMode: boolean;
}

const ReusableDatePicker: React.FC<ReusableDatePickerProps> = ({
  formData,
  handleChange,
  handleToggleCalendar,
  setFormData,
  timingError,
  setTimingError,
  inputChecker,
  consumerMasjidId,
  isEditMode,
}) => {
  const [tZone, setTZone] = useState<string>("");
  const {
    masjidData,
    isLoading: isMasjidDataLoading,
    error: masjidDataError,
  } = useMasjidData(consumerMasjidId);

  useEffect(() => {
    if (
      masjidData &&
      masjidData.location &&
      masjidData.location.coordinates.length > 1
    ) {
      setTZone(masjidData.location.timezone);
    }
  }, [masjidData, consumerMasjidId]);

  useEffect(() => {
    validateTime(formData, setTimingError);
  }, [
    formData.recurrenceType,
    formData.startDate,
    formData.endDate,
    formData.startTime,
    formData.endTime,
  ]);
  const getCurrentDateInTimeZone = (zone: string) => {
    return moment().tz(zone).format("YYYY-MM-DD");
  };

  useEffect(() => {
    if (
      // formData.recurrenceType === "none" ||
      formData?.recurrenceType === RecurrenceType.WEEKLY
    ) {
      if (formData.startDate && formData.endDate) {
        handleWeeklySelection();
      } else {
        setFormData((prevFormData: EventFormData) => ({
          ...prevFormData,
          dates: [],
        }));
      }
    }
  }, [
    formData?.startDate,
    formData?.endDate,
    formData?.days,
    formData?.recurrenceType,
  ]);

  const handleRangeSelection = (dateObjects: DateObject[]) => {
    const allDatesInRange = getAllDatesInRange(dateObjects, true).map(
      (date) => new DateObject(date)
    );
    setFormData((prevFormData: EventFormData) => ({
      ...prevFormData,
      dates: allDatesInRange,
    }));

    handleChange({
      target: { name: "dates", value: allDatesInRange },
    } as SelectChangeEvent<unknown>);
  };

  const handleRandomSelection = (dateObjects: DateObject[]) => {
    const randomDates = dateObjects
      .map((date) => new DateObject(date))
      .sort((a, b) => a.toDate().getTime() - b.toDate().getTime()); // Sorting by date
    setFormData((prevFormData: EventFormData) => ({
      ...prevFormData,
      dates: randomDates,
    }));
  };

  const handleWeeklySelection = () => {
    if (formData.startDate && formData.endDate) {
      const start = new DateObject(formData.startDate).format("YYYY-MM-DD");
      const end = new DateObject(formData.endDate).format("YYYY-MM-DD");

      const matchedDates = getMatchingDates(
        [formData.startDate, formData.endDate],
        formData.days
      );

      // Convert the matched dates into DateObjects
      const selectedDatesArray = matchedDates.map(
        (dateString) => new DateObject(dateString)
      );

      setFormData((prevFormData: EventFormData) => ({
        ...prevFormData,
        dates: selectedDatesArray,
      }));
    }
  };

  useEffect(() => {
    if (
      formData.recurrenceType.toLowerCase() === RecurrenceType.NONE ||
      formData.recurrenceType === RecurrenceType.WEEKLY
    ) {
      return;
    }
    setFormData((prevFormData: EventFormData) => ({
      ...prevFormData,
      startDate:
        formData.dates.length > 0 ? formData.dates[0].format("YYYY-MM-DD") : "",
      endDate:
        formData.dates.length > 0
          ? formData.dates[formData.dates.length - 1].format("YYYY-MM-DD")
          : "",
    }));
  }, [formData.dates]);
  // useEffect(() => {
  //   // console.log("updating selectedDates", selectedDates);
  //   if (
  //     formData.recurrenceType !== "none" &&
  //     formData.recurrenceType !== "weekly"
  //   ) {
  //     setFormData({
  //       ...formData,
  //       dates: selectedDates,
  //       startDate:
  //         selectedDates.length > 0 ? selectedDates[0].format("YYYY-MM-DD") : "",
  //       endDate:
  //         selectedDates.length > 0
  //           ? selectedDates[selectedDates.length - 1].format("YYYY-MM-DD")
  //           : "",
  //       // selectedDates.length > 1
  //       //   ? selectedDates[selectedDates.length - 1].format("YYYY-MM-DD")
  //       //   : formData.recurrenceType === "weekly"
  //       //   ? selectedDates[selectedDates.length - 1]?.format("YYYY-MM-DD") ||
  //       //     ""
  //       //   : "",
  //     });
  //   } else {
  //     setFormData({
  //       ...formData,
  //       dates: selectedDates,
  //     });
  //   }
  // }, [selectedDates]);

  const getMatchingDates = (dateArray: any[], weekdays: string[]): string[] => {
    const matchingDates: string[] = [];
    let currentDate = moment(dateArray[0]);
    while (currentDate.isSameOrBefore(dateArray[1], "day")) {
      const dayOfWeek = currentDate.format("ddd");

      if (weekdays.includes(dayOfWeek)) {
        const matchedDate = currentDate.format("YYYY-MM-DD");
        matchingDates.push(UtcDateConverter(matchedDate, tZone));
      }
      currentDate = currentDate.add(1, "day");
    }
    return matchingDates;
  };

  // useEffect(() => {
  //   if (formData.startTime && formData.endTime) {
  //     const start = dayjs(formData.startTime, "HH:mm");
  //     const end = dayjs(formData.endTime, "HH:mm");

  //     if (end.isBefore(start)) {
  //       toast.error("End time cannot be earlier than start time");
  //     }
  //   }
  // }, [formData.startTime, formData.endTime]);

  const handleRecurrenceCheck = (e: ChangeEvent<HTMLInputElement>) => {
    // console.log("not here");
    const { checked } = e.target;
    if (!checked) {
      setFormData((prevFormData: EventFormData) => ({
        ...prevFormData,
        recurrenceType: "none",
      }));
    } else {
      setFormData((prevFormData: EventFormData) => ({
        ...prevFormData,
        recurrenceType: "daily",
      }));
    }
  };
  return (
    <div className="date-picker-container">
      {!isEditMode && (
        <div className={`${styles["recurrenceField"]}`}>
          <label
            htmlFor="recurrence_checkbox"
            data-testid="recurrence_checkbox"
          >
            Recurrence
          </label>
          <Checkbox
            name="recurrence"
            checked={
              formData.recurrenceType.toLowerCase() !== RecurrenceType.NONE
            }
            onChange={handleRecurrenceCheck}
            inputProps={{ "aria-label": "controlled" }}
            id="recurrence_checkbox"
            sx={{
              "& .MuiSvgIcon-root": {
                width: 20,
                height: 15,
              },
            }}
          />
        </div>
      )}
      {formData.recurrenceType.toLowerCase() !== RecurrenceType.NONE && (
        <>
          <div className={styles.recurrenceTypeField}>
            <label htmlFor="recurrenceType">Occurs</label>
            <FormControl
              sx={{
                width: "100%",
                borderRadius: "20px",
                "& .MuiOutlinedInput-root": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cfcfcf",
                    borderRadius: "20px",
                  },
                },
              }}
            >
              <CustomSelect
                name="recurrenceType"
                className={`${styles.selectInput} ${inputChecker(
                  formData.recurrenceType
                )}`}
                sx={{ width: "100%", borderRadius: "20px" }}
                id="recurrenceType"
                displayEmpty
                value={formData.recurrenceType}
                onChange={handleChange}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="random">Random</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
              </CustomSelect>
            </FormControl>
          </div>
          {/* Range selection */}
          {formData?.recurrenceType === RecurrenceType.DAILY && (
            <div className="range-date-picker-container">
              <label className="range-label">Select Range</label>
              <div className="date-picker-wrapper">
                <DatePicker
                  format="DD-MMM-YYYY"
                  className="green"
                  range
                  dateSeparator="to"
                  rangeHover
                  value={formData.dates}
                  onChange={handleRangeSelection}
                  plugins={[<DatePanel />]}
                  minDate={LocationBasedToday(tZone)}
                  containerStyle={{
                    width: "100%",
                  }}
                  renderButton={(
                    direction: any,
                    handleClick: any,
                    disabled: boolean
                  ) =>
                    direction === "right" ? (
                      <img
                        src={right_arrow}
                        alt="Right Arrow"
                        onClick={handleClick}
                        className="arrow-icon"
                      />
                    ) : !disabled ? (
                      <img
                        src={left_arrow}
                        alt="Left Arrow"
                        onClick={handleClick}
                        className="arrow-icon"
                      />
                    ) : (
                      <span style={{ width: "38px" }}></span>
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "20px",
                    marginRight: "50px",
                    borderRadius: "25px",
                    border: `${inputChecker(
                      formData.dates.length <= 1 ? "" : "noErr",
                      true
                    )}`,
                  }}
                />
                <div className="calendar-icon-container">
                  <img
                    src={calenderIcon}
                    alt="Calendar Icon"
                    className="calendar-icon"
                  />
                </div>
              </div>{" "}
              {inputChecker(
                formData.dates.length === 1 ? "" : "noErr",
                true
              ) !== "" && (
                <p
                  style={{
                    color: "red",
                    margin: "0",
                    marginLeft: "8px",
                    marginTop: "3px",
                  }}
                >
                  Please select a date range with at least 2 dates
                </p>
              )}
            </div>
          )}

          {/* Random date selection */}
          {formData?.recurrenceType === RecurrenceType.RANDOM && (
            <div className="random-date-picker-container">
              <label className="random-label">Select Random Dates</label>
              <div className="date-picker-wrapper">
                <DatePicker
                  format="DD-MMM-YYYY"
                  className="green"
                  multiple
                  value={formData.dates}
                  onChange={handleRandomSelection}
                  minDate={LocationBasedToday(tZone)}
                  plugins={[<DatePanel />]}
                  containerStyle={{
                    width: "100%",
                  }}
                  renderButton={(
                    direction: any,
                    handleClick: any,
                    disabled: boolean
                  ) =>
                    direction === "right" ? (
                      <img
                        src={right_arrow}
                        alt="Right Arrow"
                        onClick={handleClick}
                        className="arrow-icon"
                      />
                    ) : !disabled ? (
                      <img
                        src={left_arrow}
                        alt="Left Arrow"
                        onClick={handleClick}
                        className="arrow-icon"
                      />
                    ) : (
                      <span style={{ width: "38px" }}></span>
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "20px",
                    borderRadius: "25px",
                    paddingRight: "35px",

                    border: `${inputChecker(
                      formData.dates.length <= 1 ? "" : "noErr",
                      true
                    )}`,
                  }}
                />
                <div className="calendar-icon-container">
                  <img
                    src={calenderIcon}
                    alt="Calendar Icon"
                    className="calendar-icon"
                  />
                </div>
              </div>{" "}
              {inputChecker(
                formData.dates.length === 1 ? "" : "noErr",
                true
              ) !== "" && (
                <p
                  style={{
                    color: "red",
                    margin: "0",
                    marginLeft: "8px",
                    marginTop: "3px",
                  }}
                >
                  Please select at least 2 dates
                </p>
              )}
            </div>
          )}

          {/* Weekly selection */}
          {/* Weekly selection */}
          {formData?.recurrenceType === RecurrenceType.WEEKLY && (
            <div className="weekly-date-picker-container">
              <label className="day-selection-label">Select Days</label>
              <DaySelection
                setDays={(array) => {
                  setFormData((prevFormData: EventFormData) => ({
                    ...prevFormData,
                    days: array,
                  }));
                }}
                currentDays={formData.days}
                setRecurrenceType={(recurrencetype: string) => {
                  // console.log(recurrencetype, "---------recur");
                  setFormData((prevFormData: EventFormData) => ({
                    ...prevFormData,
                    recurrenceType: recurrencetype,
                  }));
                }}
              />
              {inputChecker(formData.dates.length <= 0 ? "" : "noErr", true) !==
                "" &&
                formData.startDate &&
                formData.endDate &&
                formData.startTime &&
                formData.endTime && (
                  <p
                    style={{
                      color: "red",
                      margin: "0",
                      marginLeft: "8px",
                      marginTop: "3px",
                    }}
                  >
                    The selected days and date range do not match. Please select
                    dates that include the selected days.
                  </p>
                )}
            </div>
          )}
        </>
      )}
      {/* Show start and end date when formData.recurrence is not checked */}
      {(formData?.recurrenceType.toLowerCase() === RecurrenceType.NONE ||
        formData?.recurrenceType === RecurrenceType.WEEKLY) && (
        <div className="none-date-picker-container">
          {/* <label className="none-label">Select Start and End Dates</label> */}
          <div className="date-picker-wrapper">
            {/* Start Date Input */}
            <span onClick={() => handleToggleCalendar("startDate")}>
              <label className="none-label">Start Date</label>
              <input
                className={inputChecker(formData.startDate)}
                type="text"
                value={dateFormatter(formData.startDate)}
                placeholder="Select Start Date"
                min={moment(LocationBasedToday(tZone)).format("YYYY-MM-DD")}
                style={{
                  width: "100%",
                  marginRight: "10%",
                  padding: "10px",
                  borderRadius: "20px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
                readOnly
              />
            </span>
            {/* End Date Input */}
            <span onClick={() => handleToggleCalendar("endDate")}>
              <label className="none-label">End Date</label>
              <input
                className={inputChecker(formData.endDate)}
                type="text"
                value={dateFormatter(formData.endDate)}
                placeholder="Select End Date"
                min={
                  formData.startDate
                    ? formData.startDate
                    : moment().format("YYYY-MM-DD")
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "20px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
                readOnly
              />
            </span>
          </div>
        </div>
      )}
      <div className="time-input-container">
        <div className="time-clock">
          <ClockInput
            setTime={(time) => {
              handleChange({
                target: { name: "startTime", value: time },
              } as any);
              const startTime = parseTime(time as string);
              const endTime = parseTime(formData.endTime);
              if (endTime < startTime) {
                handleChange({
                  target: { name: "endTime", value: time },
                } as any);
              }
            }}
            tim={formData.startTime}
            label={
              formData.recurrenceType === "none"
                ? "Start Time"
                : "Each Day Start Time"
            }
            id="start-time"
            className="time-picker"
            error={inputChecker(formData.startTime)}
          />
        </div>
        <div className="time-clock">
          <ClockInput
            setTime={(time) => {
              handleChange({ target: { name: "endTime", value: time } } as any);
            }}
            tim={formData.endTime}
            label={
              formData.recurrenceType === "none"
                ? "End Time"
                : "Each Day End Time"
            }
            id="end-time"
            // minTime={dayjs(formData.startTime, "HH:mm")} // Ensure end time is after start time
            className="time-picker"
            error={inputChecker(formData.endTime) || timingError}
          />
        </div>
      </div>
      {
        <div style={{ textAlign: "center", marginTop: "10px", color: "red" }}>
          {timingError && "End time cannot be earlier than start time"}
        </div>
      }
    </div>
  );
};

export default ReusableDatePicker;
