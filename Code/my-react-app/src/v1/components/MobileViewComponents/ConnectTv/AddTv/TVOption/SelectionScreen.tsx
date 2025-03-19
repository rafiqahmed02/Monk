import { Header } from "./reusableComponent/header";
import styles from "./Option.module.css";
import SalahIcon from "../../../../../photos/Newuiphotos/menuIcons/salah.webp";
import EventIcon from "../../../../../photos/Newuiphotos/menuIcons/event.webp";
// import type { SettingType } from "./themes/settings";
import { Box, Button, styled } from "@mui/material";
import unlinkIcon from "../../TV-Photos/unlickIcon.svg";
import type { SettingType } from "./themes/themes";

interface SelectionScreenProps {
  onSelect: (type: SettingType, tv?: any) => void;
  tvData?: any;
  tvName?: string;
  onUnlink: (id?: string) => void;
}

const ButtonContainer = styled(Box)({
  display: "flex",
  gap: "12px",
  marginTop: "auto",
  justifyContent: "center",
  alignItems: "center",
});

const UnlinkButton = styled(Button)({
  backgroundColor: "white",
  border: "2px solid #FF7272",
  color: "#FF6B6B",
  textTransform: "none",
  borderRadius: "25px",
  padding: "8px 20px",
  "&:hover": {
    backgroundColor: "#FFF0F0",
  },
});

export function SelectionScreen({
  onSelect,
  tvData,
  tvName,
  onUnlink,
}: SelectionScreenProps) {
  return (
    <div>
      {Array.isArray(tvData) ? (
        tvData.map((tv: any) => (
          <div className={styles.tvOptions} key={tv._id}>
            <div className={styles.tvViewSelection}>
              <Header name={tv.name} />
              <p className={styles.selectOption}>
                Select Option to Display on Tv
              </p>
              <div className={styles.salahView}>
                <div
                  className={styles.viewName}
                  onClick={() => onSelect("prayer-times", tv)}
                >
                  <div className={styles.viewContent}>
                    {/* <img src={SalahIcon} alt="Salah Timings" /> */}
                    <b>Salah Timings</b>
                  </div>
                  {tv?.permissions?.length != 2 &&
                    tv?.permissions[0] === "prayer-times" && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <div className={styles.activedot}></div>
                        <p
                          style={{
                            fontSize: "12px",
                            margin: "0",
                            color: "#00c986",
                          }}
                        >
                          Active
                        </p>
                      </div>
                    )}
                </div>
                <div
                  className={styles.viewName}
                  onClick={() => onSelect("events", tv)}
                >
                  <div className={styles.viewContent}>
                    {/* <img src={EventIcon} alt="Events" /> */}
                    <b>Events</b>
                  </div>
                  {tv?.permissions?.length != 2 &&
                    tv?.permissions[0] === "events" && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <div className={styles.activedot}></div>
                        <p
                          style={{
                            fontSize: "12px",
                            margin: "0",
                            color: "#00c986",
                          }}
                        >
                          Active
                        </p>
                      </div>
                    )}
                </div>
                <div
                  className={styles.viewName}
                  onClick={() => onSelect("salah+events", tv)}
                >
                  <div className={styles.viewContent}>
                    {/* <img src={EventIcon} alt="Events" /> */}
                    <b>Salah Timings + Events</b>
                  </div>
                  {tv?.permissions?.length === 2 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <div className={styles.activedot}></div>
                      <p
                        style={{
                          fontSize: "12px",
                          margin: "0",
                          color: "#00c986",
                        }}
                      >
                        Active
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <ButtonContainer>
                <UnlinkButton onClick={() => onUnlink(tv._id)}>
                  <img
                    src={unlinkIcon}
                    alt=""
                    style={{
                      width: "15px",
                      height: "15px",
                      marginRight: "5px",
                    }}
                  />{" "}
                  Unpair Device
                </UnlinkButton>
              </ButtonContainer>
            </div>
          </div>
        ))
      ) : (
        <div className={styles.tvOptions}>
          <div className={styles.tvViewSelection}>
            <Header name={tvName} />
            <p className={styles.selectOption}>Select Option to Display on</p>
            <div className={styles.salahView}>
              <div
                className={styles.viewName}
                onClick={() => onSelect("prayer-times", tvData)}
              >
                <div className={styles.viewContent}>
                  {/* <img src={SalahIcon} alt="Salah Timings" /> */}
                  <b>Salah Timings</b>
                </div>
              </div>
              <div
                className={styles.viewName}
                onClick={() => onSelect("events", tvData)}
              >
                <div className={styles.viewContent}>
                  {/* <img src={EventIcon} alt="Events" /> */}
                  <b>Events</b>
                </div>
              </div>
              <div
                className={styles.viewName}
                onClick={() => onSelect("salah+events", tvData)}
              >
                <div className={styles.viewContent}>
                  {/* <img src={EventIcon} alt="Events" /> */}
                  <b>Salah Timings + Events</b>
                </div>
              </div>
            </div>
            {/* <ButtonContainer>
              <UnlinkButton onClick={() => onUnlink()}>
                <img
                  src={unlinkIcon}
                  alt=""
                  style={{
                    width: "15px",
                    height: "15px",
                    marginRight: "5px",
                  }}
                />{" "}
                Unpair Device
              </UnlinkButton>
            </ButtonContainer> */}
          </div>
        </div>
      )}
    </div>
  );
}
