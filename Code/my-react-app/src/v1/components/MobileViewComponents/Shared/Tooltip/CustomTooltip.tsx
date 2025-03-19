import React, { useState, useEffect } from "react";
import { Tooltip, IconButton, Box, Typography } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

interface CustomTooltipProps {
  id: string;
  text: string | React.ReactNode; // Tooltip text
  iconStyle?: React.CSSProperties; // Optional icon styling
  tooltipStyle?: any; // Optional tooltip styling
  popperProps?: any; // Optional PopperProps for positioning
  open: boolean; // Whether the tooltip is currently open
  handleTooltipOpen: (id: string) => void; // Function to open the tooltip
  handleClickOutside: (event: MouseEvent) => void;
  icon?: React.ReactNode; // Optional icon component
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  id = "",
  text,
  iconStyle = {},
  tooltipStyle = {},
  popperProps = {},
  open,
  handleTooltipOpen,
  handleClickOutside,
  icon,
}) => {
  useEffect(() => {
    // Add event listener for outside clicks
    document.addEventListener("click", handleClickOutside);

    return () => {
      // Cleanup listener on component unmount
      document.removeEventListener("click", handleClickOutside);
    };
  }, [open, handleClickOutside]);

  return (
    <Tooltip
      title={text}
      arrow
      open={open}
      PopperProps={popperProps} // Pass the PopperProps here
      componentsProps={{
        tooltip: {
          sx: {
            maxWidth: { xs: "95vw", sm: "70vw", md: "50vw" },
            padding: {
              xs: "5px",
              sm: "5px",
              md: "1.4vmin",
            },
            backgroundColor: "white",
            color: "#1D785A",
            fontSize: {
              xs: "10px",
              sm: "10px",
              md: "1.4vmin",
            },
            borderRadius: "8px",
            ...tooltipStyle,
          },
        },

        arrow: {
          sx: {
            boxShadow: "0px 0px 10.25px 0px #0000001A",
            color: "white",
          },
        },
      }}
      // disableInteractive
    >
      {icon ? (
        <span
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the document click event
            handleTooltipOpen(id);
          }}
          style={iconStyle}
          className="tooltip-icon"
        >
          {icon}
        </span>
      ) : (
        <InfoIcon
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the document click event
            handleTooltipOpen(id);
          }}
          style={{
            color: "#3D5347",
            ...iconStyle,
          }}
          sx={{
            fontSize: {
              xs: "15px",
              sm: "15px",
              md: "15px",
              lg: "2vmin",
            },
            marginLeft: {
              xs: "5px",
              sm: "5px",
              md: "5px",
              lg: "0.8vmin",
            },
          }}
        />
      )}
    </Tooltip>
  );
};

export default CustomTooltip;
