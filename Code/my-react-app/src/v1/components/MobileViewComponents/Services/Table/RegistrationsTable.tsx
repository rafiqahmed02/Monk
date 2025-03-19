import React, { useState } from "react";
import {
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import {
  fontSize,
  fontWeight,
  maxWidth,
  padding,
  styled,
  width,
} from "@mui/system";

import CustomBtn from "../../Shared/CustomBtn";

import BackButton from "../../Shared/BackButton";

import "./RegistrationsTable.css";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import {
  customNavigatorTo,
  useCustomParams,
} from "../../../../helpers/HelperFunction";
import { GET_USERS_FOR_SERVICE } from "../../../../graphql-api-calls/query";
import { useQuery } from "@apollo/client";
import { useNavigationprop } from "../../../../../MyProvider";
import ServiceUserDetails from "../ServiceUserDetails/ServiceUserDetails";
import moment from "moment";
import CustomButton from "../../Shared/NewComponents/CustomButton/CustomButton";
import { BasicButtonStyle } from "../../SharedHelpers/helpers";
import CustomDropdown from "../../Donation/History/CustomDropdown";
// const CustomTableCell = styled(TableCell)<{
//   isLeftAligned?: string;
//   isHeader?: string;
// }>(({ theme, isLeftAligned, isHeader }) => ({
//   // padding: isHeader ? "0px" : "4px",
//   // textAlign: isLeftAligned ? "left" : "center",
//   // fontWeight: isHeader ? "bolder !important" : "500 !important", // Set bold for header cells
//   fontFamily: "Lato !important",
//   // fontSize: isHeader ? "0.8rem" : "0.875rem",
// }));

const CustomTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#F6F6F6",
  },
  "&:nth-of-type(even)": {
    backgroundColor: "white",
  },
}));
const CustomTextField = styled(TextField)(({ theme }) => ({
  width: "95%",
  margin: "16px",
  [theme.breakpoints.down("sm")]: {
    margin: "0px 3px 0px 6px",
    fontSize: "0.7rem",
    "& .MuiOutlinedInput-root": {
      padding: "2px !important",
    },
  },
  "& .MuiOutlinedInput-root": {
    // padding: "4px",
    borderRadius: "22px",
    border: "1px solid #606060", // Border for the text field
    padding: "5px",
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
    marginLeft: "2px",
  },
  "& .MuiInputBase-input": {
    padding: "4px 4px",
    fontSize: "0.8rem",
  },
}));
type props = {
  handleToggleRegistrationTable: (val: any) => void;
  id: string;
  formData: any;
  tZone: string;
};

const RegistrationsTable = ({
  handleToggleRegistrationTable,
  id,
  formData,
  tZone,
}: props) => {
  const navigation = useNavigationprop();
  // console.log("formData=> ", formData);
  const isMobile = useMediaQuery("(max-width:450px)");
  const isLargeMobile = useMediaQuery("(max-width:768px)");

  const [isFinancialRegDetailsVisible, setIsFinancialRegDetailsVisible] =
    useState(false);
  const [user, setUser] = useState({});
  const getColumnName = () => {
    if (formData.serviceName == "Financial Assistance") return "Detail";
    else return "Appointment";
  };

  const serviceId = useCustomParams();
  // const isMobile = useMediaQuery("(max-width:768px)");
  const [period, setPeriod] = useState("This Week");
  const {
    loading: serviceLoading,
    error: serviceError,
    data: ServiceData,
  } = useQuery(GET_USERS_FOR_SERVICE, {
    variables: { serviceId: id },
    fetchPolicy: "network-only",
  });

  // console.log("Registration table => ", ServiceData?.getUsersForService);
  const tickets = ServiceData?.getUsersForService ?? [];
  const [searchTerm, setSearchTerm] = useState("");

  const prayerOrder = [
    "After Fajr",
    "After Dhuhr",
    "After Asr",
    "After Maghrib",
    "After Isha",
  ];
  const handleChange = (event: any) => {
    setPeriod(event.target.value);
  };
  const filteredByPeriod = tickets.filter((ticket) => {
    // 1) Parse the UTC ISO string in UTC
    // 2) Convert to the account's time zone
    const ticketDate = tZone
      ? moment.utc(ticket.details.date).tz(tZone)
      : moment.utc(ticket.details.date);

    // Current date/time in the account's time zone
    const now = tZone ? moment().tz(tZone) : moment().utc();

    if (period === "Today") {
      // Checks if ticketDate is the same calendar day in that time zone
      return ticketDate.isSame(now, "day");
    } else if (period === "This Week") {
      // Checks if ticketDate is in the same calendar week
      // (Moment's default startOf('week') is Sunday)
      return ticketDate.isSame(now, "week");
    } else if (period === "Past") {
      // Checks if ticketDate is before today's date
      return ticketDate.isBefore(now, "day");
    }
    // else if (period === "All Registrations") {
    //   // Checks if ticketDate is in the same calendar year
    //   return ticketDate.isSame(now, "year");
    // }

    // If no filter chosen, just return true
    return true;
  });

  const filteredRegistrations = filteredByPeriod
    ?.filter(
      (ticket) =>
        ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.contact.includes(searchTerm)
    )
    .sort((a, b) => {
      // Step 1: Sort by date
      const dateDiff = moment(b.details.date).diff(moment(a.details.date));
      if (dateDiff !== 0) return dateDiff;

      // Step 2: Sort by time string (e.g., "08:00 AM - 09:00 AM")
      const timeRegex = /^\d{1,2}:\d{2} (AM|PM)/; // Matches time strings like "08:00 AM"
      const isTimeA = timeRegex.test(a.details.time);
      const isTimeB = timeRegex.test(b.details.time);

      if (isTimeA && isTimeB) {
        const startTimeA = moment(a.details.time.split(" - ")[0], "hh:mm A");
        const startTimeB = moment(b.details.time.split(" - ")[0], "hh:mm A");
        return startTimeA.diff(startTimeB);
      }

      if (isTimeA) return -1; // Time strings should come before prayer-based times
      if (isTimeB) return 1;

      // Step 3: Sort by prayer times
      const prayerIndexA = prayerOrder.indexOf(a.details.time);
      const prayerIndexB = prayerOrder.indexOf(b.details.time);

      if (prayerIndexA !== -1 && prayerIndexB !== -1) {
        return prayerIndexA - prayerIndexB;
      }

      if (prayerIndexA !== -1) return -1; // Prayer times should come before invalid/missing times
      if (prayerIndexB !== -1) return 1;

      // Default case for any unhandled time values
      return 0;
    });

  const openDetails = (user: any) => {
    setUser(user);
  };

  const headingStyle = {
    // padding: "10px !important",
    fontSize: isMobile ? "0.7rem" : "0.795rem",

    // fontWeight: "600",
  };
  const ticketNameStyle = {
    fontSize: isMobile ? "0.65rem" : isLargeMobile ? "0.7rem" : "0.865rem",
    fontWeight: "600",
  };
  const ticketEmailStyle = {
    fontSize: isMobile ? "0.6rem" : isLargeMobile ? "0.65rem" : "0.775rem",
  };

  const ticketPhoneAppointmentStyle = {
    fontSize: isMobile ? "0.6rem" : isLargeMobile ? "0.65rem" : "0.795rem",
  };

  return (
    <>
      {user?.name ? (
        <ServiceUserDetails user={user} setUser={setUser} formData={formData} />
      ) : (
        <div className="registrations-table">
          <div className={"title-container"}>
            <div className="goback" style={{ marginTop: "0" }}>
              {/* <div> */}
              <BackButton handleBackBtn={handleToggleRegistrationTable} />
              {/* </div> */}
            </div>
            <h3
              className="page-title"
              data-testid="page-title"
              style={{ color: "#054635" }}
            >
              {formData.serviceName} Registered Users
            </h3>
          </div>
          <Box
            sx={{
              fontFamily: "Lato !important",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            className="registration-table-box"
          >
            <>
              {/* <div className="donationTopbar">
                <div className="topbarflex">
                  <div className="goback">
                    <BackButton handleBackBtn={handleToggleRegistrationTable} />
                  </div>
                  <h3 className="page-title">
                    {formData.serviceName} Registered Users
                  </h3>
                </div>
              </div> */}

              <TableContainer
                component={Paper}
                sx={{
                  minHeight: "450px",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "13px",
                    boxSizing: "border-box",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#2E382E",
                      fontWeight: "600",
                      fontSize: isMobile ? "0.875rem" : "1rem",
                    }}
                  >
                    Registration Fees
                  </Typography>
                  <Typography
                    sx={{
                      color: "#1D785A",
                      fontWeight: "600",
                      fontSize: isMobile ? "0.875rem" : "1rem",
                    }}
                  >
                    {formData.cost === "0" ||
                    formData.cost === 0 ||
                    formData.cost === null
                      ? "Free"
                      : "$" + formData.cost}
                  </Typography>
                </div>

                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CustomTextField
                    variant="outlined"
                    fullWidth
                    placeholder="Search Registered users"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <CustomDropdown
                    isMobile={isMobile}
                    period={period}
                    handleChange={handleChange}
                  />
                </div>
                <Table stickyHeader sx={{ padding: isMobile ? "0px" : "10px" }}>
                  <TableHead>
                    <TableRow className="service-reg-table-title">
                      <TableCell
                        sx={{
                          ...headingStyle,
                          maxWidth: "30%",
                          overflow: "hidden",
                        }}
                      >
                        Name/Email
                      </TableCell>
                      <TableCell sx={{ ...headingStyle }}>Phone</TableCell>
                      {formData.serviceName !== "Financial Assistance" && (
                        <TableCell sx={{ ...headingStyle }}>
                          {getColumnName()}
                        </TableCell>
                      )}
                      <TableCell sx={headingStyle}>{/* Detail */}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRegistrations.length > 0 ? (
                      filteredRegistrations.map((ticket: any) => (
                        <CustomTableRow
                          key={ticket.email}
                          sx={
                            formData.serviceName !== "Financial Assistance" &&
                            moment
                              .utc(ticket.details.date)
                              .tz(tZone)
                              .startOf("day")
                              .isBefore(moment().tz(tZone).startOf("day"))
                              ? {
                                  "& td": {
                                    color: "#888",
                                  },
                                }
                              : {}
                          }
                        >
                          <TableCell sx={{}}>
                            <Typography sx={ticketNameStyle}>
                              {ticket.name}
                            </Typography>
                            <Typography sx={ticketEmailStyle}>
                              {ticket.email}
                            </Typography>
                          </TableCell>
                          <TableCell sx={ticketPhoneAppointmentStyle}>
                            {ticket.contact}
                          </TableCell>
                          {formData.serviceName !== "Financial Assistance" && (
                            <TableCell sx={ticketPhoneAppointmentStyle}>
                              {`${ticket.details.time} (${moment(
                                ticket.details.date
                              ).format("DD MMM, YYYY")})`}
                            </TableCell>
                          )}
                          <TableCell>
                            <CustomButton
                              text="Details"
                              buttonStyle={{
                                ...BasicButtonStyle,
                                padding: isMobile ? "1px" : "3px",
                                fontSize: isMobile
                                  ? "0.6rem"
                                  : isLargeMobile
                                  ? "0.65rem"
                                  : "0.775rem",
                                width: "100%",
                                maxWidth: "100px",
                              }}
                              onClick={() => openDetails(ticket)}

                              // eventHandler={() => openDetails(ticket)}
                              // size={"10px"}
                              // fontSize={"10px"}
                              // hightSize={"20px"}
                              // showIcon={false}
                              // label="Details"
                            />
                          </TableCell>
                        </CustomTableRow>
                      ))
                    ) : (
                      <TableCell
                        colSpan={
                          formData.serviceName !== "Financial Assistance"
                            ? 4
                            : 3
                        }
                      >
                        <Typography
                          sx={{
                            textAlign: "center",
                            padding: "20px",
                            marginTop: "20vh",
                            fontSize: "1rem",
                            fontWeight: "bold",
                            color: "#929292",
                          }}
                        >
                          {serviceLoading ? (
                            <CircularProgress />
                          ) : serviceError ? (
                            "Error Fetching Registered Users"
                          ) : filteredRegistrations.length === 0 &&
                            tickets.length > 0 ? (
                            "No Match Found"
                          ) : tickets.length <= 0 ? (
                            "No Registered Users Yet"
                          ) : (
                            ""
                          )}
                        </Typography>
                      </TableCell>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          </Box>
        </div>
      )}
    </>
  );
};

export default RegistrationsTable;
