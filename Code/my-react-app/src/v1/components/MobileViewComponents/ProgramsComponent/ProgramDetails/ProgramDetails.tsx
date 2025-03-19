import { Suspense, useEffect, useMemo, useState } from "react";
import styles from "./ProgramDetails.module.css"; // Updated styles
import BackButton from "../../Shared/BackButton";
import { useNavigationprop } from "../../../../../MyProvider";
import {
  customNavigatorTo,
  dateFormatter,
  dateReverterNew,
  dateReverter,
  useCustomParams,
  UTCTimeConverter,
} from "../../../../helpers/HelperFunction";
import previewMasjid from "../../../../photos/Newuiphotos/Icons/noEvntphoto.svg"; // Updated placeholder
import programCancelRecursive from "../../../../photos/Newuiphotos/program/recursiveProgram.svg";
import programCancelNonRecursive from "../../../../photos/Newuiphotos/program/normalProgram.svg";
import programIcon from "../../../../photos/Newuiphotos/program/programIcon.svg";
import ShareIcon from "../../../../photos/Newuiphotos/ShareIcon.webp";
import edit from "../../../../photos/Newuiphotos/Icons/editwhite.svg";
import del from "../../../../photos/Newuiphotos/events/cancelcross.png";
import { useAppSelector, useAppThunkDispatch } from "../../../../redux/hooks";
import ShareModal from "../../Services/Helpers/ShareModel/ShareModel";
import { adminFromLocalStg } from "../../../../helpers/AdminFromLocalStorage/AdminFromLocalStorage";
import Ticket from "../../Shared/TicketModel/Ticket";
import toast from "react-hot-toast";
import moment from "moment";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
// import { useCancelProgram } from "../../../../graphql-api-calls/Programs/mutation"; // Updated mutation
import { Button, Container, styled } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MessageModel from "../../OtherSalah/helperComponent/messageModel/messageModel";
import TicketManagementTable from "../../Shared/TicketModel/TicketCheckin/TicketManagementTable";
import {
  descriptionScrollable,
  formatDatesWithYearTransition,
  getTimeInTimeZone,
} from "../Helper/Functions";
import useMasjidData from "../../SharedHooks/useMasjidData";
import { BasicButtonStyle, handleBackBtn } from "../../SharedHelpers/helpers";
import CustomButton from "../../Shared/NewComponents/CustomButton/CustomButton";
import { AdminRole, RecurrenceType } from "../enums/enums";
import PieChartComponent from "../../../../helpers/EventPieChart/PieChartComponent";
import FullScreenImageModal from "../../Donation/Carousel/FullScreenImageModal ";
import { ProgramFormData, ProgramType } from "../Types/Types";
import EventDisclaimer from "../../Events/Disclaimer/EventDisclaimer";
import {
  useGetProgramById,
  useRsvpAnalytics,
} from "../../../../graphql-api-calls/Program/query";
import ProgramForm from "../ProgramForm/ProgramForm";
import { useCancelProgram } from "../../../../graphql-api-calls/Program/mutation";
import { shareLink } from "../../OtherSalah/helperFunctions/helperFunc";
import CarouselImageUploader from "../../Shared/NewComponents/CarouselImageUploader/CarouselImageUploader";
import programmainplaceholder from "../../../../photos/Newuiphotos/events/placeholder/eventcardmain.webp";

const StyledButton = styled(Button)<{ selected: boolean }>(
  ({ selected, theme }) => ({
    fontSize: "12px",
    justifyContent: "space-between",
    width: "100%",
    textTransform: "none",
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(2),
    borderRadius: "20px",
    boxShadow: "0px 3px 4px 3px rgba(0, 0, 0, 0.1)",
    border: selected ? `2px solid #1B8368` : "none",
    backgroundColor: selected ? "#FFFFFF" : "transparent",
    color: selected ? "#1B8368" : "black",
  })
);

type pieData = {
  name: string;
  value: number;
  color: string;
};

interface ProgramDetailsProp {
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  formData: ProgramFormData;
  handleSubmit: () => void;
  setIsPreviewVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isMainAdmin: boolean;
  images: File[];
  updateProgramPhotos: any;
}

const ProgramDetails = ({
  isEditMode = true,
  isPreviewMode = false,
  formData,
  handleSubmit,
  setIsPreviewVisible,
  isMainAdmin,
  images,
  updateProgramPhotos,
}: ProgramDetailsProp) => {
  const [programData, setProgramData] = useState<ProgramType | any | null>(
    null
  );
  const [isImageOpenVisible, setIsImageOpenVisible] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState("");
  const [currentImageAlt, setCurrentImageAlt] = useState("");
  const [isShareVisible, setIsShareVisible] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState<boolean>(false);
  const [tZone, setTZone] = useState("");
  const [cancellationType, setCancellationType] = useState<
    "single" | "recurrence" | null
  >("single");
  const [pieData, setPieData] = useState<pieData[]>([]);
  const [showDeleteWarning, setShowDeleteWarning] = useState<boolean>(false);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);

  const navigation = useNavigationprop();
  let admin = useAppSelector((state) => state.admin);
  const dispatch = useAppThunkDispatch();
  const [shareUrl, setShareUrl] = useState("");

  const [showDisclaimer, setDisclaimer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const masjidIdQuery = queryParams.get("masjidId");
  const id = useMemo(() => {
    const idvalue = useCustomParams();
    return idvalue;
  }, []);

  const isNewEvent = queryParams.get("new") === "true";
  const removenew = () => {
    const location = window.location;
    const searchParams = new URLSearchParams(location.search);

    // Remove the 'new' query parameter
    searchParams.delete("new");

    // Update the URL without reloading the page
    window.history.replaceState(
      null,
      "",
      `${location.pathname}?${searchParams.toString()}`
    );
  };
  useEffect(() => {
    if (isNewEvent) {
      setIsShareVisible(true);
      removenew();
    }
  }, [isNewEvent]);

  const { cancelProgram, cancelling, cnclerr } = useCancelProgram(); // Updated cancel hook
  const skipQuery = useMemo(() => {
    return !id || isPreviewMode;
  }, [id, isPreviewMode]);
  const {
    program,
    loading: programLoading,
    error,
    refetch,
  } = useGetProgramById(id, skipQuery); // Updated fetch hook

  const { rsvpData, loading, rsvperror } = useRsvpAnalytics(
    id,
    "program",
    skipQuery
  );

  const consumerMasjidId = masjidIdQuery
    ? masjidIdQuery
    : adminFromLocalStg()?.masjids?.[0];

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
    } else if (masjidDataError) {
      toast.error("Masjid Not Found");
    }
  }, [masjidData, consumerMasjidId, masjidDataError]);

  console.log(formData);

  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      const type = formData.recurrenceType.toLowerCase();
      const Dates: any = formData.dates;
      const startDate =
        type === RecurrenceType.DAILY
          ? Dates[0].format("YYYY-MM-DD")
          : type === RecurrenceType.WEEKLY
          ? Dates[0].format("YYYY-MM-DD")
          : type === RecurrenceType.NONE
          ? formData.startDate
          : Dates[0]?.format("YYYY-MM-DD");
      const endDate =
        type === RecurrenceType.DAILY
          ? Dates[Dates.length - 1]?.format("YYYY-MM-DD")
          : type === RecurrenceType.WEEKLY
          ? Dates[Dates.length - 1]?.format("YYYY-MM-DD")
          : type === RecurrenceType.NONE
          ? formData.endDate
          : type === RecurrenceType.RANDOM && Dates.length > 0
          ? Dates[Dates.length - 1]?.format("YYYY-MM-DD")
          : Dates[0]?.format("YYYY-MM-DD");

      const programData = {
        _id: "",
        programName: formData.programName,
        description: formData.description,
        programProfilePhoto: "",
        dates: formData.dates,
        timings: [
          {
            startTime: UTCTimeConverter(
              formData?.startTime,
              formData.startDate,
              tZone
            ),
            endTime: UTCTimeConverter(
              formData?.endTime,
              formData.endDate,
              tZone
            ),
            __typename: "ProgramTimings",
          },
        ],
        location: {
          type: "Point",
          coordinates: [formData.longitude || "", formData.latitude || ""],
          __typename: "Location",
        },
        metaData: {
          startDate: moment
            .tz(startDate, tZone)
            .startOf("day")
            .utc()
            .toISOString(),
          endDate: moment.tz(endDate, tZone).endOf("day").utc().toISOString(),
          recurrenceType: formData.recurrenceType || "",
          __typename: "ProgramMetaData",
        },
        ageRange: {
          minimumAge: formData.ageOption === "range" ? formData.minAge : 0,
          maximumAge: formData.ageOption === "range" ? formData.maxAge : 0,
        },
        address: formData.address || "",
        capacity: formData.capacity || "",
        availableSeats: formData.capacity || "",
        category: formData.category || "",
        cost: formData.cost,
        isCancelled: false,
        guests: [],
        programPhotos: [],
        isRegistrationRequired: formData.registrationRequired || false,
        stripeProductId: "",
        updatedAt: "",
        createdAt: "",
        __typename: "Program",
      };
      setProgramData(programData);
    }
  }, [formData, tZone]);

  console.log(programData);

  useEffect(() => {
    if (!programLoading && program && tZone && admin.role) {
      setProgramData(program); // Set actual program data

      setShareUrl(shareLink(program._id, "program"));
      if (admin.role !== AdminRole.MUSALI_ADMIN) {
        if (rsvpData) {
          setPieData([
            {
              name: "Attending",
              value: rsvpData?.attending | 0,
              color: "#0EB77F",
            },
            {
              name: "Not Attending",
              value: rsvpData?.notAttending | 0,
              color: "#FF7272",
            },
            {
              name: "Maybe",
              value: rsvpData?.maybe | 0,
              color: "#FFB625",
            },
          ]);
        }
      }
    }
  }, [program, programLoading, tZone, admin, rsvpData]);

  console.log(pieData);

  const handleSelect = (option: "single" | "recurrence") => {
    setCancellationType(option);
  };
  const handleCancelProgram = async (programId: string | undefined) => {
    if (programId) {
      const loadingToast = toast.loading("Please Wait...!");
      try {
        const { data } = await cancelProgram({
          variables: {
            id: programId,
            all: cancellationType === "recurrence",
          },
        });
        toast.dismiss(loadingToast);
        console.log(data);
        if (data.CancelProgram) {
          toast.success("Cancelled Program Successfully");
          if (navigation) {
            navigation(`/feed/9`);
          } else {
            customNavigatorTo(`/feed/9`);
          }
        } else {
          throw new Error("Cancellation Failed");
        }
      } catch (err: any) {
        toast.dismiss(loadingToast);
        toast.error("Failed to Cancel program: " + err.message);
      }
    }
  };

  const handleDeleteClick = () => {
    if (
      admin.role !== AdminRole.SUB_ADMIN &&
      programData?.isRegistrationRequired &&
      programData?.cost !== 0
    ) {
      toast.error("Only Masjid Admin Can Delete Paid Programs");
    } else {
      setShowDeleteWarning(true);
    }
  };
  const handleEditClick = () => {
    if (isPreviewMode) {
      setIsPreviewVisible(false);
    } else {
      setIsFormVisible(true);
    }
  };

  const handleDisclaimerStatus = (sta: boolean) => {
    if (sta) handleSubmit();
  };

  const handleShowDisclaimer = () => {
    setDisclaimer(true);
  };
  const getDateRecurrence = () => {
    if (programData?.metaData?.recurrenceType) {
      if (programData?.metaData?.recurrenceType === RecurrenceType.DAILY) {
        return " (Daily)";
      } else if (
        programData?.metaData?.recurrenceType === RecurrenceType.WEEKLY
      ) {
        if (formData?.days) {
          return ` (Weekly On ${(formData.days as []).join(", ")})`;
        } else {
          return ` (Weekly)`;
        }
      } else if (
        programData?.metaData?.recurrenceType === RecurrenceType.RANDOM
      ) {
        return ` (Random)`;
      }
      return "";
    }
    return "";
  };

  const isPastProgram = () => {
    if (!programData?.metaData?.endDate || !tZone || isPreviewMode)
      return false;
    // Get the start of today in the target time zone.
    const todayStart = moment.tz(tZone).startOf("day");

    // Parse the event's endDate (assumed to be in UTC ISO format),
    // then convert it to the target time zone.
    const eventEndDate = moment.utc(programData?.metaData?.endDate).tz(tZone);

    // Check if the event's end date is before the start of today.
    return eventEndDate.isBefore(todayStart);
  };
  const carouselImages = useMemo(() => {
    if (updateProgramPhotos?.length) {
      return updateProgramPhotos.reduce(
        (acc: any[], img: any, index: number) => {
          if (img instanceof File) {
            acc.push({
              url: URL.createObjectURL(img),
              alt: `Photo ${index}`,
              createdByObjectURL: true,
            });
          } else {
            acc.push({
              url: img,
              alt: `Photo ${index}`,
              createdByObjectURL: false,
            });
          }
          return acc;
        },
        []
      );
    } else if (programData?.programPhotos?.length) {
      return programData.programPhotos.map((img: any, index: number) => ({
        url: img,
        alt: `Photo ${index}`,
        createdByObjectURL: false,
      }));
    } else {
      return [];
    }
  }, [
    isPreviewMode,
    isEditMode,
    images,
    updateProgramPhotos,
    programData?.programPhotos,
  ]);
  useEffect(() => {
    return () => {
      carouselImages.forEach((img: any) => {
        if (img.createdByObjectURL) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [carouselImages]);
  return (
    <>
      {showCheckIn ? (
        <TicketManagementTable
          setShowCheckIn={setShowCheckIn}
          eventData={programData} // Updated to programData
          getTimeInTimeZone={getTimeInTimeZone}
          tZone={tZone}
          admin={admin}
        />
      ) : isFormVisible ? (
        <>
          <ProgramForm // Updated to ProgramForm
            isMainAdmin={isMainAdmin}
            setIsFormVisible={setIsFormVisible}
            refetch={refetch}
            consumerMasjidId={consumerMasjidId}
            programData={programData} // Updated to programData
            isEditMode={isEditMode}
          />
        </>
      ) : (
        <div className={styles["program-details-container"]}>
          <div className={"title-container"} style={{ top: "40px" }}>
            <div className={styles["program-details_goback"]}>
              <BackButton
                handleBackBtn={() =>
                  isPreviewMode
                    ? setIsPreviewVisible(false)
                    : handleBackBtn(navigation, "/feed/9")
                }
              />
            </div>
          </div>
          <div className={styles["program-details-body"]}>
            <div className={styles["program-details-body_container"]}>
              <div className={styles["program-details_carousel"]}>
                {
                  <CarouselImageUploader
                    images={carouselImages}
                    isCarousel={true}
                    placeholderImg={programmainplaceholder}
                    defaultImgStyle={{
                      maxHeight: "200px",
                      minHeight: "200px",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "50% 45%",
                      borderRadius: "20px 20px 20px 20px",
                    }}
                  ></CarouselImageUploader>
                }
              </div>

              <div className={styles["program-details_info"]}>
                <div className={styles["program-details_info-title"]}>
                  <h3
                    className={[
                      styles["title"],
                      programData && isPastProgram()
                        ? styles["past_text"]
                        : programData && programData.isCancelled
                        ? styles["cancel_text"]
                        : "",
                    ].join(" ")}
                  >
                    {" "}
                    {programData ? (
                      programData?.programName
                    ) : (
                      <Skeleton count={1} width={"100px"} />
                    )}
                  </h3>
                  {isPastProgram() && (
                    <div
                      className={[
                        styles["program-details_catagory"],
                        styles["past_background"],
                        ,
                      ].join(" ")}
                    >
                      <p>Past Program</p>
                    </div>
                  )}
                  {programData &&
                    !programData.isCancelled &&
                    !isPastProgram() && (
                      <div className={styles["program-details_actions"]}>
                        {(programData?.metaData.recurrenceType.toLowerCase() ===
                          RecurrenceType.NONE ||
                          isPreviewMode) && (
                          <Button
                            style={{
                              background: "#1B8368",
                              borderRadius: "22px",
                              color: "white",
                              fontSize: "12px",
                              textTransform: "none",
                              padding: "5px 12px",
                              minWidth: "70px",
                              boxShadow: "none",
                            }}
                            variant="contained"
                            startIcon={
                              <img
                                src={edit}
                                alt="edit icon"
                                style={{ width: "13px", height: "13px" }}
                              />
                            }
                            onClick={() => {
                              if (isPastProgram()) {
                                toast.error("Cannot edit past Program");
                              } else handleEditClick();
                            }}
                          >
                            Edit
                          </Button>
                        )}

                        {!isPreviewMode && (
                          <Button
                            style={{
                              // background: "#FF7272",
                              borderRadius: "22px",
                              fontSize: "12px",
                              textTransform: "none",
                              padding: "5px 12px",
                              border: "1px solid #FF7272",
                              color: "#FF7272",
                              boxSizing: "border-box",
                              minWidth: "70px",
                              boxShadow: "none",
                            }}
                            variant="outlined"
                            onClick={() => {
                              if (isPastProgram()) {
                                toast.error("Cannot cancel past Program");
                              } else handleDeleteClick();
                            }}
                          >
                            Cancel{" "}
                          </Button>
                        )}
                      </div>
                    )}
                </div>

                {programData ? (
                  <div
                    className={[
                      styles["program-details_catagory"],
                      programData && isPastProgram()
                        ? styles["past_background"]
                        : programData && programData?.isCancelled
                        ? styles["cancel_background"]
                        : "",
                    ].join(" ")}
                  >
                    <p> {programData?.category}</p>
                  </div>
                ) : (
                  <Skeleton count={1} width={"100px"} />
                )}
                {!isPreviewMode &&
                  programData &&
                  !programData.isRegistrationRequired &&
                  admin?.role !== AdminRole.MUSALI_ADMIN && (
                    <div className={styles["program-details_Piechart"]}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <hr
                          className={styles["program-details_catagory-line"]}
                        />

                        <PieChartComponent pieData={pieData} />
                        <hr
                          className={styles["program-details_catagory-line"]}
                        />
                      </Suspense>
                    </div>
                  )}

                {programData &&
                  programData.isRegistrationRequired &&
                  !programData.isCancelled && (
                    <div>
                      <div
                        onClick={() =>
                          !programData?.isCancelled && !isPreviewMode
                            ? setShowCheckIn(true)
                            : null
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <h4 className={styles["program-details_ticket-header"]}>
                          Ticket will be issued to the user{" "}
                        </h4>
                        <Ticket
                          title={programData?.programName}
                          time={getTimeInTimeZone(
                            programData?.timings[0].startTime,
                            tZone
                          )}
                          date={dateFormatter(
                            dateReverter(programData?.metaData.startDate, tZone)
                          )}
                          seats={programData?.capacity}
                          price={programData?.cost}
                          color={
                            programData?.isCancelled ? "#FFD1D1" : "#C2E8D5"
                          }
                          totalSeatsBooked={
                            programData?.availableSeats
                              ? programData?.availableSeats < 0
                                ? -programData?.availableSeats
                                : programData?.capacity -
                                  programData?.availableSeats
                              : 0
                          }
                          isCancelled={programData?.isCancelled}
                        />
                      </div>
                    </div>
                  )}

                <div className={styles["program-details-column-item"]}>
                  <span>Age Range</span>
                  <p
                    className={`${styles["program-details_texts"]} ${
                      programData?.isCancelled ? styles["gray_text"] : ""
                    }`}
                  >
                    {programData?.ageRange ? (
                      programData?.ageRange.maximumAge === 0 ? (
                        "All Ages"
                      ) : (
                        `${programData?.ageRange.minimumAge} - ${programData?.ageRange.maximumAge} Years`
                      )
                    ) : (
                      <Skeleton count={1} width={"50px"} />
                    )}
                  </p>
                </div>

                {programData && (
                  <div
                    className={[
                      styles["program-details-row"],
                      programData?.isCancelled ? styles["gray_text"] : "",
                    ].join(" ")}
                  >
                    <span>Registration Fees</span>
                    <span
                      className={[
                        styles["program-details-row_value"],
                        programData?.isCancelled ? styles["gray_text"] : "",
                      ].join(" ")}
                    >
                      {programData && programData?.cost !== undefined ? (
                        programData?.cost === 0 ||
                        programData?.cost === "0" ||
                        programData?.cost === null ? (
                          "Free"
                        ) : (
                          `$${programData?.cost}`
                        )
                      ) : (
                        <Skeleton count={1} width={"30px"} />
                      )}
                    </span>
                  </div>
                )}

                <div
                  className={`${styles["program-details-row"]} ${
                    programData?.isCancelled ? styles["gray_text"] : ""
                  }`}
                >
                  <span>Program Capacity</span>
                  <span
                    className={[
                      styles["program-details-row_value"],
                      programData?.isCancelled ? styles["gray_text"] : "",
                    ].join(" ")}
                  >
                    {programData ? (
                      programData?.capacity
                    ) : (
                      <Skeleton count={1} width={"30px"} />
                    )}
                  </span>
                </div>

                {/* Description, Dates, Location in columns */}
                <div
                  className={`${styles["program-details-column"]} ${
                    programData?.isCancelled ? styles["gray_text"] : ""
                  }`}
                >
                  <div className={styles["program-details-column-item"]}>
                    <span style={{ marginBottom: "2px" }}>Description</span>
                    <p
                      className={`${styles["program-details_texts"]} ${
                        programData?.isCancelled ? styles["gray_text"] : ""
                      } ${
                        programData &&
                        descriptionScrollable(programData?.description, 10)
                          ? styles.scrollable
                          : ""
                      }`}
                    >
                      {programData ? (
                        programData?.description
                      ) : (
                        <Skeleton count={3} width={"100%"} />
                      )}
                    </p>
                  </div>

                  {programData?.metaData.recurrenceType.toLowerCase() ===
                  RecurrenceType.NONE ? (
                    <>
                      <div className={styles["program-details-column-item"]}>
                        <span>Start Date & Time</span>
                        <p
                          className={`${styles["program-details_texts"]} ${
                            programData?.isCancelled ? styles["gray_text"] : ""
                          }`}
                        >
                          {programData ? (
                            `${dateFormatter(
                              dateReverter(
                                programData?.metaData.startDate,
                                tZone
                              )
                            )} |
                    ${getTimeInTimeZone(
                      programData?.timings[0].startTime,
                      tZone
                    )}`
                          ) : (
                            <Skeleton count={1} width={"130px"} />
                          )}
                        </p>
                      </div>

                      <div className={styles["program-details-column-item"]}>
                        <span>End Date & Time</span>
                        <p
                          className={`${styles["program-details_texts"]} ${
                            programData?.isCancelled ? styles["gray_text"] : ""
                          }`}
                        >
                          {programData ? (
                            `${dateFormatter(
                              dateReverter(programData?.metaData.endDate, tZone)
                            )}     |  
                    ${getTimeInTimeZone(
                      programData?.timings[0].endTime,
                      tZone
                    )}`
                          ) : (
                            <Skeleton count={1} width={"130px"} />
                          )}
                        </p>
                      </div>
                    </>
                  ) : programData?.metaData.recurrenceType ===
                      RecurrenceType.WEEKLY ||
                    programData?.metaData.recurrenceType ===
                      RecurrenceType.DAILY ||
                    (programData?.metaData.recurrenceType ===
                      RecurrenceType.RANDOM &&
                      !isPreviewMode) ? (
                    <>
                      <div className={styles["program-details-column-item"]}>
                        <span>Start Date & End Date</span>
                        <p
                          className={`${styles["program-details_texts"]} ${
                            programData?.isCancelled ? styles["gray_text"] : ""
                          }`}
                        >
                          {programData ? (
                            <>
                              {moment(programData?.metaData.startDate).format(
                                "DD-MMM-YYYY"
                              )}{" "}
                              To{" "}
                              {moment(programData?.metaData.endDate).format(
                                "DD-MMM-YYYY"
                              )}
                              <b>{getDateRecurrence()}</b>
                            </>
                          ) : (
                            <Skeleton count={1} width={"130px"} />
                          )}
                        </p>
                      </div>

                      <div className={styles["program-details-column-item"]}>
                        <span>Each Day Start & End Time</span>
                        <p
                          className={`${styles["program-details_texts"]} ${
                            programData?.isCancelled ? styles["gray_text"] : ""
                          }`}
                        >
                          {programData ? (
                            `${getTimeInTimeZone(
                              programData?.timings[0].startTime,
                              tZone
                            )}    to  
                    ${getTimeInTimeZone(
                      programData?.timings[0].endTime,
                      tZone
                    )}`
                          ) : (
                            <Skeleton count={1} width={"130px"} />
                          )}
                        </p>
                      </div>
                    </>
                  ) : programData?.metaData.recurrenceType ===
                    RecurrenceType.RANDOM ? (
                    <>
                      <div className={styles["program-details-column-item"]}>
                        <span>Program Happening on</span>
                        <p
                          className={`${styles["program-details_texts"]} ${
                            programData?.isCancelled ? styles["gray_text"] : ""
                          }`}
                        >
                          {Array.isArray(formData.dates) &&
                          formData.dates.length > 0 ? (
                            <>{formatDatesWithYearTransition(formData.dates)}</>
                          ) : (
                            <Skeleton count={1} width={"130px"} />
                          )}
                        </p>
                      </div>
                      <div className={styles["program-details-column-item"]}>
                        <span>Each Day Start & End Time</span>
                        <p
                          className={`${styles["program-details_texts"]} ${
                            programData?.isCancelled ? styles["gray_text"] : ""
                          }`}
                        >
                          {programData ? (
                            `${getTimeInTimeZone(
                              programData?.timings[0].startTime,
                              tZone
                            )}    to  
                    ${getTimeInTimeZone(
                      programData?.timings[0].endTime,
                      tZone
                    )}`
                          ) : (
                            <Skeleton count={1} width={"130px"} />
                          )}
                        </p>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}

                  <div className={styles["program-details-column-item"]}>
                    <span>Location:</span>
                    <p
                      className={`${styles["program-details_texts"]} ${
                        programData?.isCancelled ? styles["gray_text"] : ""
                      }`}
                    >
                      {masjidData?.address === programData?.address ? (
                        masjidData?.masjidName
                      ) : programData?.address ? (
                        programData?.address
                      ) : (
                        <Skeleton count={3} width={"100%"} />
                      )}
                    </p>
                  </div>

                  {isPreviewMode && (
                    <CustomButton
                      text={`Confirm & ${
                        isEditMode ? "Update" : "Add"
                      } Program`}
                      onClick={() => {
                        handleShowDisclaimer();
                      }}
                      buttonStyle={{
                        ...BasicButtonStyle,
                        fontSize: "10px",
                        width: "80%",
                        maxWidth: "300px",
                        margin: "0px auto 15px",
                      }}
                      iconStyle={{
                        height: "14px",
                        width: "14px",
                      }}
                      iconSrc={programIcon}
                      disabled={isSubmitting}
                    />
                  )}
                </div>
                {programData &&
                  !programData?.isCancelled &&
                  !isPreviewMode &&
                  !isPastProgram() && (
                    <div
                      className="serviceShowRegistrationsBtn"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <div className="share-btn">
                        <CustomButton
                          onClick={() => {
                            setIsShareVisible(true);
                          }}
                          text="Share"
                          iconSrc={ShareIcon}
                          buttonStyle={{
                            backgroundColor: "#1D785A",
                            fontSize: "12px",
                            color: "#fff",
                            borderRadius: "20px",
                            cursor: "pointer",
                            textTransform: "none",
                            padding: "5px 25px",
                            "&:hover": {
                              backgroundColor: "#1D785A",
                            },
                          }}
                          iconStyle={{ height: "14px", width: "14px" }}
                        />
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {showDeleteWarning && (
            <MessageModel
              onClose={() => setShowDeleteWarning(false)}
              onConfirm={() => {
                setShowDeleteWarning(false);
                handleCancelProgram(id); // Updated to handleCancelProgram
              }}
              messageType="Cancel Program"
              message={`Are you sure want to cancel this program?`}
              img={
                programData?.metaData.recurrenceType.toLowerCase() ===
                RecurrenceType.NONE
                  ? programCancelNonRecursive
                  : programCancelRecursive
              }
              isLoading={cancelling}
            >
              {programData?.metaData.recurrenceType.toLowerCase() !==
                RecurrenceType.NONE && (
                <Container>
                  <div>
                    <StyledButton
                      selected={cancellationType === "single"}
                      onClick={() => handleSelect("single")}
                      endIcon={
                        cancellationType === "single" ? (
                          <CheckCircleIcon />
                        ) : null
                      }
                    >
                      Cancel This Program{" "}
                      {tZone
                        ? moment(programData?.date)
                            .utc()
                            .tz(tZone)
                            .format("(D MMMM)")
                        : moment(programData?.date).format("(D MMMM)")}
                    </StyledButton>
                    <StyledButton
                      selected={cancellationType === "recurrence"}
                      onClick={() => handleSelect("recurrence")}
                      endIcon={
                        cancellationType === "recurrence" ? (
                          <CheckCircleIcon />
                        ) : null
                      }
                    >
                      Cancel All Programs In This Series
                    </StyledButton>
                  </div>
                </Container>
              )}
            </MessageModel>
          )}

          <EventDisclaimer // Updated to ProgramDisclaimer
            showDisclaimer={showDisclaimer}
            handleDisclaimerStatus={handleDisclaimerStatus}
            setDisclaimer={setDisclaimer}
            setIsSubmitting={setIsSubmitting}
          />

          <FullScreenImageModal
            isOpen={isImageOpenVisible}
            setIsOpen={setIsImageOpenVisible}
            imgSrc={currentImageSrc}
            imgAlt={currentImageAlt}
          />

          {/* <ShareModal
            isOpen={isShareVisible}
            onClose={() => {
              setIsShareVisible(false);
            }}
            assetType="program" // Updated asset type
            id={id}
            consumerMasjidId={consumerMasjidId}
          /> */}

          {programData && (
            <ShareModal
              isOpen={isShareVisible}
              onClose={() => setIsShareVisible(false)}
              shareLink={shareUrl}
              shareType="program" // Based on your context, set this appropriately
              imageUrl={programData?.programPhotos[0]}
              shareDetails={{
                name: programData?.programName || "Unnamed Event",
                masjidName: masjidData?.masjidName || "Unnamed Masjid",
                date: {
                  startDate:
                    moment(programData?.metaData.startDate).format(
                      "DD-MMM-YYYY"
                    ) || "No Date", // Format it properly
                  endDate:
                    moment(programData?.metaData.endDate).format(
                      "DD-MMM-YYYY"
                    ) || "No Date", // Format it properly
                },
                ageRange:
                  programData?.ageRange.maximumAge > 0
                    ? {
                        minAge:
                          programData?.ageRange.minimumAge || "No Age Range",
                        maxAge:
                          programData?.ageRange.maximumAge || "No Age Range",
                      }
                    : 0,
                startTime: programData?.timings[0]?.startTime
                  ? getTimeInTimeZone(programData?.timings[0].startTime, tZone)
                  : "No Time",
                endTime: programData?.timings[0]?.endTime
                  ? getTimeInTimeZone(programData?.timings[0].endTime, tZone)
                  : "No Time",
                location: programData?.address || "No Location",
              }}
              isRegistrationRequired={programData?.isRegistrationRequired}
              id={id}
              consumerMasjidId={consumerMasjidId}
            />
          )}
        </div>
      )}
    </>
  );
};

export default ProgramDetails;
