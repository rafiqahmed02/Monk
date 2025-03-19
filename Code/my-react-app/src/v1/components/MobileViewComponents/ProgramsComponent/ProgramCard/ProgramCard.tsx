import React, { useMemo } from "react";
import styles from "./ProgramCard.module.css"; // Update with the new CSS module for programs
import clockIcon from "../../../../photos/Newuiphotos/Icons/clock.svg";
import programCardPlaceholder from "../../../../photos/Newuiphotos/events/placeholder/eventcard.webp";

import { AdminInterFace } from "../../../../redux/Types"; // Updated type
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
import { ProgramType } from "../Types/Types";

interface ProgramCardProps {
  selectedDate: Date | undefined;
  program: ProgramType; // Updated type to ProgramType
  consumerMasjidId: string;
  openTooltipId: string | null;
  onTooltipToggle: (id: string | null, e: React.MouseEvent) => void;
}

const ProgramCard = ({
  selectedDate,
  program,
  consumerMasjidId,
  openTooltipId,
  onTooltipToggle,
}: ProgramCardProps) => {
  const {
    programName,
    date,
    dates,
    _id,
    timings,
    isCancelled,
    category,
    metaData,
  } = program;
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

  const convertedDate = dateReverter(
    metaData.recurrenceType === "none" || !selectedDate
      ? metaData.endDate
      : date,
    masjidData?.location?.timezone ?? ""
  );
  const programDate = moment.tz(
    convertedDate,
    "YYYY-MM-DD",
    masjidData?.location?.timezone ?? ""
  );
  const todayDate = moment.tz(masjidData?.location?.timezone ?? "");
  const isProgramPassed = programDate.isBefore(todayDate, "day");

  const allDates = useMemo(() => {
    if (!dates || dates.length === 0) {
      return masjidData?.location?.timezone
        ? `(${moment(date)
            .utc()
            .tz(masjidData?.location?.timezone)
            .format("D MMM")})`
        : `(${moment(date).utc().format("D MMM")})`; // Return a single formatted date
    }

    const sortedDates = dates
      .map((dateStr: moment.MomentInput) =>
        masjidData?.location?.timezone
          ? moment(dateStr).utc().tz(masjidData?.location?.timezone)
          : moment(dateStr).utc()
      )
      .sort((a: { diff: (arg0: any) => any }, b: any) => a.diff(b)); // Sort the moment objects

    if (metaData?.recurrenceType === RecurrenceType.DAILY) {
      const firstDate = sortedDates[0]?.format("Do MMM");
      const lastDate = sortedDates[sortedDates.length - 1]?.format("Do MMM");
      return `${firstDate} To ${lastDate}`;
    }

    return sortedDates
      .map((dateMoment: { format: (arg0: string) => any }) =>
        dateMoment.format("Do MMM")
      )
      .join(", ");
  }, [dates, date, metaData]);

  const finalDates = useMemo(() => {
    if (!dates || dates.length === 0) {
      return masjidData?.location?.timezone
        ? `(${moment(date)
            .utc()
            .tz(masjidData?.location?.timezone)
            .format("D MMM")})`
        : `(${moment(date).utc().format("D MMM")})`;
    }

    const formattedDates = dates
      .map((dateStr: moment.MomentInput) =>
        masjidData?.location?.timezone
          ? moment(dateStr).utc().tz(masjidData?.location?.timezone)
          : moment(dateStr).utc()
      )
      .sort((a: { diff: (arg0: any) => any }, b: any) => a.diff(b))
      .map((dateMoment: { format: (arg0: string) => any }) =>
        dateMoment.format("Do MMM")
      );

    const limitedDates = formattedDates.slice(0, 2);

    if (formattedDates.length > 3) {
      limitedDates.push("...");
      limitedDates.push(formattedDates[formattedDates.length - 1]);
    }

    return `(${limitedDates.join(", ")})`;
  }, [dates, date]);

  const programIcon = isProgramPassed ? clockBlackIcon : clockIcon;

  const handleCardClick = () => {
    if (navigation) {
      navigation(`/program-details/${_id}${masjidIdQuery}`);
    } else {
      customNavigatorTo(`/program-details/${_id}${masjidIdQuery}`);
    }
  };

  const isTooltipOpen = openTooltipId === _id;

  return (
    <div
      className={`${styles["program-card"]} ${
        isCancelled
          ? styles["cancelled"]
          : isProgramPassed
          ? styles["passed"]
          : ""
      }`}
      data-testid={`program-card-${_id}`}
      onClick={handleCardClick}
    >
      <div className={styles["program-card-image-container"]}>
        <img
          src={program?.programPhotos[0] || programCardPlaceholder}
          alt=""
          width={"100%"}
          height={"100%"}
        />
      </div>
      <div className={styles["program-card-detail-container"]}>
        <div className={styles["program-card-date"]}>
          <img src={isCancelled ? clockRedIcon : programIcon} alt="" />
          <span
            className={`${styles["program-card__starttime"]} ${
              isCancelled ? styles["cancelledProgramDate"] : {}
            }`}
          >
            {tmFormatter(
              timings[0].startTime,
              masjidData?.location?.timezone ?? ""
            )}
          </span>
          <span
            className={`${styles["program-card__finaldates"]} ${
              isCancelled ? styles["cancelledProgramDate"] : {}
            }`}
          >
            {finalDates}
          </span>
        </div>
        <p className={styles["program-card-category"]}> {category ?? ""}</p>
        <div
          className={`${styles["program-card-title"]} ${
            isCancelled ? styles["cancelledProgram"] : {}
          }`}
        >
          {programName ?? ""}
        </div>
        <div className={`${styles["program-card-location"]}`}>
          {masjidData?.masjidName ?? ""}
        </div>
        {program.metaData.recurrenceType.toLowerCase() !==
          RecurrenceType.NONE && (
          <CustomToolTip
            recurrenceIcon={recurrenceIcon}
            allDates={allDates}
            isOpen={isTooltipOpen}
            onToggle={(e: React.MouseEvent<Element, MouseEvent>) =>
              onTooltipToggle(_id, e)
            }
          />
        )}
      </div>
    </div>
  );
};

export default ProgramCard;
