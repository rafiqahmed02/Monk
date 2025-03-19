import React, {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  useRef,
} from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PrayerTypeDropdown from "./PrayerTypeDropdown";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { EnteredData } from "./NamazTImings";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { makeStyles } from "@mui/styles";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";

type propsType = {
  setEnteredData: Dispatch<SetStateAction<EnteredData>>;
  enteredData: EnteredData;
  label: string;
  nonHanafyAsr: string;
  prayerName: string;
  solarHanafyAsr: string;
  prayerTimeType?: string;
};
const TimeSelector = ({
  setEnteredData,
  enteredData,
  label,
  nonHanafyAsr,
  solarHanafyAsr,
  prayerName,
  prayerTimeType,
}: propsType) => {
  const [prayerStatus, setPrayerStatus] = useState(prayerTimeType);
  const initialTimesByJamaat = useRef(prayerTimeType);
  const theme = useTheme();
  const customStyles = {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    // fontSize: "11px",
    lineHeight: 1.43,
    letterSpacing: "0.01071em",
    color: prayerStatus === "No Iqama" ? "#9F9E9E" : "#1B8368",
    marginLeft: "5px",
    marginRight: "auto",
  };
  const isMobile = useMediaQuery("(max-width:767.98px)");
  // Effect to check if jamaatTime is empty and set prayerStatus to "skip"
  useEffect(() => {
    // console.log(
    //   "----------------------the method is changing",
    //   enteredData[prayerName]
    // );
    const currentPrayer = enteredData[prayerName];
    if (currentPrayer && label == "Iqama") {
      setPrayerStatus(currentPrayer.TimesByJamaat);
    }
  }, [enteredData, prayerName]);

  useEffect(() => {
    const currentPrayer = enteredData[prayerName];
    if (
      currentPrayer &&
      currentPrayer.TimesByJamaat !== "No Iqama" &&
      currentPrayer.jamaatTime === "" &&
      label === "Iqama"
    ) {
      const updatedData = {
        ...enteredData,
        [prayerName]: {
          ...currentPrayer,
          jamaatTime: currentPrayer.azaanTime, // autofill jamaatTime with azaanTime
        },
      };
      setEnteredData(updatedData);
    }
  }, [enteredData, prayerName, label, setEnteredData]);

  const statusHandler = (status: string) => {
    const {
      TimesByAzaan,
      TimesByJamaat,
      ExtendedAzaanMinutes,
      ExtendedJamaatMinutes,
      jamaatTime,
      azaanTime,
      ...rest
    } = enteredData[prayerName];
    const updatedData = {
      ...enteredData,
      [prayerName]: {
        ...rest,
        TimesByAzaan: label === "Azan" ? status : TimesByAzaan,
        TimesByJamaat: label === "Azan" ? TimesByJamaat : status,
        ExtendedJamaatMinutes:
          label === "Iqama" && status === "solar"
            ? 5
            : label === "Iqama" && status === "No Iqama"
            ? 0
            : ExtendedJamaatMinutes,
        jamaatTime:
          label === "Iqama" && (status === "solar" || status === "manual")
            ? dayjs(azaanTime, "HH:mm")
                .add(ExtendedAzaanMinutes, "minutes")
                .format("HH:mm")
            : label === "Iqama" && status === "No Iqama"
            ? ""
            : jamaatTime,
        azaanTime: azaanTime,
        ExtendedAzaanMinutes: ExtendedAzaanMinutes,
      },
    };

    setEnteredData(updatedData);
    setPrayerStatus(status);
  };

  useEffect(() => {
    if (nonHanafyAsr && prayerName === "Asar" && prayerStatus === "solar") {
      timeSetter(nonHanafyAsr);
    } else if (
      solarHanafyAsr &&
      prayerName === "Asar" &&
      prayerStatus === "solar"
    ) {
      timeSetter(solarHanafyAsr);
    }
  }, [nonHanafyAsr, prayerName]);

  const timeSetter = (tim: string) => {
    const { azaanTime, jamaatTime, ...rest } = enteredData[prayerName];
    const updatedData = {
      ...enteredData,
      [prayerName]: {
        ...rest,
        azaanTime: label === "Azan" ? tim : azaanTime,
        jamaatTime: label === "Azan" ? jamaatTime : tim,
      },
    };
    setEnteredData(updatedData);
  };

  // Convert your time string to a Dayjs object for the TimePicker
  const timeValue =
    label === "Azan"
      ? enteredData[prayerName]?.azaanTime
      : enteredData[prayerName]?.jamaatTime;

  const handleTimeChange = (newValue) => {
    // setIsSubmitBtnDisabled(false);
    console.log(newValue);
    if (newValue) {
      const formattedTime = newValue.format("HH:mm"); // Format back to string
      timeSetter(formattedTime);
    }
  };

  const handleCountPlusMins = (isIncrease: boolean) => {
    if (isIncrease) {
      // if (count < 60) {
      const {
        ExtendedAzaanMinutes,
        ExtendedJamaatMinutes,
        jamaatTime,
        azaanTime,
        TimesByJamaat,
        ...rest
      } = enteredData[prayerName];

      const updatedData = {
        ...enteredData,
        [prayerName]: {
          ...rest,
          ExtendedAzaanMinutes:
            label === "Azan" ? ExtendedAzaanMinutes + 1 : ExtendedAzaanMinutes,
          ExtendedJamaatMinutes:
            label === "Azan"
              ? ExtendedJamaatMinutes
              : ExtendedJamaatMinutes + 1,
          // jamaatTime: jamaatTime,
          jamaatTime:
            label === "Azan" && TimesByJamaat === "solar"
              ? dayjs(jamaatTime, "HH:mm").add(1, "minute").format("HH:mm")
              : jamaatTime,
          azaanTime: azaanTime,
          TimesByJamaat: TimesByJamaat,
        },
      };

      setEnteredData(updatedData);
      // }
    } else {
      const {
        ExtendedAzaanMinutes,
        ExtendedJamaatMinutes,
        jamaatTime,
        TimesByJamaat,
        ...rest
      } = enteredData[prayerName];
      const updatedData = {
        ...enteredData,
        [prayerName]: {
          ...rest,
          ExtendedAzaanMinutes:
            label === "Azan" ? ExtendedAzaanMinutes - 1 : ExtendedAzaanMinutes,
          ExtendedJamaatMinutes:
            label === "Azan"
              ? ExtendedJamaatMinutes
              : ExtendedJamaatMinutes - 1,
          jamaatTime:
            label === "Azan" && TimesByJamaat === "solar"
              ? dayjs(jamaatTime, "HH:mm").add(-1, "minute").format("HH:mm")
              : jamaatTime,
          TimesByJamaat: TimesByJamaat,
        },
      };

      setEnteredData(updatedData);
    }
  };
  // // perfect
  // const minTime =
  //   label === "Iqama"
  //     ? dayjs(enteredData[prayerName]?.azaanTime, "HH:mm")
  //         .add(enteredData[prayerName]?.ExtendedAzaanMinutes, "minutes")
  //         .add(-enteredData[prayerName]?.ExtendedJamaatMinutes, "minutes")
  //     : null;
  // // need to change
  // const maxTime =
  //   label === "Azan"
  //     ? //check if the iqama is manual autofill or skipp

  //       // if it is manual then don't add extended. if it is autofill add

  //       dayjs(enteredData[prayerName]?.jamaatTime, "HH:mm").add(
  //         -enteredData[prayerName]?.ExtendedAzaanMinutes,
  //         "minutes"
  //       )
  //     : null;

  const minTime = () => {
    if (label === "Iqama") {
      if (enteredData[prayerName]?.TimesByJamaat === "manual") {
        return dayjs(enteredData[prayerName]?.azaanTime, "HH:mm").add(
          enteredData[prayerName]?.ExtendedAzaanMinutes,
          "minutes"
        );
      } else if (enteredData[prayerName]?.TimesByJamaat === "solar") {
        return dayjs(enteredData[prayerName]?.azaanTime, "HH:mm")
          .add(enteredData[prayerName]?.ExtendedAzaanMinutes, "minutes")
          .add(-enteredData[prayerName]?.ExtendedJamaatMinutes, "minutes");
      } else {
        return null;
      }
    } else {
      return null;
    }
  };
  const maxTime = () => {
    if (label === "Azan") {
      if (enteredData[prayerName]?.TimesByJamaat === "manual") {
        return dayjs(enteredData[prayerName]?.jamaatTime, "HH:mm").add(
          -enteredData[prayerName]?.ExtendedAzaanMinutes,
          "minutes"
        );
      } else if (enteredData[prayerName]?.TimesByJamaat === "solar") {
        return dayjs(enteredData[prayerName]?.jamaatTime, "HH:mm")
          .add(enteredData[prayerName]?.ExtendedJamaatMinutes, "minutes")
          .add(-enteredData[prayerName]?.ExtendedAzaanMinutes, "minutes");
      } else {
        return null;
      }
    }
  };
  const iconBtnStyle = { color: "white", padding: 0 };

  // .clock .clock-input input[type="text"] {
  //   margin-bottom: 0;
  //   box-sizing: content-box;
  // }

  // .clock-input .css-60amat-MuiInputBase-root-MuiOutlinedInput-root {
  //   padding-right: 0;
  // }

  // .clock .MuiInputBase-root {
  //   border-radius: 20px;
  // }
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };
  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <div
      className="Azan-solar-timings"
      data-testid={`timings-div-${prayerName}-${label}`}
    >
      <PrayerTypeDropdown
        prayerName={prayerName}
        statusHandler={statusHandler}
        timingStatus={prayerStatus}
        label={label}
      />

      {/* time picker clock option div ------------------------------------------------------------------------ */}
      <div
        data-testid="each-clock"
        className="clock"
        style={
          prayerStatus === "No Iqama"
            ? { visibility: "hidden" }
            : label === "Iqama" && prayerStatus === "solar"
            ? { display: "none" }
            : {}
        }
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <label style={{ color: "#9F9E9E" }} data-testid="clock-label">
            {label}
            <DesktopTimePicker
              open={isOpen}
              onClose={handleClose}
              className="mobileTimePicker"
              onChange={handleTimeChange}
              openTo="minutes"
              {...(prayerStatus === "solar" || prayerStatus === "No Iqama"
                ? { readOnly: true }
                : {})}
              value={timeValue ? dayjs(timeValue, "HH:mm") : null}
              // minTime={minTime()}
              // maxTime={maxTime()}
              timeSteps={{ minutes: 1 }}
              slotProps={{
                textField: {
                  variant: "outlined",
                  inputProps: {
                    "data-testid": `${label}-${prayerName}-time`,
                    readOnly: true, // Add your test ID here
                    "aria-readonly": false,
                    endAdornment: null,
                  },
                  InputProps: {
                    style: { cursor: "pointer" },
                    endAdornment: null,
                    sx: {
                      pointerEvents: "none",
                    },
                  },
                  onClick: () => {
                    label !== "Azan" && handleOpen();
                  },
                },
                popper: {
                  sx: {
                    // width: "80%",
                    // maxWidth: "320px",
                    "& .MuiList-root": {
                      scrollbarWidth: "none",
                      // width: "33%",
                      // "& .MuiMenuItem-root": {
                      //   width: "100%",
                      // },
                    },
                  },
                },
              }}
              sx={{
                cursor: label === "Azan" ? "auto" : "pointer",
                width: "95px",
                border:
                  // dayjs(timeValue, "HH:mm").isAfter(maxTime()) ||
                  // dayjs(timeValue, "HH:mm").isBefore(minTime())
                  //   ? "1px solid #ccc":
                  label === "Iqama"
                    ? dayjs(timeValue, "HH:mm").isBefore(minTime())
                      ? "1px solid #f44336"
                      : "1px solid #1B8368"
                    : "1px solid #ccc",

                // dayjs(enteredData[prayerName]?.azaanTime, "HH:mm")
                //   .add(enteredData[prayerName].ExtendedAzaanMinutes)
                //   .isAfter(dayjs(enteredData[prayerName]?.jamaatTime, "HH:mm"))
                //   ? "1px solid red"
                //   : "1px solid #ccc",
                borderRadius: "20px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",

                  padding: "5px",
                  color: prayerStatus === "No Iqama" ? "grey" : "",
                  "&:hover, &:focus-visible": {
                    outline: "none !important",
                    boxShadow: "none !important",
                    border: "none !important",
                  },
                  // fontSize: "14px",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "& .Mui-error.MuiOutlinedInput-notchedOutline": {
                  border: "none",
                  // borderColor: "#FF2929",
                },
                textDecorationLine:
                  prayerStatus === "No Iqama" ? "line-through" : "",
              }}
            />
          </label>
        </LocalizationProvider>
      </div>
      {/* ))} */}

      {/* time picker clock option div close------------------------------------  ------------------------------------ */}

      {/* offset option div ------------------------------------  ------------------------------------ */}
      {/* {prayerStatus !== "No Iqama" && ( */}

      {prayerStatus === "solar" && (
        <div
          className="offset-container"
          data-testid={`offset-container-${label}-${prayerName}`}
          style={{
            visibility:
              prayerStatus === "manual" || prayerStatus === "No Iqama"
                ? "hidden"
                : "visible",
            position: "relative",
            display: "flex",
            alignItems: "end",
            justifyContent: "center",
            margin: isMobile
              ? "0px"
              : label !== "Iqama"
              ? "0px"
              : "0px 0px 0px 15px",
            ...(!isMobile && label === "Iqama" && { width: "10vw" }),
            // paddingLeft:
            //   label === "Iqama" && prayerStatus === "solar" && isMobile
            //     ? "10px"
            //     : label === "Iqama" && prayerStatus === "solar" && !isMobile
            //     ? "20px"
            //     : "",
          }}
        >
          {label === "Iqama" && (
            <Typography
              textAlign="center"
              position="absolute"
              top={0}
              color="#9F9E9E"
              sx={{
                fontFamily: "Lato",
                fontSize: "13.5px",
                fontWeight: "600",
                "@media (min-width: 1700px)": {
                  fontSize: "20px",
                },
              }}
            >
              Iqama
            </Typography>
          )}
          <Box
            className="plus-minus-container"
            height="32px"
            borderRadius="37px"
            border={`1px solid #1B8368`}
            display="flex"
            alignItems="center"
          >
            <Typography
              style={customStyles}
              className="offset-value"
              data-testid={`offset-${label}-${prayerName}`}
            >
              {label === "Azan"
                ? enteredData[prayerName]?.ExtendedAzaanMinutes >= 0
                  ? "+"
                  : ""
                : enteredData[prayerName]?.ExtendedJamaatMinutes >= 0
                ? "+"
                : ""}
              {label === "Azan"
                ? enteredData[prayerName]?.ExtendedAzaanMinutes
                : enteredData[prayerName]?.ExtendedJamaatMinutes}{" "}
              min
            </Typography>
            <Box
              className="plus-minus-box"
              width="40%"
              height="32px"
              borderRadius="0 37px 37px 0"
              bgcolor={prayerStatus === "No Iqama" ? "#9F9E9E" : "#1B8368"}
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              <IconButton
                size="small"
                style={iconBtnStyle}
                onClick={() => handleCountPlusMins(true)}
                data-testid="increment-btn"
                disableRipple
              >
                <KeyboardArrowUpIcon sx={{ width: "15px", height: "15px" }} />
              </IconButton>
              <IconButton
                size="small"
                style={iconBtnStyle}
                onClick={() => handleCountPlusMins(false)}
                data-testid="decrement-btn"
                disableRipple
              >
                <KeyboardArrowDownIcon sx={{ width: "15px", height: "15px" }} />
              </IconButton>
            </Box>
          </Box>
        </div>
      )}

      {/* Empty container to make the rest of the laout sames */}
      {isMobile && (
        <div
          className="offset-container"
          data-testid={`offset-container-${label}-${prayerName}`}
          // style={
          //   prayerStatus === "No Iqama"
          //     ? { visibility: "hidden" }
          //     : label === "Iqama" && prayerStatus === "solar"
          //     ? { display: "none" }
          //     : {}
          // }
          style={{
            position: "relative",
            display: label === "Iqama" ? "flex" : "none",
            alignItems: "end",
            justifyContent: "center",
          }}
        ></div>
      )}
    </div>
  );
};

export default TimeSelector;
