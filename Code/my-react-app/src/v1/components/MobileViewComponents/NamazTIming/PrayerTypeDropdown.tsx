import React, { FC, useEffect, useRef, useState } from "react";
import { Card, CardContent, Typography, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CustomBtn from "../Shared/CustomBtn";

interface DropdownProps {
  prayerName: string;
  statusHandler: (val: string) => void;
  timingStatus: string;
  label: string;
}

const PrayerTypeDropdown: FC<DropdownProps> = ({
  prayerName,
  statusHandler,
  timingStatus,
  label,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [buttonText, setButtonText] = useState(() => {
    switch (timingStatus) {
      case "manual":
        return "Fixed Time";
      case "solar":
        return "Autofill";
      case "No Iqama":
        return "No Iqama";
      default:
        return "Autofill";
    }
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false); // Close dropdown if click is outside
      }
    };

    // Add event listener for mousedown (or you can use 'click')
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Cleanup event listener when the component unmounts
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    switch (timingStatus) {
      case "manual":
        setButtonText("Fixed Time");
        break;
      case "solar":
        if (label !== "Azan") setButtonText("After Azan");
        else setButtonText("Autofill");
        break;
      case "No Iqama":
        setButtonText("No Iqama");
        break;
      default:
        setButtonText("Autofill");
    }
  }, [timingStatus]);

  const handleToggle = (tx = "") => {
    if (label !== "Azan") {
      setIsExpanded((prevExpanded) => !prevExpanded);
      if (!tx) {
        return;
      }
      const incomingTx = tx || buttonText;
      setButtonText(incomingTx);

      switch (incomingTx) {
        case "Fixed Time":
          statusHandler("manual");
          break;
        case "Autofill":
          statusHandler("solar");
          break;
        case "No Iqama":
          statusHandler("No Iqama");
          break;
        case "After Azan":
          statusHandler("solar");
          break;
        default:
          statusHandler("solar");
      }
    }
  };

  const contentTxOptions =
    label === "Iqama" ? ["Fixed Time", "After Azan", "No Iqama"] : ["Autofill"];

  return (
    <div className="prayer-type-dropdown-container" ref={dropdownRef}>
      <Card
        className="dropdown-card"
        style={{
          height: isExpanded ? (label === "Azan" ? "60px" : "auto") : "33px",
          position: "absolute",
          top: "37px",
          // bottom: 0,
          borderRadius: "17px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          transition: "height 0.3s",
          overflow: "hidden",
          zIndex: isExpanded ? 1000 : "auto",
          background: isExpanded ? "#1B8368" : "transparent",
          // background: "#1B8368",
          color: "white",
        }}
        data-testid={`statusDropdown-${label}-${prayerName}`}
      >
        <CustomBtn
          hightSize={"33px"}
          label={buttonText}
          size={"3vw"}
          showIcon={false}
          eventHandler={() => handleToggle()}
          bgColor={
            (buttonText === "No Iqama" && !isExpanded) ||
            buttonText === "Autofill"
              ? "#9F9E9E"
              : ""
          }
        >
          <div style={label != "Iqama" ? { display: "none" } : {}}>
            {isExpanded ? (
              <ExpandLessIcon
                style={{
                  marginLeft: "5px",
                  textAlign: "left",
                  width: "15px",
                  height: "15px",
                }}
              />
            ) : (
              <ExpandMoreIcon
                style={{ marginLeft: "5px", width: "15px", height: "15px" }}
              />
            )}
          </div>
        </CustomBtn>
        {isExpanded && (
          <CardContent
            style={{
              display: "flex",
              justifyContent: "center",
              // alignItems: "center",
              flexDirection: "column",
              padding: "0 0 0 10px",
              gap: "5px",
              paddingBottom: "9px",
            }}
          >
            {contentTxOptions.map(
              (option) =>
                option !== buttonText && (
                  <Typography
                    className="dropdown-option"
                    key={option}
                    sx={{
                      cursor: "pointer",
                      // fontSize: "13px",
                      fontWeight: "400",
                    }}
                    onClick={() => handleToggle(option)}
                  >
                    {option}
                  </Typography>
                )
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default PrayerTypeDropdown;
