import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import styles from "../../../EventComponent/EventCard/EventCard.module.css";
import "./CustomToolTip.css";

function CustomToolTip({ recurrenceIcon, allDates, isOpen, onToggle }) {
  const [isHidden, setIsHidden] = useState(false); // Tracks if the tooltip went out of view

  const tooltipContent = allDates?.trim() ? allDates : "No Dates Available";

  return (
    <Tooltip
      title={tooltipContent}
      open={isOpen && !isHidden} // Tooltip state controlled by click and visibility
      disableFocusListener
      disableTouchListener
      PopperProps={{
        className: "custom-tooltip-container",
        modifiers: [
          {
            name: "preventOverflow",
            options: {
              boundary: "window", // Ensure the tooltip doesn't go out of bounds
            },
          },
          {
            name: "offset",
            options: {
              offset: [0, 8], // Adjust the offset to ensure visibility
            },
          },
          {
            name: "hide",
            enabled: true, // Enable the hide modifier
            options: {
              strategy: "escaped", // Detect when the tooltip goes out of view
            },
          },
          {
            name: "onHiddenChange", // Custom Popper.js modifier to handle hiding logic
            enabled: true,
            phase: "write",
            fn: ({ state }) => {
              const isTooltipOutOfView =
                state.modifiersData.hide?.isReferenceHidden;
              if (isTooltipOutOfView) {
                setIsHidden(true); // Set tooltip as hidden
              }
            },
          },
        ],
      }}
      onClose={() => setIsHidden(false)} // Reset hidden state when tooltip closes
      sx={{
        "& .MuiTooltip-tooltip": {
          fontSize: "0.875rem",
          backgroundColor: "#f5f5f9",
          color: "#333",
          border: "1px solid #dadde9",
        },
      }}
    >
      <IconButton
        data-testid="recurring-icon"
        className={styles["event-card__recurrence-icon-container"]}
        onClick={(e) => {
          if (!isHidden) {
            onToggle(e); // Toggle tooltip on click only if not hidden
          }
        }}
      >
        <img
          src={recurrenceIcon}
          alt="Recurring Event"
          className={styles["event-card__recurrence-icon"]}
        />
      </IconButton>
    </Tooltip>
  );
}

export default CustomToolTip;
