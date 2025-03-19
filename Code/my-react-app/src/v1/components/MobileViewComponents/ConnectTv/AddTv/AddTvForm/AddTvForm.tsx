import React, { useState } from "react";
import PairingIcon from "../../../../../photos/Newuiphotos/Icons/Tvimages/pairingimage.svg";
import { Backdrop, Typography } from "@mui/material";
import BackButton from "../../../Shared/BackButton";
import SuccessMessageModel from "../../../../../helpers/SuccessMessageModel/SuccessMessageModel";
import styles from "./AddTvForm.module.css";
import Page from "../TVOption/page";
import toast from "react-hot-toast";
import { useNavigationprop } from "../../../../../../MyProvider";
import {
  customNavigatorTo,
  useCustomParams,
} from "../../../../../helpers/HelperFunction";
import { useAppDispatch, useAppSelector } from "../../../../../redux/hooks";
import { pairTv } from "../../../../../redux/actions/TvActions/TvActions";
import CustomTooltip from "../../../Shared/Tooltip/CustomTooltip";

const AddTvForm: React.FC<{ setShowAddTv?: (show: boolean) => void }> = ({
  setShowAddTv,
}) => {
  const [tvName, setTvName] = useState(""); // Store TV name
  const [tvCode, setTvCode] = useState(""); // Store TV code
  const [pairing, setPairing] = useState(false);
  const [pairSuccess, setPairSuccess] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const [open, setOpen] = useState(false);
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  const [tooltipTimeouts, setTooltipTimeouts] = useState<
    Record<string, NodeJS.Timeout>
  >({});

  // If you need to use the newly paired TV details after pairing is successful,
  // create local state to store it:
  const [newTvDetail, setNewTvDetail] = useState<any>(null);
  const masjidId = useCustomParams();

  const navigation = useNavigationprop();
  const dispatch = useAppDispatch();
  const pairingState = useAppSelector(
    (state) => state.tvReducers.pairingStatus
  );

  const handleBackBtn = () => {
    navigation ? navigation("/feed/8") : customNavigatorTo("/feed/8");
  };

  const handlePair = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // If you prefer local validation in addition to HTML 'required':
    if (!tvName || !tvCode) {
      toast.error("Please fill in both the TV name and code.");
      return;
    }

    setPairing(true);

    dispatch(pairTv(tvCode, tvName, masjidId))
      .then((data) => {
        // If your action creator returns TV details, you can store them:
        setNewTvDetail(data);
        // Show success modal
        setOpenSuccessModal(true);
        toast.success("TV Paired Successfully");
      })
      .catch((error) => {
        console.error("Pairing failed:", error.response);
        const err =
          error.response?.data === "mongo: no documents in result\n"
            ? "Invalid Pairing Code"
            : error.response?.data || "Pairing Failed";
        toast.dismiss();
        toast.error(err);
      })
      .finally(() => {
        setPairing(false);
      });
  };

  const handleCloseSuccessModal = () => {
    setOpenSuccessModal(false);
    setPairSuccess(true);
  };

  const handleTooltipOpen = (id: string) => {
    // Clear any existing timeout for this tooltip
    if (tooltipTimeouts[id]) {
      return;
    }
    const newTimeouts: Record<string, NodeJS.Timeout> = {};
    Object.values(tooltipTimeouts).forEach(clearTimeout);
    setTooltipTimeouts({});

    // Open the tooltip
    setOpenTooltipId(id);
    setOpen(true);

    // Set a timeout to close the tooltip after 10 seconds
    const timeout = setTimeout(() => {
      setOpen(false);
      setOpenTooltipId(null);
      setTooltipTimeouts({});
    }, 10000);

    newTimeouts[id] = timeout;
    // Store the timeout in the Map
    setTooltipTimeouts(newTimeouts);
  };

  const handleClickOutside = (e: MouseEvent) => {
    // Close all tooltips
    e.stopPropagation();
    if (Object.keys(tooltipTimeouts).length > 0) {
      Object.values(tooltipTimeouts).forEach(clearTimeout);
      setTooltipTimeouts({});
      setOpen(false);
      setOpenTooltipId(null);
    }
  };

  const handleAllTooltipsClose = () => {
    if (Object.keys(tooltipTimeouts).length > 0) {
      Object.values(tooltipTimeouts).forEach(clearTimeout);
      setTooltipTimeouts({});
      setOpen(false);
      setOpenTooltipId(null);
    }
  };

  return (
    <>
      {pairSuccess ? (
        <Page tvName={tvName} newTvDetail={newTvDetail} MasjidId={masjidId} />
      ) : (
        <div style={{ padding: "5px" }}>
          <div>
            <div className={styles.titleContainer}>
              <div className="goback" style={{ marginTop: "0" }}>
                <BackButton handleBackBtn={handleBackBtn} />
              </div>
              <h3 className="page-title">Add New TV</h3>
            </div>
          </div>

          <div className={styles.addTvForm}>
            <h5 className={styles.tvformheading}>
              Steps to Set Up Smart Tv App
            </h5>
            <form onSubmit={handlePair}>
              <div className={styles.step}>
                <p className={styles.stepText}>1. Step</p>
                <label>
                  On Your Smart Tv, Open the App Store, Search for App{" "}
                  <b
                    className={styles.appName}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTooltipOpen("1");
                    }}
                  >
                    CMZ/ConnectMasjid{" "}
                    <CustomTooltip
                      id="1"
                      open={openTooltipId === "1" && open}
                      handleTooltipOpen={handleTooltipOpen}
                      text={
                        <div className={styles.tooltipText}>
                          <label style={{ color: "black" }}>
                            Search <b style={{ color: "#1B8368" }}>"CMZ"</b> on
                            Android Tv, Google Tv, Fire Tv and Fire Tv Stick.{" "}
                            <br />
                            Search{" "}
                            <b style={{ color: "#1B8368" }}>
                              "ConnectMasjid"
                            </b>{" "}
                            On LG TV.
                            <br />
                            For Samsung TVs, Follow These steps:{" "}
                            <a
                              href="https://connectmazjid.com/how-to-install-the-cmz-app-on-samsung-tv/"
                              target="_blank"
                              style={{
                                color: "#1B8368",
                                textDecoration: "underline",
                                fontWeight: "bold",
                              }}
                            >
                              Samsung TV Setup Steps.
                            </a>
                            <br />
                            Support for More Tvs is Coming Soon, for Now Use{" "}
                            <a
                              href="https://www.amazon.com/dp/B091GJ72FP?ref=ppx_yo2ov_dt_b_fed_asin_title"
                              target="_blank"
                              style={{
                                color: "#1B8368",
                                textDecoration: "underline",
                                fontWeight: "bold",
                              }}
                            >
                              Fire TV Stick
                            </a>{" "}
                            or{" "}
                            <a
                              href="https://business.walmart.com/ip/onn-Google-TV-Full-HD-Streaming-Device-New-2023/2262757145?wmlspartner=wlpa&selectedSellerId=0&wmlspartner=wlpa&cn=FY25-ENTP-PMAX_cnv_dps_dsn_dis_ad_entp_e_n&gclsrc=aw.ds&adid=222222222972262757145_0_b2b_0000000000_21407473164&wl0=&wl1=x&wl2=c&wl3=&wl4=&wl5=9026850&wl6=&wl7=&wl8=&wl9=pla&wl10=5054601392&wl11=online&wl12=2262757145_0_b2b&veh=sem&gad_source=1&gclid=CjwKCAiAn9a9BhBtEiwAbKg6fnFtK9LGMa_8RgQYxDfnEv0pjfMN_vTrc1JnvVVsRc6m7v7sdxx-NxoCkVAQAvD_BwE"
                              style={{
                                color: "#1B8368",
                                textDecoration: "underline",
                                fontWeight: "bold",
                              }}
                              target="_blank"
                            >
                              Android TV Stick
                            </a>
                            .
                          </label>
                        </div>
                      }
                      tooltipStyle={{
                        boxShadow: "0px 0px 10.25px 0px #0000001A",
                      }}
                      popperProps={{
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, -14], // Adjust the tooltip position
                            },
                          },
                        ],
                      }}
                      handleClickOutside={handleClickOutside}
                    />
                  </b>
                </label>
              </div>
              <div className={styles.step}>
                <p className={styles.stepText}>2. Step</p>
                <label>
                  Launch <b style={{ textWrap: "nowrap" }}>CMZ/ConnectMasjid</b>{" "}
                  App on Your TV and Find <b>“Unique Code”</b> Displayed on the
                  App.
                </label>
              </div>

              <div className={styles.step}>
                <p className={styles.stepText}>3. Step</p>
                <label>Enter the Code Displayed on the TV</label>
                <div className={styles.inputWithIcon}>
                  <input
                    className={styles.noSpinInput}
                    type="number"
                    required
                    onKeyDown={(e) =>
                      ["e", ".", "-", "ArrowUp", "ArrowDown", "+"].includes(
                        e.key
                      ) && e.preventDefault()
                    }
                    onWheel={(e) => e.target.blur()}
                    value={tvCode}
                    onChange={(e) => setTvCode(e.target.value)} // Capture TV code
                  />
                </div>
              </div>
              <div className={styles.step}>
                <p className={styles.stepText}>4. Step</p>
                <label>Give an Alias Name for the TV.</label>
                <input
                  type="text"
                  placeholder="Your TV Name"
                  required
                  value={tvName}
                  onChange={(e) => setTvName(e.target.value)}
                />
              </div>
              <button type="submit" className={styles.submitButton}>
                Pair
              </button>
            </form>
          </div>

          <SuccessMessageModel
            message={"TV Successfully Paired"}
            open={openSuccessModal}
            onClose={handleCloseSuccessModal}
          />

          <Backdrop
            open={pairing}
            sx={{
              zIndex: "10",
            }}
          >
            <div className={styles.pairingPopup}>
              <b>
                <em>{tvName}</em>
              </b>
              <img src={PairingIcon} alt="" style={{ width: "180px" }} />
              <p>Your device is pairing.....</p>
              <button onClick={() => setPairing(false)}>Cancel</button>
            </div>
          </Backdrop>
        </div>
      )}
    </>
  );
};

export default AddTvForm;
