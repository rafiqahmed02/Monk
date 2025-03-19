import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import checkedImg from "../../../../../photos/Newuiphotos/Services/checked.png";
import unCheckedImg from "../../../../../photos/Newuiphotos/Services/nonChecked.png";

interface DaySelectionProps {
  setDays: Dispatch<SetStateAction<string[]>>;
  currentDays: string[];
  setRecurrenceType: (recurrencetype: string) => void;
}

const DaySelection: React.FC<DaySelectionProps> = ({
  setDays,
  currentDays,
  setRecurrenceType,
}) => {
  const [selectedDays, setSelectedDays] = useState<string[]>(currentDays);

  // Sync selected days with currentDays prop when it changes
  useEffect(() => {
    setSelectedDays(currentDays);
  }, [currentDays]);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDayToggle = (day: string) => {
    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let updatedDays: string[];

    // Check if day is already selected
    if (selectedDays.includes(day)) {
      // Remove the day if it's already selected
      updatedDays = selectedDays.filter((d) => d !== day);
    } else {
      // Add the day if it's not selected
      updatedDays = [...selectedDays, day];
    }

    // Sort the updated days array based on the predefined day order
    updatedDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

    // Update recurrence type based on the number of selected days
    if (updatedDays.length === 7) {
      setRecurrenceType("daily");
    } else {
      setRecurrenceType("weekly");
    }

    setSelectedDays(updatedDays);
    setDays(updatedDays);
  };

  return (
    <Box>
      <FormGroup
        sx={{
          flexDirection: "row",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0px", // default gap for small screens
          // Media query for larger screens
          "@media (min-width: 600px)": {
            gap: "10px", // gap for screens 600px and larger
          },
          "@media (min-width: 960px)": {
            gap: "15px", // gap for screens 960px and larger
          },
        }}
      >
        {days.map((day, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox
                icon={
                  <img
                    src={unCheckedImg}
                    alt="Unchecked"
                    style={{ width: "15px", height: "15px" }}
                  />
                }
                checkedIcon={
                  <img
                    src={checkedImg}
                    alt="Checked"
                    style={{ width: "15px", height: "15px" }}
                  />
                }
                sx={{
                  borderRadius: "50%",
                  padding: "10px",
                  "& .MuiIconButton-root": {
                    borderRadius: "50%",
                  },
                }}
                checked={selectedDays.includes(day)}
                onChange={() => handleDayToggle(day)}
              />
            }
            label={
              <Typography
                sx={{
                  fontSize: "13px",
                }}
                component="span"
              >
                {day}
              </Typography>
            }
          />
        ))}
      </FormGroup>
    </Box>
  );
};

export default DaySelection;
