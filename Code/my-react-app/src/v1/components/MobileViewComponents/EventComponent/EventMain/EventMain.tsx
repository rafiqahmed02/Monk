import { useEffect, useState } from "react";
import styles from "./EventMain.module.css";
import BackButton from "../../Shared/BackButton";
import { useNavigationprop } from "../../../../../MyProvider";
import {
  customNavigatorTo,
  LocationBasedToday,
  UtcDateConverter,
} from "../../../../helpers/HelperFunction";
import CustomButton from "../../Shared/NewComponents/CustomButton/CustomButton";
import eventImg from "../../../../photos/eventIcon.png";
import addeventImg from "../../../../photos/Newuiphotos/events/addevent.png";
import CustomCalender from "../../Shared/NewComponents/CustomCalendar/CustomCalendar";
import EventList from "./EventList";
import useMasjidData from "../../SharedHooks/useMasjidData";
import useFetchEvents from "../Helper/Functions/useFetchEvents";
import moment from "moment-timezone";
import { EventType, RecurrenceBucket } from "../../../../redux/Types";
import { handleSingleDateClick } from "../Helper/Functions";
import EventForm from "../EventForm/EventForm";
import toast from "react-hot-toast";
import { RecurrenceType } from "../enums/enums";

interface EventMainprops {
  consumerMasjidId: string;
  isMainAdmin?: boolean;
}
const EventMain = ({
  consumerMasjidId,
  isMainAdmin = false,
}: EventMainprops) => {
  const navigation = useNavigationprop();
  const {
    masjidData,
    isLoading: isMasjidDataLoading,
    error: masjidDataError,
  } = useMasjidData(consumerMasjidId);

  const {
    combinedEvents,
    isLoading: isEventsLoading,
    error: eventsError,
  } = useFetchEvents(consumerMasjidId, masjidData?.location?.timezone);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [tZone, setTZone] = useState<string>("");
  const [selectedEvents, setSelectedEvents] = useState<EventType[]>([]);
  const [noEventsFound, setNoEventsFound] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null); // Tracks the open tooltip

  const tileContent = ({ date }: { date: Date }) => {
    if (!combinedEvents) return null; // or some fallback

    // Merge non-recurring ("single") and recurring events into one array
    const allMergedEvents = [
      ...combinedEvents.single,
      ...Object.values(combinedEvents.recursive).flatMap((rec) => rec.events),
    ];

    // Some date helpers as in your original code
    const currentDate = LocationBasedToday(tZone);
    currentDate.setDate(currentDate.getDate() - 1);

    if (date) {
      // Format date for comparison
      const dateStringLocal = moment(date).format("YYYY-MM-DD");
      // Convert that date to UTC in your time zone
      const dateStringUTC = UtcDateConverter(dateStringLocal, tZone).split(
        "T"
      )[0];

      // 1) Check if there are *any* events on this date
      const dateHasData = allMergedEvents.some(
        (item) => item.date.split("T")[0] === dateStringUTC
      );

      // 2) All the events that occur on this date
      const eventsOnDate = allMergedEvents.filter(
        (event) => event.date.split("T")[0] === dateStringUTC
      );

      // 3) If *any* of these events is still upcoming (not in the past)
      const anyNonPastEventOnDate: boolean = eventsOnDate.some((event) => {
        const eventDate =
          event.metaData.recurrenceType === "none"
            ? event.metaData.endDate
            : event.date; // or maybe startDate, depending on your logic
        return moment
          .utc(eventDate)
          .tz(tZone)
          .startOf("day")
          .isSameOrAfter(moment.tz(tZone).startOf("day"));
      });

      if (dateHasData && anyNonPastEventOnDate) {
        // 4) Check if *all* events for that day are canceled
        const areAllEventsCancelled = eventsOnDate.every(
          (event) => event.isCancelled
        );
        return areAllEventsCancelled ? (
          <div className="red-dot" />
        ) : (
          <div className="green-dot" />
        );
      } else if (dateHasData) {
        return <div className="grey-dot" data-testid="grey-dot" />;
      }

      return null;
    }

    return null;
  };
  // useEffect(() => {
  //   if (tZone) {
  //     const todayInTZone = LocationBasedToday(tZone);
  //     setSelectedDate(todayInTZone);
  //   }
  // }, [tZone]);
  const handleDateSelect = (selectedDate: Date | undefined) => {
    const eventsSelected = handleSingleDateClick(
      selectedDate,
      combinedEvents,
      tZone
    );
    if (eventsSelected.length === 0) setNoEventsFound(true);
    else setNoEventsFound(false);
    setSelectedEvents(eventsSelected);
  };

  useEffect(() => {
    if (
      masjidData &&
      masjidData.location &&
      masjidData.location.coordinates.length > 1
    ) {
      setTZone(masjidData.location.timezone);

      // Call fetchEvents once tZone is set
      // const fetchData = async () => {
      //   await fetchEvents(consumerMasjidId, masjidData.location.timezone);
      // };

      // fetchData();
    } else {
    }
  }, [masjidData, consumerMasjidId]);
  const showAllEvents = () => {
    setSelectedEvents([]);
    setNoEventsFound(false);
    setSelectedDate(undefined);
  };
  // function compareEvents(a: EventType, b: EventType) {
  //   console.log(a, b);
  //   // Check the pre-computed 'past' property.
  //   if (a.past !== b.past) {
  //     return a.past ? 1 : -1;
  //   }

  //   // For both events (either past or upcoming), determine their effective time.
  //   // For single (non-recurring) events, use metaData.endDate; for recurring, use event.date.
  //   const aTime =
  //     a.metaData.recurrenceType === "none"
  //       ? moment(a.metaData.endDate).valueOf()
  //       : moment(a.date).valueOf();
  //   const bTime =
  //     b.metaData.recurrenceType === "none"
  //       ? moment(b.metaData.endDate).valueOf()
  //       : moment(b.date).valueOf();

  //   // For upcoming events, sort ascending; for past events, sort descending.
  //   return !a.past ? aTime - bTime : bTime - aTime;
  // }

  // Retrieve a filtered list of events.
  // If selectedEvents exists, use those; otherwise, merge non-recurring events
  // with the first instance of each recurring event group.
  // const getFilteredEvents = (): EventType[] => {
  //   if (selectedEvents.length > 0) {
  //     return selectedEvents;
  //   }

  //   if (
  //     !combinedEvents ||
  //     (Object.keys(combinedEvents.recursive).length === 0 &&
  //       combinedEvents.single.length === 0)
  //   ) {
  //     return [];
  //   }

  //   // Combine non-recurring events with one representative from each recurring group.
  //   const combinedFilteredEvents = [
  //     ...combinedEvents.single,
  //     ...Object.values(combinedEvents.recursive).map(
  //       (bucket) => bucket.events[0]
  //     ),
  //   ];

  //   return combinedFilteredEvents;
  // };
  function selectRecurringEvent(
    bucket: RecurrenceBucket
  ): (EventType & { past: boolean }) & { dates: string[] } {
    // Filter for upcoming (non-past) events.
    const upcomingEvents = bucket.events.filter((event) => !event.past);
    if (upcomingEvents.length > 0) {
      // Sort ascending by start date.
      return { ...upcomingEvents[0], dates: bucket.dates };
    } else {
      return {
        ...bucket.events[bucket.events.length - 1],
        dates: bucket.dates,
      };
    }
  }

  /**
   * Simplified comparator using the already-set `past` flag.
   * - Upcoming events come first (sorted ascending by start date).
   * - Past events come later (sorted descending by start date).
   */
  function compareEvents(
    a: EventType & { past?: boolean },
    b: EventType & { past?: boolean }
  ) {
    // Upcoming events before past events.
    if (a.past && !b.past) return 1;
    if (!a.past && b.past) return -1;
    // Both are upcoming: sort ascending by start date.
    if (!a.past && !b.past) {
      const aDate =
        a.metaData.recurrenceType === RecurrenceType.NONE
          ? a.metaData.startDate
          : a.date;
      const bDate =
        b.metaData.recurrenceType === RecurrenceType.NONE
          ? b.metaData.startDate
          : b.date;
      return moment(aDate).valueOf() - moment(bDate).valueOf();
    }
    // Both are past: sort descending by start date (most recent past first).
    const aDate =
      a.metaData.recurrenceType === RecurrenceType.NONE
        ? a.metaData.startDate
        : a.date;
    const bDate =
      b.metaData.recurrenceType === RecurrenceType.NONE
        ? b.metaData.startDate
        : b.date;
    return moment(bDate).valueOf() - moment(aDate).valueOf();
  }

  /**
   * Returns the filtered events for display.
   * If `selectedEvents` exists (has length > 0) we use it; otherwise,
   * we merge non-recurring events and a single representative for each recurrence.
   *
   * For recurring events, we pick the first upcoming event if available;
   * if not, the most recent past event. The returned event is attached with the
   * full dates list (`dates`) for that recurrence.
   */
  const getFilteredEvents = (): (EventType & { past?: boolean } & {
    dates?: string[];
  })[] => {
    // Condition 1: if selectedEvents has data, return those.
    if (selectedEvents.length > 0) {
      return selectedEvents;
    }

    // Condition 2: if combinedEvents doesn't have any data, return [].
    if (
      !combinedEvents ||
      (Object.keys(combinedEvents.recursive).length === 0 &&
        combinedEvents.single.length === 0)
    ) {
      return [];
    }

    // Start with non-recurring events.
    let combinedFilteredEvents = [...combinedEvents.single];

    // For each recurrence bucket, select the best event.
    Object.keys(combinedEvents.recursive).forEach((recurrenceId) => {
      const bucket = combinedEvents.recursive[recurrenceId];
      const selectedEvent = selectRecurringEvent(bucket);
      combinedFilteredEvents.push(selectedEvent);
    });

    return combinedFilteredEvents;
  };

  // Later in your code, you would sort the events as:
  console.log(getFilteredEvents());
  const events = getFilteredEvents().sort(compareEvents);
  console.log(events);
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
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      // console.log(startOfMonth);
      return providedDate < startOfMonth;
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
  useEffect(() => {
    if (masjidDataError) {
      toast.dismiss();
      toast.error("Error Loading Masjid Info...");
    } else if (eventsError) {
      toast.dismiss();
      toast.error("Error Loading Events Info...");
    }
  }, [masjidDataError || eventsError]);

  if (isFormVisible)
    return (
      <>
        <EventForm
          isMainAdmin={isMainAdmin}
          setIsFormVisible={setIsFormVisible}
          consumerMasjidId={consumerMasjidId}
        />
      </>
    );
  return (
    <div
      className={styles["event-main"]}
      data-testid="event-main"
      onScroll={() => {
        setOpenTooltipId(null);
      }}
    >
      <div className={"title-container"}>
        <div className="goback">
          {/* <div> */}
          <BackButton
            handleBackBtn={navigation ? navigation : customNavigatorTo}
            isHome={true}
          />
          {/* </div> */}
        </div>
        <h3
          className="page-title"
          data-testid="page-title"
          style={{ color: "#054635" }}
        >
          Events
        </h3>
      </div>
      <div
        className={styles["event-main-body-container"]}
        data-testid="event-main-body-container"
        onScroll={() => {
          setOpenTooltipId(null);
        }}
      >
        <div className={styles["event-main-body"]}>
          <div className={styles["calendar-container"]}>
            <CustomCalender
              value={selectedDate}
              setValue={setSelectedDate}
              onDateSelect={handleDateSelect}
              tileContent={tileContent}
              minDate={
                new Date(
                  LocationBasedToday(tZone).getFullYear(),
                  LocationBasedToday(tZone).getMonth(),
                  1
                )
              }
              tileDisabled={tileDisabled}
            />
            <CustomButton
              text="Add Events"
              onClick={() => {
                setIsFormVisible(true);
              }}
              iconSrc={eventImg}
              buttonStyle={{
                marginTop: "20px",
                backgroundColor: "#1B8368",
                color: "white",
                fontSize: "10px",
                borderRadius: "30px",
                width: "200px",
                display: "none",
                "@media (min-width: 768px)": {
                  display: "inline-flex",
                },
                ":hover": {
                  backgroundColor: "#1B8368",
                },
              }}
              iconStyle={{ marginRight: "5px", height: "14px", width: "14px" }}
            />
          </div>

          <EventList
            showAllEvents={showAllEvents}
            noEventsFound={noEventsFound}
            selectedDate={selectedDate}
            isLoading={isMasjidDataLoading || isEventsLoading}
            events={events}
            consumerMasjidId={consumerMasjidId}
            openTooltipId={openTooltipId}
            setOpenTooltipId={setOpenTooltipId}
          />
        </div>
      </div>
      <CustomButton
        onClick={() => {
          setIsFormVisible(true);
        }}
        text=""
        iconSrc={addeventImg}
        buttonStyle={{
          position: "fixed",
          right: "27px",
          bottom: "55px",
          backgroundColor: "#1B8368",
          color: "white",
          borderRadius: "12px",
          padding: "15px",
          display: "inline-flex",
          zIndex: "2",
          "@media (min-width: 768px)": {
            display: "none",
          },
          ":hover": {
            backgroundColor: "#1B8368",
          },
        }}
        iconStyle={{ height: "25px", width: "25px" }}
      />
    </div>
  );
};

export default EventMain;
