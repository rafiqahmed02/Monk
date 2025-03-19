import React from "react";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import moment from "moment";
import FajrIcon from "../../../../photos/Newuiphotos/Icons/prayerIcons/Fajar.webp";
import DhurIcon from "../../../../photos/Newuiphotos/Icons/prayerIcons/dhur.webp";
import AsarIcon from "../../../../photos/Newuiphotos/Icons/prayerIcons/asr.webp";
import MaghribIcon from "../../../../photos/Newuiphotos/Icons/prayerIcons/magrib.webp";
import IshaIcon from "../../../../photos/Newuiphotos/Icons/prayerIcons/isha.webp";
import noPrayer from "../../../../photos/Newuiphotos/Icons/prayerIcons/nosalahtiming.png";
import "./PrayerBox.css";
import { NamajTiming } from "../../../../redux/Types";
import ProgressLoader from "../Loader/Loader";

export const icons: { [key: string]: string } = {
  Fajr: FajrIcon,
  Dhur: DhurIcon,
  Asar: AsarIcon,
  Maghrib: MaghribIcon,
  Isha: IshaIcon,
};

type propsType = {
  tZone: string;
  prayer: NamajTiming<number | string>[];
  children: React.ReactNode;
  timingId?: string;
  masjidId?: string;
  reloader?: () => void;
  date?: string;
  loading?: boolean;
  noneSalahFound?: boolean;
};
const PrayerBox = ({
  tZone,
  prayer,
  children,
  reloader,
  date,
  loading,
  noneSalahFound = true,
}: propsType) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.up("sm"));
  const isLarge = useMediaQuery("(min-width: 2000px)");
  const timeZoneHandler = (tm: number | string) => {
    if (typeof tm === "number")
      return moment.unix(tm)?.tz(tZone)?.format("hh:mm A");
    else return moment.tz(tm, "HH:mm", tZone).format("hh:mm A");
  };

  const normalStyle = `.PrayerTimings-box .Prayer-card-Tr td,
.PrayerTimings-box .Prayer-card-header th,
.PrayerTimings-box .Prayer-card-Tr th {
  width:25vw;
  text-align:center
}
`;

  return (
    <div className="prayerTable">
      {loading ? (
        <ProgressLoader />
      ) : (
        <TableContainer
          component={Paper}
          style={{ width: "100%", boxShadow: "none", borderRadius: "20px" }}
        >
          {children}
          <Table
            aria-label="prayer timings table"
            sx={{
              marginBottom: "8px",
              borderCollapse: "collapse",
              "& .MuiTableRow-root, & .MuiTableCell-root": {
                border: "none",
                fontWeight: 500,
                // fontFamily: '"Inter", sans-serif',
              },
              "& .MuiTableHead-root .MuiTableRow-root": {
                borderTop: "0.1px solid #afbfba",
                borderBottom: "0.1px solid #afbfba",
              },
              "& .MuiTableBody-root .MuiTableRow-root:last-child": {
                borderBottom: "0.1px solid #afbfba",
              },
            }}
          >
            <colgroup>
              <col style={{ width: "33.33%" }} />
              <col style={{ width: "33.33%" }} />
              <col style={{ width: "33.33%" }} />
            </colgroup>
            <TableHead>
              <TableRow sx={{ border: "none" }}>
                <TableCell
                  align="center"
                  style={{
                    fontWeight: 700,
                    color: "#A5A5A5",
                    padding: " 12px",
                    fontSize: isLarge
                      ? "1.4rem"
                      : isMobile
                      ? "0.875rem"
                      : "0.8rem",
                  }}
                >
                  Salah
                </TableCell>
                <TableCell
                  align="center"
                  style={{
                    fontWeight: 700,
                    color: "#A5A5A5",
                    padding: " 12px",
                    fontSize: isLarge
                      ? "1.4rem"
                      : isMobile
                      ? "0.875rem"
                      : "0.8rem",
                  }}
                >
                  Azan
                </TableCell>
                <TableCell
                  align="center"
                  style={{
                    fontWeight: 700,
                    color: "#A5A5A5",
                    padding: " 12px",
                    fontSize: isLarge
                      ? "1.4rem"
                      : isMobile
                      ? "0.875rem"
                      : "0.8rem",
                  }}
                >
                  Iqama
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prayer?.length !== 0 ? (
                prayer?.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      border: "none",
                      fontWeight: "700",
                      fontFamily: "Inter sans-serif",
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      align="left" // Changed from center to left
                      style={{
                        padding: "10px", // Adjust padding as needed
                        display: "table-cell", // Ensuring default table cell display
                        fontSize: isLarge
                          ? "1.4rem"
                          : isMobile
                          ? "0.875rem"
                          : "0.8rem",
                      }}
                    >
                      <div
                        className="Prayer-card-Tr"
                        style={{
                          textAlign: "center",
                          marginLeft: "auto",
                          paddingLeft:
                            row.namazName === "Maghrib" && isMobile
                              ? "23px"
                              : "",
                        }}
                      >
                        <img
                          src={icons[row.namazName]}
                          alt=""
                          style={{
                            width: isMobile
                              ? ["Maghrib", "Isha"].includes(row.namazName)
                                ? "19px"
                                : "25px"
                              : ["Maghrib", "Isha"].includes(row.namazName)
                              ? "16px"
                              : "20px",
                            height: isMobile
                              ? ["Maghrib", "Isha"].includes(row.namazName)
                                ? "19px"
                                : "25px"
                              : ["Maghrib", "Isha"].includes(row.namazName)
                              ? "16px"
                              : "20px",
                            marginRight: "10px", // Spacing between icon and text, adjust as needed
                            verticalAlign: "middle", // Align icon vertically with text
                          }}
                        />
                        {row.namazName}
                      </div>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={
                        window.innerWidth <= 320
                          ? {
                              padding: " 7px",
                              fontSize: isLarge
                                ? "1.4rem"
                                : isMobile
                                ? "0.875rem"
                                : "0.8rem",
                            }
                          : {
                              padding: "10px",
                              fontSize: isLarge
                                ? "1.4rem"
                                : isMobile
                                ? "0.875rem"
                                : "0.8rem",
                            }
                      }
                    >
                      {typeof row.azaanTime === "number"
                        ? timeZoneHandler(row.azaanTime)
                        : timeZoneHandler(
                            moment(row.azaanTime, "HH:mm")
                              .add(
                                row?.ExtendedAzaanMinutes
                                  ? -row.ExtendedAzaanMinutes
                                  : 0,
                                "minutes"
                              )
                              .format("HH:mm")
                          )}
                      {row.ExtendedAzaanMinutes
                        ? row.ExtendedAzaanMinutes >= 0
                          ? `(+${row.ExtendedAzaanMinutes}min)`
                          : `(${row.ExtendedAzaanMinutes}min)`
                        : null}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "3px",
                        fontSize: isLarge
                          ? "1.4rem"
                          : isMobile
                          ? "0.875rem"
                          : "0.8rem",
                      }}
                    >
                      {row.jamaatTime && row.TimesByJamaat !== "No Iqama"
                        ? row.TimesByJamaat === "solar"
                          ? timeZoneHandler(
                              moment(row.jamaatTime, "HH:mm")
                                // .add(row.ExtendedJamaatMinutes, "minutes")
                                .format("HH:mm")
                            )
                          : timeZoneHandler(row.jamaatTime)
                        : "-:-"}
                      {/* {row.TimesByJamaat !== "manual" &&
                        row.ExtendedJamaatMinutes
                          ? row.ExtendedJamaatMinutes >= 0
                            ? ` (+${row.ExtendedJamaatMinutes}min)`
                            : ` (${row.ExtendedJamaatMinutes}min)`
                          : null} */}
                      {row.azaanTime && row.jamaatTime ? (
                        <div style={{ fontSize: "0.75em", color: "#1B8368" }}>
                          {reloader &&
                          row.jamaatTime &&
                          row.TimesByJamaat !== "No Iqama" &&
                          row.iqamahType === "solar"
                            ? `(Azan ${
                                row?.offset?.iqamah >= 0
                                  ? `+ ${row.offset.iqamah}`
                                  : row.offset.iqamah
                              }min)`
                            : !reloader &&
                              row.jamaatTime &&
                              row.TimesByJamaat !== "No Iqama" &&
                              row.TimesByJamaat === "solar"
                            ? `(Azan ${
                                row.ExtendedJamaatMinutes >= 0
                                  ? `+ ${row.ExtendedJamaatMinutes}`
                                  : row.ExtendedJamaatMinutes
                              }min)`
                            : ""}
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <div
                      className="notavailable"
                      style={{ color: "#9F9E9E", margin: "20px 0px" }}
                    >
                      <div>
                        <img
                          src={noPrayer}
                          alt="no prayer"
                          style={{ width: "200px" }}
                        />
                        <Typography style={{ marginTop: "15px" }}>
                          No Salah Timings{" "}
                          {noneSalahFound ? "" : "On This Date"}
                        </Typography>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default PrayerBox;
