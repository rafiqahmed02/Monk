import moment from "moment";
import { NamajTiming } from "../../../../redux/Types";
import { UTCTimeConverter } from "../../../../helpers/HelperFunction";

export const UTCExtendedTiming = (
  timeStatus: string | undefined,
  prayerTime: any,
  ExtendedMinutes: number | undefined,
  type: number | undefined,
  isAzn: boolean,
  date: string,
  isSingle: boolean = false,
  inputtedTimings: NamajTiming<string>[],
  tZone: string
): number => {
  if (timeStatus && ExtendedMinutes !== undefined) {
    if (timeStatus === "solar" || timeStatus === "nonHanafy") {
      // console.log("timeStatus", timeStatus);
      // console.log("isSingle", isSingle);
      const localTime = moment
        .unix(isSingle ? UTCTimeConverter(prayerTime, date, tZone) : prayerTime)
        .tz(tZone);

      const updatedMoment = localTime.add(ExtendedMinutes, "minutes");
      const updatedTimestamp = updatedMoment.clone().tz("UTC").unix();
      return updatedTimestamp;
    } else if (timeStatus === "manual") {
      if (isSingle) {
        const unixVal = UTCTimeConverter(prayerTime, date, tZone);
        return unixVal;
      }
      const mergedTimings = [...inputtedTimings]; //to fix the magrib namz issue
      // console.log("mergedTimings", mergedTimings);
      // let NamazData = inputtedTimings.filter((item) => item.type === type);
      let NamazData = mergedTimings.filter(item => item.type === type);
      // console.log("NamazData", NamazData);
      const tm = isAzn ? NamazData[0].azaanTime : NamazData[0].jamaatTime;
      const unixVal = UTCTimeConverter(tm, date, tZone);
      return unixVal;
    } else if (timeStatus === "No Iqama") {
      return 0;
    }
  }
  return 0;
};
