import { Suspense, useEffect, useMemo, useState } from "react";
import styles from "./EventDetails.module.css";
import BackButton from "../../Shared/BackButton";
import { useNavigationprop } from "../../../../../MyProvider";
import {
  customNavigatorTo,
  dateFormatter,
  dateReverter,
  dateReverterNew,
  useCustomParams,
  UtcDateConverter,
  UTCTimeConverter,
} from "../../../../helpers/HelperFunction";
import FullScreenImageModal from "../../Donation/Carousel/FullScreenImageModal ";
import previewMasjid from "../../../../photos/Newuiphotos/Icons/noEvntphoto.svg";
import eventCancel from "../../../../photos/Newuiphotos/Common/event_can.svg";
import eventCancelNonRecursive from "../../../../photos/Newuiphotos/Common/cancel_non_recursive.svg";
import ShareIcon from "../../../../photos/Newuiphotos/ShareIcon.webp";
import edit from "../../../../photos/Newuiphotos/Icons/editwhite.svg";
import del from "../../../../photos/Newuiphotos/events/cancelcross.png";
import PieChartComponent from "../../../../helpers/EventPieChart/PieChartComponent";
import { useAppSelector, useAppThunkDispatch } from "../../../../redux/hooks";
import ShareModal from "../../Services/Helpers/ShareModel/ShareModel";
// import ShareModal from "../../Services/Helpers/ShareButtons/ShareButtons";

import { adminFromLocalStg } from "../../../../helpers/AdminFromLocalStorage/AdminFromLocalStorage";
import Ticket from "../../Shared/TicketModel/Ticket";
import toast from "react-hot-toast";
import moment from "moment-timezone";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useCancelEvent } from "../../../../graphql-api-calls/Events/mutation";
import { useGetEvent } from "../../../../graphql-api-calls/Events/query";
import { EventFormData, EventType } from "../../../../redux/Types";
import { Button, Container, styled } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MessageModel from "../../OtherSalah/helperComponent/messageModel/messageModel";
import { FetchRSVPByEventId } from "../../../../redux/actions/EventActions/FetchingEventRsvp";
import TicketManagementTable from "../../Shared/TicketModel/TicketCheckin/TicketManagementTable";
import {
  descriptionScrollable,
  formatDatesWithYearTransition,
  getTimeInTimeZone,
} from "../Helper/Functions";
import useMasjidData from "../../SharedHooks/useMasjidData";
import { BasicButtonStyle, handleBackBtn } from "../../SharedHelpers/helpers";
import CustomButton from "../../Shared/NewComponents/CustomButton/CustomButton";
import EventForm from "../EventForm/EventForm";
import eventImg from "../../../../photos/eventIcon.png";
import eventmainplaceholder from "../../../../photos/Newuiphotos/events/placeholder/eventcardmain.webp";

import EventDisclaimer from "../../Events/Disclaimer/EventDisclaimer";
import { AdminRole, RecurrenceType } from "../enums/enums";
import { shareLink } from "../../OtherSalah/helperFunctions/helperFunc";
import { useRsvpAnalytics } from "../../../../graphql-api-calls/Program/query";
import CarouselImageUploader from "../../Shared/NewComponents/CarouselImageUploader/CarouselImageUploader";

const StyledButton = styled(Button)<{ selected: boolean }>(
  ({ selected, theme }) => ({
    fontSize: "13px",
    justifyContent: "space-between",
    width: "100%",
    textTransform: "none",
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(2),
    borderRadius: "20px",
    boxShadow: "0px 3px 4px 3px rgba(0, 0, 0, 0.1)",
    border: selected ? `2px solid #1B8368` : "none",
    backgroundColor: selected ? "#FFFFFF  " : "transparent",
    color: selected ? "#1B8368" : "black",
  })
);

type pieData = {
  name: string;
  value: number;
  color: string;
};
interface EventDetailsProp {
  isEditMode?: boolean;
  isPreviewMode?: boolean;
  formData: EventFormData;
  handleSubmit: () => void;
  setIsPreviewVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isMainAdmin: boolean;
  images: File[];
  updateEventPhotos: any;
}
const EventDetails = ({
  isEditMode = true,
  isPreviewMode = false,
  formData,
  handleSubmit,
  setIsPreviewVisible,
  isMainAdmin,
  images,
  updateEventPhotos,
}: EventDetailsProp) => {
  const [eventData, setEventData] = useState<EventType | any | null>(null);
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

  const [showDisclaimer, setDisclaimer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

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

  const { cancelEvent, cancelling, cnclerr } = useCancelEvent();
  const skipQuery = useMemo(() => {
    return !id || isPreviewMode;
  }, [id, isPreviewMode]);

  const {
    event,
    loading: eventLoading,
    error,
    refetch,
  } = useGetEvent(id, skipQuery);

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
  const isPastEvent = () => {
    if (!eventData?.metaData?.endDate || !tZone || isPreviewMode) return false;
    // Get the start of today in the target time zone.
    const todayStart = moment.tz(tZone).startOf("day");
    const selectedDate =
      eventData?.metaData?.recurrenceType === RecurrenceType.NONE
        ? eventData?.metaData?.endDate
        : eventData?.date;
    // Parse the event's endDate (assumed to be in UTC ISO format),
    // then convert it to the target time zone.
    const eventEndDate = moment.utc(selectedDate).tz(tZone);
    // Check if the event's end date is before the start of today.
    return eventEndDate.isBefore(todayStart);
  };
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      const type = formData.recurrenceType;
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
      const eventData = {
        _id: "", // Assuming this remains static
        eventName: formData.eventName, // From formData
        description: formData.description, // From formData
        eventProfilePhoto: "", // Left blank since it's not in formData
        // date: new Date(formData.startDate).toISOString(), // Convert startDate to ISO format
        dates: formData.dates,
        timings: [
          {
            startTime: UTCTimeConverter(
              formData?.startTime,
              formData.startDate,
              tZone
            ), // Convert startTime to Unix timestamp
            endTime: UTCTimeConverter(
              formData?.endTime,
              formData.endDate,
              tZone
            ), // Convert endTime to Unix timestamp
            // startTime: moment(formData.startTime, "HH:mm").unix(), // Convert startTime to Unix timestamp
            // endTime: moment(formData.endTime, "HH:mm").unix(), // Convert endTime to Unix timestamp
            __typename: "EventTimings",
          },
        ],
        location: {
          type: "Point",
          coordinates: [formData.longitude || "", formData.latitude || ""], // Coordinates from formData, leave blank if not available
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
          __typename: "EventMetaData",
        },
        address: formData.address || "", // Left blank if not available
        capacity: formData.capacity || "", // Left blank if not available
        availableSeats: formData.capacity || "", // Assuming it's the same as capacity, leave blank if not available
        category: formData.category || "", // Left blank if not available
        cost: formData.cost, // Left blank if not available
        isCancelled: false, // Default to false if not available
        guests: [], // Left empty as no guests in formData
        eventPhotos: [], // Left empty as no eventPhotos in formData
        isRegistrationRequired: formData.registrationRequired || false, // Default to false if not available
        stripeProductId: "", // Left blank as it's not in formData
        updatedAt: "", // Left blank for now, assuming this is handled by the backend
        createdAt: "", // Left blank for now, assuming this is handled by the backend
        __typename: "Event",
      };
      setEventData(eventData);
    }
  }, [formData, tZone]);

  const { rsvpData, loading, rsvperror } = useRsvpAnalytics(
    id,
    "event",
    !id || isPreviewMode
  );

  useEffect(() => {
    if (!eventLoading && event && tZone && admin.role) {
      setEventData(event.event); // Set actual event data
      setShareUrl(shareLink(event.event._id, "event"));

      if (admin.role !== AdminRole.MUSALI_ADMIN && rsvpData) {
        setPieData([
          {
            name: "Attending",
            value: rsvpData.attending || 0,
            color: "#0EB77F",
          },
          {
            name: "Not Attending",
            value: rsvpData.notAttending || 0,
            color: "#FF7272",
          },
          {
            name: "Maybe",
            value: rsvpData.maybe || 0,
            color: "#FFB625",
          },
        ]);
      }
    }
  }, [event, eventLoading, tZone, admin, rsvpData]);

  const handleSelect = (option: "single" | "recurrence") => {
    setCancellationType(option);
  };
  const handleCancelEvent = async (eventId: string | undefined) => {
    if (eventId) {
      const loadingToast = toast.loading("Please wait...!");
      try {
        const { data } = await cancelEvent({
          variables: {
            id: eventId,
            all: cancellationType === "recurrence",
          },
        });

        toast.dismiss(loadingToast);
        if (data.cancelEvent) {
          toast.success("Cancelled Event Successfully");
          if (navigation) {
            navigation(`/feed/4`);
          } else {
            customNavigatorTo(`/feed/4`);
          }
        } else {
          throw new Error("Cancellation Failed!");
        }
      } catch (err: any) {
        toast.dismiss(loadingToast);
        toast.error("Failed to Cancel Event: " + err.message);
      }
    }
  };

  const handleDeleteClick = () => {
    if (
      admin.role !== AdminRole.SUB_ADMIN &&
      eventData?.isRegistrationRequired &&
      eventData?.cost !== 0
    ) {
      toast.error("Only Masjid Admin can delete paid events");
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
    if (eventData?.metaData?.recurrenceType) {
      if (eventData?.metaData?.recurrenceType === RecurrenceType.DAILY) {
        return " (Daily)";
      } else if (
        eventData?.metaData?.recurrenceType === RecurrenceType.WEEKLY
      ) {
        if (formData?.days) {
          return ` (Weekly On ${(formData.days as []).join(", ")})`;
        } else {
          return ` (Weekly)`;
        }
      } else if (
        eventData?.metaData?.recurrenceType === RecurrenceType.RANDOM
      ) {
        return ` (Random)`;
      }
      return "";
    }
    return "";
  };

  const carouselImages = useMemo(() => {
    if (isPreviewMode) {
      if (!isEditMode && images?.length) {
        return images.reduce(
          (
            acc: { url: string; alt: string; createdByObjectURL: boolean }[],
            curr,
            index
          ) => {
            acc.push({
              url: URL.createObjectURL(curr),
              alt: `Photo ${index}`,
              createdByObjectURL: true, // Mark this URL as created by URL.createObjectURL
            });
            return acc;
          },
          []
        );
      } else if (isEditMode) {
        return [
          ...updateEventPhotos.map((image: any) => ({
            url: image.url,
            alt: `Photo ${updateEventPhotos.indexOf(image)}`,
            createdByObjectURL: false,
            _id: image._id,
          })),
          ...images.map((image, index) => ({
            url: URL.createObjectURL(image),
            alt: `Photo ${index + updateEventPhotos.length}`,
            createdByObjectURL: true,
          })),
        ];
      } else {
        return [];
      }
    } else if (!isPreviewMode && eventData?.eventPhotos?.length) {
      return eventData.eventPhotos.reduce((acc, curr, index) => {
        acc.push({
          url: curr.url,
          alt: `Photo ${index}`,
          createdByObjectURL: false,
          _id: curr._id,
        });
        return acc;
      }, []);
    } else {
      return [];
    }
  }, [
    isPreviewMode,
    isEditMode,
    images,
    updateEventPhotos,
    eventData?.eventPhotos,
  ]);
  useEffect(() => {
    return () => {
      carouselImages.forEach((image: any) => {
        if (image.createdByObjectURL) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [carouselImages]);
  return (
    <>
      {showCheckIn ? (
        <TicketManagementTable
          setShowCheckIn={setShowCheckIn}
          eventData={eventData}
          getTimeInTimeZone={getTimeInTimeZone}
          tZone={tZone}
          admin={admin}
        />
      ) : isFormVisible ? (
        <EventForm
          isMainAdmin={isMainAdmin}
          setIsFormVisible={setIsFormVisible}
          refetch={refetch}
          consumerMasjidId={consumerMasjidId}
          eventData={eventData}
          isEditMode={isEditMode}
        />
      ) : (
        <div className={styles["event-details-container"]}>
          {/* <div className={"title-container"}> */}
          <div
            className={styles["event-details_goback"]}
            style={{ top: "40px" }}
          >
            <BackButton
              handleBackBtn={() =>
                isPreviewMode
                  ? setIsPreviewVisible(false)
                  : handleBackBtn(navigation, "/feed/4")
              }
            />
            {/* </div> */}
          </div>
          <div className={styles["event-details-body"]}>
            <div className={styles["event-details-body_container"]}>
              <div className={styles["event-details_carousel"]}>
                {
                  <CarouselImageUploader
                    images={carouselImages}
                    isCarousel={true}
                    placeholderImg={eventmainplaceholder}
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

              <div
                className={styles["event-details_info"]}
                data-testid="event-details_info"
              >
                <div className={styles["event-details_info-title"]}>
                  <h3
                    className={[
                      styles["title"],
                      eventData && isPastEvent()
                        ? styles["past_text"]
                        : eventData && eventData.isCancelled
                        ? styles["cancel_text"]
                        : "",
                    ].join(" ")}
                    data-testid="cancelText"
                  >
                    {eventData ? (
                      eventData?.eventName
                    ) : (
                      <div data-testid="eventname-skeleton">
                        <Skeleton count={1} width={"100px"} />
                      </div>
                    )}
                  </h3>
                  {isPastEvent() && (
                    <div
                      className={[
                        styles["event-details_catagory"],
                        styles["past_background"],
                        ,
                      ].join(" ")}
                    >
                      <p>Past Event</p>
                    </div>
                  )}
                  {eventData && !eventData.isCancelled && !isPastEvent() && (
                    <div className={styles["event-details_actions"]}>
                      {(eventData?.metaData.recurrenceType ===
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
                            if (isPastEvent()) {
                              toast.dismiss();
                              toast.error("Cannot Edit Past Events");
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
                            if (isPastEvent()) {
                              toast.dismiss();
                              toast.error("Cannot Cancel Past Events");
                            } else handleDeleteClick();
                          }}
                        >
                          Cancel{" "}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {eventData ? (
                  <div
                    className={[
                      styles["event-details_catagory"],
                      eventData && isPastEvent()
                        ? styles["past_background"]
                        : eventData && eventData.isCancelled
                        ? styles["cancel_background"]
                        : "",
                    ].join(" ")}
                  >
                    <p> {eventData?.category}</p>
                  </div>
                ) : (
                  <div data-testid="event-category-skeleton">
                    <Skeleton count={1} width={"100px"} />
                  </div>
                )}
                {!isPreviewMode &&
                  eventData &&
                  !eventData.isRegistrationRequired &&
                  admin?.role !== AdminRole.MUSALI_ADMIN && (
                    <div className={styles["event-details_Piechart"]}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <hr className={styles["event-details_catagory-line"]} />

                        <PieChartComponent pieData={pieData} />
                        <hr className={styles["event-details_catagory-line"]} />
                      </Suspense>
                    </div>
                  )}

                {eventData &&
                  eventData.isRegistrationRequired &&
                  !eventData.isCancelled && (
                    <div>
                      <div
                        onClick={() =>
                          !eventData?.isCancelled && !isPreviewMode
                            ? setShowCheckIn(true)
                            : null
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <h4 className={styles["event-details_ticket-header"]}>
                          Ticket will be issued to the user{" "}
                        </h4>
                        <Ticket
                          title={eventData?.eventName}
                          time={getTimeInTimeZone(
                            eventData?.timings[0].startTime,
                            tZone
                          )}
                          date={dateFormatter(
                            dateReverter(
                              eventData?.metaData?.recurrenceType ===
                                RecurrenceType.NONE
                                ? eventData?.metaData.startDate
                                : eventData?.date,
                              tZone
                            )
                          )}
                          seats={eventData?.capacity}
                          price={eventData?.cost}
                          color={eventData?.isCancelled ? "#FFD1D1" : "#C2E8D5"}
                          totalSeatsBooked={
                            !isNaN(Number(eventData?.capacity)) &&
                            !isNaN(Number(eventData?.availableSeats))
                              ? Math.max(
                                  0,
                                  Number(eventData?.capacity) -
                                    Number(eventData?.availableSeats)
                                )
                              : 0
                          }
                          isCancelled={eventData?.isCancelled}
                        />
                      </div>
                    </div>
                  )}
                {/* Registration Fees and Capacity in row */}
                {eventData && (
                  <div
                    className={[
                      styles["event-details-row"],
                      eventData?.isCancelled ? styles["gray_text"] : "",
                    ].join(" ")}
                  >
                    <span>Registration Fees</span>
                    <span
                      className={[
                        styles["event-details-row_value"],
                        eventData?.isCancelled ? styles["gray_text"] : "",
                      ].join(" ")}
                    >
                      {eventData && eventData?.cost !== undefined ? (
                        eventData?.cost === 0 ||
                        eventData?.cost === "0" ||
                        eventData?.cost === null ? (
                          "Free"
                        ) : (
                          `$${eventData?.cost}`
                        )
                      ) : (
                        <div data-testid="event-cost-skeleton">
                          <Skeleton count={1} width={"30px"} />
                        </div>
                      )}
                    </span>
                  </div>
                )}

                <div
                  className={`${styles["event-details-row"]} ${
                    eventData?.isCancelled ? styles["gray_text"] : ""
                  }`}
                >
                  <span>Event Capacity</span>
                  <span
                    className={[
                      styles["event-details-row_value"],
                      eventData?.isCancelled ? styles["gray_text"] : "",
                    ].join(" ")}
                  >
                    {eventData ? (
                      eventData?.capacity
                    ) : (
                      <div data-testid="event-capacity-skeleton">
                        <Skeleton count={1} width={"30px"} />
                      </div>
                    )}
                  </span>
                </div>

                {/* Description, Dates, Location in columns */}
                <div
                  className={`${styles["event-details-column"]} ${
                    eventData?.isCancelled ? styles["gray_text"] : ""
                  }`}
                >
                  <div className={styles["event-details-column-item"]}>
                    <span style={{ marginBottom: "2px" }}>Description</span>
                    <p
                      className={`${styles["event-details_texts"]} ${
                        eventData?.isCancelled ? styles["gray_text"] : ""
                      } ${
                        eventData &&
                        descriptionScrollable(eventData?.description, 10)
                          ? styles.scrollable
                          : ""
                      }`}
                    >
                      {eventData ? (
                        eventData?.description
                      ) : (
                        <div data-testid="event-description-skeleton">
                          <Skeleton count={3} width={"100%"} />
                        </div>
                      )}
                    </p>
                  </div>

                  {eventData?.metaData.recurrenceType ===
                  RecurrenceType.NONE ? (
                    <>
                      <div className={styles["event-details-column-item"]}>
                        <span>Start Date & Time</span>
                        <p
                          className={`${styles["event-details_texts"]} ${
                            eventData?.isCancelled ? styles["gray_text"] : ""
                          }`}
                        >
                          {eventData ? (
                            `${dateFormatter(
                              dateReverter(eventData?.metaData.startDate, tZone)
                            )} |
                    ${getTimeInTimeZone(
                      eventData?.timings[0].startTime,
                      tZone
                    )}`
                          ) : (
                            <div data-testid="event-startdatetime-skeleton">
                              <Skeleton count={1} width={"130px"} />
                            </div>
                          )}
                        </p>
                      </div>

                      <div className={styles["event-details-column-item"]}>
                        <span>End Date & Time</span>
                        <p
                          className={`${styles["event-details_texts"]} ${
                            eventData?.isCancelled ? styles["gray_text"] : ""
                          }`}
                        >
                          {eventData ? (
                            `${dateFormatter(
                              dateReverter(eventData?.metaData.endDate, tZone)
                            )}    |  
                    ${getTimeInTimeZone(eventData?.timings[0].endTime, tZone)}`
                          ) : (
                            <div data-testid="event-enddatetime-skeleton">
                              <Skeleton count={1} width={"130px"} />
                            </div>
                          )}
                        </p>
                      </div>
                    </>
                  ) : eventData?.metaData.recurrenceType ===
                      RecurrenceType.WEEKLY ||
                    eventData?.metaData.recurrenceType ===
                      RecurrenceType.DAILY ||
                    (eventData?.metaData.recurrenceType ===
                      RecurrenceType.RANDOM &&
                      !isPreviewMode) ? (
                    <>
                      <div className={styles["event-details-column-item"]}>
                        <span>Start Date & End Date</span>
                        <p
                          className={`${styles["event-details_texts"]} ${
                            eventData?.isCancelled ? styles["gray_text"] : ""
                          }`}
                        >
                          {eventData ? (
                            <>
                              {moment
                                .utc(eventData?.metaData.startDate)
                                .tz(tZone)
                                .format("DD-MMM-YYYY")}{" "}
                              To{" "}
                              {moment
                                .utc(eventData?.metaData.endDate)
                                .tz(tZone)
                                .format("DD-MMM-YYYY")}
                              <b>{getDateRecurrence()}</b>
                            </>
                          ) : (
                            <div data-testid="event-recur-weekly-date">
                              <Skeleton count={1} width={"130px"} />
                            </div>
                          )}
                        </p>
                      </div>

                      <div className={styles["event-details-column-item"]}>
                        <span>Each Day Start & End Time</span>
                        <p
                          className={`${styles["event-details_texts"]} ${
                            eventData?.isCancelled ? styles["gray_text"] : ""
                          }`}
                        >
                          {eventData ? (
                            `${getTimeInTimeZone(
                              eventData?.timings[0].startTime,
                              tZone
                            )}    to  
                    ${getTimeInTimeZone(eventData?.timings[0].endTime, tZone)}`
                          ) : (
                            <div data-testid="event-recur-weekly-time">
                              <Skeleton count={1} width={"130px"} />
                            </div>
                          )}
                        </p>
                      </div>
                    </>
                  ) : eventData?.metaData.recurrenceType ===
                      RecurrenceType.RANDOM && isPreviewMode ? (
                    <>
                      <div className={styles["event-details-column-item"]}>
                        <span>Event Happening on</span>
                        <p
                          className={`${styles["event-details_texts"]} ${
                            eventData?.isCancelled ? styles["gray_text"] : ""
                          }`}
                        >
                          {/* {eventData ? (
                            `${dateFormatter(
                              dateReverter(eventData?.metaData.startDate, tZone)
                            )} To 
                        ${dateFormatter(
                          dateReverter(eventData?.metaData.endDate, tZone)
                        )}`
                          ) : (
                            <Skeleton count={1} width={"130px"} />
                          )} */}

                          {Array.isArray(formData.dates) &&
                          formData.dates.length > 0 ? (
                            <>{formatDatesWithYearTransition(formData.dates)}</>
                          ) : (
                            <div data-testid="event-recur-random-date">
                              <Skeleton count={1} width={"130px"} />
                            </div>
                          )}
                        </p>
                      </div>
                      <div className={styles["event-details-column-item"]}>
                        <span>Each Day Start & End Time</span>
                        <p
                          className={`${styles["event-details_texts"]} ${
                            eventData?.isCancelled ? styles["gray_text"] : ""
                          }`}
                        >
                          {`${getTimeInTimeZone(
                            eventData?.timings[0].startTime,
                            tZone
                          )}    to  
                    ${getTimeInTimeZone(eventData?.timings[0].endTime, tZone)}`}
                        </p>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}

                  <div className={styles["event-details-column-item"]}>
                    <span>Location:</span>
                    <p
                      className={`${styles["event-details_texts"]} ${
                        eventData?.isCancelled ? styles["gray_text"] : ""
                      }`}
                    >
                      {masjidData?.address === eventData?.address ? (
                        masjidData?.masjidName
                      ) : eventData?.address ? (
                        eventData?.address
                      ) : (
                        <div data-testid="event-location-skeleton">
                          <Skeleton count={3} width={"100%"} />
                        </div>
                      )}
                    </p>
                  </div>

                  {isPreviewMode && (
                    <CustomButton
                      text={`Confirm & ${isEditMode ? "Update" : "Add"} Event`}
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
                      iconSrc={eventImg}
                      disabled={isSubmitting}
                    />
                  )}
                </div>
                {eventData &&
                  !eventData?.isCancelled &&
                  !isPreviewMode &&
                  !isPastEvent() && (
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
                handleCancelEvent(id);
              }}
              messageType="Cancel Event"
              message={`Are you sure want to cancel this event?`}
              img={
                eventData?.metaData.recurrenceType === RecurrenceType.NONE
                  ? eventCancelNonRecursive
                  : eventCancel
              }
              isLoading={cancelling}
            >
              {eventData?.metaData.recurrenceType !== RecurrenceType.NONE && (
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
                      Cancel This Event{" "}
                      {tZone
                        ? moment(eventData?.date)
                            .utc()
                            .tz(tZone)
                            .format("(D MMMM)")
                        : moment(eventData?.date).format("(D MMMM)")}
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
                      Cancel All Events in This Series
                    </StyledButton>
                  </div>
                </Container>
              )}
            </MessageModel>
          )}

          <EventDisclaimer
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
            assetType="event"
            id={id}
            consumerMasjidId={consumerMasjidId}
          /> */}

          {eventData && (
            <ShareModal
              isOpen={isShareVisible}
              onClose={() => {
                setIsShareVisible(false);
              }}
              shareLink={shareUrl}
              imageUrl={eventData?.eventPhotos[0]}
              shareType="event" // Based on your context, set this appropriately
              shareDetails={{
                name: eventData?.eventName || "Unnamed Event",
                masjidName: masjidData?.masjidName || "Unnamed Masjid",
                date: {
                  startDate:
                    moment(eventData?.metaData.startDate).format(
                      "DD-MMM-YYYY"
                    ) || "No Date", // Format it properly
                  endDate:
                    moment(eventData?.metaData.endDate).format("DD-MMM-YYYY") ||
                    "No Date", // Format it properly
                },
                startTime: eventData?.timings[0]?.startTime
                  ? getTimeInTimeZone(eventData?.timings[0].startTime, tZone)
                  : "No Time",
                endTime: eventData?.timings[0]?.endTime
                  ? getTimeInTimeZone(eventData?.timings[0].endTime, tZone)
                  : "No Time",
                location: eventData?.address || "No Location",
              }}
              isRegistrationRequired={eventData?.isRegistrationRequired}
              id={id}
              consumerMasjidId={consumerMasjidId}
            />
          )}
        </div>
      )}
    </>
  );
};

export default EventDetails;
