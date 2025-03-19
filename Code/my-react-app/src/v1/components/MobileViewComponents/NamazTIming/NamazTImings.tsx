import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import "./NamazTimings.css";
import "./NamazTimingsFonts.css";
import PrayerTable from "./PrayerTable";
import moment from "moment-timezone";
import tz_lookup from "tz-lookup";
import { useAppSelector, useAppThunkDispatch } from "../../../redux/hooks";
import { fetchMasjidById } from "../../../redux/actions/MasjidActions/fetchMasjidById";
import {
  Masjid,
  NamajTiming,
  NamazTimingsType,
  PrayerMethod,
  PrayerTimings,
  ResponseType,
  optionalTimings,
} from "../../../redux/Types";
import { addTiming } from "../../../redux/actions/TimingsActions/AddTiming";
import { FetchingTimingsByDateRange } from "../../../redux/actions/TimingsActions/FetchingTimingsByDateRangeAction";
import { UpdateAllTimingsOfSingleDay } from "../../../redux/actions/TimingsActions/UpdateAllTimingsOfSingleDay";
import axios from "axios";
// import { TimingsFetch } from "../TimingsFetch/TimingsFetch";
import { addSolarTimings } from "../../../api-calls";
import { toast } from "react-hot-toast";
import TimeSelector from "./TimeSelector";
import {
  LocationBasedToday,
  UTCTimeConverter,
  UTCTimeReverter,
  UTCTimeReverter2,
  UtcDateConverter,
  customNavigatorTo,
} from "../../../helpers/HelperFunction";
import BackButton from "../Shared/BackButton";
import PrayerBox, { icons } from "../Shared/PrayerBox/PrayerBox";
import {
  Backdrop,
  Box,
  Card,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import TimeZone from "../Shared/TimeZone";
import CustomBtn from "../Shared/CustomBtn";
// import CustomSlider from "../Shared/Slider/CustomSlider";
import PrayerCalculationMethod from "./PrayerCalculationMethod";
import KeyboardArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardArrowLeftOutlined";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import calender from "../../../photos/Newuiphotos/Icons/calender.svg";
import CustomCalender from "../Shared/calendar/CustomCalender";
import { format } from "date-fns";
// import PrayerTimingSlider from "../Shared/Slider/CustomSlider";
import PrayerInputSlider from "../Shared/Slider/PrayerInputSlider";
import prayercalender from "../../../photos/Newuiphotos/Icons/prayercalender.svg";
import { Madhab, CalculationMethod, CalculationParameters } from "adhan";
import {
  fetchAndFormatTimings,
  fetchPrayerMethods,
  getPrayerTimes,
  methodMapping,
  TimingsFetch,
} from "../../../PrayerCalculation/Adhan";
import dayjs from "dayjs";
import SuccessMessageModel from "../../../helpers/SuccessMessageModel/SuccessMessageModel";
import SalahMethodSettings from "./SalahMethodSettings/SalahMethodSettings";
import {
  useCreateOrUpdateTimings,
  useDeleteTimings,
} from "../../../graphql-api-calls/Salah/mutation";
import { GET_TIMINGS_BY_MASJID_ID_WITH_ENDDATE } from "../../../graphql-api-calls/Salah/queries";
import { useQuery } from "@apollo/client";
import { useMemo } from "react";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
// import "swiper/swiper-bundle.min.css";
import SwiperCore from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { isNumber } from "../SharedHelpers/helpers";
import { getFinalTimings } from "./Util/TimingCalc";
import { UTCExtendedTiming } from "./Util/helpers";
import Warning from "./Warning/Warning";
import { useNavigationprop } from "../../../../MyProvider";
import { SalahType } from "../MobileViewCalender/SalahTimings/SalahTimings";
export type EnteredData = Record<
  string,
  {
    azaanTime: string;
    namazName?: string;
    jamaatTime: string;
    ExtendedJamaatMinutes: number;
    ExtendedAzaanMinutes: number;
    TimesByAzaan: string;
    TimesByJamaat: string;
  }
>;

const defaultPrayerSteps = [
  { name: "Fajr", next: "Dhur", type: 1 },
  { name: "Dhur", next: "Asar", type: 2 },
  { name: "Asar", next: "Maghrib", type: 3 },
  { name: "Maghrib", next: "Isha", type: 4 },
  { name: "Isha", next: null, type: 5 },
];

type propsType = {
  prayerType: string | undefined;
  setShowNamzTiming: Dispatch<SetStateAction<boolean>>;
  tims: NamajTiming<number>[] | undefined;
  masjidId: string;
  prayerMethod: string | undefined;
  handleSingleDateClick: (date: Date) => void;
  handleRangeDateChange: (date: Date[]) => void;
  setSelectedType: Dispatch<SetStateAction<SalahType>>;
};

function NamazTimings({
  setShowNamzTiming,
  tims,
  prayerType,
  masjidId,
  prayerMethod,
  handleSingleDateClick,
  handleRangeDateChange,
  setSelectedType,
}: propsType) {
  let initialMethod = {
    id: 2,
    name: "Islamic Society of North America (ISNA)",
  };
  const navigation = useNavigationprop();
  const dispatch = useAppThunkDispatch();
  let selectedDat = useAppSelector((state) => state.selectedDate);
  let admin = useAppSelector((state) => state.admin);
  let AdminMasjidState = useAppSelector((state) => state.AdminMasjid);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  let [isMethodChanged, setIsMethodChanged] = useState(false); // Tracks whether the prayer method has changed.
  const [selectedMethod, setSelectedMethod] = useState("Hanafi"); // Stores the selected prayer method type, e.g., "Hanafi".
  const [selectedAsrJurisdiction, setSelectedAsrJurisdiction] =
    useState<Partial<PrayerMethod>>(initialMethod); // Stores details of the selected prayer method.

  const [prayerMethodsList, setPrayerMethodsList] = useState<PrayerMethod[]>(
    []
  ); // Holds a list of all available prayer methods fetched from an API.

  const [matchedItm, setMatchItem] = useState<PrayerTimings<string>>(); //Holds the matched prayer timings item for the selected date.
  const [tZone, setTZone] = useState<string>("");

  const [nonHanafyAsr, setNonHanafyAsr] = useState<string>(""); // Stores the Asr timing for non-Hanafi method
  const [solarHanafyAsr, setSolarHanafyAsr] = useState<string>(""); // Stores the Asr timing for Hanafi method.

  const [inputtedTimings, setInputtedTimings] = useState<NamajTiming<string>[]>(
    []
  ); // Stores the timings inputted by the user.
  const [masjid, setMasjid] = useState<Masjid>(); // Contains details about the masjid.

  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(0); // mobile view, prev next classname
  const [isSubmitBtnDisabled, setIsSubmitBtnDisabled] = useState(false);
  const [showTimings, setShowTimings] = useState(false);

  const [activeDateField, setActiveDateField] = useState("startDate");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [dateArray, setDateArray] = useState<string[]>([]); // array has from, to date

  const [enteredData, setEnteredData] = useState<EnteredData>({});

  // const [isMobile, setIsMobile] = useState(false);
  // const isMobile = useMediaQuery(`(max-width: 767px)`);

  const swiperMobileRef = useRef<SwiperCore>(null);
  const swiperPrayerBoxRef = useRef<SwiperClass>(
    null
  ) as MutableRefObject<SwiperClass>;
  const [currentSliderIdx, setCurrentSliderIdx] = useState(0); // Keeps track of the current index in the prayer steps slider.
  const [currentPrayerBoxSliderIdx, setCurrentPrayerBoxSliderIdx] = useState(0); // Keeps track of the current index in the prayer steps slider.

  const carouselSteps = [0, 1, 2, 3, 4]; // all steps
  const [prayerSteps, setPrayerSteps] = useState(defaultPrayerSteps); // Contains the default prayer steps.
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [modalMessage, setModalmessage] = useState("");
  const [errors, setErrors] = useState({});

  const startDate = useMemo(() => {
    if (tZone) {
      return moment.tz(tZone).startOf("month").utc().toISOString();
    }
    return null; // or some default value
  }, [tZone]);

  const endDate = useMemo(() => {
    if (tZone) {
      return moment.tz(tZone).add(45, "days").utc().toISOString();
    }
    return null; // or some default value
  }, [tZone]);

  const {
    removeTimings,
    loading: loadingDelete,
    error: errorDelete,
  } = useDeleteTimings();

  const {
    loading: loadingTimings1,
    error: errorTimings1,
    data: timingsData1,
    refetch: timingsRefetch1,
  } = useQuery(GET_TIMINGS_BY_MASJID_ID_WITH_ENDDATE, {
    variables: { masjidId: masjidId, startDate: startDate, endDate: endDate },
    skip: !masjidId || !startDate || !endDate, // Skip if masjidId is not available
  });
  const {
    createOrUpdate,
    loading: loadingMutation,
    error: mutationError,
  } = useCreateOrUpdateTimings();
  const [rangeTimings, setRangeTimings] = useState<NamazTimingsType<string>[]>(
    []
  );

  const goNext = () => {
    swiperMobileRef.current?.slideNext();
  };

  const goPrev = () => {
    swiperMobileRef.current?.slidePrev();
  };

  const slideNext = useCallback(() => {
    if (swiperPrayerBoxRef.current) {
      swiperPrayerBoxRef.current.slideNext();
    }
  }, []);
  const slidePrev = useCallback(() => {
    if (swiperPrayerBoxRef.current) {
      swiperPrayerBoxRef.current.slidePrev();
    }
  }, []);
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(`(max-width:767.98px)`);
  const [showWarning, setShowWarning] = useState(false);
  // useEffect(() => {
  //   if (masjidId) {
  //     timingsRefetch1(); // Refetch timings if masjidId is valid
  //   }
  // }, [masjidId, timingsRefetch1]); // Add dependencies for the refetch
  // Handle data processing
  useEffect(() => {
    if (!loadingTimings1 && timingsData1) {
      setIsLoading(false);
      const items = timingsData1?.getTimingsByMasjidId ?? []; // Adjust according to your GraphQL structure
      const selectedDate = moment(new Date(selectedDat[0])).format(
        "YYYY-MM-DD"
      );

      const isItemExist = items.find((item: any) => {
        return (
          item.date.split("T")[0] ===
          UtcDateConverter(selectedDate, tZone).split("T")[0]
        );
      });
      setMatchItem(isItemExist);
    }
  }, [loadingTimings1, timingsData1]); // Handle changes in loading, data, and selected date

  // Fetching masjid details and prayer methods (assumed existing logic)
  useEffect(() => {
    if (masjidId) {
      const fetchMasjidDetails = async () => {
        const res = await dispatch(fetchMasjidById(masjidId));
        setMasjid(res);
        const lon = res.location.coordinates[0];
        const lat = res.location.coordinates[1];
        if (lat && lon) {
          const location = tz_lookup(lat, lon);
          setTZone(location);
        }
      };

      fetchMasjidDetails();

      // Fetch prayer methods
      try {
        const methods = fetchPrayerMethods();
        setPrayerMethodsList(methods);
      } catch (error) {
        toast.error("Failed to Fetch Prayer Methods");
        console.error("Error fetching prayer methods:", error);
      }
    }
  }, [masjidId]);

  // Sets the selected prayer method type based on prayerType.
  useEffect(() => {
    if (prayerType) {
      console.log(prayerType);
      console.log(selectedMethod);
      if (prayerType === "Manual") setSelectedMethod("Hanafi");
      else setSelectedMethod(prayerType);
    }
  }, [prayerType]);

  const autoTxStyle = {
    background: isLargeScreen ? "white" : "",
    fontFamily: "Inter",
    color: "#3D544E",
    fontWeight: 600,
    textAlign: "center",
    padding: "10px",
    fontSize: "9px",
    textTransform: "capitalize",
  };

  const selectTxt = {
    fontFamily: "Inter",
    color: "#3D544E",
    fontWeight: 600,
    textAlign: "center" as "center",
    width: "100%",
    fontSize: "12px",
    margin: "10px 0",
    display: isLargeScreen ? "none" : "",
  };
  // Initialize dates based on timezone
  useEffect(() => {
    if (selectedDat && selectedDat.length > 0) {
      console.log(selectedDat);
      const dateString = selectedDat[0];
      const [year, month, day] = dateString.split("-").map(Number);
      // const todayInTZone = LocationBasedToday(tZone);
      // const parsedTodayInTZone = moment(todayInTZone);
      const parsedDate = moment(dateString);

      console.log(dateString);
      setFromDate(new Date(year, month - 1, day, 0, 0, 0, 0));

      const toDate = parsedDate.clone().add(3, "months");
      setToDate(toDate.toDate());
    }
  }, []);

  // Handle date changes
  useEffect(() => {
    const formattedFromDate: string = moment(fromDate).format("YYYY-MM-DD");
    const formattedToDate: string = moment(toDate).format("YYYY-MM-DD");
    console.log(formattedFromDate);

    console.log(formattedToDate);
    if (formattedFromDate === formattedToDate) {
      console.log("same date", fromDate);
      handleSingleDateClick(fromDate);
      setDateArray([formattedFromDate]); // Correctly using string[] as defined in useState
    } else if (formattedFromDate > formattedToDate) {
      setToDate(fromDate);
      handleSingleDateClick(fromDate);
    } else {
      handleRangeDateChange([fromDate, toDate]);
      setDateArray([formattedFromDate, formattedToDate]);
    }
  }, [fromDate, toDate]);

  const handleToggleCalendar = (dateType: string) => {
    setIsCalendarVisible(!isCalendarVisible);
    setActiveDateField(dateType); // This now just sets which field we're editing
  };

  // whenever "prayerMethod" or "prayerMethodsList" is chnaged, we set the setSelectedAsrJurisdiction
  useEffect(() => {
    if (prayerMethod !== null) {
      const selectedMethod = prayerMethodsList.find(
        (method) => method.id === Number(prayerMethod)
      );
      console.log(prayerMethod);
      console.log(selectedMethod);
      if (selectedMethod) {
        setSelectedAsrJurisdiction(selectedMethod);
      }
    }
  }, [prayerMethod, prayerMethodsList]);

  // to set previously added prayer timing extended minutes(default is 5min)
  const getMagribExtraMin = (
    azaanTim: number,
    extendedAzaanMinutes: number,
    jamaatTim: number
  ) => {
    const azaanTime = moment.unix(azaanTim);
    // .add(-extendedAzaanMinutes, "minutes");
    const jamaatTime = moment.unix(jamaatTim);

    const duration = moment.duration(jamaatTime.diff(azaanTime));

    return duration.minutes();
  };
  // if tzone receive by  line -109 useeffect and if Tims has value then modifying(keeping default according to tims order) default prayerSteps and setting the data as a setEnteredData
  // tims has value if user selected date in mobile view Calender component has time or last 3 month has anytime

  useEffect(() => {
    if (tZone && tims && !isMethodChanged) {
      let updateObj: any = {};
      let newPrayerSteps: any[] = [];
      // console.log("tims", tims);
      // let selectedStartDate = new Date(selectedDat[0]);

      const startDate = moment(selectedDat[0]);

      const latitude = masjid?.location.coordinates[1];
      const longitude = masjid?.location.coordinates[0];

      console.log("selectedAsrJurisdiction", selectedAsrJurisdiction);
      const selectedMethodData = methodMapping.find(
        (method) => method.id === selectedAsrJurisdiction.id
      );
      // Define calculation method based on the selected prayer method
      const method = selectedMethodData?.method; // Assuming selectedAsrJurisdiction.id matches the method names
      // Fetch prayer times for both Shafi and Hanafi
      const prayerTimesHanafi = getPrayerTimes(
        latitude as number,
        longitude as number,
        startDate.toDate(),
        method as CalculationParameters,
        Madhab.Hanafi,
        tZone,
        "HH:mm"
      );

      const prayerTimesShafi = getPrayerTimes(
        latitude as number,
        longitude as number,
        startDate.toDate(),
        method as CalculationParameters,
        Madhab.Shafi,
        tZone,
        "HH:mm"
      );
      // Update the state with the new prayer times
      const selectedMethodTimes =
        selectedMethod === "Hanafi" ? prayerTimesHanafi : prayerTimesShafi;

      // console.log("selectedMethodTimes", JSON.stringify(selectedMethodTimes));
      // console.log("prayerSteps", prayerSteps);

      for (let item of tims) {
        const currentType = prayerSteps.find(
          (prayerStep) => prayerStep.name === item.namazName
        );
        newPrayerSteps.push(currentType);
        // Convert item.azaanTime to "HH:mm" format using UTCTimeReverter
        const revertedAzaanTime = UTCTimeReverter2(item.azaanTime, tZone);

        // Get the selected method time in "HH:mm A" format
        const selectedMethodAzaanTime =
          selectedMethodTimes[
            item.namazName == "Dhur"
              ? "dhuhr"
              : item.namazName == "Asar"
              ? "asr"
              : item.namazName.toLowerCase()
          ];
        // Convert the selected method time and the reverted azaan time to moment objects
        const selectedTime = moment(selectedMethodAzaanTime, "hh:mm A");
        const itemTime = moment(revertedAzaanTime, "hh:mm A");

        // Calculate the offset (difference in minutes)
        const extendedAzaanMinutes = itemTime.diff(selectedTime, "minutes");

        // Adjust the Azaan time based on the offset
        // const adjustedAzaanTime = selectedTime
        //   .add(extendedAzaanMinutes, "minutes")
        //   .format("HH:mm");

        // combination of the azaan time and offset
        const newPrayerObj = {
          type: currentType?.type,
          azaanTime: selectedMethodAzaanTime,
          jamaatTime:
            item?.iqamahType && item?.iqamahType === "solar"
              ? revertedAzaanTime
              : item.namazName === "Maghrib" && !item?.iqamahType
              ? revertedAzaanTime
              : // item.namazName === "Maghrib"
                UTCTimeReverter2(item.jamaatTime, tZone),
          // item.namazName === "Maghrib"
          //   ? selectedMethodAzaanTime
          //   : // item.namazName === "Maghrib"
          //     UTCTimeReverter2(item.jamaatTime, tZone),
          // UTCTimeReverter(item.azaanTime, tZone),
          TimesByAzaan: "solar",
          TimesByJamaat:
            UTCTimeReverter2(item.jamaatTime, tZone) === "" ||
            item.iqamahType === "No Iqama"
              ? "No Iqama"
              : item?.iqamahType
              ? item?.iqamahType
              : item.namazName === "Maghrib"
              ? "solar"
              : "manual",
          ExtendedAzaanMinutes: isNumber(item.offset?.azaan)
            ? item.offset?.azaan
            : extendedAzaanMinutes,

          ExtendedJamaatMinutes: isNumber(item.offset?.iqamah)
            ? item.offset?.iqamah
            : item.namazName === "Maghrib"
            ? getMagribExtraMin(
                item.azaanTime,
                extendedAzaanMinutes,
                item.jamaatTime
              )
            : 0,
        };

        updateObj = {
          ...updateObj,
          [item.namazName]: newPrayerObj,
        };
        // const objWithName = { ...newPrayerObj, namazName: item.namazName };
        // setPrayerTimingInfo((preVal: any) => [...preVal, objWithName]);
      }
      setPrayerSteps(newPrayerSteps);
      setEnteredData(updateObj);
    }
  }, [tZone, tims, selectedAsrJurisdiction.id, selectedMethod]);

  //called twice since dates are setting late
  useEffect(() => {
    // Format the selected date
    // let selectedStartDate = new Date(selectedDat[0]);
    const startDate = moment(selectedDat[0]);
    // Proceed only if masjid address exists
    if (masjid) {
      // Fetch coordinates based on the masjid address (assuming you have a way to get latitude and longitude)
      const latitude = masjid?.location.coordinates[1];
      const longitude = masjid?.location.coordinates[0];
      const selectedMethodData = methodMapping.find(
        (method) => method.id === selectedAsrJurisdiction.id
      );
      // Define calculation method based on the selected prayer method
      const method = selectedMethodData?.method; // Assuming selectedAsrJurisdiction.id matches the method names
      // Fetch prayer times for both Shafi and Hanafi
      const prayerTimesHanafi = getPrayerTimes(
        latitude,
        longitude,
        startDate.toDate(),
        method as CalculationParameters,
        Madhab.Hanafi,
        tZone,
        "HH:mm"
      );
      const prayerTimesShafi = getPrayerTimes(
        latitude,
        longitude,
        startDate.toDate(),
        method as CalculationParameters,
        Madhab.Shafi,
        tZone,
        "HH:mm"
      );
      // Update the state with the new prayer times
      const timings =
        selectedMethod === "Hanafi" ? prayerTimesHanafi : prayerTimesShafi;

      // Rename timings for consistency
      const modifiedPrayerTimes = {
        Fajr: timings.fajr,
        Dhur: timings.dhuhr,
        Asar: timings.asr,
        Maghrib: timings.maghrib,
        Isha: timings.isha,
      };

      // Initialize update object for prayer steps
      let updateObj = {};
      prayerSteps.forEach((item) => {
        const newPrayerObj = {
          type: item.type,
          azaanTime:
            modifiedPrayerTimes[item.name as keyof typeof modifiedPrayerTimes],
          jamaatTime:
            modifiedPrayerTimes[item.name as keyof typeof modifiedPrayerTimes],
          TimesByAzaan: "solar",
          TimesByJamaat: item.type === 4 ? "solar" : "manual",
          ExtendedAzaanMinutes: 0,
          ExtendedJamaatMinutes: 0,
        };
        updateObj = {
          ...updateObj,
          [item.name]: newPrayerObj,
        };
      });
      // console.log("updateObj", updateObj);
      // Update the state with the new prayer times
      // only called to set timings when there are no existing prayers
      if (isMethodChanged || (!tims && selectedDat[0])) {
        console.log("Field Change", updateObj);
        setEnteredData(updateObj);
        setIsMethodChanged(false);
      }
    }
  }, [masjid, selectedAsrJurisdiction.id, isMethodChanged, selectedDat[0]]);

  // validate to disable the submit button
  // function validatePrayerTimings(enteredData: EnteredData) {
  //   let hasError = false;

  //   Object.keys(enteredData).forEach((prayerName) => {
  //     const prayer = enteredData[prayerName];

  //     // Calculate actual Azaan time
  //     let actualAzaanTime = dayjs(prayer.azaanTime, "HH:mm");
  //     // if (prayer.TimesByAzaan === "solar") {
  //     actualAzaanTime = actualAzaanTime.add(
  //       prayer.ExtendedAzaanMinutes,
  //       "minutes"
  //     );
  //     // }

  //     // Calculate actual Jamaat time
  //     let actualJamaatTime = dayjs(prayer.jamaatTime, "HH:mm");
  //     if (prayer.TimesByJamaat === "solar") {
  //       actualJamaatTime = actualJamaatTime.add(
  //         prayer.ExtendedJamaatMinutes,
  //         "minutes"
  //       );
  //     }

  //     // Check if Azaan time is greater than Jamaat time
  //     if (
  //       prayer.TimesByJamaat != "No Iqama" &&
  //       actualAzaanTime.isAfter(actualJamaatTime)
  //     ) {
  //       console.error(
  //         `Error: ${prayerName} Azaan time is greater than Jamaat time`
  //       );
  //       hasError = true;
  //     }
  //   });

  //   return hasError;
  // }
  function validatePrayerTimings(enteredData) {
    const errors = {};

    Object.keys(enteredData).forEach((prayerName) => {
      const prayer = enteredData[prayerName];

      // Calculate actual Azaan time
      let actualAzaanTime = dayjs(prayer.azaanTime, "HH:mm");
      actualAzaanTime = actualAzaanTime.add(
        prayer.ExtendedAzaanMinutes,
        "minutes"
      );

      // Calculate actual Jamaat time
      let actualJamaatTime = dayjs(prayer.jamaatTime, "HH:mm");
      if (prayer.TimesByJamaat === "solar") {
        actualJamaatTime = actualJamaatTime.add(
          prayer.ExtendedJamaatMinutes,
          "minutes"
        );
      }

      // Check if Azaan time is greater than Jamaat time
      if (
        prayer.TimesByJamaat !== "No Iqama" &&
        actualAzaanTime.isAfter(actualJamaatTime)
      ) {
        errors[prayerName] = `Azaan time (${actualAzaanTime.format(
          "HH:mm"
        )}) is greater than Jamaat time (${actualJamaatTime.format("HH:mm")})`;
      }
    });
    setErrors(errors);
    return Object.keys(errors).length > 0;
  }
  // useeffect to call the error checker everytime any data in the enteredData is changed
  useEffect(() => {
    const hasError = validatePrayerTimings(enteredData);
    if (hasError) {
      setIsSubmitBtnDisabled(true);
    } else {
      setIsSubmitBtnDisabled(false);
    }
  }, [enteredData]);

  // render when showTimings state change,if showTimings true it's show timing preview

  const showTimingHandler = async () => {
    const val = Object.entries(enteredData).map(([namazName, info]) => ({
      namazName,
      ...info,
    }));
    setInputtedTimings(val);
    setShowTimings(true);
    const masjidCoordinates = {
      latitude: masjid?.location?.coordinates[1] as number,
      longitude: masjid?.location?.coordinates[0] as number,
    }; // Replace with actual coordinates

    const selectedStartDate = moment(selectedDat[0]);
    // const selectedEndDate = moment(selectedDat[1]);
    const selectedEndDate = selectedDat[1]
      ? moment(selectedDat[1])
      : moment(selectedDat[0]);

    const EndDate = selectedEndDate.format("YYYY-MM-DD");
    const StartDate = selectedStartDate.format("YYYY-MM-DD");
    console.log(StartDate, EndDate);
    const difference = selectedEndDate.diff(selectedStartDate, "days") + 1;
    console.log(difference);
    const mergedTiming1 = [...inputtedTimings];

    const formattedTimings = await fetchAndFormatTimings(
      masjidCoordinates,
      selectedDat,
      val, //single days enetered data timing
      tZone, // Replace with your timezone
      selectedMethod, // Replace with your method
      selectedAsrJurisdiction // Replace with your prayer method
    );
    // let resultantTimings = [];

    let dateCounter = moment(StartDate);
    console.log(dateCounter.format("YYYY-MM-DD"));
    let resultantTimingsWithErrors: any[] = [];
    for (let i = 0; i < difference; i++) {
      let currentDate = dateCounter.format("YYYY-MM-DD");
      let dailyTimings = formattedTimings.slice(i * 5, (i + 1) * 5);
      let hasError = false;
      let errorIqama: string[] = [];

      const dailyProcessedTimings = dailyTimings.map((Namaaz) => {
        const namaazAzaanTime = processFormattedTimings(
          Namaaz.TimesByAzaan,
          Namaaz.azaanTime,
          Namaaz.ExtendedAzaanMinutes,
          Namaaz.type,
          true,
          currentDate,
          val
        );

        const namaazJamaatTime = processFormattedTimings(
          Namaaz.TimesByJamaat,
          Namaaz.jamaatTime,
          (Namaaz.ExtendedJamaatMinutes ?? 0) +
            (Namaaz.ExtendedAzaanMinutes ?? 0),
          Namaaz.type,
          false,
          currentDate,
          val
        );
        // console.log(namaazAzaanTime);
        // console.log(namaazJamaatTime);
        if (
          moment(namaazAzaanTime, "HH:mm").isAfter(
            moment(namaazJamaatTime, "HH:mm")
          )
        ) {
          hasError = true;
          errorIqama.push(Namaaz.namazName);
        }
        return {
          ExtendedAzaanMinutes: Namaaz.ExtendedAzaanMinutes,
          ExtendedJamaatMinutes: Namaaz.ExtendedJamaatMinutes,
          TimesByAzaan: Namaaz.TimesByAzaan,
          TimesByJamaat: Namaaz.TimesByJamaat,
          azaanTime: namaazAzaanTime,
          jamaatTime: namaazJamaatTime,
          namazName: Namaaz.namazName,
          type: Namaaz.type,

          // namazName: Namaaz.namazName,
          // type: Namaaz.type,
          // azaanTime: namaazAzaanTime,
          // jamaatTime: namaazJamaatTime,
        };
      });

      dailyProcessedTimings.sort(
        (a, b) => (a.type as number) - (b.type as number)
      );

      const prayerInfo = {
        timings: dailyProcessedTimings,
        date: currentDate,
        hasError: hasError,
        errorIqama: errorIqama,
      };

      resultantTimingsWithErrors.push(prayerInfo);
      dateCounter.add(1, "days");
    }
    // setRangeTimings(resultantTimingsWithErrors);
    setRangeTimings(resultantTimingsWithErrors);
  };

  // const processFormattedTimings = (
  // TimesByAzaan,
  //       azaanTime,
  //       ExtendedAzaanMinutes,
  //       type,
  //       true,
  //       selectedDat[0],
  //       true) => {};
  const processFormattedTimings = (
    timeStatus: string | undefined,
    prayerTime: any,
    ExtendedMinutes: number | undefined,
    type: number | undefined,
    isAzn: boolean,
    date: string,
    inputTimings: any,
    isSingle: boolean = false
  ) => {
    if (timeStatus && ExtendedMinutes !== undefined) {
      if (timeStatus === "solar" || timeStatus === "nonHanafy") {
        const updatedTime = moment
          .unix(prayerTime)
          .tz(tZone)
          .add(ExtendedMinutes, "minutes")
          .format("HH:mm");

        return updatedTime;
      } else if (timeStatus === "manual") {
        const mergedTimings = [...inputTimings]; //to fix the magrib namz issue
        let NamazData = mergedTimings.filter((item) => item.type === type);
        const tm = isAzn ? NamazData[0].azaanTime : NamazData[0].jamaatTime;
        return tm;
      } else if (timeStatus === "No Iqama") {
        return "";
      }
    }
  };

  const handleAddRangeNetworkCall = async (TimingDataToUpload: any) => {
    const loading = toast.loading("Please Wait...!");
    try {
      // Call the createOrUpdate mutation
      const results = await createOrUpdate(masjidId, TimingDataToUpload);
      if (results) {
        toast.dismiss(loading);
        setModalmessage("Salah Timings Added Successfully");
        setOpenSuccessModal(true);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.dismiss(loading);
      toast.error("Something Went Wrong, Please Try Again");
    } finally {
      setIsLoading(false);
    }
    // handleNetworkCalls(difference, TimingDataToUpload);
  };

  const handleBackBtn = () => {
    if (showTimings) {
      setShowTimings(false);
    } else {
      setShowNamzTiming(false);
    }
  };
  const handleBottomBackBtn = () => {
    if (swiperPrayerBoxRef.current) {
      swiperPrayerBoxRef.current.slideTo(0); // Set to the first slide
    }
    if (!prayerSteps.length) {
      setShowNamzTiming(false);
      return;
    }
    setShowTimings(false);
  };

  const condCls = `${
    isVisible === 1 ? "next-step" : isVisible === 2 ? "back-step" : ""
  }`;
  const prayerBoxConditionalCls = showTimings
    ? " prayer-d-block time-preview"
    : " prayer-d-none time-preview";
  const prayerBoxRangeConditionalCls = showTimings
    ? " prayer-d-block time-preview-range"
    : " prayer-d-none time-preview-range";
  const sliderConditionalCls = showTimings
    ? "prayer-d-none "
    : "prayer-d-block ";

  const handleDateSelect = (selectedDate: any) => {
    if (activeDateField === "endDate") {
      setToDate(selectedDate);
    } else {
      setFromDate(selectedDate);
    }

    setTimeout(() => {
      setIsCalendarVisible(false); // Close calendar after selection
    }, 300); // Close after 1 second
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

  const getMessage = (messageType: string) => {
    // return "Please select a valid date range";

    const findError = rangeTimings.find((item) => item.hasError);
    // console.log(rangeTimings);
    if (findError) {
      console.log(findError.date);
      const errorDate = moment(findError.date);
      console.log(errorDate.format());
      console.log(errorDate.clone().subtract(1, "days").format());
      const previousDate = errorDate.clone().subtract(1, "days");
      if (messageType === "error") {
        return ``;
      } else if (messageType === "warning") {
        return `The ${
          findError?.errorIqama && findError?.errorIqama?.length > 0
            ? findError?.errorIqama?.join(", ")
            : ""
        } Azan time for ${errorDate.format(
          "DD MMM, YYYY"
        )}, exceeds the Iqama time. You can only update timings until ${previousDate.format(
          "DD MMM, YYYY"
        )}. Would you like to proceed?`;
      }
    }
    if (messageType === "error") {
      return "";
    } else if (messageType === "warning") {
      return "Are you sure you want to update these timings?";
    }
    return "";
  };
  const handleSubmit = () => {
    console.log("handleSubmit", inputtedTimings);
    const TimingDataToUpload = getFinalTimings({
      setIsLoading,
      AdminMasjidState,
      selectedDateArray: selectedDat,
      inputtedTimings,
      tZone,
      selectedMethod,
      selectedAsrJurisdiction,
    });
    // console.log("TimingDataToUpload", TimingDataToUpload);

    handleAddRangeNetworkCall(TimingDataToUpload);
    setShowWarning(false);
  };
  return (
    <>
      <Warning
        isModalOpen={showWarning}
        setModalOpen={setShowWarning}
        errorMessage={`${getMessage("error")}`}
        warningMessage={`${getMessage("warning")}`}
        handleSubmit={handleSubmit}
      />
      <SuccessMessageModel
        message={modalMessage}
        open={openSuccessModal}
        onClose={() => {
          setOpenSuccessModal(false);
          setShowNamzTiming(false);
        }}
        hideDefaultButtons={true}
      >
        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          <button
            style={{
              width: "50%",
              padding: "10px",
              borderRadius: "20px",
              border: "2px solid #1B8368",
              background: "none",
              color: "#1B8368",
              fontSize: "12.5px",
              fontWeight: "700",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowNamzTiming(false);
              setSelectedType("other");
            }}
          >
            Update Other Salah
          </button>
          <button
            style={{
              width: "50%",
              padding: "10px",
              borderRadius: "20px",
              border: "none",
              background: "#1B8368",
              color: "white",
              fontSize: "12.5px",
              fontWeight: "700",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowNamzTiming(false);
            }}
          >
            Continue
          </button>
        </div>
      </SuccessMessageModel>
      {isCalendarVisible && (
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={isCalendarVisible}
          onClick={() => setIsCalendarVisible(false)}
        >
          <div
            className="CalendarContainer-1"
            onClick={(e) => e.stopPropagation()}
          >
            <CustomCalender
              minDate={
                activeDateField === "endDate"
                  ? fromDate
                  : LocationBasedToday(tZone)
              }
              tileDisabled={tileDisabled}
              onDateSelect={handleDateSelect}
              value={activeDateField === "endDate" ? toDate : fromDate}
              setValue={(value) => {
                // Ensure the value is a Date object
                const dateValue =
                  typeof value === "function"
                    ? value(LocationBasedToday(tZone))
                    : value;
              }}
            />
          </div>
        </Backdrop>
      )}

      {isSettingsOpen ? (
        <SalahMethodSettings setIsSettingsOpen={setIsSettingsOpen}>
          <PrayerCalculationMethod
            selectedMethod={selectedAsrJurisdiction}
            setSelectedMethod={setSelectedAsrJurisdiction}
            setIsMethodChanged={setIsMethodChanged}
            isMethodChanged={isMethodChanged}
            selectedAsrMethod={selectedMethod}
            setSelectedAsrMethod={setSelectedMethod}
            masjid={masjid}
            selectedStartDate={selectedDat[0]}
            masjidId={masjidId}
            tZone={tZone}
            prayerType={prayerType}
            prayerMthd={prayerMethod}
            setIsSettingsOpen={setIsSettingsOpen}
          />
        </SalahMethodSettings>
      ) : (
        <div className="mainNamazTablePreview">
          <div className={"title-container"}>
            <div className="goback ">
              <BackButton handleBackBtn={handleBackBtn} />
            </div>
            <h3 className="page-title">Salah Timing</h3>
          </div>
          {/* <div className="namaz-top-box">
            <BackButton handleBackBtn={handleBackBtn} />
            <h3 className="page-title">Salah Timing</h3>
          </div> */}

          {!showTimings || showTimings ? (
            <div
              className="Azan-Container-timings"
              data-testid="salah-container"
            >
              <div
                className={prayerBoxRangeConditionalCls}
                // className="time-preview-range"
                data-testid="preview-box"
              >
                <div className="salahdates-range">
                  <img src={prayercalender} alt="" style={{ width: "20px" }} />
                  {fromDate.toDateString() === toDate.toDateString()
                    ? format(fromDate, "MMM, dd")
                    : `${format(fromDate, "MMM, dd")} - ${format(
                        toDate,
                        "MMM, dd"
                      )}`}
                </div>
              </div>
              <Swiper
                onSlideChange={(swiper) =>
                  setCurrentPrayerBoxSliderIdx(swiper.activeIndex)
                }
                onSwiper={(swiper) => {
                  swiperPrayerBoxRef.current = swiper;
                }}
                style={{
                  marginLeft: "0px",
                  marginRight: "0px",
                }}
              >
                {rangeTimings.map((timing, index) => (
                  <SwiperSlide key={index}>
                    <div
                      className={prayerBoxConditionalCls}
                      data-testid="preview-box"
                    >
                      <div className="salahdates">
                        <Box
                          data-testid="prevslide"
                          sx={{
                            borderRadius: "20px",
                            cursor: "pointer",

                            // boxShadow:
                            //   index != 0
                            //     ? "0px 1px 5px -1px rgba(0, 0, 0, 0.3)"
                            //     : "none",
                            height: "20px",
                            width: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => index != 0 && slidePrev()}
                        >
                          {index != 0 && <KeyboardArrowLeftOutlinedIcon />}
                        </Box>
                        <img
                          src={prayercalender}
                          alt=""
                          style={{ width: "20px" }}
                        />
                        (
                        {moment
                          .tz(timing.date, tZone)
                          .format("ddd, DD MMM, YYYY")}
                        )
                        <Box
                          data-testid="nextslide"
                          sx={{
                            borderRadius: "20px",
                            cursor: "pointer",
                            // boxShadow:
                            //   index !== rangeTimings.length - 1
                            //     ? "0px 1px 5px -1px rgba(0, 0, 0, 0.3)"
                            //     : "none",
                            height: "20px",
                            width: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() =>
                            index !== rangeTimings.length - 1 && slideNext()
                          }
                        >
                          {index !== rangeTimings.length - 1 && (
                            <KeyboardArrowRightOutlinedIcon />
                          )}
                        </Box>
                      </div>
                      <PrayerBox tZone={tZone} prayer={timing.timings}>
                        <TimeZone tZone={tZone} />
                        {timing.hasError && (
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "red",
                              fontWeight: "400",
                              width: "90%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              margin: "auto",
                              textAlign: "center",
                            }}
                          >
                            Incorrect Timings for{" "}
                            {timing?.errorIqama?.join(", ") ?? ""}
                          </div>
                        )}
                      </PrayerBox>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className={sliderConditionalCls} data-testid="slider-box">
                {/* <div className="selected-date-with-backbtn">
                  <BackButton handleBackBtn={handleBackBtn} />
                </div> */}

                <div className="namazConatinerMain">
                  <div className="namazConatiner">
                    <div
                      style={{
                        margin: "10px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CustomBtn
                        label="Salah Methods Settings"
                        showIcon={false}
                        eventHandler={() => setIsSettingsOpen(true)}
                        size="50px"
                      />
                    </div>

                    <Typography style={selectTxt}>
                      Please Select Date for Salah Timing
                    </Typography>
                    <div className="dateSelection">
                      <Typography
                        sx={{ display: isLargeScreen ? "block" : "none" }}
                      >
                        Please Select Date for Salah Timing
                      </Typography>

                      <Box
                        onClick={() => handleToggleCalendar("startDate")}
                        sx={{ position: "relative" }}
                      >
                        <label htmlFor="fromDate">From</label>
                        <input
                          id="fromDate"
                          type="text"
                          placeholder="DD MM YYYY"
                          value={format(fromDate, "dd MMM yyyy")}
                          readOnly
                        />

                        <span
                          className="calendar-ico"
                          style={{
                            position: "absolute",
                            top: "3px",
                            right: "10px",
                          }}
                        >
                          <img src={calender} alt="" width={"14px"} />
                        </span>
                      </Box>
                      <Box
                        onClick={() => handleToggleCalendar("endDate")}
                        sx={{ position: "relative" }}
                      >
                        <label htmlFor="toDate">To</label>
                        <input
                          id="toDate"
                          type="text"
                          value={format(toDate, "dd MMM yyyy")}
                          placeholder="DD MM YYYY"
                          readOnly
                        />
                        <span
                          className="calendar-ico"
                          style={{
                            position: "absolute",
                            top: "3px",
                            right: "10px",
                          }}
                        >
                          <img src={calender} alt="" width={"14px"} />
                        </span>
                      </Box>
                    </div>
                    <Box
                      style={{
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        className="Autofilldsc"
                        style={{ ...autoTxStyle, textTransform: "none" }}
                      >
                        <b style={{ color: "#1B8368" }}>Autofill: </b>
                        Azan timings are dynamically generated. For any
                        calculation changes go to salah methods settings above.
                      </Typography>
                    </Box>
                    <Box
                      style={{
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        className="Autofilldsc"
                        style={{ ...autoTxStyle, padding: "0" }}
                      >
                        {isLargeScreen && Object.keys(errors).length > 0 && (
                          <span
                            style={{
                              color: "#f44336",
                              padding: "0",
                              fontWeight: "400",
                            }}
                          >
                            {/* {Object.keys(errors).join(", ")}  */}
                            Azan Time is greater than Iqama time
                          </span>
                        )}
                      </Typography>
                    </Box>
                    <PrayerInputSlider
                      setCurrentSliderIdx={setCurrentSliderIdx}
                      currentSliderIdx={currentSliderIdx}
                      swiperRef={swiperMobileRef}
                      goNext={goNext}
                      goPrev={goPrev}
                      errors={errors}
                    >
                      {!isMobile && !isLargeScreen && (
                        <Box
                          style={{
                            textAlign: "center",
                            paddingTop: "10px",
                          }}
                        >
                          <Typography
                            className="Autofilldsc"
                            style={{
                              ...autoTxStyle,
                              padding: "0",
                              boxSizing: "border-box",
                            }}
                          >
                            {Object.keys(errors).length > 0 && (
                              <span
                                style={{
                                  color: "#f44336",
                                  padding: "0",
                                  fontWeight: "400",
                                  textTransform: "none",
                                }}
                              >
                                Azan Time is greater than Iqama time
                              </span>
                            )}
                          </Typography>
                        </Box>
                      )}
                      {carouselSteps.map((carouselStep) =>
                        isMobile ? (
                          <div
                            key={carouselStep}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <Card
                              className={`namaz-card ${condCls}`}
                              sx={{ overflow: "visible !important" }}
                            >
                              <div className="Azan-Btn-Div">
                                <p onClick={() => goPrev()}>
                                  <KeyboardArrowLeftOutlinedIcon
                                    sx={
                                      currentSliderIdx === 0
                                        ? { visibility: "hidden" }
                                        : { width: "30px", color: "#1b8368" }
                                    }
                                  />
                                </p>
                                <p className="prayer-icn-title">
                                  <img
                                    src={icons[prayerSteps[carouselStep].name]}
                                    alt=""
                                  />
                                  {prayerSteps[carouselStep].name}
                                </p>
                                <p
                                  onClick={() => {
                                    if (
                                      Object.keys(errors).includes(
                                        prayerSteps[carouselStep].name
                                      )
                                    ) {
                                      // toast.dismiss();
                                      // toast.error(
                                      //   "Azan is greater than Iqama time"
                                      // );
                                    } else goNext();
                                  }}
                                >
                                  <KeyboardArrowRightOutlinedIcon
                                    sx={
                                      currentSliderIdx === 4 ||
                                      Object.keys(errors).includes(
                                        prayerSteps[carouselStep].name
                                      )
                                        ? { visibility: "hidden" }
                                        : {
                                            width: "30px",
                                            color:
                                              // Object.keys(errors).includes(
                                              //   prayerSteps[carouselStep].name
                                              // )
                                              //   ? "grey":
                                              "#1b8368",
                                          }
                                    }
                                  />
                                </p>
                              </div>

                              <div style={{ padding: "0px 9px 24px 9px" }}>
                                <TimeSelector
                                  enteredData={enteredData}
                                  setEnteredData={setEnteredData}
                                  prayerName={prayerSteps[carouselStep].name}
                                  label="Azan"
                                  prayerTimeType="solar"
                                  nonHanafyAsr={
                                    selectedMethod !== "Hanafi"
                                      ? nonHanafyAsr
                                      : ""
                                  }
                                  solarHanafyAsr={
                                    selectedMethod === "Hanafi"
                                      ? solarHanafyAsr
                                      : ""
                                  }
                                />
                                <TimeSelector
                                  enteredData={enteredData}
                                  setEnteredData={setEnteredData}
                                  prayerName={prayerSteps[carouselStep].name}
                                  label="Iqama"
                                  prayerTimeType={
                                    prayerSteps[carouselStep].name === "Maghrib"
                                      ? "solar"
                                      : "manual"
                                  }
                                  nonHanafyAsr={
                                    selectedMethod !== "Hanafi"
                                      ? nonHanafyAsr
                                      : ""
                                  }
                                  solarHanafyAsr={
                                    selectedMethod === "Hanafi"
                                      ? solarHanafyAsr
                                      : ""
                                  }
                                />

                                {Object.keys(errors).length > 0 && (
                                  <div
                                    style={{
                                      textAlign: "center",
                                      color: "#f44336",
                                      paddingTop: "15px",
                                      fontWeight: "400",
                                      fontSize: "12px",
                                      height: "30px",
                                      textTransform: "none",
                                    }}
                                  >
                                    {/* {Object.keys(errors).join(", ")}  */}
                                    {errors[prayerSteps[carouselStep].name] &&
                                      "Azan Time is Greater Than Iqama Time"}
                                  </div>
                                )}
                              </div>
                            </Card>
                          </div>
                        ) : (
                          <div
                            style={
                              !isMobile
                                ? {
                                    display: "flex",
                                    // justifyContent: "initial",
                                    alignItems: "end",
                                    gap: "20px",
                                    justifyContent: "initial",
                                  }
                                : {}
                            }
                          >
                            {!isMobile && (
                              <p
                                className="prayer-icn-title"
                                style={{
                                  width: "120px",
                                  margin: "0",
                                  justifyContent: "initial",
                                }}
                              >
                                <img
                                  src={icons[prayerSteps[carouselStep].name]}
                                  alt=""
                                />
                                {showTimings
                                  ? ""
                                  : prayerSteps[carouselStep].name}
                              </p>
                            )}
                            <div
                              key={carouselStep}
                              className="tablet-timing-card"
                            >
                              {isMobile && (
                                <p className="prayer-icn-title">
                                  <img
                                    src={icons[prayerSteps[carouselStep].name]}
                                    alt=""
                                  />
                                  {showTimings
                                    ? ""
                                    : prayerSteps[carouselStep].name}
                                </p>
                              )}
                              <TimeSelector
                                enteredData={enteredData}
                                setEnteredData={setEnteredData}
                                prayerName={prayerSteps[carouselStep].name}
                                label="Azan"
                                prayerTimeType="solar"
                                nonHanafyAsr={
                                  selectedMethod !== "Hanafi"
                                    ? nonHanafyAsr
                                    : ""
                                }
                                solarHanafyAsr={
                                  selectedMethod === "Hanafi"
                                    ? solarHanafyAsr
                                    : ""
                                }
                              />
                              <TimeSelector
                                enteredData={enteredData}
                                setEnteredData={setEnteredData}
                                prayerName={prayerSteps[carouselStep].name}
                                prayerTimeType={
                                  prayerSteps[carouselStep].name === "Maghrib"
                                    ? "solar"
                                    : "manual"
                                }
                                label="Iqama"
                                nonHanafyAsr={
                                  selectedMethod !== "Hanafi"
                                    ? nonHanafyAsr
                                    : ""
                                }
                                solarHanafyAsr={
                                  selectedMethod === "Hanafi"
                                    ? solarHanafyAsr
                                    : ""
                                }
                              />
                            </div>
                          </div>
                        )
                      )}
                      {!isMobile && (
                        <div className="done-btn-container">
                          <CustomBtn
                            size={"10vw"}
                            eventHandler={showTimingHandler}
                            label={"Done"}
                            showIcon={false}
                            isDisabled={isSubmitBtnDisabled}
                          />
                        </div>
                      )}
                    </PrayerInputSlider>
                  </div>
                </div>

                {currentSliderIdx === 4 && isMobile ? (
                  <div className="done-btn-container">
                    <CustomBtn
                      size={"15vw"}
                      eventHandler={showTimingHandler}
                      label={"Done"}
                      showIcon={false}
                      isDisabled={isSubmitBtnDisabled}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div>
              <PrayerTable timings={inputtedTimings} tZone={tZone} />
            </div>
          )}
          {/* show back and add btn if show timing clicked */}
          {showTimings && (
            <div className="Butoon-Azan">
              <CustomBtn
                showIcon={false}
                bgColor={"#FF7272"}
                eventHandler={handleBottomBackBtn}
                label={"Cancel"}
                size={window.innerWidth >= 1024 ? "8vw" : "10vw"}
              />

              <CustomBtn
                showIcon={false}
                eventHandler={() => {
                  const findErrorIndex = rangeTimings.findIndex(
                    (item) => item.hasError
                  );
                  if (findErrorIndex === 0) {
                    toast.dismiss();
                    toast.error(
                      "You Cannot Update Incorrect Timings. Azan is Greater Than Iqama!"
                    );
                  } else {
                    setShowWarning(true);
                  }
                }}
                label={"Confirm"}
                isLoading={isLoading}
                size={window.innerWidth >= 1024 ? "8vw" : "10vw"}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default NamazTimings;
