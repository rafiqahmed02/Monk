import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react";
import "react-calendar/dist/Calendar.css";
import "./MobileViewComponent.css";
import moment from "moment-timezone";
import { useAppSelector, useAppThunkDispatch } from "../../../redux/hooks";
import tz_lookup from "tz-lookup";
import { fetchMasjidById } from "../../../redux/actions/MasjidActions/fetchMasjidById";
import {
  LocationBasedToday,
  LocationBasedToday2,
  UtcDateConverter,
} from "../../../helpers/HelperFunction";
import { FetchingTimingsByDateRange } from "../../../redux/actions/TimingsActions/FetchingTimingsByDateRangeAction";
import { PrayerTimings } from "../../../redux/Types";
import NamazTimings from "../NamazTIming/NamazTImings";
import PrayerBox from "../Shared/PrayerBox/PrayerBox";
import clockIcon from "../../../photos/clockIcon.png";
import SpecialCalendar from "../Shared/calendar/SpecialCalendar";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import "swiper/css";
import ProgressLoader from "../Shared/Loader/Loader";
import CustomBtn from "../Shared/CustomBtn";
import {
  Box,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import prayercalender from "../../../photos/Newuiphotos/Icons/prayercalender.svg";
import KeyboardArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardArrowLeftOutlined";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import BackButton from "../Shared/BackButton";
import { SalahType } from "./SalahTimings/SalahTimings";
import { GET_TIMINGS_BY_MASJID_ID_WITH_ENDDATE } from "../../../graphql-api-calls/Salah/queries";
import SunCalc from "suncalc";
import { ApolloError, useQuery } from "@apollo/client";
import FullMonthCalendar from "./FullMonthCalendar/FullMonthCalendar";
import { useReactToPrint } from "react-to-print";
import toast from "react-hot-toast";
import DownloadIcon from "@mui/icons-material/Download";
import { useGetSpecialTimesByMasjidId } from "../../../graphql-api-calls/OtherSalah/query";
import { getTimingsById } from "../../../api-calls";
import MonthYearDialog from "./MonthSelection/MonthSelection";

type MobileViewCalenderProps = {
  consumerMasjidId: string;
  setSelectedType: Dispatch<SetStateAction<SalahType>>;
};

async function fetchHijriCalendar(year: string, month: string) {
  const response = await fetch(
    `https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`
  );
  const data = await response.json();
  return data.data.map((day: any) => ({
    gregorianDate: day.gregorian.date,
    hijriDate: `${day.hijri.month.en} ${day.hijri.day}, ${day.hijri.year}`,
  }));
}

const MobileViewCalender = ({
  consumerMasjidId,
  setSelectedType,
}: MobileViewCalenderProps) => {
  const selectedDatesArray = useAppSelector((state) => state.selectedDate);

  const [tZone, setTZone] = useState("");
  let AdminMasjidState = useAppSelector((state) => state.AdminMasjid);
  const dispatch = useAppThunkDispatch();
  const [reloadTiming, setReload] = useState<boolean>(false);
  const [allPrayers, setAllPrayer] = useState<PrayerTimings<number>[]>([]);
  const [showNamzTiming, setShowNamzTiming] = useState<boolean>(false);
  const [hijriDatesMap, setHijriDatesMap] = useState<any>({});
  const [selectedPrayers, setSelectedPrayers] =
    useState<PrayerTimings<number>>();
  const [isLoading, setIsLoading] = useState(false);
  const swiperRef = useRef<SwiperClass>();
  let admin = useAppSelector((state) => state.admin);
  //Selected Date for Range or Single use this function
  const [selectedDates, setSelectedDates] = useState<
    [Date | null, Date | null]
  >([null, null]);
  const [loadedPrayers, setLoadedPrayers] = useState<PrayerTimings<number>[]>(
    []
  );
  const [currentMonthsPrayers, setCurrentMonthsPrayers] = useState<
    PrayerTimings<number>[]
  >([]);
  const [shouldPrint, setShouldPrint] = useState(false);

  const [masjid, setMasjid] = useState<any>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const [targetIndexToSlide, setTargetIndexToSlide] = useState<number | null>(
    null
  );
  const [loadingHijriDate, setLoadingHijriDate] = useState(false);
  const [isOtherPrayerLoading, setIsOtherPrayerLoading] = useState(true);

  const startMonth = tZone
    ? moment().tz(tZone).startOf("month").utc().startOf("day").toISOString()
    : null; // Use UTC or a default timezone
  const endOfYear = moment().endOf("year").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
  const [skipTimings, setSkipTimings] = useState(true);
  const [isMonthYearDialogVisible, setIsMonthYearDialogVisible] =
    useState(false);
  const {
    loading: loadingTimings,
    error: errorTimings,
    data: timingsData,
    refetch: timingsRefetch,
  } = useQuery(GET_TIMINGS_BY_MASJID_ID_WITH_ENDDATE, {
    variables: { masjidId: consumerMasjidId, startDate: startMonth },
    skip: !consumerMasjidId || skipTimings || !startMonth,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const [skipOtherPrayer, setSkipOtherPrayer] = useState(true);
  const { otherSalahStartDate, otherSalahEndDate } = useMemo(() => {
    if (tZone) {
      const startDate = moment
        .tz(selectedDatesArray[0], tZone)
        // .tz(tZone)
        // .startOf("month")
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      const endDate = moment(selectedDatesArray[0])
        .endOf("month")
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      return {
        otherSalahStartDate: startDate,
        otherSalahEndDate: endDate,
      };
    }
    return {
      otherSalahStartDate: "",
      otherSalahEndDate: "",
    };
  }, [tZone, selectedDatesArray[0]]);

  const {
    loading,
    error,
    specialTimes = [],
    refetch,
  } = useGetSpecialTimesByMasjidId(
    consumerMasjidId,
    otherSalahStartDate && otherSalahEndDate ? otherSalahStartDate : null,
    otherSalahStartDate && otherSalahEndDate ? otherSalahEndDate : null,
    skipOtherPrayer
  );

  const INITIAL_LOAD_COUNT = 10;
  const LOAD_MORE_COUNT = 20;
  //to fetch from current date to end of the year prayer data
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.up("sm"));
  const isLarge = useMediaQuery("(min-width: 2000px)");

  useEffect(() => {
    if (Object.keys(AdminMasjidState).length === 0 && consumerMasjidId) {
      const res = dispatch(fetchMasjidById(consumerMasjidId));
      res.then((result) => {
        setMasjid(result);
        const lon = result.location.coordinates[0];
        const lat = result.location.coordinates[1];
        if (lat && lon) {
          let location = tz_lookup(lat, lon);
          setTZone(location);
        }
      });
    } else if (Object.keys(AdminMasjidState).length !== 0) {
      setMasjid(AdminMasjidState);

      const lon = AdminMasjidState.location.coordinates[0];
      const lat = AdminMasjidState.location.coordinates[1];
      if (lat && lon) {
        let location = tz_lookup(lat, lon);
        setTZone(location);
      }
    }
  }, [admin]);

  useEffect(() => {
    if (masjid) {
      setSkipTimings(false);
    }
  }, [masjid]);
  useEffect(() => {
    if (!loadingTimings && timingsData && tZone && !errorTimings) {
      setIsLoading(true);
      const today = moment().tz(tZone).startOf("day"); // Ensure today starts at 00:00 in the correct timezone
      // console.log(today.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"));
      setSkipTimings(false);
      // console.log("today", today);
      // const filteredData = timingsData?.getTimingsByMasjidId.filter(
      //   (item: any) => {
      //     const itemDateInTimeZone = moment.tz(item.date, tZone);
      //     return itemDateInTimeZone.isSameOrAfter(today, "day");
      //   }
      // );
      // console.log("filteredData", filteredData);
      const filteredData = timingsData?.getTimingsByMasjidId?.filter(
        (item: any) => {
          // console.log(moment(item.date).format());
          return moment(item.date).utc().isSameOrAfter(today.utc(), "day");
        }
      );
      if (filteredData?.length > 0) {
        const lastDataDate = moment(filteredData[filteredData.length - 1].date)
          .utc()
          .startOf("day"); // Ensure lastDataDate starts at 00:00

        // console.log(lastDataDate.format());
        // console.log(today.utc().format());
        const daysToFill = lastDataDate.diff(
          today.utc().startOf("day"),
          "days"
        );
        const completeData = [];
        let currentDate = moment().tz(tZone).startOf("day").utc();
        // console.log(currentDate.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"));
        // console.log(filteredData[0].date);
        // console.log(moment(filteredData[0].date).utc().tz(tZone));
        for (let i = 0; i <= daysToFill; i++) {
          // console.log(currentDate.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"));
          const existingData = filteredData.find((item: any) => {
            return moment(item.date).utc().isSame(currentDate, "day");
          });

          if (existingData) {
            // console.log("found", currentDate.format("YYYY-MM-DD"));
            completeData.push(existingData);
          } else {
            // console.log("not found", currentDate.format("YYYY-MM-DD"));
            completeData.push({
              date: currentDate.format("YYYY-MM-DDTHH:mm:ss[Z]"), // Format the date
              timings: [],
            });
          }

          currentDate = currentDate.add(1, "day"); // Move to the next day
        }
        setAllPrayer(completeData);
        fetchHijriDates(filteredData);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setAllPrayer([]);
      }
      /******  ac9a733f-085f-4ddf-8f9e-c0a915a2d059  *******/
    } else if (errorTimings) {
      toast.error("Error Fetching Timings, Please Try Again");
      setIsLoading(false);
      setAllPrayer([]);
    }
  }, [loadingTimings, timingsData, tZone, errorTimings]); // Only depend on data and tZone for this effect

  useEffect(() => {
    if (consumerMasjidId && tZone && !showNamzTiming) {
      // setIsLoading(true);
      timingsRefetch();
    }
  }, [reloadTiming, showNamzTiming, tZone]); // Add all conditions that should trigger a refetch

  useEffect(() => {
    if (!showNamzTiming && tZone) {
      const todayInTZone = LocationBasedToday2(tZone);
      // const parsedTodayInTZone = moment(todayInTZone);
      // console.log(parsedTodayInTZone.toDate());
      handleSingleDateClick(todayInTZone);
    }
  }, [showNamzTiming, allPrayers]);

  // useEffect(() => {
  //   if (showNamzTiming && tZone) {
  //     timeZoneToday moment.tz(tZone);

  //     handleSingleDateClick()
  //   }
  // }, [showNamzTiming,tZone]);
  useEffect(() => {
    setLoadedPrayers(allPrayers.slice(0, INITIAL_LOAD_COUNT));
  }, [allPrayers]);

  const loadMorePrayers = useCallback(() => {
    setLoadedPrayers((prevLoadedPrayers) => {
      const currentCount = prevLoadedPrayers.length;
      const morePrayers = allPrayers.slice(
        currentCount,
        currentCount + LOAD_MORE_COUNT
      );
      return [...prevLoadedPrayers, ...morePrayers];
    });
  }, [allPrayers]);
  const handleSlideChange = (swiper: SwiperClass) => {
    const activeIndex = swiper.activeIndex;

    if (allPrayers[activeIndex]) {
      const isoDateString = allPrayers[activeIndex].date; // This is in UTC

      // Convert to the user's timezone
      // Get the correct timezone dynamically
      // const selectedDateInTimeZone = moment(isoDateString).utc().tz(tZone);
      // console.log(selectedDateInTimeZone.format("YYYY--MM-DDTHH:mm:ss"));
      // console.log(
      //   moment.utc(selectedDateInTimeZone).format("YYYY--MM-DDTHH:mm:ss")
      // );
      const selectedDateInTimeZone = moment(isoDateString).utc().tz(tZone);

      // console.log(selectedDateInTimeZone.format("YYYY--MM-DDTHH:mm:ss"));
      // Format it to retain the date-time exactly as it is
      // const formattedDate1 = selectedDateInTimeZone.format(
      //   "YYYY-MM-DD HH:mm:ss"
      // );
      // console.log(formattedDate1);
      // Create a new moment object treating this date-time as UTC
      // const finalUtcMoment = moment.utc(formattedDate1, "YYYY-MM-DD HH:mm:ss");

      // console.log(finalUtcMoment.toDate());
      // const startOfDayUTC = selectedDateUTC.startOf("day");
      // const dateForCalendar = startOfDayUTC.toDate();

      // Store the correct Date object
      // console.log(
      //   "selectedDate moment",
      //   selectedDate.format("YYYY-MM-DDTHH:mm:ssZ")
      // );
      // console.log("selectedDate date", selectedDate.toDate());

      const year = selectedDateInTimeZone.year();
      const month = selectedDateInTimeZone.month(); // Note: January is 0, December is 11
      const day = selectedDateInTimeZone.date();
      const dateForCalendar = new Date(year, month, day, 0, 0, 0, 0);

      setSelectedDates([dateForCalendar, null]);

      // console.log(selectedDateUTC.tz(tZone));
      // console.log(tZone);
      // Format correctly for dispatching
      const formattedDate = selectedDateInTimeZone.format("YYYY-MM-DD");

      dispatch({
        type: "singleDate",
        payload: [formattedDate],
      });

      setSelectedPrayers(allPrayers[activeIndex]);

      // Load more prayers if nearing the end
      if (swiper.activeIndex >= loadedPrayers.length - 5) {
        loadMorePrayers();
      }
    } else {
      setSelectedPrayers(undefined);
    }
  };

  const handleSingleDateClick = (date: Date) => {
    console.log("handlesingledateclick", date);

    setSelectedDates([date, null]);
    dispatch({
      type: "singleDate",
      payload: [moment(date).format("YYYY-MM-DD")],
    });

    const selectedDateStr = moment(date).format("YYYY-MM-DD");

    // Check if the date has prayer timings in `allPrayers`
    const timings = allPrayers.find(
      (item) =>
        item.date.split("T")[0] ===
        UtcDateConverter(selectedDateStr, tZone).split("T")[0]
      //    &&
      // item?.timings?.length > 0
    );
    if (timings) {
      // Set the selected prayer timings if available
      setSelectedPrayers(timings);
      setIsLoading(false);

      // Get the index of the clicked date in `allPrayers`
      const targetIndex = allPrayers.findIndex(
        (item) =>
          item.date.split("T")[0] ===
          UtcDateConverter(selectedDateStr, tZone).split("T")[0]
      );

      // Load additional prayers if targetIndex is beyond loadedPrayers
      if (targetIndex >= loadedPrayers.length) {
        setLoadedPrayers((prevLoadedPrayers) => [
          ...prevLoadedPrayers,
          ...allPrayers.slice(prevLoadedPrayers.length, targetIndex + 1),
        ]);
        // Set targetIndexToSlide to trigger slideTo in useEffect
        setTargetIndexToSlide(targetIndex);
      } else {
        // If loadedPrayers already has enough, slide immediately
        if (swiperRef.current && !showNamzTiming) {
          setTargetIndexToSlide(targetIndex);
        }
      }
    } else {
      // If no prayer timings are available for the selected date
      setSelectedPrayers(undefined);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (
      targetIndexToSlide !== null &&
      targetIndexToSlide < loadedPrayers.length
    ) {
      // Slide to target index now that loadedPrayers has enough items
      swiperRef.current?.slideTo(targetIndexToSlide);
      setTargetIndexToSlide(null); // Reset target index
    }
  }, [targetIndexToSlide, loadedPrayers]);

  const handleRangeDateChange = useCallback(
    (date) => {
      const date1 = moment(date[0], "YYYY-MM-DD");
      const date2 = moment(date[1], "YYYY-MM-DD");

      if (date1.isSame(date2, "day")) return;

      const processedData = [
        moment(date[0]).format("YYYY-MM-DD"),
        moment(date[1]).format("YYYY-MM-DD"),
      ];
      dispatch({ type: "rangeDate", payload: processedData });
      setSelectedDates([date[0], date[1]]);

      const selectedStartDate = moment(date[0]);
      const firstDay = selectedStartDate; // Get the first day

      // Check for a match on the first day
      const timings = allPrayers.filter(
        (item) =>
          item.date.split("T")[0] ===
          UtcDateConverter(firstDay.format("YYYY-MM-DD"), tZone).split("T")[0]
      );

      if (timings.length > 0) {
        setSelectedPrayers(timings[0]);
      } else {
        setSelectedPrayers(undefined);
      }
    },
    [allPrayers, selectedDates, tZone, dispatch]
  );

  useEffect(() => {
    if (!skipOtherPrayer) {
      if (error) {
        toast.error("Couldn't Fetch Other Salah");
      } else if (currentMonthsPrayers.length > 0 && !loading) {
        setShouldPrint(true);
      }
    }
  }, [loading, error, specialTimes]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Masjid Calender - ${
      selectedDates[0] ? moment(selectedDates[0]).format("MMMM YYYY") : ""
    }`,
    onBeforePrint() {
      toast.loading("Generating PDF...");
    },
    onAfterPrint: () => {
      toast.dismiss();
    },
    onPrintError: () => {
      toast.dismiss();
      toast.error("Error Occurred While Printing Document!");
    },
  });
  useEffect(() => {
    // Check if selected date is available in Hijri map

    if (
      !isLoading &&
      !loadingHijriDate &&
      selectedDates[0] && // A date is selected
      !hijriDatesMap[moment(selectedDates[0]).format("DD-MM-YYYY")] // Hijri date not loaded
    ) {
      fetchHijriDateForSpecificDate(selectedDates[0]); // Fetch dynamically
    }
  }, [selectedDates, targetIndexToSlide, isLoading, loadingHijriDate]);

  const handleRoute = () => {
    // if (!isDateSelected)
    //   handleSnackbar(true, "error", "Please, select a date", dispatch);
    // else {
    setShowNamzTiming(true);
    // }
  };
  const fetchHijriDates = useCallback(async (prayers) => {
    setLoadingHijriDate(true);
    // Extract the month and year from the first prayer's date
    const firstPrayerDate = moment(prayers[0].date);
    const year = firstPrayerDate.format("YYYY");
    const month = firstPrayerDate.format("MM");

    // Fetch the Hijri calendar for the extracted month and year
    const calendar = await fetchHijriCalendar(year, month);

    // Create a mapping between Gregorian and Hijri dates
    const hijriMap = {};
    calendar.forEach((day) => {
      hijriMap[day.gregorianDate] = day.hijriDate;
    });

    setHijriDatesMap(hijriMap);
    setIsLoading(false);
    setLoadingHijriDate(false);
  }, []);
  // const fetchHijriDates = useCallback(
  //   async (prayers: PrayerTimings<number>[]) => {
  //     const uniqueMonths = new Set(
  //       prayers.map((prayer) => moment(prayer.date).format("YYYY-MM"))
  //     );
  //     const hijriCalendarPromises = Array.from(uniqueMonths).map(
  //       (monthYear) => {
  //         const [year, month] = monthYear.split("-");
  //         return fetchHijriCalendar(year, month);
  //       }
  //     );

  //     const calendars = await Promise.all(hijriCalendarPromises);
  //     const hijriMap = {};
  //     calendars.flat().forEach((day) => {
  //       hijriMap[day.gregorianDate] = day.hijriDate;
  //     });
  //     console.log("hijriMap", hijriMap);
  //     setHijriDatesMap(hijriMap);
  //     setIsLoading(false);
  //   },
  //   []
  // );

  const tileContent = ({
    activeStartDate,
    date,
    view,
  }: {
    activeStartDate: Date;
    date: Date;
    view: string;
  }) => {
    const currentDate = LocationBasedToday(tZone);
    const selectedDate = new Date(date);

    currentDate.setDate(currentDate.getDate() - 1);
    if (date) {
      const dateHasData = allPrayers.some(
        (item) =>
          item.date.split("T")[0] ===
            UtcDateConverter(moment(date).format("YYYY-MM-DD"), tZone).split(
              "T"
            )[0] && item.timings.length > 0
      );
      if (dateHasData && selectedDate >= currentDate) {
        return <div className="green-dot" />;
      }

      return null;
    }

    return null;
  };

  function isToday(date: Date) {
    const today = LocationBasedToday(tZone);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
  const tileClassName = ({ date }: { date: Date }) => {
    if (isToday(date)) {
      return "today-date";
    }
    return "";
  };

  const tileDisabled = ({
    activeStartDate,
    date,
    view,
  }: {
    activeStartDate: Date;
    date: Date;
    view: string;
  }) => {
    const currentDate = LocationBasedToday(tZone);
    currentDate.setHours(0, 0, 0, 0);

    const providedDate = new Date(date);
    providedDate.setHours(0, 0, 0, 0);

    if (view === "month") {
      return providedDate < currentDate;
    } else if (view === "year") {
      return (
        providedDate.getFullYear() < currentDate.getFullYear() ||
        (providedDate.getFullYear() === currentDate.getFullYear() &&
          providedDate.getMonth() < currentDate.getMonth())
      );
    } else if (view === "decade") {
      return providedDate.getFullYear() < currentDate.getFullYear();
    } else if (view === "century") {
      return (
        Math.floor(providedDate.getFullYear() / 100) <
        Math.floor(currentDate.getFullYear() / 100)
      );
    }

    return false;
  };

  const reloader = () => {
    setReload(!reloadTiming);
  };

  const fetchHijriDateForSpecificDate = async (date: Date) => {
    const year = moment(date).format("YYYY");
    const month = moment(date).format("MM");

    try {
      setLoadingHijriDate(true); // Show loading indicator
      const fetchedHijriData = await fetchHijriCalendar(year, month);
      const newHijriMap = { ...hijriDatesMap };

      fetchedHijriData.forEach((day: any) => {
        newHijriMap[day.gregorianDate] = day.hijriDate;
      });

      setHijriDatesMap(newHijriMap); // Update the Hijri map
    } catch (error) {
      console.error("Error Fetching Hijri Date:", error);
    } finally {
      setLoadingHijriDate(false); // Hide loading indicator
    }
  };

  const slidePrev = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  }, []);

  const slideNext = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  }, []);

  const handleCalendarPrint = (month: string, year: string) => {
    console.log("month", month, "year", year);

    // 1) Make sure we have data
    if (
      !timingsData?.getTimingsByMasjidId ||
      timingsData.getTimingsByMasjidId.length === 0
    ) {
      toast.dismiss();
      setCurrentMonthsPrayers([]);
      toast.error("No Data Available");
      return;
    }

    toast.dismiss();
    const loadingId = toast.loading("Please Wait...!");

    // 2) Construct a moment date from month/year, in your time zone
    //    e.g. "2025-03-01" if month="03" and year="2025"
    const selectedDate = tZone
      ? moment.tz(`${year}-${month}-01`, tZone)
      : moment(`${year}-${month}-01`);
    const now = tZone ? moment.tz(tZone) : moment();
    const finalMoment = selectedDate.isBefore(now, "day") ? now : selectedDate;

    const dateForCalendar = new Date(
      Number(year),
      Number(month) - 1,
      finalMoment.date(),
      0,
      0,
      0
    );
    handleSingleDateClick(dateForCalendar);
    // 3) Get the start and end of that month for filtering
    const firstOfMonth = selectedDate.clone().startOf("month");
    const lastOfMonth = selectedDate.clone().endOf("month").startOf("day");

    // 4) Filter your data to keep items within this month
    const CurrentMonthData = timingsData.getTimingsByMasjidId.filter(
      (item: any) => {
        const itemDate = moment(item.date).utc();
        return itemDate.isBetween(
          firstOfMonth.utc().startOf("day"),
          lastOfMonth.utc().endOf("day"),
          null,
          "[]"
        );
      }
    );

    // 5) If we found data, transform it; otherwise show an error
    if (CurrentMonthData && CurrentMonthData.length > 0) {
      if (!masjid) {
        toast.dismiss();
        toast.error("Masjid Details Not Found");
        return;
      }

      // 6) Transform data (same logic you already had)
      const transformedData = CurrentMonthData.map((day: any) => {
        const momentDate = moment.utc(day.date).tz(tZone);
        const yr = momentDate.year();
        const mn = momentDate.month(); // Note: January=0, December=11
        const dt = momentDate.date();

        // Sunrise calculation
        const dateForSunrise = new Date(yr, mn, dt, 0, 0, 0, 0);
        const { sunrise } = SunCalc.getTimes(
          dateForSunrise,
          masjid.location.coordinates[1],
          masjid.location.coordinates[0]
        );
        const sunriseTime = sunrise.getTime() / 1000;

        // Prayer times
        const timings = day.timings.reduce((acc: any, prayer: any) => {
          const azanTime =
            prayer.azaanTime === 0
              ? "-:-"
              : moment.unix(prayer.azaanTime).tz(tZone).format("hh:mm A");
          const iqamaTime =
            prayer.jamaatTime === 0
              ? "-:-"
              : moment.unix(prayer.jamaatTime).tz(tZone).format("hh:mm A");

          acc[prayer.namazName.toLowerCase() + "Azan"] = azanTime;
          acc[prayer.namazName.toLowerCase() + "Iqama"] = iqamaTime;
          return acc;
        }, {});

        // Return final shape
        return {
          date: moment(day.date).utc().tz(tZone).format("DD"),
          day: moment(day.date).utc().tz(tZone).format("ddd"),
          sunrise: moment.unix(sunriseTime).tz(tZone).format("hh:mm A"),
          ...timings,
        };
      });

      setCurrentMonthsPrayers(transformedData);
      setSkipOtherPrayer(false);

      // If you still want auto-printing:
      // setShouldPrint(true);
    } else {
      toast.dismiss();
      setCurrentMonthsPrayers([]);
      toast.error("No Data Available for the Selected Month");
    }

    // toast.dismiss(loadingId);
  };
  useEffect(() => {
    if (shouldPrint && currentMonthsPrayers.length > 0) {
      handlePrint(); // Trigger print when data is available
      setShouldPrint(false); // Reset the print trigger
      setSkipOtherPrayer(true);
      toast.dismiss();
    }
  }, [shouldPrint, currentMonthsPrayers]); // Depend on both states if needed

  return (
    <>
      {showNamzTiming ? (
        <NamazTimings
          masjidId={consumerMasjidId}
          setShowNamzTiming={setShowNamzTiming}
          setSelectedType={setSelectedType}
          prayerType={
            masjid?.metadata?.juristic ??
            selectedPrayers?.prayerType ??
            undefined
          }
          prayerMethod={
            masjid?.metadata?.method ??
            selectedPrayers?.prayerMethod ??
            undefined
          }
          handleSingleDateClick={handleSingleDateClick}
          handleRangeDateChange={handleRangeDateChange}
          tims={
            selectedPrayers?.timings && selectedPrayers?.timings.length > 0
              ? selectedPrayers?.timings
              : undefined
          }
        />
      ) : (
        <div className="mainprayerconatiner" data-testid="root">
          {/* <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          > */}
          <div className={"title-container"}>
            <div className="goback">
              <BackButton
                handleBackBtn={() => {
                  setSelectedType(null);
                }}
              />
            </div>
            <h3 className="page-title">Salah Timings</h3>
          </div>
          {/* </div> */}
          <div className="MobileView-main-container">
            {/* <div className="goback" style={{ margin: "0" }}>
              <BackButton
                handleBackBtn={() => {
                  setSelectedType(null);
                }}
              />
            </div>
            <h3 className="page-title">Salah Timings</h3> */}
            <div className="MobileView">
              <div className="MobileViewContainer">
                <div className="CalendarContainer">
                  {tZone ? (
                    <SpecialCalendar
                      tZone={tZone}
                      minDate={LocationBasedToday(tZone)}
                      value={selectedDates[0]}
                      // onDateChange={handleRangeDateChange}
                      handleSingleDateClick={handleSingleDateClick}
                      tileContent={tileContent}
                      tileDisabled={tileDisabled}
                      tileClassName={tileClassName}
                    />
                  ) : null}
                </div>
              </div>

              <>
                {loadingTimings || isLoading ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: "300px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      "@media (min-width: 768px)": {
                        width: "50%",
                      },
                      // "@media (min-width: 1024px)": {
                      //   width: "100%",
                      // },
                    }}
                  >
                    <ProgressLoader />
                  </Box>
                ) : allPrayers.length === 0 ? (
                  <div
                    className="prayer-right-calender"
                    data-testid="right-calendar"
                  >
                    <PrayerBox
                      prayer={[]}
                      tZone={tZone}
                      timingId={selectedPrayers ? selectedPrayers?._id : ""}
                      masjidId={consumerMasjidId}
                      reloader={reloader}
                      noneSalahFound={true}
                    >
                      <div style={{ margin: "10px auto" }}>
                        <p className="time-zone">Time Zone : {tZone}</p>
                      </div>
                    </PrayerBox>
                    <CustomBtn
                      label="Add Salah Timings"
                      icon={clockIcon}
                      size="16vw"
                      eventHandler={handleRoute}
                    />
                  </div>
                ) : !selectedPrayers &&
                  selectedDates[0] &&
                  moment(selectedDates[0]).isAfter(
                    moment(allPrayers[allPrayers.length - 1]?.date)
                  ) ? (
                  <div
                    className="prayer-right-calender"
                    data-testid="right-calendar"
                  >
                    <PrayerBox
                      prayer={[]}
                      tZone={tZone}
                      timingId={selectedPrayers ? selectedPrayers?._id : ""}
                      masjidId={consumerMasjidId}
                      reloader={reloader}
                      noneSalahFound={false}
                    >
                      <Box
                        sx={{
                          padding: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          component="div"
                          variant="body2"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <img src={prayercalender} alt="" />
                          <div style={{ textAlign: "center" }}>
                            <p
                              style={{
                                textAlign: "center",
                                margin: "0",
                                color: "#154F30",
                              }}
                            >
                              {loadingHijriDate ? (
                                <span>Loading...</span>
                              ) : (
                                hijriDatesMap[
                                  moment(selectedDates[0]).format("DD-MM-YYYY")
                                ] || "Hijri date not available"
                              )}
                            </p>
                            <Typography
                              color="#154F30"
                              variant="body2"
                              data-test-id="date-selected"
                            >
                              {moment(selectedDates[0]).format(
                                "ddd, D MMMM, YYYY"
                              )}
                            </Typography>
                          </div>
                        </Typography>

                        <Box sx={{ marginTop: 2, width: "100%" }}>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            className="time-zone"
                          >
                            Time Zone: {tZone}
                          </Typography>
                        </Box>
                      </Box>
                    </PrayerBox>
                    <CustomBtn
                      label="Add Salah Timings"
                      icon={clockIcon}
                      size="16vw"
                      eventHandler={handleRoute}
                    />
                  </div>
                ) : (
                  <div
                    className="prayer-right-calender"
                    data-testid="right-calendar"
                  >
                    <div className="swiper-download-btn-conatiner">
                      <Swiper
                        spaceBetween={50}
                        slidesPerView={1}
                        ref={swiperRef}
                        // onSlideChange={handleSlideChange}
                        onSlideChange={(swiper) => handleSlideChange(swiper)}
                        onSwiper={(swiper) => {
                          swiperRef.current = swiper;
                        }}
                      >
                        {loadedPrayers.map((times, index) => (
                          <SwiperSlide key={index}>
                            <PrayerBox
                              prayer={times ? times.timings : []}
                              tZone={tZone}
                              timingId={
                                selectedPrayers ? selectedPrayers?._id : ""
                              }
                              masjidId={consumerMasjidId}
                              reloader={reloader}
                              noneSalahFound={false}
                            >
                              <Box
                                sx={{
                                  padding: 2,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  component="div"
                                  variant="body2"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                  }}
                                >
                                  {allPrayers.length > 1 &&
                                    !moment(times.date)
                                      .tz(tZone)
                                      .isSame(moment().tz(tZone), "day") && (
                                      <Box
                                        data-testid="prevslide"
                                        sx={{
                                          cursor: "pointer",
                                          borderRadius: "20px",
                                          boxShadow:
                                            "0px 1px 5px -1px rgba(0, 0, 0, 0.3)",
                                          height: "20px",
                                          width: "20px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          marginRight: "5px",
                                        }}
                                        onClick={() => slidePrev()}
                                      >
                                        <KeyboardArrowLeftOutlinedIcon
                                          sx={{
                                            width: isMobile ? "0.9em" : "0.7em",
                                            height: isMobile
                                              ? "0.9em"
                                              : "0.7em",
                                          }}
                                        />
                                      </Box>
                                    )}

                                  <img src={prayercalender} alt="" />
                                  <div style={{ textAlign: "center" }}>
                                    {" "}
                                    <p
                                      style={{
                                        textAlign: "center",
                                        margin: "0",
                                        color: "#154F30",
                                        // fontWeight: "500",
                                        fontSize: isLarge
                                          ? "1.4rem"
                                          : isMobile
                                          ? "0.875rem"
                                          : "0.8rem",
                                      }}
                                    >
                                      {/* {hijriDatesMap[
                                        moment(times.date).format("DD-MM-YYYY")
                                      ] ? (
                                        hijriDatesMap[
                                          moment(times.date).format(
                                            "DD-MM-YYYY"
                                          )
                                        ]
                                      ) : loadingHijriDate ? (
                                        <span>Loading...</span>
                                      ) : (
                                        "Hijri date not available"
                                      )} */}
                                      {loadingHijriDate ? (
                                        <span>Loading...</span>
                                      ) : (
                                        hijriDatesMap[
                                          moment(times.date)
                                            .utc()
                                            .tz(tZone)
                                            .format("DD-MM-YYYY")
                                          // moment(times.date).format(
                                          //   "DD-MM-YYYY"
                                          // )
                                        ]
                                      )}
                                    </p>
                                    <Typography
                                      color="#154F30"
                                      variant="body2"
                                      data-testid="date-selected"
                                      style={{
                                        // fontWeight: "500",
                                        fontSize: isLarge
                                          ? "1.4rem"
                                          : isMobile
                                          ? "0.875rem"
                                          : "0.8rem",
                                      }}
                                    >
                                      {moment(times.date)
                                        .tz(tZone)
                                        .format("ddd, D MMMM, YYYY")}
                                    </Typography>
                                  </div>

                                  {allPrayers.length > 1 && (
                                    <Box
                                      data-testid="nextslide"
                                      sx={{
                                        cursor: "pointer",
                                        borderRadius: "20px",
                                        boxShadow:
                                          "0px 1px 5px -1px rgba(0, 0, 0, 0.3)",
                                        height: "20px",
                                        width: "20px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginLeft: "5px",
                                      }}
                                      onClick={() => slideNext()}
                                    >
                                      <KeyboardArrowRightOutlinedIcon
                                        sx={{
                                          width: isMobile ? "0.9em" : "0.7em",
                                          height: isMobile ? "0.9em" : "0.7em",
                                        }}
                                      />
                                    </Box>
                                  )}
                                </Typography>

                                <Box sx={{ marginTop: 2, width: "100%" }}>
                                  <Typography
                                    variant="body2"
                                    color="text.primary"
                                    className="time-zone"
                                    style={{
                                      fontSize: isLarge
                                        ? "1.4rem"
                                        : isMobile
                                        ? "0.875rem"
                                        : "0.8rem",
                                    }}
                                  >
                                    Time Zone: {tZone}
                                  </Typography>
                                </Box>
                              </Box>
                            </PrayerBox>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      {!loadingTimings && !isLoading && (
                        <Button
                          sx={{
                            textTransform: "none",
                            color: "#686868;",
                            fontSize: isLarge
                              ? "1.2rem"
                              : isMobile
                              ? "0.8rem"
                              : "0.77rem",
                            width: "100%",
                            marginBottom: "15px",
                          }}
                          // onClick={handlePrintCalendar}
                          onClick={() => {
                            setIsMonthYearDialogVisible(true);
                          }}
                        >
                          <DownloadIcon fontSize="small" /> Download Salah
                          Calendar
                        </Button>
                      )}
                    </div>
                    <CustomBtn
                      label="Add Salah Timings"
                      icon={clockIcon}
                      eventHandler={handleRoute}
                    />
                  </div>
                )}
              </>
            </div>
          </div>
        </div>
      )}

      <FullMonthCalendar
        otherPrayers={specialTimes}
        isOtherPrayerLoading={isOtherPrayerLoading}
        setIsOtherPrayerLoading={setIsOtherPrayerLoading}
        componentRef={componentRef}
        selectedDate={selectedDates[0]}
        tZone={tZone}
        timings={currentMonthsPrayers}
        handlePrint={handlePrint}
        masjid={masjid}
        consumerMasjidId={consumerMasjidId}
      />
      <MonthYearDialog
        open={isMonthYearDialogVisible}
        setOpen={setIsMonthYearDialogVisible}
        onSubmit={handleCalendarPrint}
        tZone={tZone}
        selectedDate={selectedDates[0]}
        timings={timingsData?.getTimingsByMasjidId ?? []}
      ></MonthYearDialog>
    </>
  );
};

export default MobileViewCalender;
