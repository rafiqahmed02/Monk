import React, { useState, useEffect } from "react";
import calender from "../../../../photos/Newuiphotos/OtherSalah/cal.svg";
import cross from "../../../../photos/Newuiphotos/OtherSalah/remove.svg";
import CustomCalender from "../../Shared/calendar/CustomCalender";
import styles from "./OtherSalahForm.module.css";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ClockInput from "../helperComponent/ClockInput";
import btnImg from "../../../../photos/clockIcon.png";
import dropdownIcon from "../dropdown.svg";
import {
  useCreateSpecialTimes,
  useUpdateSpecialTimes,
} from "../../../../graphql-api-calls/OtherSalah/mutation";
import {
  LocationBasedToday,
  UTCTimeConverter,
  UtcDateConverter,
  timeZoneHandler,
} from "../../../../helpers/HelperFunction";

import moment from "moment";
import { useAppSelector } from "../../../../redux/hooks";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Backdrop, CircularProgress } from "@mui/material";
import OtherSalahCard from "../OtherSalahCard/OtherSalahCard";
import {
  EidSalah,
  fetchEidDates,
  getFirstAvailablePrayerNumber,
  parseTimings,
  validateAzaanJamaatTimes,
} from "../helperFunctions/helperFunc";

export interface Timing {
  startDate: Date | null;
  endDate: Date | null;
  azanTime: string;
  iqamaTime: string;
  isStartDateInvalid?: boolean;
  isEndDateInvalid?: boolean;
  isIqamaTimeInvalid?: boolean;
  isDropdownOpen?: boolean;
  isSelectingDate?: boolean;
}

export interface OtherSalahFormProps {
  selectedSalah: string;
  consumerMasjidId: string;
  setShowSelectSalah: (value: boolean) => void;
  setRefetchTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  initialTimings?: {
    startDate: string;
    endDate: string;
    azanTime: string;
    iqamaTime: string;
  }[];
  selectedSalahId?: string;
  addedPrayers?: Set<string>;
  filteredSalah?: {
    [key: string]: any;
    timings: {
      startDate: string;
      endDate: string;
      azanTime: number;
      jamaatTime: number;
    }[];
  }[];
}

const OtherSalahForm: React.FC<OtherSalahFormProps> = ({
  selectedSalah,
  consumerMasjidId,
  setShowSelectSalah,
  setRefetchTrigger,
  initialTimings = [],
  selectedSalahId,
  addedPrayers,
  filteredSalah,
}) => {
  const [prayerNumber, setPrayerNumber] = useState(1);
  const [timings, setTimings] = useState<Timing[]>(
    initialTimings.length > 0
      ? parseTimings(initialTimings)
      : [
          {
            startDate: null,
            endDate: null,
            azanTime: "",
            iqamaTime: "",
            isStartDateInvalid: false,
            isEndDateInvalid: false,
            isIqamaTimeInvalid: false,
            isDropdownOpen: false,
            isSelectingDate: false,
          },
        ]
  );

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSelectingStart, setIsSelectingStart] = useState(true);
  const [activeTimingIndex, setActiveTimingIndex] = useState<number | null>(
    null
  );
  const { createTimes, isLoading, error } = useCreateSpecialTimes();
  const {
    updateTimes,
    loading: isUpdating,
    error: updateError,
  } = useUpdateSpecialTimes();

  const [tZone, setTZone] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [ErrorConflict, setErrorConflict] = useState<string | null>(null); // Error state for conflicts
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Convert Unix timestamp (existing jamaatTime) to minutes since midnight
  function convertUnixToMinutes(unixTime: number, timeZone: string) {
    const momentDate = moment.tz(unixTime * 1000, timeZone); // Convert Unix timestamp to moment object with timezone
    const hours = momentDate.hours(); // Get hours in 24-hour format
    const minutes = momentDate.minutes(); // Get minutes
    return hours * 60 + minutes;
  }

  // Convert 24-hour time string (new azaan/jamaat time) to minutes since midnight
  function convert24HourToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(":").map(Number); // Split "HH:mm" and convert to numbers
    return hours * 60 + minutes;
  }

  function isConflicting(
    newAzaanTime: string,
    newJamaatTime: string,
    existingSalah: any[]
  ): string {
    // Convert the new times to minutes for easy comparison
    const newAzaanMinutes = newAzaanTime
      ? convert24HourToMinutes(newAzaanTime)
      : null;
    const newJamaatMinutes = convert24HourToMinutes(newJamaatTime);

    // If adding a new Jumma, only compare with the last existing Jumma
    if (!selectedSalahId) {
      if (existingSalah.length > 0) {
        const lastSalah = existingSalah[existingSalah.length - 1];
        const lastJamaatMinutes = convertUnixToMinutes(
          lastSalah.jamaatTime,
          tZone
        );

        // Check for conflict with last Jumma's Jamaat time
        if (newAzaanMinutes !== null && newAzaanMinutes <= lastJamaatMinutes) {
          return `${selectedSalah} ${prayerNumber} Azaan time cannot be earlier or equal to ${
            lastSalah.name
          }'s Jamaat time (${timeZoneHandler(lastSalah.jamaatTime, tZone)}).`;
        }
        if (newAzaanMinutes === null && newJamaatMinutes <= lastJamaatMinutes) {
          return `${selectedSalah} ${prayerNumber} Jamaat time cannot be earlier or equal to ${
            lastSalah.name
          }'s Jamaat time (${timeZoneHandler(lastSalah.jamaatTime, tZone)}).`;
        }
      }
      return "";
    }

    // If editing an existing Jumma, compare by name using selectedSalah
    const salahIndex = existingSalah.findIndex(
      (salah) => salah.name === selectedSalah
    );

    const selectedSalahData = existingSalah[salahIndex];

    const prevSalah = salahIndex > 0 ? existingSalah[salahIndex - 1] : null;
    const nextSalah =
      salahIndex < existingSalah.length - 1
        ? existingSalah[salahIndex + 1]
        : null;

    const prevJamaatMinutes = prevSalah
      ? convertUnixToMinutes(prevSalah.jamaatTime, tZone)
      : null;
    const nextAzaanMinutes =
      nextSalah && nextSalah.azaanTime
        ? convertUnixToMinutes(nextSalah.azaanTime, tZone)
        : null;
    const nextJamaatMinutes = nextSalah
      ? convertUnixToMinutes(nextSalah.jamaatTime, tZone)
      : null;

    // Case 1: Validate new Azaan time (if it exists)
    if (newAzaanMinutes !== null) {
      // Backward validation: Azaan should not be earlier than the previous Jamaat time
      if (prevJamaatMinutes !== null && newAzaanMinutes <= prevJamaatMinutes) {
        return `${
          selectedSalah.split(" ")[0]
        } ${prayerNumber} Azaan time cannot be earlier or equal to ${
          prevSalah.name
        }'s Jamaat time (${timeZoneHandler(prevSalah.jamaatTime, tZone)}).`;
      }

      // Forward validation: Azaan should not be later than the next Azaan time (if next Azaan exists)
      if (nextAzaanMinutes !== null && newAzaanMinutes >= nextAzaanMinutes) {
        return `${
          selectedSalah.split(" ")[0]
        } ${prayerNumber} Azaan time cannot be later or equal to ${
          nextSalah.name
        }'s Azaan time (${timeZoneHandler(nextSalah.azaanTime, tZone)}).`;
      }

      // NEW: If next Azaan is null, validate against next Jamaat time
      if (
        nextAzaanMinutes === null &&
        nextJamaatMinutes !== null &&
        newAzaanMinutes >= nextJamaatMinutes
      ) {
        return `${
          selectedSalah.split(" ")[0]
        } ${prayerNumber} Azaan time cannot be later or equal to ${
          nextSalah.name
        }'s Jamaat time (${timeZoneHandler(nextSalah.jamaatTime, tZone)}).`;
      }
    }

    // Case 2: Validate new Jamaat time (always required)
    if (prevJamaatMinutes !== null && newJamaatMinutes <= prevJamaatMinutes) {
      return `${
        selectedSalah.split(" ")[0]
      } ${prayerNumber} Jamaat time cannot be earlier or equal to ${
        prevSalah.name
      }'s Jamaat time (${timeZoneHandler(prevSalah.jamaatTime, tZone)}).`;
    }

    // Forward validation: Jamaat should not be later than the next Azaan time (if next Azaan exists)
    if (nextAzaanMinutes !== null && newJamaatMinutes >= nextAzaanMinutes) {
      return `${
        selectedSalah.split(" ")[0]
      } ${prayerNumber} Jamaat time cannot be later or equal to ${
        nextSalah.name
      }'s Azaan time (${timeZoneHandler(nextSalah.azaanTime, tZone)}).`;
    }

    // NEW: If next Azaan is null, validate Jamaat against next Jamaat time
    if (
      nextAzaanMinutes === null &&
      nextJamaatMinutes !== null &&
      newJamaatMinutes >= nextJamaatMinutes
    ) {
      return `${
        selectedSalah.split(" ")[0]
      } ${prayerNumber} Jamaat time cannot be later or equal to ${
        nextSalah.name
      }'s Jamaat time (${timeZoneHandler(nextSalah.jamaatTime, tZone)}).`;
    }

    return ""; // No conflict
  }

  const [eidSelections, setEidSelections] = useState<boolean[]>(() => {
    if (initialTimings.length > 0) {
      return initialTimings.map(() => true); // Set all to true if initial timings are present
    }
    return [true, false, false, false]; // Default state
  });

  const AdminMasjid = useAppSelector((state) => state.AdminMasjid);
  useEffect(() => {
    if (consumerMasjidId && AdminMasjid) {
      setTZone(AdminMasjid.location.timezone);
    }
  }, []);

  // Set default start date for Jummah prayer
  useEffect(() => {
    if (
      selectedSalah.toLowerCase() === "jummah" &&
      !initialTimings.length &&
      tZone
    ) {
      const nowInTz = moment.tz(tZone).startOf("day").toDate(); // Current date in timezone
      setTimings((prevTimings) => [
        {
          ...prevTimings[0],
          startDate: nowInTz,
        },
        ...prevTimings.slice(1),
      ]);
    }
  }, [selectedSalah, tZone]);

  useEffect(() => {
    // Update the prayerNumber if `selectedSalah` or `addedPrayers` changes
    const baseName = selectedSalah.split(" ")[0];
    setPrayerNumber(
      getFirstAvailablePrayerNumber(baseName, addedPrayers || new Set())
    );
  }, [selectedSalah, addedPrayers]);

  useEffect(() => {
    if (initialTimings.length > 0) {
      setTimings(parseTimings(initialTimings));

      if (selectedSalah.toLowerCase().startsWith("eid")) {
        setEidSelections(initialTimings.map(() => true));
      } else {
        selectedSalah.split(" ")[1] === undefined
          ? setPrayerNumber(1)
          : setPrayerNumber(parseInt(selectedSalah.split(" ")[1]));
      }
    }
  }, [initialTimings]);

  const EidSalahValues = [EidSalah.EidUlFitr, EidSalah.EidUlDuha];

  useEffect(() => {
    if (EidSalahValues.includes(selectedSalah as EidSalah)) {
      fetchEidDates().then((eidDates: any) => {
        if (eidDates && !initialTimings.length) {
          const { eidFitrDate, eidAdhaDate } = eidDates;
          const selectedDate =
            selectedSalah === "Eid Ul-Fitr" ? eidFitrDate : eidAdhaDate;

          const startDate = dayjs(selectedDate).subtract(4, "day").toDate();
          const endDate = dayjs(selectedDate).add(2, "day").toDate();

          const newTimings = eidSelections
            .map((selected) => {
              if (selected) {
                return {
                  startDate: startDate,
                  endDate: endDate,
                  azanTime: "",
                  iqamaTime: "",
                  isStartDateInvalid: false,
                  isEndDateInvalid: false,
                  isIqamaTimeInvalid: false,
                } as Timing;
              }
              return null;
            })
            .filter((timing): timing is Timing => timing !== null);

          setTimings(newTimings);
        }
      });
    }
  }, [selectedSalah]);

  const handleEidCheckboxChange = (index: number) => {
    const updatedSelections = [...eidSelections];

    if (index === 0) return; // First checkbox cannot be unchecked

    if (updatedSelections[index]) {
      // Uncheck current and subsequent checkboxes
      for (let i = index; i < updatedSelections.length; i++) {
        updatedSelections[i] = false;
      }
    } else {
      // Check current checkbox
      updatedSelections[index] = true;
    }

    setEidSelections(updatedSelections);

    // Get the current date from first timing
    // const currentDate = timings[0]?.startDate;
    const startDate = timings[0]?.startDate;
    const endDate = timings[0]?.endDate;

    // Create new timings array with the same date for all selected prayers
    const newTimings = updatedSelections
      .map((selected, i) => {
        if (selected) {
          return (
            timings[i] ||
            ({
              startDate: startDate,
              endDate: endDate,
              azanTime: "",
              iqamaTime: "",
              isStartDateInvalid: false,
              isEndDateInvalid: false,
              isIqamaTimeInvalid: false,
            } as Timing)
          );
        }
        return null;
      })
      .filter((timing): timing is Timing => timing !== null);

    setTimings(newTimings);
  };

  const validateFields = () => {
    let isValid = true;
    const updatedTimings = [...timings];
    let errorMessages: string[] = [];

    updatedTimings.forEach((timing, index) => {
      if (!timing.startDate) {
        isValid = false;
        errorMessages.push(`Start date ${index + 1}`);
        timing.isStartDateInvalid = true;
      } else {
        timing.isStartDateInvalid = false;
      }

      // Validate End Date if it's not Jumma or any variation of it
      if (
        !selectedSalah.toLowerCase().startsWith("jumma") ||
        timing.isSelectingDate
      ) {
        if (!timing.endDate) {
          isValid = false;
          errorMessages.push(`End date ${index + 1}`);
          timing.isEndDateInvalid = true;
        } else {
          timing.isEndDateInvalid = false;
        }
      } else {
        if (!timing.endDate) {
          // If it's Jumma and no end date is provided, remove it from state
          timing.endDate = null;
          timing.isEndDateInvalid = false;
        }
      }

      if (!timing.iqamaTime) {
        isValid = false;
        errorMessages.push(`Iqama time ${index + 1}`);
        timing.isIqamaTimeInvalid = true;
      } else {
        timing.isIqamaTimeInvalid = false;
      }

      if (!validateAzaanJamaatTimes(timing.azanTime, timing.iqamaTime)) {
        isValid = false;
        errorMessages.push(`Azan time cannot be later than Iqama ${index + 1}`);
        timing.isIqamaTimeInvalid = true;
      }
    });

    setTimings(updatedTimings);

    if (!isValid) {
      const consolidatedMessage = `Please fill in the following fields: ${errorMessages.join(
        ", "
      )}`;
      toast.dismiss();
      toast.error(consolidatedMessage);
    }

    return isValid;
  };

  const handleAddTiming = () => {
    if (timings.length < 4) {
      setTimings((prevTimings) => {
        const lastEndDate = prevTimings[prevTimings.length - 1].endDate;
        const newStartDate = lastEndDate
          ? moment(lastEndDate).tz(tZone).add(1, "day").toDate()
          : moment.tz(tZone).startOf("day").toDate(); // Default to timezone-based date if none

        return [
          ...prevTimings,
          {
            startDate: newStartDate,
            endDate: null,
            azanTime: "",
            iqamaTime: "",
            isStartDateInvalid: false,
            isEndDateInvalid: false,
            isIqamaTimeInvalid: false,
            isDropdownOpen: false,
            isSelectingDate: false,
          },
        ];
      });
    }
  };

  const handleRemoveTiming = (index: number) => {
    setTimings(timings.filter((_, i) => i !== index));
  };

  const handleDateClick = (index: number, isStart: boolean) => {
    setActiveTimingIndex(index);
    setIsSelectingStart(isStart);
    setIsCalendarOpen(true);
  };

  const handleDateSelect = (selectedDate: Date) => {
    if (activeTimingIndex === null) return;
    const updatedTimings = [...timings];

    if (isSelectingStart) {
      updatedTimings[activeTimingIndex].startDate = selectedDate;
      updatedTimings[activeTimingIndex].isStartDateInvalid = false;
      if (
        updatedTimings[activeTimingIndex].endDate &&
        updatedTimings[activeTimingIndex].endDate < selectedDate
      ) {
        updatedTimings[activeTimingIndex].endDate = selectedDate;
        updatedTimings[activeTimingIndex].isEndDateInvalid = false;
      }
    } else {
      updatedTimings[activeTimingIndex].endDate = selectedDate;
      updatedTimings[activeTimingIndex].isEndDateInvalid = false;
      if (
        updatedTimings[activeTimingIndex].startDate &&
        updatedTimings[activeTimingIndex].startDate > selectedDate
      ) {
        updatedTimings[activeTimingIndex].startDate = selectedDate;
        updatedTimings[activeTimingIndex].isStartDateInvalid = false;
      }
    }

    setTimings(updatedTimings);
    setIsCalendarOpen(false);
  };

  const handleChange = (
    index: number,
    field: keyof Timing,
    value: string | Date
  ) => {
    const updatedTimings = [...timings];
    updatedTimings[index][field] = value as never;

    if (filteredSalah) {
      let conflictMessage = isConflicting(
        updatedTimings[index].azanTime,
        updatedTimings[index].iqamaTime,
        filteredSalah
      );
      setErrorConflict(conflictMessage);
    } else {
      setErrorConflict(null);
    }

    if (field === "startDate" && value) {
      updatedTimings[index].isStartDateInvalid = false;
    }
    if (field === "endDate" && value) {
      updatedTimings[index].isEndDateInvalid = false;
    }
    if (field === "iqamaTime" && value) {
      updatedTimings[index].isIqamaTimeInvalid = false;
    }
    setTimings(updatedTimings);
  };

  const handleSubmit = async () => {
    if (validateFields()) {
      setShowConfirmation(true);
    }
  };

  const confirmSubmit = async () => {
    const nameToSend =
      prayerNumber > 1
        ? selectedSalahId
          ? `${selectedSalah.split(" ")[0]} ${prayerNumber}`
          : `${selectedSalah} ${prayerNumber}`
        : selectedSalah;

    const input = {
      masjid: consumerMasjidId,
      name: nameToSend,
      timings: timings.map((timing) => ({
        startDate: timing.startDate
          ? UtcDateConverter(
              moment(timing.startDate).format("YYYY-MM-DD"),
              tZone
            )
          : null,
        endDate: timing.endDate
          ? UtcDateConverter(
              moment(timing.endDate).format("YYYY-MM-DD"),
              tZone,
              true
            )
          : null,
        azaanTime: timing.azanTime
          ? UTCTimeConverter(
              timing.azanTime,
              moment(timing.startDate).format("DD-MM-YYYY"),
              tZone
            )
          : null,
        jamaatTime: UTCTimeConverter(
          timing.iqamaTime,
          moment(timing.startDate).format("DD-MM-YYYY"),
          tZone
        ),
      })),
    };

    if (!validateAzaanJamaatTimes(timings[0].azanTime, timings[0].iqamaTime)) {
      return;
    }

    try {
      if (selectedSalahId) {
        // Update existing Salah
        const result = await updateTimes(selectedSalahId, input);
        toast.dismiss();
        toast.success(`${selectedSalah} Updated Successfully`);
      } else {
        // Create new Salah
        const result = await createTimes(input);
        toast.dismiss();
        toast.success(`${selectedSalah} Added Successfully`);
      }
      setShowSelectSalah(false);
      setRefetchTrigger((prev: boolean) => !prev);
    } catch (err) {
      toast.error("Error Creating/Updating other salah");
    }
  };

  const formattedTimings = timings.map((timing) => ({
    startDate: timing.startDate
      ? moment(timing.startDate).format("DD-MMM-YYYY")
      : null,
    endDate: timing.endDate
      ? moment(timing.endDate).format("DD-MMM-YYYY")
      : null,
    azanTime: timing.azanTime
      ? moment.tz(timing.azanTime, "HH:mm", tZone).format("hh:mm A")
      : "",
    iqamaTime: timing.iqamaTime
      ? moment.tz(timing.iqamaTime, "HH:mm", tZone).format("hh:mm A")
      : "",
  }));

  const handleDropdownClick = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    index: number
  ) => {
    e.stopPropagation();
    const updatedTimings = [...timings];
    updatedTimings.forEach((timing, i) => {
      timing.isDropdownOpen = i === index ? !timing.isDropdownOpen : false;
    });
    setTimings(updatedTimings);
  };

  const handleOptionSelect = (index: number, option: string) => {
    const updatedTimings = [...timings];

    updatedTimings[index].isDropdownOpen = false;

    if (option === "No End Date") {
      updatedTimings[index].endDate = null;
      updatedTimings[index].isSelectingDate = false;

      // Remove all timings below the current index
      updatedTimings.splice(index + 1);
    } else if (option === "Select a Date") {
      handleDateClick(index, false);
      updatedTimings[index].isSelectingDate = true;
    }

    setTimings(updatedTimings);
  };

  return (
    <div className={styles.formCard} data-testid="other-salah-form">
      <h2 className={styles.formTitle}>
        {selectedSalahId
          ? `${selectedSalah.split(" ")[0]} ${prayerNumber}`
          : selectedSalah}
      </h2>

      {EidSalahValues.includes(selectedSalah as EidSalah) ? (
        <div className={styles.checkboxGroup}>
          {[1, 2, 3, 4].map((num) => (
            <label
              key={num}
              className={styles.checkboxLabel}
              style={
                num > 1 && !eidSelections[num - 2]
                  ? { color: "grey" }
                  : undefined
              }
            >
              <input
                type="checkbox"
                checked={eidSelections[num - 1]}
                onChange={() => handleEidCheckboxChange(num - 1)}
                className={styles.checkboxInput}
                disabled={num > 1 && !eidSelections[num - 2]}
              />
              <span className={styles.customCheckbox}></span>
              {`${num}${["st", "nd", "rd", "th"][num - 1]}`}
            </label>
          ))}
        </div>
      ) : (
        <div className={styles.radioGroup}>
          {[1, 2, 3, 4].map((num, index) => {
            // Construct the prayer name, handling the suffix for each one
            const prayerName =
              num === 1
                ? selectedSalah.split(" ")[0]
                : `${selectedSalah.split(" ")[0]} ${num}`;

            // Check if the user is adding or editing
            const isEditing = !!selectedSalahId;

            // Logic for sequential addition based on addedPrayers
            const isSequentialOrder = (num: number) => {
              if (num === 1) {
                return !addedPrayers?.has("Jummah"); // Check if Jummah (without number) has been added
              } else {
                return (
                  addedPrayers?.has(`Jummah ${num - 1}`) &&
                  !addedPrayers?.has(`Jummah ${num}`)
                ); // Ensure previous one is added, and this one isn't
              }
            };

            // Disable logic: Check if this prayer has been added or if it's out of sequence
            const isDisabled = isEditing
              ? !!selectedSalahId // If editing, allow user to select the current Salah
              : !isSequentialOrder(num) || addedPrayers?.has(prayerName); // Disable if out of sequence or already added

            console.log("isDisabled", prayerName);

            return (
              <label
                key={num}
                className={styles.radioLabel}
                style={isDisabled ? { color: "#b1b1b1" } : undefined}
              >
                <input
                  type="radio"
                  name="jummah"
                  value={num}
                  checked={prayerNumber === num}
                  onChange={() => setPrayerNumber(num)}
                  className={styles.radioInput}
                  disabled={isDisabled} // Disable if this prayer is already added or if selectedSalahId is available
                />
                <span className={styles.customRadio}></span>
                {`${num}${["st", "nd", "rd", "th"][index]}`}
              </label>
            );
          })}
        </div>
      )}

      {!EidSalahValues.includes(selectedSalah as EidSalah) && (
        <h3 className={styles.subTitle}>
          {selectedSalah.split(" ")[0]} {prayerNumber}
          {["st", "nd", "rd", "th"][prayerNumber - 1]}
        </h3>
      )}

      {/* Dynamic timing inputs */}
      {timings.map((timing, index) => (
        <div key={index} className={styles.timingGroup}>
          {!EidSalahValues.includes(selectedSalah as EidSalah) && (
            <div className={styles.selectDates}>
              <div>Select Dates</div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTiming(index)}
                  className={styles.removeButton}
                >
                  <img src={cross} alt="cross" className={styles.crossIcon} />
                </button>
              )}
            </div>
          )}
          {EidSalahValues.includes(selectedSalah as EidSalah) && (
            <h3 className={styles.subTitle}>
              {selectedSalah} {index + 1}
              {["st", "nd", "rd", "th"][index]}
            </h3>
          )}

          {!EidSalahValues.includes(selectedSalah as EidSalah) && (
            <div className={styles.dateInputs}>
              <div
                className={`${styles.dateInput} ${
                  timing.isStartDateInvalid ? styles.errorBorder : ""
                }`}
                onClick={() => handleDateClick(index, true)}
              >
                <span className={styles.dateText}>
                  {timing.startDate
                    ? moment(timing.startDate).format("DD-MMM-YYYY")
                    : "DD-MMM-YYYY"}
                </span>
                <span>
                  <img src={calender} alt="calendar" className={styles.icon} />
                </span>
              </div>
              <span className={styles.toText}>To</span>
              <div
                className={`${styles.dateInput} ${
                  timing.isEndDateInvalid ? styles.errorBorder : ""
                }`}
              >
                <span
                  className={styles.dateText}
                  onClick={(e) => {
                    !selectedSalah.toLowerCase().startsWith("jummah") ||
                    timing.isSelectingDate
                      ? handleDateClick(index, false)
                      : handleDropdownClick(e, index);
                  }}
                >
                  {timing.endDate
                    ? moment(timing.endDate).format("DD-MMM-YYYY")
                    : selectedSalah.toLowerCase().startsWith("jummah")
                    ? timing.isSelectingDate
                      ? "DD-MMM-YYYY"
                      : "No End Date"
                    : "DD-MMM-YYYY"}
                </span>

                {selectedSalah.toLowerCase().startsWith("jummah") && (
                  <span onClick={(e) => handleDropdownClick(e, index)}>
                    <img
                      src={dropdownIcon}
                      alt="dropdown"
                      className={styles.dropdownIcon}
                    />
                  </span>
                )}
                {!selectedSalah.toLowerCase().startsWith("jummah") && (
                  <span onClick={() => handleDateClick(index, false)}>
                    <img
                      src={calender}
                      alt="calendar"
                      className={styles.icon}
                    />
                  </span>
                )}
                {timing.isDropdownOpen && (
                  <div className={styles.dropdown}>
                    <div
                      className={styles.dropdownOption}
                      onClick={() => handleOptionSelect(index, "No End Date")}
                    >
                      No End Date
                    </div>
                    <div
                      className={styles.dropdownOption}
                      onClick={() => handleOptionSelect(index, "Select a Date")}
                    >
                      Select a Date
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={styles.timeInputs}>
            <div
              className={`${styles.azanIqamaBox} ${
                selectedSalah.toLowerCase().startsWith("taraweeh") ||
                selectedSalah.toLowerCase().startsWith("qayam") ||
                selectedSalah.toLowerCase().startsWith("eid")
                  ? styles.fullWidth
                  : ""
              }`}
            >
              {!(
                selectedSalah.toLowerCase().startsWith("taraweeh") ||
                selectedSalah.toLowerCase().startsWith("qayam") ||
                selectedSalah.toLowerCase().startsWith("eid")
              ) && (
                <ClockInput
                  label={"Azaan Time (Optional)"}
                  id={"azan"}
                  tim={timing.azanTime}
                  setTime={(time: any) => {
                    handleChange(index, "azanTime", time);
                  }}
                  defaultToPM={true}
                  allowClear={true}
                />
              )}
              <ClockInput
                label={"Iqama Time"}
                id={"iqama"}
                tim={timing.iqamaTime}
                setTime={(time: any) => {
                  handleChange(index, "iqamaTime", time);
                }}
                minTime={
                  timing.azanTime ? dayjs(timing.azanTime, "HH:mm") : null
                }
                className={`${
                  timing.isIqamaTimeInvalid ? styles.errorBorder : ""
                } ${
                  selectedSalah.toLowerCase().startsWith("taraweeh") ||
                  selectedSalah.toLowerCase().startsWith("qayam") ||
                  selectedSalah.toLowerCase().startsWith("eid")
                    ? styles.fullWidth
                    : ""
                }`}
                defaultToPM={
                  selectedSalah.toLowerCase().startsWith("eid") ? false : true
                }
              />
            </div>
          </div>
          <p className={styles.ErrorConflict}> {ErrorConflict}</p>
        </div>
      ))}

      {!EidSalahValues.includes(selectedSalah as EidSalah) &&
        timings.length < 4 &&
        !(
          selectedSalah.toLowerCase().startsWith("jummah") &&
          // !timings[0].endDate
          // )
          timings.some((timing) => !timing.endDate)
        ) && (
          <button
            type="button"
            onClick={handleAddTiming}
            className={styles.addMoreButton}
          >
            <AddCircleIcon style={{ fontSize: "1rem" }} />
            <span>Add More Timings</span>
          </button>
        )}

      <button
        type="button"
        onClick={handleSubmit}
        className={styles.submitButton}
        disabled={isLoading || isUpdating || !!ErrorConflict}
      >
        <img src={btnImg} alt="cross" className={styles.crossIcon} />
        {isLoading || isUpdating
          ? "Submitting..."
          : selectedSalahId
          ? selectedSalah.toLowerCase().startsWith("eid")
            ? `Update Eid Salah`
            : `Update ${selectedSalah.split(" ")[0]} ${prayerNumber}`
          : `Add ${selectedSalah}`}
      </button>

      {error && <p className={styles.errorText}>Error: {error.message}</p>}
      {updateError && (
        <p className={styles.errorText}>Error: {updateError.message}</p>
      )}

      {showConfirmation && (
        <Backdrop open={showConfirmation}>
          <OtherSalahCard
            title={
              selectedSalahId
                ? `${selectedSalah.split(" ")[0]} ${prayerNumber}`
                : selectedSalah
            }
            timings={formattedTimings}
            onEdit={() => setShowConfirmation(false)}
            onDelete={() => setShowConfirmation(false)}
          >
            <div className={styles.confirmationMessage}>
              <p className={styles.confirmationText}>
                Are you sure you want to{" "}
                {selectedSalahId
                  ? selectedSalah.toLowerCase().startsWith("eid")
                    ? `Update Eid Salah`
                    : `Update ${selectedSalah.split(" ")[0]} ${prayerNumber}`
                  : `Add ${selectedSalah}`}{" "}
                timings?
              </p>
              <div className={styles.confirmationButtons}>
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={isLoading || isUpdating}
                  style={
                    isLoading || isUpdating
                      ? {
                          backgroundColor: "grey",
                        }
                      : undefined
                  }
                >
                  No
                </button>
                <button
                  onClick={confirmSubmit}
                  disabled={isLoading || isUpdating}
                >
                  {isLoading || isUpdating ? (
                    <CircularProgress color="inherit" size={15} />
                  ) : (
                    "Yes"
                  )}
                </button>
              </div>
            </div>
          </OtherSalahCard>
        </Backdrop>
      )}

      {loading && (
        <Backdrop open={true} style={{ zIndex: 999 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}

      {isCalendarOpen && (
        <>
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isCalendarOpen}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsCalendarOpen(false);
              }
            }}
          >
            <div className={styles.calendarPopup}>
              <CustomCalender
                onDateSelect={handleDateSelect}
                minDate={
                  isSelectingStart
                    ? activeTimingIndex! > 0 &&
                      timings[activeTimingIndex! - 1].endDate
                      ? dayjs(timings[activeTimingIndex! - 1].endDate)
                          .add(1, "day")
                          .toDate()
                      : LocationBasedToday(tZone)
                    : timings[activeTimingIndex!]?.startDate ||
                      LocationBasedToday(tZone)
                }
                value={
                  isSelectingStart
                    ? timings[activeTimingIndex!]?.startDate || undefined
                    : timings[activeTimingIndex!]?.endDate || undefined
                }
                setValue={
                  isSelectingStart
                    ? (date) => handleDateSelect(date)
                    : (date) => handleDateSelect(date)
                }
                tileDisabled={() => false}
              />
            </div>
          </Backdrop>
        </>
      )}
    </div>
  );
};

export default OtherSalahForm;
