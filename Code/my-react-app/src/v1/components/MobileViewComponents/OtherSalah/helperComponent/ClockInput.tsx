import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";
import styles from "./ClockInput.module.css";
import clock from "../../../../photos/Newuiphotos/OtherSalah/clock.svg";
import { ClearIcon } from "@mui/x-date-pickers";

interface ClockTimeInputProps {
  setTime: Dispatch<SetStateAction<string>>;
  tim: string;
  label: string;
  id?: string;
  minTime?: Dayjs | null;
  className?: string;
  error?: boolean;
  defaultToPM?: boolean;
  allowClear?: boolean;
}

const ClockInput: React.FC<ClockTimeInputProps> = ({
  setTime,
  tim,
  label,
  id,
  minTime,
  className,
  error,
  defaultToPM = false,
  allowClear = false,
}) => {
  const defaultTime = dayjs().hour(12).minute(0); // 12 PM default time
  const [selectedTime, setSelectedTime] = React.useState<Dayjs | null>(
    tim ? dayjs(tim, "HH:mm") : null
  );

  const [isOpen, setIsOpen] = React.useState(false);
  const [displayTime, setDisplayTime] = React.useState<Dayjs | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const SAFE_DATE = "2000-01-01"; // or 1970-01-01, any date with no DST shift

  const parseTimeOnly = (timeString: string) => {
    // timeString is "HH:mm"
    const [hours, minutes] = timeString.split(":");
    // Build a Dayjs object pinned to a safe date
    return dayjs(SAFE_DATE).hour(Number(hours)).minute(Number(minutes));
  };

  useEffect(() => {
    setSelectedTime(tim ? parseTimeOnly(tim) : null);
    // setSelectedTime(tim ? dayjs(tim, "HH:mm") : null);
  }, [tim]);

  const handleDisplayTimeChange = (newTime: Dayjs | null) => {
    console.log(newTime);
    if (newTime?.isValid()) {
      // if (newTime.minute() === 0) {
      //   // When only the hour is selected, move to minute view
      //   setDisplayTime(newTime);
      // } else {
      handleAccept(newTime); // Finalize time selection
      // }
    } else {
      setSelectedTime(null);
      setTime("");
    }
  };
  const handleIconClick = () => {
    setDisplayTime(selectedTime || (defaultToPM ? defaultTime : null));
    setIsOpen(true);
  };

  const handleAccept = (finalTime: Dayjs | null) => {
    // Confirm the selected time on "OK" click
    defaultToPM = false;
    if (finalTime) {
      const formattedTime = finalTime.format("HH:mm");
      setTime(formattedTime);
      setSelectedTime(finalTime);
    } else {
      setTime("");
      setSelectedTime(null);
    }
    // setIsOpen(false);
  };

  const handleClose = () => {
    if (
      defaultToPM &&
      displayTime &&
      displayTime.isSame(defaultTime, "minute") &&
      !selectedTime
    ) {
      const formattedTime = defaultTime.format("HH:mm");
      setTime(formattedTime);
      setSelectedTime(defaultTime);
    }
    setIsOpen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div
        className={`${styles.clock} ${
          className?.includes("fullWidth") ? styles.fullWidth : ""
        }`}
      >
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <div className={`${!error ? styles.inputWrapper : ""} ${className}`}>
          <DesktopTimePicker
            open={isOpen}
            onClose={handleClose}
            onAccept={handleAccept} // Confirm time on OK click
            value={selectedTime || displayTime} // Display time (defaults to 12 PM when open)
            onChange={handleDisplayTimeChange}
            timeSteps={{ minutes: 1 }} // Set minute step to 1 minute
            slotProps={{
              textField: {
                id: id,
                inputRef: inputRef,
                InputProps: {
                  sx: {
                    pointerEvents: "none",
                  },
                  endAdornment: (
                    <div className={styles.icon} onClick={handleIconClick}>
                      <img
                        src={clock}
                        alt="clock icon"
                        style={{ cursor: "pointer", pointerEvents: "auto" }}
                      />
                    </div>
                  ),
                },
                placeholder: "hh:mm a",
                InputLabelProps: {
                  shrink: true,
                },
                onClick: () => {
                  handleIconClick();
                },
              },
              popper: {
                sx: {
                  "& .MuiList-root": {
                    scrollbarWidth: "none",
                  },
                },
              },
              actionBar: {
                // The order here will determine how the buttons appear.
                // "clear" will be rendered alongside "cancel" and "accept"
                actions: allowClear ? ["clear", "accept"] : ["accept"],
              },
            }}
            sx={{
              width: "100%",

              "& .MuiOutlinedInput-root": {
                border: error ? "1px solid red" : "none",
                padding: "0px",
                borderRadius: "20px",
                "&.Mui-focused": {
                  borderRadius: "20px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "1px solid #1d785a",
                    borderColor: "#1d785a",
                  },
                },
                "&:hover": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                },
              },
              "& .MuiInputBase-input": {
                borderColor: "#838383",
                borderRadius: "20px",
                textAlign: "left",
                fontSize: { xs: "0.75rem", sm: "0.9rem" },
                padding: "8px 12px",
              },
            }}
          />
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default ClockInput;
