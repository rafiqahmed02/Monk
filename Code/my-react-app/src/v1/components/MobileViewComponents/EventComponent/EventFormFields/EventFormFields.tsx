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
import styles from "./EventFormFields.module.css";
import { AdminInterFace, EventFormData, Masjid } from "../../../../redux/Types";
import {
  CustomFormControl,
  CustomSelect,
} from "../../Programs/Main/ProgramForm/StyledButtons";
import useStripeStatus from "../../../../helpers/StripeConnectHelper/useStripeStatus";
import { useAppSelector } from "../../../../redux/hooks";
import RegistrationOptions from "../Helper/Components/RegistrationOptions";
import useMasjidData from "../../SharedHooks/useMasjidData";
import ReusableDatePicker from "../helperComponent/ReusableDatePicker";
import CustomButton from "../../Shared/NewComponents/CustomButton/CustomButton";
import eventImg from "../../../../photos/eventIcon.png";
import { useCalendarLogic } from "../../Events/Helpers/eventHooks/useCalendarLogic";
import CustomCalender from "../../Shared/calendar/CustomCalender";
import { format, parseISO } from "date-fns";
import { LocationBasedToday } from "../../../../helpers/HelperFunction";
import toast from "react-hot-toast";
import MasjidsList from "../../../../pages/Shared/MasjidsList/MasjidsList";
import moment from "moment";
import { RecurrenceType } from "../enums/enums";
import { DateObject } from "react-multi-date-picker";
import { useDisableScrollOnNumberInput } from "../../SharedHelpers/helpers";
import { validateTime } from "../Helper/Functions/validation";
import CarouselImageUploader from "../../Shared/NewComponents/CarouselImageUploader/CarouselImageUploader";
import eventmainplaceholder from "../../../../photos/Newuiphotos/events/placeholder/eventcardmain.webp";

export interface EventFormFieldsProps {
  isMainAdmin?: boolean;
  isEditMode: boolean;
  formData: EventFormData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  images: File[];
  updateEventPhotos: any;
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
  // handleDeleteImage: (eventImgId: string) => void;
  setSelectedMasjids: Dispatch<SetStateAction<Masjid[]>>;
  stripeFields: [boolean, boolean];
}
const EventFormFields = ({
  isMainAdmin = false,
  isEditMode,
  formData,
  setFormData,
  images,
  updateEventPhotos,
  handleChange,
  consumerMasjidId,
  setIsPreviewVisible,
  timingError,
  setTimingError,
  handleImageUpload,
  handleImageDelete,
  // handleDeleteImage,
  setSelectedMasjids,
  stripeFields,
}: EventFormFieldsProps) => {
  const [isPaymentsSetup, isStripeLoading] = stripeFields;

  const [tZone, setTZone] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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
    let eventType = formData.recurrenceType;
    if (
      (eventType === RecurrenceType.RANDOM ||
        eventType === RecurrenceType.DAILY) &&
      // || eventType === RecurrenceType.WEEKLY
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
      "eventName",
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

    let missingFields = []; // Track all missing fields
    let customError = null; // Track if a custom error should be shown

    for (let field of requiredFields) {
      if (field === "cost") {
        if (
          (formData.cost === null ||
            formData.cost === "" ||
            formData.cost === 0) &&
          formData?.registrationOption === "paid"
        ) {
          customError = "Cost is Required for Paid Events.";
          missingFields.push(field);
        }
      } else if (field === "dates") {
        console.log("formData[field]", formData[field]);
        const isValidDates = Array.isArray(formData[field])
          ? (formData.recurrenceType === RecurrenceType.WEEKLY &&
              formData[field].length > 0) ||
            ((formData.recurrenceType === RecurrenceType.DAILY ||
              formData.recurrenceType === RecurrenceType.RANDOM) &&
              formData[field].length > 1) ||
            formData.recurrenceType === RecurrenceType.NONE
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
        missingFields.push(field); // General missing field
      }
    }
    // Decide what error to show
    if (missingFields.length === 0) {
      if (!validateTime(formData, setTimingError)) {
      } else {
        setIsPreviewVisible(true);
        setIsSubmitting(false);
      }
    } else if (missingFields.length === 1 && customError) {
      toast.error(customError); // Show custom error if only one issue and it's custom
    } else {
      toast.error("Please fill in all required fields before previewing."); // General error
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
    const isValidImageType = (file: File) => file?.type?.startsWith("image/");

    if (!images || !Array.isArray(images)) {
      return []; // Return an empty array if images is undefined or not an array
    }

    if (!isEditMode && images.length) {
      const validImages = images.filter(isValidImageType);

      return validImages.reduce((acc, curr, index) => {
        acc.push({
          url: URL.createObjectURL(curr),
          alt: `Photo ${index}`,
          createdByObjectURL: true,
        });
        return acc;
      }, [] as { url: string; alt: string; createdByObjectURL: boolean }[]);
    } else if (isEditMode) {
      const validImages = images.filter(isValidImageType);

      return [
        ...updateEventPhotos.map((image) => ({
          url: image.url,
          alt: `Photo ${updateEventPhotos.indexOf(image)}`,
          _id: image._id,
          createdByObjectURL: false,
        })),
        ...validImages.map((image, index) => ({
          url: URL.createObjectURL(image),
          alt: `Photo ${index + updateEventPhotos.length}`,
          createdByObjectURL: true,
        })),
      ];
    }
    return [];
  }, [isEditMode, images, updateEventPhotos]);

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
      className={styles["event-form-wrapper"]}
      data-testid="event-form-fields"
    >
      <div className={styles["event-images-container"]}>
        <CarouselImageUploader
          images={UploaderImages}
          onUpload={handleImageUpload}
          onDelete={handleImageDelete}
          placeholderImg={eventmainplaceholder}
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
      <div className={styles["event-info-container"]}>
        {isMainAdmin && !isEditMode ? (
          <MasjidsList
            id={consumerMasjidId}
            handleChange={handleMasjids}
            isMultiple={true}
          />
        ) : null}

        <div className={styles.inputField}>
          <label htmlFor="eventName">Event Name</label>
          <input
            placeholder=""
            type="text"
            id="eventName"
            name="eventName"
            data-testid="eventName"
            value={formData.eventName}
            onChange={handleChange}
            className={inputChecker(formData.eventName)}
          />
        </div>

        <div className={styles.inputField}>
          <label htmlFor="eventCategory">Event Category</label>
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
              // data-testid="category"
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
              </MenuItem>{" "}
              <MenuItem value="Charity Event">Charity Event</MenuItem>
              <MenuItem value="Educational Event">Educational Event</MenuItem>
              <MenuItem value="Eid Event">Eid Event</MenuItem>
              <MenuItem value="Family Event">Family Event</MenuItem>
              <MenuItem value="Health Event">Health Event</MenuItem>
              <MenuItem value="Islamic Event">Islamic Event</MenuItem>
              <MenuItem value="Kids Event">Kids Event</MenuItem>
              <MenuItem value="Social Event">Social Event</MenuItem>
              <MenuItem value="Sports Event">Sports Event</MenuItem>
            </CustomSelect>
          </FormControl>
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
          <label htmlFor="capacity">Event Capacity</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            placeholder="e.g.500"
            data-testid="capacity"
            value={formData.capacity as string}
            onWheel={(e) => e.target.blur()} // Prevents scroll changes
            ref={inputRef}
            // onChange={handleChange}
            className={inputChecker(formData.capacity)}
            onKeyDown={(e) => {
              console.log("e.key", e.key);
              if (["e", "E", "+", "-"].includes(e.key)) {
                console.log("ignoring");
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const value = e.target.value;

              // Check if the value starts with a zero and has more than one digit
              if (value.length > 1 && value.startsWith("0")) {
                // Remove the leading zero
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
            // style={checkError("description")}
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
              <label data-testid="randomDatesLabel">Pickup Random Dates</label>
              <div
                className={styles.readOnlyValues}
                data-testid="randomDatesValue"
              >
                {formData.dates.map((datevalue: DateObject, index) => (
                  <>
                    {/* <div>{datevalue}</div> */}
                    <span key={index} className={styles.readOnlyDate}>
                      {datevalue.format("DD-MMM-YYYY")}
                      {index !== (formData.dates as string[]).length - 1
                        ? ", "
                        : ""}
                    </span>
                  </>
                ))}
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
                  "You cannot change the registration options for existing event. Kindly cancel this event and create a new one if needed."
                );
              } else if (formData?.registrationOption === "paid") {
                toast.dismiss();
                toast.error("Registration is Required for Paid Events.");
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
            iconSrc={eventImg}
            buttonStyle={{
              backgroundColor: shouldDisableButton() ? "grey" : "#1B8368",
              color: "white",
              fontSize: "10px",
              borderRadius: "30px",
              // maxWidth: "250px",
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
          className={styles["event-calendar"]}
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

export default EventFormFields;
