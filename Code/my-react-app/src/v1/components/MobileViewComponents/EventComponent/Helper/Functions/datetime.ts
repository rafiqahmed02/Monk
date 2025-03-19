import moment from "moment";
import { EventType, Masjid } from "../../../../../redux/Types";
import { RecurrenceType } from "../../enums/enums";

export function formatConvertDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
export const parseTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes), 0);
  return date;
};

export const formatUtcStringToTimeZone = (
  utcString: string,
  tZone: string,
  outputFormat: string
) => {
  if (!utcString || !tZone) return;
  else return moment.utc(utcString).tz(tZone).format(outputFormat);
};

export const getNow = (tZone: string) => {
  const now = tZone ? moment.tz(tZone) : moment();
};

export const getEventFormattedDate=(event:EventType, masjidData:Masjid)=> {
  const timezone = masjidData?.location?.timezone || "";

  // If the event is recurring, use the single event.date value.
  if (event.metaData.recurrenceType !== RecurrenceType.NONE) {
    return formatUtcStringToTimeZone(event?.date ?? "", timezone, "Do MMM");
  }

  // Extract start and end dates from the event metadata.
  const startDate = event?.metaData?.startDate ?? "";
  const endDate = event?.metaData?.endDate ?? "";
  console.log(moment.utc(startDate).tz(timezone).isSame(moment.utc(endDate).tz(timezone), "day"))
  // Compare the dates using moment; if they're the same day, return only the start date.
  if (moment.utc(startDate).tz(timezone).isSame(moment.utc(endDate).tz(timezone), "day")) {
    return formatUtcStringToTimeZone(startDate, timezone, "Do MMM");
  } else {
    // Otherwise, return the range with a dash.
    return `${formatUtcStringToTimeZone(startDate, timezone, "Do MMM")} - ${formatUtcStringToTimeZone(endDate, timezone, "Do MMM")}`;
  }
}