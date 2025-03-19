import React, { useMemo } from "react";
import styles from "./EventCard.module.css";
import clockIcon from "../../../../photos/Newuiphotos/Icons/clock.svg";
import eventPlaceholder from "../../../../photos/placeholder.png";
import eventCardPlaceholder from "../../../../photos/Newuiphotos/events/placeholder/eventcard.webp";

import { AdminInterFace, EventType } from "../../../../redux/Types";
import moment from "moment";
import {
  customNavigatorTo,
  dateReverter,
} from "../../../../helpers/HelperFunction";
import useMasjidData from "../../SharedHooks/useMasjidData";
import { tmFormatter } from "../Helper/Functions";
import clockBlackIcon from "../../../../photos/Newuiphotos/Icons/endevntclock.svg";
import clockRedIcon from "../../../../photos/Newuiphotos/Icons/clockRed.png";
import { useNavigationprop } from "../../../../../MyProvider";
import { useAppSelector } from "../../../../redux/hooks";
import recurrenceIcon from "../../../../photos/Newuiphotos/Icons/recurrence.png";
import CustomToolTip from "../Helper/Components/CustomToolTip";
import { AdminRole, RecurrenceType } from "../enums/enums";


interface EventCardProps {
  selectedDate: Date | undefined;
  event: EventType;
  consumerMasjidId: string;
  openTooltipId: string | null;
  onTooltipToggle: (id: string | null, e: React.MouseEvent) => void;
}

const EventCard = ({
  selectedDate,
  event,
  consumerMasjidId,
  openTooltipId,
  onTooltipToggle,
}: EventCardProps) => {
  const {
    eventName,
    date,
    dates,
    _id,
    timings,
    isCancelled,
    category,
    metaData,
  } = event;
  let admin = useAppSelector((state) => state.admin);
  const navigation = useNavigationprop();
  const adminRole = (admin as AdminInterFace)?.role;
  const masjidIdQuery =
    adminRole === AdminRole.ADMIN || adminRole === AdminRole.SUPER_ADMIN
      ? `?masjidId=${consumerMasjidId}`
      : "";

  const {
    masjidData,
    isLoading: isMasjidDataLoading,
    error: masjidDataError,
  } = useMasjidData(consumerMasjidId);

  // console.log("event", event.eventPhotos.length > 0);

  const convertedDate = dateReverter(
    metaData.recurrenceType === "none" || !selectedDate
      ? metaData.endDate
      : date,
    masjidData?.location?.timezone ?? ""
  );
  const eventDate = moment.tz(
    convertedDate,
    "YYYY-MM-DD",
    masjidData?.location?.timezone ?? ""
  );
  const todayDate = moment.tz(masjidData?.location?.timezone ?? "");
  const isEventPassed = eventDate.isBefore(todayDate, "day");

  const allDates = useMemo(() => {
    if (!dates || dates.length === 0) {
      return masjidData?.location?.timezone
        ? `(${moment(date)
            .utc()
            .tz(masjidData?.location?.timezone)
            .format("D MMM")})`
        : `(${moment(date).utc().format("D MMM")})`; // Return a single formatted date
    }

    // Map and sort the dates
    const sortedDates = dates
      .map((dateStr: moment.MomentInput) =>
        masjidData?.location?.timezone
          ? moment(dateStr).utc().tz(masjidData?.location?.timezone)
          : moment(dateStr).utc()
      ) // Convert to moment objects
      .sort((a: number, b: number) => a - b); // Sort the moment objects

    // Check if recurrence type is "daily"
    if (metaData?.recurrenceType === RecurrenceType.DAILY) {
      const firstDate = sortedDates[0]?.format("Do MMM"); // Get the first date
      const lastDate = sortedDates[sortedDates.length - 1]?.format("Do MMM"); // Get the last date
      return `${firstDate} To ${lastDate}`; // Return the range
    }

    // For other recurrence types, format all dates
    return sortedDates
      .map((dateMoment: { format: (arg0: string) => any }) =>
        dateMoment.format("Do MMM")
      )
      .join(", "); // Combine all dates into a single string
  }, [dates, date, metaData]);

  const eventIcon = isEventPassed ? clockBlackIcon : clockIcon;
  const handleCardClick = () => {
    if (navigation) {
      navigation(`/event-details/${_id}${masjidIdQuery}`);
    } else {
      customNavigatorTo(`/event-details/${_id}${masjidIdQuery}`);
    }
  };

  const isTooltipOpen = openTooltipId === _id; // Determine if this card's tooltip is open

  return (
    <div
      className={`${styles["event-card"]} ${
        isCancelled
          ? styles["cancelled"]
          : isEventPassed
          ? styles["passed"]
          : ""
      }`}
      data-testid={`event-card-${_id}`}
      onClick={handleCardClick}
    >
      <div className={styles["event-card-image-container"]}>
        <img
          src={
            event.eventPhotos.length > 0
              ? event.eventPhotos[0].url
              : eventCardPlaceholder
          }
          alt=""
          width={"100%"}
          height={"100%"}
        />
      </div>
      <div className={styles["event-card-detail-container"]}>
        <div className={styles["event-card-date"]}>
          <img src={isCancelled ? clockRedIcon : eventIcon} alt="" />
          <span
            className={`${styles["event-card__starttime"]} ${
              isCancelled ? styles["cancelledEventDate"] : {}
            }`}
          >
            {tmFormatter(
              timings[0].startTime,
              masjidData?.location?.timezone ?? ""
            )}
          </span>
          <span
            className={`${styles["event-card__finaldates"]} ${
              isCancelled ? styles["cancelledEventDate"] : {}
            }`}
          >
            {/* ({getEventFormattedDate(event, masjidData)}) */}
          </span>
        </div>
        <p className={styles["event-card-category"]}> {category ?? ""}</p>
        <div
          className={`${styles["event-card-title"]} ${
            isCancelled ? styles["cancelledEvent"] : {}
          }`}
        >
          {eventName ?? ""}
        </div>
        <div
          // style={isCancelled ? style.cancelledEvent : style.activeEvent}
          className={`${styles["event-card-location"]}`}
        >
          {masjidData?.masjidName ?? ""}
        </div>
        {event.metaData.recurrenceType !== RecurrenceType.NONE && (
          <CustomToolTip
            recurrenceIcon={recurrenceIcon}
            allDates={allDates}
            isOpen={isTooltipOpen} // Control tooltip visibility
            onToggle={(e: React.MouseEvent<Element, MouseEvent>) =>
              onTooltipToggle(_id, e)
            }
          />
        )}
      </div>
    </div>
  );
};

export default EventCard;
