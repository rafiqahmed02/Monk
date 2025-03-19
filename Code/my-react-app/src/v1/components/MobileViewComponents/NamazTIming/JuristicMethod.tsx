import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Modal, Card, CardContent, Typography, Box } from "@material-ui/core";
import checkImg from "../../../photos/checkmark.png";
import CustomBtn from "../Shared/CustomBtn";
import ConfirmationModal from "./ConfirmationModal";
import { useMediaQuery, useTheme } from "@mui/material";

interface JuristicMethodProps {
  setSelectedMethod: Dispatch<SetStateAction<string>>;
  selectedMethod: string;
}

const JuristicMethod: React.FC<JuristicMethodProps> = ({
  selectedMethod,
  setSelectedMethod,
}) => {
  const theme = useTheme();

  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));
  const isMidScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.up("xs"));

  const [isModalOpen, setModalOpen] = useState(false);
  const [isConModalOpen, setConModalOpen] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [isSaveButtonVisible, setIsSaveButtonVisible] = useState(false);
  const [initialSelectedMethod, setInitialSelectedMethod] =
    useState<string>("Hanafi");

  // const savedMethod = localStorage.getItem("JuristicMethod");
  const savedMethod = selectedMethod;

  useEffect(() => {
    setSelectedMethod(savedMethod ?? "Hanafi");
    setInitialSelectedMethod(savedMethod ?? "Hanafi");
  }, [isModalOpen]);

  const handleEditClick = () => {
    setModalOpen(true);
  };

  const handleCancelClick = () => {
    setModalOpen(false);
    setSelectedMethod(savedMethod ?? "Hanafi");
  };

  const handleSaveClick = () => {
    setConModalOpen(true);
  };

  useEffect(() => {
    if (selectedMethod !== initialSelectedMethod) {
      setIsSaveButtonVisible(true);
    } else setIsSaveButtonVisible(false);
  }, [selectedMethod, isModalOpen]);

  const selectedStyle = { ...nonSelectionCardStyle, ...selectedCard };

  const isHanafy = selectedMethod === "Hanafi" ? true : false;
  const CardStyle = {
    display: "flex",
    flexDirection: "column" as "column",
    justifyContent: "space-between",

    width: isLargeScreen ? "60%" : isMidScreen ? "65%" : "90%",
    borderRadius: "16px",
    boxShadow: "none",
  };

  return (
    <>
      <div className="juristic-main-container" style={juristicConainer}>
        
        <Card style={CardStyle}>
          <CardContent style={{ padding: "10px 0" }}>
            <Typography
              align="center"
              style={{ marginBottom: "25px", fontWeight: "500" }}
            >
              Al-Asr Juristic Method
            </Typography>

            <Card
              style={isHanafy ? selectedStyle : nonSelectionCardStyle}
              onClick={() => setSelectedMethod("Hanafi")}
              data-testid="asr-jurisdiction-hanafi"
            >
              <Typography
                style={isHanafy ? juristicTxStyle : { fontSize: "13px" }}
              >
                Hanafi
              </Typography>
              <img
                src={checkImg}
                alt="Check Img"
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                  display: !isHanafy ? "none" : "block",
                }}
              />
            </Card>
            <Card
              style={!isHanafy ? selectedStyle : nonSelectionCardStyle}
              onClick={() => setSelectedMethod("Maliki/Shafi'i/Hanbali")}
              data-testid="asr-jurisdiction-shafi"
            >
              <Typography
                style={!isHanafy ? juristicTxStyle : { fontSize: "13px" }}
              >
                Maliki/Shafi'i/Hanbali
              </Typography>
              <img
                src={checkImg}
                alt="Check Img"
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                  display: isHanafy ? "none" : "block",
                }}
              />
            </Card>
          </CardContent>

        </Card>
        {/* </Modal> */}
        {isConModalOpen ? (
          <ConfirmationModal
            isModalOpen={isConModalOpen}
            setModalOpen={setConModalOpen}
            setParentModalOpen={setModalOpen}
            juristicMethod={selectedMethod}
          />
        ) : null}
      </div>
    </>
  );
};

const juristicTxStyle = {
  fontFamily: "Lato",
  color: "#1B8368",
  fontWeight: 600,
  fontSize: "12px",
  textAlign: "center" as "center",
};
const autoTxStyle = {
  fontFamily: "Lato",
  color: "#3D544E",
  fontWeight: 600,
  textAlign: "center" as "center",
  width: "90%",
  fontSize: "11px",
  marginBottom: "15px",
};
export const modalCenterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const nonSelectionCardStyle = {
  padding: "10px",
  height: " 30px",
  display: "flex",
  alignItems: "center",
  margin: "10px 0",
  borderRadius: "16px",
  justifyContent: "space-between",
  boxShadow: "0px 0px 25px 0px #0000000D",
  border: "1px solid #a3a3a3",
  color: "#a3a3a3",
};
const selectedCard = {
  border: "2px solid green",
};

const juristicConainer = {
  display: "flex",
  justifyContent: "center",
};

export default JuristicMethod;
