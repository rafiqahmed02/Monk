import React, { useEffect, useState } from "react";
import styles from "./Programs.module.css";
import BackButton from "../../Shared/BackButton";
import { useNavigationprop } from "../../../../../MyProvider";
import {
  customNavigatorTo,
  LocationBasedToday,
  UtcDateConverter,
} from "../../../../helpers/HelperFunction";
import CustomButton from "../../Shared/NewComponents/CustomButton/CustomButton";
import noProgram from "../../../../photos/Newuiphotos/program/noProgram.webp";
import addProgramIcon from "../../../../photos/Newuiphotos/program/program-add.webp";
import CustomCalendar from "../../Shared/NewComponents/CustomCalendar/CustomCalendar";
import useMasjidData from "../../SharedHooks/useMasjidData";
import moment from "moment";
import { handleSingleDateClick } from "../Helper/Functions";
import { useFetchPrograms } from "../Helper/Functions/useFetchPrograms";
import { ProgramType } from "../Types/Types";
import ProgramList from "./ProgramList";
import ProgramForm from "../ProgramForm/ProgramForm";
import toast from "react-hot-toast";

interface ProgramMainProps {
  consumerMasjidId: string;
  isMainAdmin?: boolean;
}

const ProgramMain = ({
  consumerMasjidId,
  isMainAdmin = false,
}: ProgramMainProps) => {
  const navigation = useNavigationprop();

  const {
    masjidData,
    isLoading: isMasjidDataLoading,
    error: masjidDataError,
  } = useMasjidData(consumerMasjidId);

  const {
    allPrograms,
    combinedPrograms,
    isLoading: isProgramsLoading,
    error: programsError,
  } = useFetchPrograms(consumerMasjidId, masjidData?.location?.timezone);

  console.log("allPrograms", allPrograms);
  console.log("combinedPrograms", combinedPrograms);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [tZone, setTZone] = useState<string>("");
  const [selectedPrograms, setSelectedPrograms] = useState<ProgramType[]>([]);
  const [noProgramsFound, setNoProgramsFound] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null); // Tracks the open tooltip

  useEffect(() => {
    if (
      masjidData &&
      masjidData.location &&
      masjidData.location.coordinates.length > 1
    ) {
      setTZone(masjidData.location.timezone);
    }
  }, [masjidData, consumerMasjidId]);

  const tileContent = ({ date }: { date: any }) => {
    const currentDate = LocationBasedToday(tZone);
    const selectedDate = new Date(date);
    currentDate.setDate(currentDate.getDate() - 1);

    if (date) {
      const dateHasData = allPrograms.some(
        (item) =>
          item.date.split("T")[0] ===
          UtcDateConverter(moment(date).format("YYYY-MM-DD"), tZone).split(
            "T"
          )[0]
      );

      const programsOnDate = allPrograms.filter(
        (program) =>
          program.date.split("T")[0] ===
          UtcDateConverter(moment(date).format("YYYY-MM-DD"), tZone).split(
            "T"
          )[0]
      );
      const anyNonPastProgramOnDate: boolean = programsOnDate.some(
        (program) => {
          const programDate =
            program.metaData.recurrenceType === "none"
              ? program.metaData.endDate
              : program.date;
          return moment
            .utc(programDate)
            .tz(tZone)
            .startOf("day")
            .isSameOrAfter(moment.tz(tZone).startOf("day"));
        }
      );
      if (dateHasData && anyNonPastProgramOnDate) {
        const areAllProgramsCancelled = programsOnDate.every(
          (program) => program.isCancelled
        );
        if (areAllProgramsCancelled) {
          return <div className="red-dot" />;
        } else {
          return <div className="green-dot" />;
        }
      } else if (dateHasData) {
        return <div className="grey-dot" data-testid="grey-dot" />;
      }

      return null;
    }

    return null;
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    console.log("selectedDate", selectedDate);
    const programsSelected = handleSingleDateClick(
      selectedDate,
      combinedPrograms,
      tZone
    );
    if (programsSelected.length === 0) setNoProgramsFound(true);
    else setNoProgramsFound(false);
    setSelectedPrograms(programsSelected);
  };

  const showAllPrograms = () => {
    setSelectedPrograms([]);
    setNoProgramsFound(false);
    setSelectedDate(undefined);
  };

  const getFilteredPrograms = (): ProgramType[] => {
    if (selectedPrograms.length > 0) {
      return selectedPrograms;
    }
    if (
      !combinedPrograms ||
      (Object.keys(combinedPrograms.recursive).length <= 0 &&
        combinedPrograms.single.length <= 0)
    ) {
      return [];
    }
    if (
      combinedPrograms &&
      (Object.keys(combinedPrograms.recursive).length > 0 ||
        combinedPrograms.single.length > 0)
    ) {
      let combinedFilteredPrograms = [...combinedPrograms.single];

      Object.keys(combinedPrograms.recursive).forEach((recurrenceId) => {
        const uniqueRecurringProgram =
          combinedPrograms.recursive[recurrenceId][0];
        combinedFilteredPrograms.push(uniqueRecurringProgram);
      });

      return combinedFilteredPrograms;
    }
    return [];
  };

  const programs: ProgramType[] = getFilteredPrograms().sort((a, b) => {
    const dateA = a.metaData?.startDate
      ? new Date(a.metaData.startDate).getTime()
      : 0;
    const dateB = b.metaData?.startDate
      ? new Date(b.metaData.startDate).getTime()
      : 0;
    return dateB - dateA;
  });
  console.log("programs-", programs);
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
    } else if (programsError) {
      toast.dismiss();
      toast.error("Error Loading Programs Info...");
    }
  }, [masjidDataError || programsError]);
  if (isFormVisible)
    return (
      <ProgramForm
        isMainAdmin={isMainAdmin}
        setIsFormVisible={setIsFormVisible}
        consumerMasjidId={consumerMasjidId}
      />
    );

  return (
    <div
      className={styles["program-main"]}
      data-testid="program-main"
      onScroll={() => {
        setOpenTooltipId(null);
      }}
    >
      <div className={"title-container"}>
        <div className="goback" style={{ marginTop: "0" }}>
          {" "}
          <BackButton
            handleBackBtn={navigation ? navigation : customNavigatorTo}
            isHome={true}
          />
        </div>

        <h3
          className="page-title"
          data-testid="page-title"
          style={{ color: "#054635" }}
        >
          Programs
        </h3>
      </div>
      <div
        className={styles["program-main-body-container"]}
        data-testid="program-main-body-container"
        onScroll={() => {
          setOpenTooltipId(null);
        }}
      >
        <div className={styles["program-main-body"]}>
          <div className={styles["calendar-container"]}>
            <CustomCalendar
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
              text="Add Program"
              onClick={() => {
                setIsFormVisible(true);
              }}
              iconSrc={addProgramIcon}
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
              iconStyle={{ marginRight: "15px", height: "14px", width: "14px" }}
            />
          </div>

          <ProgramList
            showAllPrograms={showAllPrograms}
            noProgramsFound={noProgramsFound}
            selectedDate={selectedDate}
            isLoading={isMasjidDataLoading || isProgramsLoading}
            programs={programs}
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
        iconSrc={addProgramIcon}
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
        iconStyle={{ marginLeft: "2px", height: "25px", width: "25px" }}
      />
    </div>
  );
};

export default ProgramMain;
