import React from "react";
import styles from "./SuccessCard.module.css";
import ShareIcon from "@mui/icons-material/Share";
import CloseIcon from "@mui/icons-material/Close";
import SuccessTick from "../../../../../photos/Newuiphotos/Icons/successTick.svg";
import shareIcon from "../../../../../photos/Newuiphotos/Common/shareIcon.svg";

interface SuccessCardProps {
  title: string; // Title to display
  description: string; // Description to display
  onClose: () => void; // Close handler
  signup: boolean;
  shareMasjid?: () => void;
}

const SuccessCard: React.FC<SuccessCardProps> = ({
  title,
  description,
  onClose,
  signup,
  shareMasjid,
}) => {
  return (
    <div className={styles.cardContainer}>
      {/* Close Icon */}
      {!signup && (
        <CloseIcon
          className={styles.closeIcon}
          onClick={onClose}
          sx={{
            fontSize: "30px",
          }}
        />
      )}
      {/* Check Icon */}
      <div className={styles.iconContainer}>
        <img src={SuccessTick} className={styles.checkIcon} alt="" />
      </div>
      {/* Title */}
      <h2 className={styles.title}>{title}</h2>
      {/* Description */}
      <p className={styles.description}>{description}</p>

      {signup && (
        <button className={styles.continueButton} onClick={onClose}>
          Continue
        </button>
      )}

      {shareMasjid && (
        <div className={styles.shareContainer} onClick={shareMasjid}>
          <img src={shareIcon} className={styles.shareIcon} />
          <b>Share Your Masjid</b>
        </div>
      )}
    </div>
  );
};

export default SuccessCard;
