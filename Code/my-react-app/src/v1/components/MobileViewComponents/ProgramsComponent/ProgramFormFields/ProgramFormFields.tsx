import {
  Backdrop,
  Checkbox,
  FormControl,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./ProgramFormFields.module.css";
import { AdminInterFace, Masjid } from "../../../../redux/Types";
import { CustomSelect } from "../../Programs/Main/ProgramForm/StyledButtons";
import RegistrationOptions from "../Helper/Components/RegistrationOptions";
import useMasjidData from "../../SharedHooks/useMasjidData";
import ReusableDatePicker from "../helperComponent/ReusableDatePicker";
import CustomButton from "../../Shared/NewComponents/CustomButton/CustomButton";
import programIcon from "../../../../photos/Newuiphotos/program/programIcon.svg";
import { useCalendarLogic } from "../../Events/Helpers/eventHooks/useCalendarLogic";
import CustomCalender from "../../Shared/calendar/CustomCalender";
import { format, max, parseISO } from "date-fns";
import { LocationBasedToday } from "../../../../helpers/HelperFunction";
import toast from "react-hot-toast";
// import MasjidsList from "../../../../pages/Shared/MasjidsList/MasjidsList";
import { RecurrenceType } from "../enums/enums";
import { DateObject } from "react-multi-date-picker";
import { ProgramFormData } from "../Types/Types";
import { useAppSelector } from "../../../../redux/hooks";
import { useDisableScrollOnNumberInput } from "../../SharedHelpers/helpers";
import { validateTime } from "../Helper/Functions/validation";
import CarouselImageUploader from "../../Shared/NewComponents/CarouselImageUploader/CarouselImageUploader";
import programmainplaceholder from "../../../../photos/Newuiphotos/events/placeholder/eventcardmain.webp";

export interface ProgramFormFieldsProps {
  isMainAdmin?: boolean;
  isEditMode: boolean;
  formData: ProgramFormData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  images: File[];
  updateProgramPhotos: any;
  handleChange: (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | SelectChangeEvent<unknown>
  ) => void;
  consumerMasjidId: string;
  setIsPreviewVisible: React.Dispatch<React.SetStateAction<boolean>>;
  timingError: boolean;
  setTimingError: React.Dispatch<React.SetStateAction<boolean>>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageDelete: (index: number | string) => void;
  handleDeleteImage: (programImgId: string | number) => void;
  setSelectedMasjids: Dispatch<SetStateAction<Masjid[]>>;
  stripeFields: [boolean, boolean];
}

const ProgramFormFields = ({
  isMainAdmin = false,
  isEditMode,
  formData,
  setFormData,
  images,
  updateProgramPhotos,
  handleChange,
  consumerMasjidId,
  setIsPreviewVisible,
  timingError,
  setTimingError,
  handleImageUpload,
  handleImageDelete,
  handleDeleteImage,
  setSelectedMasjids,
  stripeFields,
}: ProgramFormFieldsProps) => {
  const [isPaymentsSetup, isStripeLoading] = stripeFields;

  const [tZone, setTZone] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [minAgeError, setMinAgeError] = useState(false);
  const [maxAgeError, setMaxAgeError] = useState(false);
  let admin = useAppSelector((state) => state.admin) as AdminInterFace;
  const inputRef = useRef<HTMLInputElement>(null);
  useDisableScrollOnNumberInput(inputRef);

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
      setTZone(masjidData?.location?.timezone ?? "");

      // Call fetchEvents once tZone is set
    }
  }, [masjidData, consumerMasjidId]);
  const checkNextField = (fieldName: "startDate" | "endDate") => {
    // console.log("fieldname", fieldName);
    // setTimeout(() => {
    //   handleToggleCalendar(fieldName);
    // }, 300);
    // handleToggleCalendar(fieldName);
  };
  const {
    isCalendarVisible,
    handleToggleCalendar,
    handleDateSelect,
    selectedDateField,
    startDateError,
    endDateError,
  } = useCalendarLogic(tZone, formData, setFormData, checkNextField);

  useEffect(() => {
    if (!formData.addressDifferentChecked) {
      setFormData({
        ...formData,
        address: masjidData?.address,
      });
    }
  }, [formData.addressDifferentChecked]);
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

  const inputChecker = (isValueExist: any, condition = false) => {
    if (condition && isSubmitting && !isValueExist) return "1px solid red";
    else return isSubmitting && !isValueExist ? styles["error-bdr"] : "";
  };

  const shouldDisableButton = () => {
    let randomOrDailyWeeklyErr = false;
    let ProgramType = formData.recurrenceType.toLowerCase();
    if (
      (ProgramType === RecurrenceType.RANDOM ||
        ProgramType === RecurrenceType.DAILY) &&
      // || ProgramType === RecurrenceType.WEEKLY
      inputChecker(
        (formData?.dates as string[]).length <= 0 ? "" : "noErr",
        true
      )
    ) {
      randomOrDailyWeeklyErr = true;
    }

    return (
      !!startDateError ||
      !!endDateError ||
      timingError ||
      randomOrDailyWeeklyErr ||
      isStripeLoading
    );
  };
  const handlePreviewOpen = (e: any) => {
    setIsSubmitting(true);
    toast.dismiss();
    const requiredFields = [
      "programName",
      "capacity",
      "description",
      "startDate",
      "endDate",
      "startTime",
      "endTime",
      "address",
      "category",
      "dates",
    ];

    if (formData?.registrationOption === "paid") {
      requiredFields.push("cost");
    }

    // Age validation
    if (formData.ageOption === "range") {
      const min = parseInt(formData.minAge.toString(), 10);
      const max = parseInt(formData.maxAge.toString(), 10);

      if (!formData.minAge || !formData.maxAge || isNaN(min) || isNaN(max)) {
        toast.dismiss();
        toast.error("Both Min Age and Max Age Are Required.");
        return;
      }

      if (min > max) {
        toast.dismiss();
        toast.error("Min Age Cannot Be Greater Than Max Age.");
        return;
      }
    }

    let missingFields = [];
    let customError = null;

    for (let field of requiredFields) {
      if (field === "cost") {
        if (
          (formData.cost === null ||
            formData.cost === "" ||
            formData.cost === 0) &&
          formData?.registrationOption === "paid"
        ) {
          customError = "Cost is Required for Paid Programs.";
          missingFields.push(field);
        }
      } else if (field === "dates") {
        const isValidDates = Array.isArray(formData[field])
          ? (formData.recurrenceType === RecurrenceType.WEEKLY &&
              formData[field].length > 0) ||
            ((formData.recurrenceType === RecurrenceType.DAILY ||
              formData.recurrenceType === RecurrenceType.RANDOM) &&
              formData[field].length > 1) ||
            formData.recurrenceType.toLowerCase() === RecurrenceType.NONE
            ? true
            : false
          : false;
        if (!isValidDates) {
          customError =
            formData.recurrenceType === RecurrenceType.WEEKLY
              ? "No Matching Dates Found in the Selected Range and Days."
              : formData.recurrenceType === RecurrenceType.DAILY ||
                formData.recurrenceType === RecurrenceType.RANDOM
              ? "Please Select at Least Two Dates."
              : "";
          missingFields.push(field);
        }
      } else if (field === "capacity") {
        if (
          formData.capacity === null ||
          formData.capacity === undefined ||
          formData.capacity === "" ||
          parseInt(formData.capacity as string) <= 0
        ) {
          customError = "Capacity Must Be a Positive Number.";
          missingFields.push(field);
        }
      } else if (!formData[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length === 0) {
      if (!validateTime(formData, setTimingError)) {
      } else {
        setIsPreviewVisible(true);
        setIsSubmitting(false);
      }
    } else if (missingFields.length === 1 && customError) {
      toast.error(customError);
    } else {
      toast.error("Please fill in all required fields before previewing.....");
    }
  };
  const handleMasjids = (masjids: Masjid[] | null) => {
    if (masjids !== null) {
      setSelectedMasjids(masjids);
    } else {
      setSelectedMasjids([]); // or some other default value
    }
  };
  const UploaderImages = useMemo(() => {
    return updateProgramPhotos.map((img: any, index: number) => {
      if (img instanceof File) {
        return {
          url: URL.createObjectURL(img),
          alt: `Photo ${index}`,
          createdByObjectURL: true,
        };
      } else {
        return {
          url: img,
          alt: `Photo ${index}`,
          createdByObjectURL: false,
        };
      }
    });
  }, [updateProgramPhotos]);
  useEffect(() => {
    return () => {
      UploaderImages.forEach((img) => {
        if (img.createdByObjectURL) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [UploaderImages]);

  return (
    <div
      className={styles["program-form-wrapper"]}
      data-testid="program-form-fields"
    >
      <div className={styles["program-images-container"]}>
        <CarouselImageUploader
          images={UploaderImages}
          onUpload={handleImageUpload}
          onDelete={handleDeleteImage}
          placeholderImg={programmainplaceholder}
          defaultImgStyle={{
            maxHeight: "180px",
            minHeight: "180px",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 45%",
            borderRadius: "20px 20px 20px 20px",
          }}
        ></CarouselImageUploader>
      </div>
      <div className={styles["program-info-container"]}>
        {/* {isMainAdmin ? (
          <MasjidsList
            id={consumerMasjidId}
            handleChange={handleMasjids}
            isMultiple={true}
          />
        ) : null} */}

        <div className={styles.inputField}>
          <label htmlFor="programName">Program Name</label>
          <input
            placeholder=""
            type="text"
            id="programName"
            name="programName"
            data-testid="programName"
            value={formData.programName}
            onChange={handleChange}
            className={inputChecker(formData.programName)}
          />
        </div>

        <div className={styles.inputField}>
          <label htmlFor="programCategory">Program Category</label>
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
              inputProps={{ "data-testid": "category" }}
              name="category"
              className={`${styles.selectInput} ${inputChecker(
                formData.category
              )}`}
              sx={{ width: "100%", borderRadius: "20px" }}
              id="category"
              displayEmpty
              value={formData.category}
              onChange={handleChange}
            >
              <MenuItem value="">
                <em>Categories</em>
              </MenuItem>
              <MenuItem value="Islamic Studies">Islamic Studies</MenuItem>
              <MenuItem value="Community Outreach">Community Outreach</MenuItem>
              <MenuItem value="Health & Wellness">Health & Wellness</MenuItem>
              <MenuItem value="Youth Programs">Youth Program</MenuItem>
              <MenuItem value="Quran Programs">Quran Program</MenuItem>
              <MenuItem value="Family Programs">Family Program</MenuItem>
              <MenuItem value="Women’s Programs">Women’s Program</MenuItem>
              <MenuItem value="Children’s Programs">
                Children’s Program
              </MenuItem>
            </CustomSelect>
          </FormControl>
        </div>

        <div className={styles.inputField}>
          <label>Select Age</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                className={styles.radioInput}
                name="ageOption"
                value="all"
                checked={formData.ageOption === "all"}
                onChange={() =>
                  setFormData((prev: ProgramFormData) => ({
                    ...prev,
                    ageOption: "all",
                    minAge: "",
                    maxAge: "",
                  }))
                }
              />
              <span className={styles.customRadio}></span>
              All Ages
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                className={styles.radioInput}
                name="ageOption"
                value="range"
                checked={formData.ageOption === "range"}
                onChange={() =>
                  setFormData((prev: ProgramFormData) => ({
                    ...prev,
                    ageOption: "range",
                  }))
                }
              />
              <span className={styles.customRadio}></span>
              Choose Range
            </label>
          </div>

          {formData.ageOption === "range" && (
            <div className={styles.ageRangeInputs}>
              <input
                type="number"
                placeholder="Min Age"
                name="minAge"
                value={formData?.minAge}
                onKeyDown={(e) => {
                  // Prevent entering 'e', '-', '+', '.', and any other non-numeric characters
                  if (["e", "E", "+", "-", "0"].includes(e.key)) {
                    if (e.key === "0" && Number(formData.minAge) >= 1) return;
                    else e.preventDefault();
                  }
                  if (e.key.length === 1 && e.key.startsWith("0")) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0 && value <= 100) {
                    handleChange(e);
                  }
                }}
                onBlur={() => {
                  const min = Number(formData.minAge);
                  const max = Number(formData.maxAge);

                  if (min < 0 || min > 100) {
                    setMinAgeError(true); // Set error state
                    toast.error("Min Age Must Be Between 0 and 100.");
                  } else if (max && min > max) {
                    setMinAgeError(true); // Set error state
                    toast.error("Min Age Cannot Be Greater Than Max Age.");
                  } else {
                    setMinAgeError(false); // Clear error state
                  }
                }}
                min="0"
                style={{ border: minAgeError ? "2px solid red" : "" }}
                className={inputChecker(formData.minAge)}
              />
              <input
                type="number"
                name="maxAge"
                placeholder="Max Age"
                value={formData.maxAge}
                onKeyDown={(e) => {
                  // Prevent entering 'e', '-', '+', '.', and any other non-numeric characters
                  if (["e", "E", "+", "-", "0"].includes(e.key)) {
                    if (e.key === "0" && Number(formData.maxAge) >= 1) return;
                    else e.preventDefault();
                  }
                  if (e.key.length === 1 && e.key.startsWith("0")) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0 && value <= 100) {
                    handleChange(e);
                  }
                }}
                onBlur={() => {
                  const min = Number(formData.minAge);
                  const max = Number(formData.maxAge);

                  if (max < 0 || max > 100) {
                    setMaxAgeError(true); // Set error state
                    toast.error("Max Age Must Be Between 0 and 100.");
                  } else if (min && max < min) {
                    setMaxAgeError(true); // Set error state
                    toast.error("Max Age Cannot Be Less Than Min Age.");
                  } else {
                    setMaxAgeError(false); // Clear error state
                  }
                }}
                style={{ border: maxAgeError ? "2px solid red" : "" }}
                min="0"
                className={inputChecker(formData.maxAge)}
              />
            </div>
          )}
        </div>

        <div className={styles["radio-group"]}>
          <RegistrationOptions
            isMainAdmin={isMainAdmin}
            formData={formData}
            stripeFields={stripeFields}
            handleChange={handleChange}
            setFormData={setFormData}
            error={inputChecker(formData.cost) === styles["error-bdr"]}
            isEditMode={isEditMode}
            isMasjidVerified={masjidData.isVerified}
          />
        </div>

        <div className={styles.inputField}>
          <label htmlFor="capacity">Program Capacity</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            placeholder="e.g.500"
            data-testid="capacity"
            value={formData.capacity as string}
            className={inputChecker(formData.capacity)}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onWheel={(e) => e.target.blur()}
            ref={inputRef}
            onChange={(e) => {
              const value = e.target.value;

              if (value.length > 1 && value.startsWith("0")) {
                handleChange({
                  target: { name: "capacity", value: value.slice(1) },
                } as React.ChangeEvent<HTMLInputElement>);
              } else if (value.length === 1 && value.startsWith("0")) {
                e.preventDefault();
              } else {
                handleChange(e);
              }
            }}
          />
        </div>

        <div className={styles.inputField}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className={inputChecker(formData.description)}
          ></textarea>
        </div>

        <ReusableDatePicker
          formData={formData}
          handleChange={handleChange}
          handleToggleCalendar={handleToggleCalendar}
          setFormData={setFormData}
          timingError={timingError}
          setTimingError={setTimingError}
          inputChecker={inputChecker}
          consumerMasjidId={consumerMasjidId}
          isEditMode={isEditMode}
        />

        {Array.isArray(formData.dates) &&
          formData.dates.length > 0 &&
          formData.recurrenceType === RecurrenceType.RANDOM && (
            <div className={styles.readOnlyField}>
              <label htmlFor="randomDates" data-testid="randomDatesLabel">
                Pickup Random Dates
              </label>
              <div
                className={styles.readOnlyValues}
                data-testid="randomDatesValue"
              >
                {Array.isArray(formData.dates)
                  ? formData.dates.map((datevalue: DateObject, index) => (
                      <span key={index} className={styles.readOnlyDate}>
                        {datevalue.format("DD-MMM-YYYY")}
                        {index !== (formData.dates as string[]).length - 1
                          ? ", "
                          : ""}
                      </span>
                    ))
                  : ""}
              </div>
            </div>
          )}
        <div className={styles["addressCheckbox"]}>
          <label htmlFor="addressDifferentChecked">
            If Location Is Different
          </label>
          <Checkbox
            checked={formData.addressDifferentChecked as boolean}
            onChange={handleChange}
            inputProps={{ "aria-label": "controlled" }}
            name="addressDifferentChecked"
            id="addressDifferentChecked"
            sx={{
              "& .MuiSvgIcon-root": {
                width: 20,
                height: 15,
              },
            }}
          />
        </div>

        {formData.addressDifferentChecked ? (
          <div className="form-group">
            <input
              data-testid="address"
              type="text"
              id="address"
              name="address"
              className={inputChecker(formData.address)}
              value={formData?.address}
              onChange={handleChange}
            />
          </div>
        ) : null}
        {admin.role !== "musaliadmin" && (
          <div
            className={`${styles["registrationCheckbox"]} ${
              formData?.registrationOption === "paid" || isEditMode
                ? styles["registrationCheckbox__disabled"]
                : {}
            }`}
            onClick={() => {
              if (isEditMode) {
                toast.dismiss();
                toast.error(
                  "You cannot change the registration options for existing program. Kindly cancel this program and create a new one if needed."
                );
              } else if (formData?.registrationOption === "paid") {
                toast.dismiss();
                toast.error("Registration is Required for Paid Programs.");
              }
            }}
          >
            <label htmlFor="registrationRequired">
              User Registration Required
            </label>
            <Checkbox
              name="registrationRequired"
              checked={formData.registrationRequired as boolean}
              onChange={handleChange}
              disabled={formData?.registrationOption === "paid" || isEditMode}
              inputProps={{ "aria-label": "controlled" }}
              id="registrationRequired"
              sx={{
                "& .MuiSvgIcon-root": {
                  width: 20,
                  height: 15,
                },
              }}
            />
          </div>
        )}

        <div className={styles["next-button-container"]}>
          <CustomButton
            onClick={handlePreviewOpen}
            text="Next"
            iconSrc={programIcon}
            buttonStyle={{
              backgroundColor: shouldDisableButton() ? "grey" : "#1B8368",
              color: "white",
              fontSize: "10px",
              borderRadius: "30px",
              width: "100%",
              ":hover": {
                backgroundColor: shouldDisableButton() ? "grey" : "#1B8368",
              },
              textTransform: "none",
            }}
            iconStyle={{ marginRight: "5px", height: "14px", width: "14px" }}
            // disabled={shouldDisableButton()}
          />
        </div>
      </div>
      <Backdrop
        data-testid="calendar-visible"
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={isCalendarVisible}
        onClick={(event) =>
          handleToggleCalendar(
            event.currentTarget.getAttribute("data-test-id") as
              | "startDate"
              | "endDate"
          )
        }
      >
        <div
          className={styles["program-calendar"]}
          onClick={(e) => {
            e.stopPropagation();
          }}
          style={{ backgroundColor: "#fff", borderRadius: "25px" }}
        >
          {selectedDateField && (
            <div
              style={{
                borderRadius: "25px 0px",
                marginTop: "15px",
                // color: "black",
                textAlign: "center",
                color: "#1d785a",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              {selectedDateField === "startDate"
                ? "Start Date"
                : selectedDateField === "endDate"
                ? "End Date"
                : ""}
            </div>
          )}
          <CustomCalender
            minDate={
              selectedDateField === "endDate" && formData.startDate
                ? new Date(
                    selectedDateField === "endDate" ? formData.startDate : ""
                  )
                : undefined
            }
            tileDisabled={tileDisabled}
            onDateSelect={handleDateSelect}
            value={
              selectedDateField && formData[selectedDateField]
                ? parseISO(String(formData[selectedDateField]))
                : undefined
            }
            setValue={(value) => {
              const dateValue =
                typeof value === "function" ? value(new Date()) : value;
              const formattedDate = format(
                dateValue,
                "yyyy-MM-dd'T'HH:mm:ssxxx"
              );
              setFormData({
                ...formData,
                [selectedDateField]: formattedDate,
              });
            }}
          />
        </div>
      </Backdrop>
    </div>
  );
};

export default ProgramFormFields;
