import moment from "moment";
import toast from "react-hot-toast";
import { TimingsFetch } from "../../../../PrayerCalculation/Adhan";
import { NamajTiming, PrayerMethod } from "../../../../redux/Types";
import { UTCExtendedTiming } from "./helpers";
import { UtcDateConverter } from "../../../../helpers/HelperFunction";

type GetFinalTimingsProps = {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  AdminMasjidState: any;
  selectedDateArray: string[];
  inputtedTimings: NamajTiming<string>[];
  tZone: string;
  selectedMethod: string;
  selectedAsrJurisdiction: Partial<PrayerMethod>;
};

export const getFinalTimings = ({
  setIsLoading,
  AdminMasjidState,
  selectedDateArray,
  inputtedTimings,
  tZone,
  selectedMethod,
  selectedAsrJurisdiction,
}: GetFinalTimingsProps) => {
  setIsLoading(true);
  const StartDate = selectedDateArray[0];
  const EndDate = selectedDateArray[1]?selectedDateArray[1]:selectedDateArray[0];
  // Only used to get difference in days so doesnt matter no need time zone
  const selectedStartDate = moment(StartDate);
  const selectedEndDate = moment(EndDate);

  const difference = selectedEndDate.diff(selectedStartDate, "days") + 1;

  if (difference >= 5) {
    toast.loading(
      "We're updating Salah timing, Please don't close your browser or use the back button!"
    );
  }

  const mergedTiming1 = [...inputtedTimings];
  const lon = AdminMasjidState.location.coordinates[0];
  const lat = AdminMasjidState.location.coordinates[1];
  const masjidCoordinates = { latitude: lat, longitude: lon };

  const allTimingsData = TimingsFetch(
    masjidCoordinates,
    selectedDateArray,
    mergedTiming1,
    tZone,
    selectedMethod,
    selectedAsrJurisdiction
  );
  console.log(allTimingsData)
  // Prepare the structure for the uploaded data
  let TimingsUploadData = [];
  let dateCounter = moment(StartDate);

  for (let i = 0; i < difference; i++) {
    let currentDate = dateCounter.format("YYYY-MM-DD");
    let dailyTimings = allTimingsData.slice(i * 5, (i + 1) * 5);
    let hasError = false;
    let dailyProcessedTimings: any[] = [];
    for(let j = 0; j < dailyTimings.length; j++) {

      const Namaaz = dailyTimings[j];
      const namaazAzaanTime = UTCExtendedTiming(
        Namaaz.TimesByAzaan,
        Namaaz.azaanTime,
        Namaaz.ExtendedAzaanMinutes,
        Namaaz.type,
        true,
        currentDate,
        false,
        inputtedTimings,
        tZone
      );

      const namaazJamaatTime = UTCExtendedTiming(
        Namaaz.TimesByJamaat,
        Namaaz.jamaatTime,
        Namaaz.ExtendedJamaatMinutes + Namaaz.ExtendedAzaanMinutes,
        Namaaz.type,
        false,
        currentDate,
        false,
        inputtedTimings,
        tZone
      );
      console.log(namaazAzaanTime, namaazJamaatTime);
      if (namaazJamaatTime && moment.unix(namaazAzaanTime).isAfter(moment.unix(namaazJamaatTime))) {
        hasError = true;
        break;
      }

      dailyProcessedTimings.push({
        namazName: Namaaz.namazName,
        type: Namaaz.type,
        azaanTime: namaazAzaanTime,
        jamaatTime: namaazJamaatTime,
        offset: {
          iqamah: Namaaz.ExtendedJamaatMinutes,
          azaan: Namaaz.ExtendedAzaanMinutes,
        },
        iqamahType: Namaaz.TimesByJamaat,
      });
      // return {
      //   namazName: Namaaz.namazName,
      //   type: Namaaz.type,
      //   azaanTime: namaazAzaanTime,
      //   jamaatTime: namaazJamaatTime,
      //   offset: {
      //     iqamah: Namaaz.ExtendedJamaatMinutes,
      //     azaan: Namaaz.ExtendedAzaanMinutes,
      //   },
      //   iqamahType: Namaaz.TimesByJamaat,
      // };
    }
    if(hasError) {  break;}
    // const dailyProcessedTimings = dailyTimings.map(Namaaz => {
      
    // });

    dailyProcessedTimings.sort((a, b) => a.type - b.type);

    const prayerInfo = {
      prayerTiming: dailyProcessedTimings,
      prayerType:
        selectedMethod === "Hanafi" ? "Manual" : "Maliki/Shafi'i/Hanbali",
    };

    TimingsUploadData.push(prayerInfo);
    dateCounter.add(1, "days");
  }

  toast.dismiss();
  let TimingDataToUpload: { date: string; timings: any }[] = [];
  let newStartDate = moment.tz(StartDate, "YYYY-MM-DD", tZone); // Explicitly set timezone
  
  TimingsUploadData.map((timings: any, key: number) => {
    let date = moment(newStartDate)
      .add(key, "days")
      .format("YYYY-MM-DD");
    console.log("updating for ", date, "results in", UtcDateConverter(date, tZone))
    console.log("data", timings.prayerTiming)
    let timingstoupload = { 
      date: UtcDateConverter(date, tZone),
      timings: timings.prayerTiming,
      prayerType: timings.prayerType,
      prayerMethod: selectedAsrJurisdiction.id?.toString(),
    };
    TimingDataToUpload.push(timingstoupload);
  });                  
  
  return TimingDataToUpload;
  
};
