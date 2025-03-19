import React, { useState, Dispatch, SetStateAction } from "react";
import { Modal, Card, Typography, Box, makeStyles } from "@material-ui/core";
import CustomBtn from "../Shared/CustomBtn";
import { modalCenterStyle } from "./JuristicMethod";
import toast from "react-hot-toast";
import { PrayerMethod } from "../../../redux/Types";
import { useAppThunkDispatch } from "../../../redux/hooks";
import { DeletingAllTimingsByDateRange } from "../../../redux/actions/TimingsActions/DeletingAllTimingsByRange";
import moment from "moment-timezone";
import warningICon from "../../../photos/Newuiphotos/salahpageicons/warning.svg";
import { useDeleteTimings } from "../../../graphql-api-calls/Salah/mutation";
import { updateMasjidMeta } from "../../../redux/actions/TimingsActions/UpdateMasjidMethodAndJurisdiction";
interface JuristicMethodProps {
  isModalOpen: boolean;
  method: Partial<PrayerMethod>;
  juristicMethod: string;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsMethodChanged: Dispatch<SetStateAction<boolean>>;
  setParentModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
  masjidId: string;
  tZone: string;
  selectedType: string;
  temporaryMethod: Partial<PrayerMethod>;
  setSelectedMethod: Dispatch<SetStateAction<Partial<PrayerMethod>>>;
  temporaryAsrMethod: string;
  setSelectedAsrMethod: Dispatch<SetStateAction<string>>;
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

const PrayerMethodConfModal: React.FC<JuristicMethodProps> = ({
  isModalOpen,
  setModalOpen,
  setParentModalOpen,
  setIsMethodChanged,
  setIsSettingsOpen,
  method,
  juristicMethod,
  masjidId,
  tZone,
  selectedType,
  temporaryMethod,
  setSelectedMethod,
  temporaryAsrMethod,
  setSelectedAsrMethod,
}) => {
  const {
    removeTimings,
    loading: loadingDelete,
    error: errorDelete,
  } = useDeleteTimings();

  const classes = useStyles();
  const [isSecondStep, setIsSecondStep] = useState(false);
  const dispatch = useAppThunkDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const handleCancelClick = () => {
    setModalOpen(false);
  };

  const handleFirstStepClick = () => {
    setIsSecondStep(true);
  };
  // console.log(masjidId);
  // const handleSaveClick = () => {
  //   localStorage.setItem("PrayerMethod", JSON.stringify(method));
  //   localStorage.setItem("JuristicMethod", juristicMethod);
  //   toast.success("Prayer Method has been saved");
  //   setModalOpen(false);
  //   setParentModalOpen(false);
  //   setIsMethodChanged(true);
  // };

  const handleSaveClick = async () => {
    setIsLoading(true);
    console.log("handle save click");
    const startDate = moment
      .tz(tZone)
      .startOf("day")
      .utc()
      .startOf("day")
      .toISOString();
    const endDate = moment(startDate).add(1, "year").utc().toISOString();
    console.log("prayer method", temporaryAsrMethod, temporaryMethod);
    try {
      if (
        !temporaryMethod?.id ||
        isNaN(temporaryMethod.id) ||
        !temporaryAsrMethod
      ) {
        throw new Error("Couldn't save the methods and delete timings");
      }
      const result = await removeTimings(masjidId, startDate, endDate);
      const res = await dispatch(
        updateMasjidMeta(masjidId, {
          method: temporaryMethod?.id?.toString(),
          juristic:
            temporaryAsrMethod === "Hanafi"
              ? "Manual"
              : "Maliki/Shafi'i/Hanbali",
        })
      );

      if (res?.message === "Success") {
        localStorage.setItem("PrayerMethod", JSON.stringify(method));
        localStorage.setItem("JuristicMethod", juristicMethod);
        toast.success(
          "Successfully deleted timing and saved the prayer method"
        );
        setModalOpen(false);
        setIsSettingsOpen(false);
        setParentModalOpen(false);
        setIsMethodChanged(true);
        setSelectedMethod(temporaryMethod);
        setSelectedAsrMethod(temporaryAsrMethod);
      } else {
        throw new Error("Couldn't Save the method and delete timings");
      }
    } catch (err) {
      console.log(err);
      toast.error("Couldn't Delete Timings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isModalOpen && (
        <Modal
          open={isModalOpen}
          onClose={handleCancelClick}
          style={modalCenterStyle}
        >
          <Card className={classes.card} data-testid="confmodal">
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
                <b
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
                </b>
                <p
                  style={{
                    fontWeight: "500",
                    lineHeight: "15px",
                  }}
                >
                  {`Are you sure you want to change ${
                    selectedType === "regular"
                      ? "Salah Calculation"
                      : "Al-Asr Juristic"
                  } Method ?`}
                </p>
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "400",
                      lineHeight: "15px",
                    }}
                  >
                    <b style={{ color: "#FF7272" }}>Note:</b> Changing these
                    settings will delete all existing salah time data. Ensure
                    you have to reviewed your selection before proceeding
                  </p>
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
                eventHandler={handleSaveClick}
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

export default PrayerMethodConfModal;
