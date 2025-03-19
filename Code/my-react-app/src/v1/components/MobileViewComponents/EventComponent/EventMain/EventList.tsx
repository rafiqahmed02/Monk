import { Box, CircularProgress, Typography } from "@mui/material";
import React, { useState } from "react";
import EventCard from "../EventCard/EventCard";
import noEventFound from "../../../../photos/Newuiphotos/BG/no events.svg";
import styles from "./EventMain.module.css";
import { EventType } from "../../../../redux/Types";
import moment from "moment";

interface EventListProps {
  showAllEvents: () => void;
  noEventsFound: boolean;
  selectedDate: Date | undefined;
  isLoading: boolean;
  events: EventType[];
  consumerMasjidId: string;
  openTooltipId: string | null;
  setOpenTooltipId: React.Dispatch<React.SetStateAction<string | null>>;
}
const EventList = ({
  showAllEvents,
  noEventsFound,
  selectedDate,
  isLoading = false,
  events,
  consumerMasjidId,
  openTooltipId,
  setOpenTooltipId, // Tracks the open tooltip
}: EventListProps) => {
  const handleTooltipToggle = (
    id: string | null,
    e: { stopPropagation: () => void }
  ) => {
    e.stopPropagation();
    setOpenTooltipId((prevId) => (prevId === id ? null : id)); // Toggle the tooltip
  };
  return (
    <div className={styles["event-list-main"]}>
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
              ? `Events of ${moment(selectedDate).format("DD MMM YYYY")}`
              : "All Events"}
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
            onClick={showAllEvents}
          >
            {selectedDate && "See All Events"}
          </Typography>
        </Box>
      )}

      <div
        data-testid="event-list-container"
        className={`${styles["event-list-container"]} ${
          !isLoading || events.length > 0 ? styles["custom-scrollbar"] : {}
        }`}
        onScroll={() => {
          setOpenTooltipId(null);
        }}
        style={{
          overflow: window.innerWidth < 768 ? "hidden" : "auto",
        }}
      >
        {isLoading ? (
          <div className={styles["no-event-loader-container"]}>
            <CircularProgress size={35} color="inherit" />
          </div>
        ) : (
          <>
            {noEventsFound ? (
              <div className={styles["no-event-loader-container"]}>
                <img src={noEventFound} alt="No Event Found" />
                <p className={styles["no-event-container__text"]}>
                  No Events Found
                  {/* On {moment(selectedDate).format("DD MMM YYYY")} */}
                </p>
              </div>
            ) : events.length > 0 ? (
              <>
                {events.map((event, index) => (
                  <EventCard
                    selectedDate={selectedDate}
                    key={index}
                    event={event}
                    consumerMasjidId={consumerMasjidId}
                    openTooltipId={openTooltipId}
                    onTooltipToggle={handleTooltipToggle}
                  />
                ))}
              </>
            ) : (
              <div className={styles["no-event-loader-container"]}>
                <img src={noEventFound} alt="No Event Found" />
                <p className={styles["no-event-container__text"]}>
                  No Events Found
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventList;
