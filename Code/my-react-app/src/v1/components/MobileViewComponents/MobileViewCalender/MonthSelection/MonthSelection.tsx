import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import moment from "moment-timezone";
import { PrayerTimings } from "../../../../redux/Types";

interface MonthYearDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (month: string, year: string) => void;
  tZone: string;
  selectedDate: Date | null;
  timings: PrayerTimings<number>[] | [];
}
const MonthYearDialog = ({
  open,
  setOpen,
  onSubmit,
  tZone,
  selectedDate,
  timings,
}: MonthYearDialogProps) => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [months, setMonths] = useState<{ value: string; label: string }>([]);

  const lastDateAvailable = useMemo(() => {
    if (!timings || timings.length === 0) return moment();
    const dates = timings.map((t) =>
      tZone ? moment.utc(t.date).tz(tZone) : moment.utc(t.date)
    );
    const lastDate = moment.max(dates);
    return lastDate;
  }, [timings]);

  useEffect(() => {
    const now = tZone ? moment().tz(tZone) : moment();
    const nowYear = now.year();
    const selectedDateYear = selectedDate ? selectedDate.getFullYear() : null;

    if (selectedDateYear && selectedDateYear === nowYear) {
      setSelectedMonth(
        selectedDate
          ? selectedDate.toLocaleString("default", { month: "2-digit" })
          : now.format("MM")
      );
    } else {
      setSelectedMonth(now.format("MM"));
    }
    setSelectedYear(nowYear.toString());
    let endMonthIndex = 12; // Exclusive end: 12 means up to December.
    if (lastDateAvailable && lastDateAvailable.year() === nowYear) {
      endMonthIndex = lastDateAvailable.month() + 1; // moment.month() is 0-indexed.
    }

    // current month index (0-based)
    const startMonthIndex = now.month(); // e.g. 2 if it's March
    const monthsArray = [];

    // push only up to December of THIS year
    for (let i = startMonthIndex; i < endMonthIndex; i++) {
      const monthMoment = now.clone().month(i);
      monthsArray.push({
        value: monthMoment.format("MM"),
        label: monthMoment.format("MMMM"),
      });
    }

    setMonths(monthsArray);
  }, [tZone, selectedDate, lastDateAvailable]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    // Here you can trigger the logic to fetch or download data
    // for the chosen month-year, for example:
    //
    // fetch(`/api/data?month=${selectedMonth}&year=${selectedYear}`)
    //   .then(...)
    //   .catch(...);
    //
    // Or trigger a file download, etc.
    console.log("Selected Month:", selectedMonth);
    console.log("Selected Year:", selectedYear);
    onSubmit(selectedMonth, selectedYear);
    // After your logic, close the dialog
    setOpen(false);
  };

  return (
    <div>
      {/* <Button variant="contained" onClick={handleOpen}>
        Open Month-Year Picker
      </Button> */}

      <Dialog
        sx={{ minWidth: "280px" }}
        PaperProps={{
          sx: { minWidth: "280px", borderRadius: "12px", padding: "8px" },
        }}
        open={open}
        onClose={handleClose}
      >
        <DialogTitle sx={{ color: "#054635" }}>Select Month</DialogTitle>
        <DialogContent>
          <FormControl sx={{ mt: 2, minWidth: 200, width: "100%" }}>
            <InputLabel id="month-label">Month</InputLabel>
            <Select
              labelId="month-label"
              id="month-select"
              value={selectedMonth}
              label="Month"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* <FormControl sx={{ mt: 2, minWidth: 120, ml: 2 }}>
            <InputLabel id="year-label">Year</InputLabel>
            <Select
              labelId="year-label"
              id="year-select"
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map((year) => (
                <MenuItem key={year.value} value={year.value}>
                  {year.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: "#1b8368" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              backgroundColor: "#1b8368",
              "&:hover": { bgcolor: "#1b8368" },
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MonthYearDialog;
