import React, { useState, Dispatch, SetStateAction } from "react";
import { Modal, Card, Typography, Box, makeStyles } from "@material-ui/core";
// import CustomBtn from "../Shared/CustomBtn";
// import { modalCenterStyle } from "./JuristicMethod";
// import toast from "react-hot-toast";
// import { PrayerMethod } from "../../../redux/Types";
// import { useAppThunkDispatch } from "../../../redux/hooks";
// import { DeletingAllTimingsByDateRange } from "../../../redux/actions/TimingsActions/DeletingAllTimingsByRange";
// import moment from "moment-timezone";
import warningICon from "../../../../photos/Newuiphotos/salahpageicons/warning.svg";
import CustomBtn from "../../Shared/CustomBtn";
// import { useDeleteTimings } from "../../../graphql-api-calls/Salah/mutation";
// import { updateMasjidMeta } from "../../../redux/actions/TimingsActions/UpdateMasjidMethodAndJurisdiction";
interface WarningProps {
  isModalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  errorMessage: string;
  warningMessage: string;
  handleSubmit: () => void;
}

const useStyles = makeStyles((theme) => ({
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "20px 10px",
    width: "90%",
    maxWidth: "500px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
    [theme.breakpoints.down("xs")]: {
      width: "95%",
    },
  },
  confirmTxStyle: {
    fontFamily: "Lato",
    color: "#3D544E",
    fontWeight: 600,
    fontSize: "16px",
    lineHeight: "24px",
    textAlign: "center",
    marginBottom: "20px",
    [theme.breakpoints.down("xs")]: {
      fontSize: "14px",
    },
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "20px",
    [theme.breakpoints.down("xs")]: {
      alignItems: "center",
    },
  },
  button: {
    width: "40%",
    maxWidth: "120px",
    [theme.breakpoints.down("xs")]: {
      width: "80%",
      marginBottom: "10px",
    },
  },
}));

const Warning: React.FC<WarningProps> = ({
  isModalOpen,
  setModalOpen,
  errorMessage,
  warningMessage,
  handleSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleCancelClick = () => {
    setModalOpen(false);
  };

  const handleFirstStepClick = () => {};
  // console.log(masjidId);
  const classes = useStyles();

  return (
    <div>
      {isModalOpen && (
        <Modal
          open={isModalOpen}
          onClose={handleCancelClick}
          // style={modalCenterStyle}
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            display: isModalOpen ? "flex" : "none",
          }}
        >
          <Card
            className={classes.card}
            data-testid="confmodal"
            // style={{}}
          >
            <Typography variant="h6" className={classes.confirmTxStyle}>
              {/* {isSecondStep ? (
              <>
                <span style={{ color: "rgb(27, 131, 104)" }}>
                  Please note :{" "}
                </span>
                Changing these settings will delete all your existing prayer
                time data. Ensure you have reviewed your selections carefully
                before proceeding.
              </>
            ) : (
              <>
                Are you sure you want to change the Prayer Calculation Methods
                to
                <span style={{ color: "rgb(27, 131, 104)" }}>
                  {method.name}
                </span>
                and the Juristic Method to{" "}
                <span style={{ color: "rgb(27, 131, 104)" }}>
                  {juristicMethod}
                </span>
                ?
              </>
            )} */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={warningICon} alt="" />
                {/* <b
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  lineHeight: "15px",
                  color: "rgb(27, 131, 104)",
                  marginTop: "15px",
                }}
              >
                {selectedType === "regular"
                  ? temporaryMethod.name
                  : temporaryAsrMethod}
              </b> */}
                <p
                  style={{
                    fontWeight: "500",
                    lineHeight: "15px",
                  }}
                >
                  {warningMessage}
                </p>
                <div>
                  {errorMessage && (
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: "400",
                        lineHeight: "15px",
                      }}
                    >
                      <b style={{ color: "#FF7272" }}>Note:</b> {errorMessage}
                    </p>
                  )}
                </div>
              </div>
            </Typography>

            <Box className={classes.buttonContainer}>
              <CustomBtn
                eventHandler={handleCancelClick}
                label={"No"}
                borderClr={"2px solid #FF7272"}
                bgColor={"#FF7272"}
                showIcon={false}
                size={"15%"}
                style={{ maxWidth: "120px" }}
                className={classes.button}
                isDisabled={isLoading}
              />
              {/* {isSecondStep ? ( */}
              <CustomBtn
                eventHandler={handleSubmit}
                label={"Yes"}
                size={"15%"}
                showIcon={false}
                style={{ maxWidth: "120px" }}
                className={classes.button}
                isLoading={isLoading}
                isDisabled={isLoading}
              />
              {/* ) : (
              <CustomBtn
                eventHandler={handleFirstStepClick}
                label={"Yes"}
                size={"15%"}
                showIcon={false}
                style={{ maxWidth: "120px" }}
                className={classes.button}
              />
            )} */}
            </Box>
          </Card>
        </Modal>
      )}
    </div>
  );
};

export default Warning;
