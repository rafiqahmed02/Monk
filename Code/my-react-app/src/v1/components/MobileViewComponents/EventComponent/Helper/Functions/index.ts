import moment from "moment-timezone";
import {
  dateFormatter,
  dateReverter,
  UtcDateConverter,
} from "../../../../../helpers/HelperFunction";
import { CombinedEvents, EventType } from "../../../../../redux/Types";
import toast from "react-hot-toast";
import { DateObject } from "react-multi-date-picker";
import { RecurrenceType } from "../../enums/enums";

export const tmFormatter = (tm?: number, tZone?: string) => {
  if (!tm || !tZone) return "--:--";
  return moment.unix(tm).tz(tZone).format("hh:mm A");
};

export const handleSingleDateClick = (
  date: Date | undefined,
  combinedEvents: CombinedEvents,
  tZone: string
) => {
  if (!date) return [];
  
  // Format the provided date as local and then convert it to UTC based on tZone.
  const formattedDate = moment(date).format("YYYY-MM-DD");
  const targetDateUTC = UtcDateConverter(formattedDate, tZone).split("T")[0];
  const matchedEvents: any[] = [];

  // Check non-recurring events (single)
  combinedEvents.single.forEach((event) => {
    const eventDate = event.metaData.startDate.split("T")[0];
    if (eventDate === targetDateUTC) {
      matchedEvents.push(event);
    }
  });

  // Check recurring events from each recurrence bucket.
  Object.values(combinedEvents.recursive).forEach((recurrenceBucket) => {
    recurrenceBucket.events.forEach((event) => {
      const eventDate = event.date.split("T")[0];
      if (eventDate === targetDateUTC) {
        console.log(recurrenceBucket)
        console.log({...event, dates:recurrenceBucket.dates})
        matchedEvents.push({...event,dates: recurrenceBucket.dates});
      }
    });
  });

  return matchedEvents;
};

export const getTimeInTimeZone = (
  timestamp: number | undefined,
  tZone: string
): string => {
  if (!tZone || !timestamp) {
    toast.error("There is something wrong with Time Zone");
    return "";
  }

  if (timestamp) return moment.unix(timestamp).tz(tZone).format("hh:mm A");
  else return "00:00";
};
const MONTH_SHORTS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const descriptionScrollable = (
  description: string,
  wordLimit: number = 10
) => {
  if (description) {
    const wordCount = description.split(" ").length;
    if (wordCount > wordLimit) {
      return true;
    }
  }
  return false;
};
export function formatDatesWithYearTransition(dateObjects:DateObject[]) {
  if (!Array.isArray(dateObjects) || dateObjects.length === 0) return "";

  // 1. Sort by year, then month, then day
  dateObjects.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.month !== b.month) return a.month.number - b.month.number;
    return a.day - b.day;
  });

  const result = [];
  let currentYear = dateObjects[0].year;

  for (let i = 0; i < dateObjects.length; i++) {
    const { year, month, day } = dateObjects[i];
    const next = dateObjects[i + 1];

    // Check if next date is in a different year
    const nextYear = next?.year ?? null;
    const isYearTransition = !next || year !== nextYear;

    if (isYearTransition) {
      // Append year if it's the last of the year or last in the array
      result.push(`${day} ${MONTH_SHORTS[month.number - 1]}, ${year}`);
    } else {
      // Otherwise omit the year
      result.push(`${day} ${MONTH_SHORTS[month.number - 1]}`);
    }

    currentYear = nextYear || currentYear;
  }

  return result.join(" | ");
}
