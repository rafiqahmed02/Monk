import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Modal,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import checkImg from "../../../photos/checkmark.png";
import CustomBtn from "../Shared/CustomBtn";
import { PrayerMethod } from "../../../redux/Types";
import PrayerMethodConfModal from "./PrayerMethodConfModal";
import toast from "react-hot-toast";
import JuristicMethod from "./JuristicMethod";
import "./PrayerCalculationMethod.css";
import { fetchPrayerMethodsWithTime } from "../../../PrayerCalculation/Adhan";
import moment from "moment";
import { InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/system";

type SalahType = "regular" | "Asr";
const CustomTextField = styled(TextField)(({ theme }) => ({
  width: "95%",
  margin: "8px auto",
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.8rem",
  },
  "& .MuiOutlinedInput-root": {
    // padding: "4px",
    borderRadius: "12px",
    border: "0.6px solid #a3a3a3", // Border for the text field
    paddingLeft: "5px",
    "& fieldset": {
      borderColor: "transparent", // Remove default border
    },
    "&:hover fieldset": {
      borderColor: "transparent",
    },
    "&.Mui-focused fieldset": {
      borderColor: "transparent",
    },
  },
  "& .MuiInputAdornment-root": {
    marginRight: "4px",
  },
  "& .MuiInputBase-input": {
    padding: "11px 11px",
    fontSize: "0.8rem",
  },
}));
interface PrayerCalculationMethodProps {
  setSelectedMethod: Dispatch<SetStateAction<Partial<PrayerMethod>>>;
  setIsMethodChanged: Dispatch<SetStateAction<boolean>>;
  isMethodChanged: boolean;
  selectedMethod: Partial<PrayerMethod>;
  setSelectedAsrMethod: Dispatch<SetStateAction<string>>;
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
  selectedAsrMethod: string;
  masjid: any;
  selectedStartDate: string;
  masjidId: string;
  tZone: string;
  prayerType: any;
  prayerMthd: any;
  selectedType?: SalahType;
}

const PrayerCalculationMethod: React.FC<PrayerCalculationMethodProps> = ({
  selectedMethod,
  setSelectedMethod,
  setIsMethodChanged,
  setSelectedAsrMethod,
  selectedAsrMethod,
  masjid,
  masjidId,
  selectedStartDate,
  tZone,
  isMethodChanged,
  prayerType,
  prayerMthd,
  selectedType,
  setIsSettingsOpen,
}) => {
  const defaultMethod = {
    id: 2,
    name: "Islamic Society of North America (ISNA)",
  };
  const [isModalOpen, setModalOpen] = useState(false);
  const [isConModalOpen, setConModalOpen] = useState(false);
  const [prayerMethods, setPrayerMethods] = useState<PrayerMethod[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaveButtonVisible, setIsSaveButtonVisible] = useState(false);
  const [initialSelectedMethod, setInitialSelectedMethod] = useState<any>(
    defaultMethod.id
  );
  const [initialSelectedAsrMethod, setInitialSelectedAsrMethod] =
    useState<string>(selectedAsrMethod);
  const [temporaryMethod, setTemporaryMethod] =
    useState<Partial<PrayerMethod>>(selectedMethod); // Stores details of the selected prayer method.
  const [temporaryAsrMethod, setTemporaryAsrMethod] =
    useState<string>(selectedAsrMethod); // Stores details of the selected prayer method.
  useEffect(() => {
    loadSelectedMethod();
  }, [prayerType]);
  useEffect(() => {
    if (masjid?.address) {
      try {
        const methods = fetchPrayerMethodsWithTime(
          masjid?.location.coordinates[1],
          masjid?.location.coordinates[0],
          moment(selectedStartDate).toDate(),
          tZone
        );
        setPrayerMethods(methods);
      } catch (error) {
        toast.error("Failed to Fetch Salah Methods");
        console.error("Error fetching salah methods:", error);
      }
    }
  }, [masjid, selectedStartDate]);

  const savedMethodString = selectedMethod;
  const savedMethod = savedMethodString ? savedMethodString : null;

  const loadSelectedMethod = () => {
    setInitialSelectedMethod(Number(prayerMthd) ?? defaultMethod.id);
    setInitialSelectedAsrMethod(
      prayerType === "Manual" ? "Hanafi" : prayerType
    );
  };

  const handleEditClick = () => {
    setModalOpen(true);
  };

  const handleCancelClick = () => {
    setModalOpen(false);
    setIsSettingsOpen(false);
    setSelectedMethod(savedMethod ?? defaultMethod);
    setSelectedAsrMethod(initialSelectedAsrMethod);
  };

  const handleSaveClick = () => {
    const validationErrors = validateSelectedMethods();
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
    } else {
      setConModalOpen(true);
    }
  };

  const validateSelectedMethods = () => {
    const errors = [];
    if (!selectedMethod.name) {
      errors.push("Please select a salah calculation method.");
    }
    // if (!selectedAsrMethod) {
    //   errors.push("Please select a juristic method.");
    // }
    return errors;
  };

  const filteredPrayerMethods = prayerMethods.filter((method) =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const isMethodChanged =
      selectedMethod?.id !== temporaryMethod?.id ||
      selectedAsrMethod !== temporaryAsrMethod;

    setIsSaveButtonVisible(isMethodChanged);
  }, [
    temporaryMethod,
    temporaryAsrMethod,
    selectedMethod,
    selectedAsrMethod,
    initialSelectedMethod,
    initialSelectedAsrMethod,
  ]);

  const theme = useTheme();
  const isExtraLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));
  const isMidScreen = useMediaQuery(theme.breakpoints.up("sm"));

  const juristicTxStyle = {
    fontFamily: "Inter",
    color: "#1B8368",
    fontWeight: 600,
    fontSize: "10px",
    margin: "5px 0",
  };

  const modalCenterStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const CardStyle = {
    display: "flex",
    flexDirection: "column" as "column",
    height: "520px",
    maxHeight: selectedType === "regular" ? "420px" : "300px",
    // overflowY: "auto" as "auto",
    padding: "25px 15px",
    width: isExtraLargeScreen
      ? "28%"
      : isLargeScreen
      ? "30%"
      : isMidScreen
      ? "55%"
      : "90%",
    borderRadius: "16px",
    minWidth: isExtraLargeScreen
      ? "28%"
      : isLargeScreen
      ? "30%"
      : isMidScreen
      ? "55%"
      : "90%",
    overflow: "hidden",
    justifyContent: "center",
  };

  const CardBody = {
    padding: "0px",
    marginTop: "12px",
    maxHeight: "290px",
    overflowY: "auto" as "auto",
  };

  const methodcontainer = {
    display: "flex",
    flexDirection: isLargeScreen ? "row" : "column",
    justifyContent: "space-around",
    width: "100%",
  };

  const methodStyle = {
    display: "flex",
    flexDirection: isLargeScreen ? "row" : "",
    gap: "20px",
    alignItems: "center",
  };

  return (
    <>
      <div
        className="juristic-main-container prayer-cal-method"
        data-testid="root"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "30px",
        }}
      >
        <Card style={CardStyle} data-testid="method-cards-container">
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "40px",
            }}
          >
            {selectedType === "regular" ? (
              <Box
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  align="center"
                  style={{ fontWeight: "600", marginBottom: "10px" }}
                >
                  Salah Calculation Methods
                </Typography>
                {/* <TextField
                  label="Search by method name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    margin: "5px auto",
                    width: "100%",
                    border: "0.6px solid #a3a3a3",
                    borderRadius: "20px",
                  }}
                  sx={{
                    "& .MuiInput-underline:before": {
                      borderBottom: "none",
                    },
                  }}
                /> */}
                <CustomTextField
                  variant="outlined"
                  fullWidth
                  placeholder="Search by method name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <CardContent style={CardBody} className="condition-text">
                  {filteredPrayerMethods.length === 0 ? (
                    <Typography align="center">No items found</Typography>
                  ) : (
                    filteredPrayerMethods.map((method) => (
                      <Card
                        data-testid="method-card"
                        key={method.id}
                        style={{
                          padding: "10px",
                          height: "50px",
                          display: "flex",
                          alignItems: "center",
                          margin: "15px",
                          borderRadius: "20px",
                          justifyContent: "space-between",
                          boxShadow: "0px 0px 25px 0px #0000000D",
                          border:
                            method.name === temporaryMethod.name
                              ? // method.name === selectedMethod.name
                                "2px solid #1D785A"
                              : "1px solid #a3a3a3",
                          color:
                            method.name === temporaryMethod.name
                              ? "#1D785A"
                              : "#a3a3a3",
                        }}
                        onClick={() => {
                          setTemporaryMethod(method);
                          // setSelectedMethod(method);
                        }}
                      >
                        <Box>
                          <Typography
                            style={{
                              fontSize: "13px",
                              fontWeight:
                                method.name === temporaryMethod.name
                                  ? "500"
                                  : "normal",
                              color:
                                method.name === temporaryMethod.name
                                  ? "#1D785A"
                                  : "",
                            }}
                          >
                            {method.name}
                          </Typography>

                          <Box sx={{ display: "flex", gap: "5px" }}>
                            {method?.fajrTime && (
                              <Typography
                                variant="body1"
                                component="p"
                                style={{ fontSize: "10px", textWrap: "nowrap" }}
                              >
                                Fajr: {method.fajrTime}
                              </Typography>
                            )}
                            {method?.ishaTime && (
                              <Typography
                                variant="body1"
                                component="p"
                                style={{ fontSize: "10px", textWrap: "nowrap" }}
                              >
                                Isha: {method.ishaTime}
                              </Typography>
                            )}
                            {method?.maghribTime && (
                              <Typography
                                variant="body1"
                                component="p"
                                style={{ fontSize: "10px", textWrap: "nowrap" }}
                              >
                                Maghrib: {method.maghribTime}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        {/* {method.name === selectedMethod.name && ( */}
                        {/* {method.name === temporaryMethod.name && (
                          <img
                            src={checkImg}
                            alt="Check Img"
                            style={{
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                            }}
                          />
                        )} */}
                      </Card>
                    ))
                  )}
                </CardContent>
              </Box>
            ) : (
              <JuristicMethod
                selectedMethod={temporaryAsrMethod}
                setSelectedMethod={setTemporaryAsrMethod}
              />
            )}
          </Box>

          <Box display="flex" justifyContent="space-around" mt={2}>
            <CustomBtn
              size={isLargeScreen ? "5vw" : "10vw"}
              eventHandler={handleCancelClick}
              label={"Cancel"}
              borderClr={"2px solid red"}
              TxColor={"red"}
              bgColor={"#ffff"}
              showIcon={false}
            />
            {/* {isSaveButtonVisible && ( */}
            <CustomBtn
              size={isLargeScreen ? "5vw" : "10vw"}
              eventHandler={handleSaveClick}
              label={"Save"}
              showIcon={false}
              isDisabled={!isSaveButtonVisible}
            />
            {/* )} */}
          </Box>
        </Card>
        {isConModalOpen && (
          <PrayerMethodConfModal
            isModalOpen={isConModalOpen}
            setModalOpen={setConModalOpen}
            setParentModalOpen={setModalOpen}
            setIsMethodChanged={setIsMethodChanged}
            method={selectedMethod}
            juristicMethod={selectedAsrMethod}
            masjidId={masjidId}
            tZone={tZone}
            setIsSettingsOpen={setIsSettingsOpen}
            selectedType={selectedType}
            temporaryMethod={temporaryMethod}
            temporaryAsrMethod={temporaryAsrMethod}
            setSelectedMethod={setSelectedMethod}
            setSelectedAsrMethod={setSelectedAsrMethod}
          />
        )}
      </div>
    </>
  );
};

export default PrayerCalculationMethod;
