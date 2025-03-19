import styles from "./TVCard.module.css";
import { getImagePath2 } from "../helperfunc";
import edit from "../../../../photos/Newuiphotos/Icons/Edit.svg";

const TVCard = ({ TvData, onSelect, setScreen }: any) => {
  const { theme, permissions, _id, orientation } = TvData;
  const [themeName, color] = theme.split("-");

  const TVType =
    permissions.length === 2
      ? "salah+events"
      : permissions[0] === "events"
      ? "events"
      : "prayer-times";

  const isNotConfigured =
    theme === "none" || !orientation || permissions.length === 0;

  console.log(permissions, TVType);

  return (
    <div className={styles.tvCardContainer} key={_id}>
      {/* Device Name */} <h2 className={styles.deviceName}>{TvData.name}</h2>
      {/* Card Content */}
      <div className={styles.card}>
        {/* Placeholder or dynamic image */}
        <img
          src={
            isNotConfigured
              ? ""
              : getImagePath2(TVType, themeName, TvData.orientation, color)
          }
          alt="No TV"
          className={styles.cardImage}
        />
        <div className={styles.rightContainer}>
          <div className={styles.cardDetails}>
            <h3 className={styles.cardTitle}>
              {`${
                permissions.length === 2
                  ? "Salah + Events"
                  : permissions[0] === "events"
                  ? "Events"
                  : "Salah Timings"
              }`}
            </h3>
            <p className={styles.cardSubtitle}>
              {permissions.length != 2 && permissions[0] === "prayer-times"
                ? themeName
                : color}
            </p>

            {/* Status row */}
            <div className={styles.statusContainer}>
              <span className={styles.statusDot}></span>
              <span className={styles.statusText}>Active</span>
            </div>
          </div>{" "}
          <img src={edit} alt="" onClick={() => onSelect(TVType, TvData)} />
        </div>
      </div>
    </div>
  );
};

export default TVCard;
