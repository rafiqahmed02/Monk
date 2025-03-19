import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";
import ProgramCard from "../ProgramCard/ProgramCard"; // Update this to match the new ProgramCard component
import noProgramFound from "../../../../photos/Newuiphotos/program/noprogram.svg"; // Update the no program image path
import styles from "./Programs.module.css";
import moment from "moment";
import { ProgramType } from "../Types/Types";

interface ProgramListProps {
  showAllPrograms: () => void;
  noProgramsFound: boolean;
  selectedDate: Date | undefined;
  isLoading: boolean;
  programs: ProgramType[]; // Update the type to ProgramType
  consumerMasjidId: string;
  openTooltipId: string | null;
  setOpenTooltipId: React.Dispatch<React.SetStateAction<string | null>>;
}

const ProgramList = ({
  showAllPrograms,
  noProgramsFound,
  selectedDate,
  isLoading = false,
  programs,
  consumerMasjidId,
  openTooltipId,
  setOpenTooltipId, // Tracks the open tooltip
}: ProgramListProps) => {
  const handleTooltipToggle = (
    id: string | null,
    e: { stopPropagation: () => void }
  ) => {
    e.stopPropagation();
    setOpenTooltipId((prevId) => (prevId === id ? null : id)); // Toggle the tooltip
  };

  return (
    <div className={styles["program-list-main"]}>
      {!isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            // position: "fixed",
            paddingBottom: "10px",
            // "@media (min-width: 768px)": {
            //   display: "none",
            // },
          }}
        >
          <Typography
            sx={{
              fontSize: "12.5px",
              color: "#3D5347",
              fontWeight: "500",
              marginLeft: "10px",
            }}
          >
            {selectedDate
              ? `Programs of ${moment(selectedDate).format("DD MMM YYYY")}`
              : "All Programs"}
          </Typography>
          <Typography
            sx={{
              fontSize: "12.5px",
              color: "#3D5347",
              fontWeight: "500",
              marginLeft: "10px",
              textDecoration: "underline",
              cursor: "pointer",
            }}
            onClick={showAllPrograms}
          >
            {selectedDate && "See All Programs"}
          </Typography>
        </Box>
      )}

      <div
        className={`${styles["program-list-container"]} ${
          !isLoading || programs.length > 0 ? styles["custom-scrollbar"] : {}
        }`}
        onScroll={() => {
          setOpenTooltipId(null);
        }}
        style={{
          overflow: window.innerWidth < 768 ? "hidden" : "auto",
        }}
      >
        {isLoading ? (
          <div className={styles["no-program-loader-container"]}>
            <CircularProgress size={35} color="inherit" />
          </div>
        ) : (
          <>
            {noProgramsFound ? (
              <div className={styles["no-program-loader-container"]}>
                <img src={noProgramFound} alt="No Program Found" />
                <p className={styles["no-program-container__text"]}>
                  {/* No Program On {moment(selectedDate).format("DD MMM YYYY")} */}
                  No Programs Found
                </p>
              </div>
            ) : programs.length > 0 ? (
              <>
                {programs.map((program) => (
                  <ProgramCard
                    selectedDate={selectedDate}
                    program={program} // Update to pass program-specific props
                    consumerMasjidId={consumerMasjidId}
                    openTooltipId={openTooltipId}
                    onTooltipToggle={handleTooltipToggle}
                  />
                ))}
              </>
            ) : (
              <div className={styles["no-program-loader-container"]}>
                <img src={noProgramFound} alt="No Program Found" />
                <p className={styles["no-program-container__text"]}>
                  No Programs Found
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProgramList;
