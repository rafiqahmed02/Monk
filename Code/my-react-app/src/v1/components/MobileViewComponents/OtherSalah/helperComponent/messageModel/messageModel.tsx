import React, { useEffect, useState } from "react";
import styles from "./messageModel.module.css";
import { CircularProgress } from "@mui/material";

interface MessageModelProps {
  onClose: () => void;
  onConfirm: () => void;
  messageType: string;
  message?: string;
  isLoading?: boolean;
  img?: string;
  children?: React.ReactNode;
  optionalValues?: any;
}

const MessageModel: React.FC<MessageModelProps> = ({
  onClose,
  onConfirm,
  messageType,
  message,
  isLoading,
  img,
  children,
  optionalValues,
}: MessageModelProps) => {
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    if (img) {
      const backgroundImage = new Image();
      backgroundImage.src = img;
      backgroundImage.onload = () => setBgLoaded(true);
    }
  }, [img]);

  return (
    <div>
      <div className={styles.popupOverlay}>
        {bgLoaded && (
          <div className={styles.popupContent}>
            <img src={img} alt="Delete Message" className={styles.popupImage} />
            {optionalValues && optionalValues.icon}
            <div className={styles.popupText}>
              <div className={styles.textContainer}>
                <div className={styles.popupTextHeading}>{messageType}</div>
                <div className={styles.subtext}>{message}</div>
              </div>
              {children && (
                <div className={styles.popupTextSubtext}>{children}</div>
              )}
              <div className={styles.popupButtons}>
                <button
                  className={styles.noButton}
                  onClick={onClose}
                  disabled={isLoading}
                >
                  No
                </button>
                <button
                  className={styles.yesButton}
                  onClick={onConfirm}
                  disabled={isLoading}
                  style={optionalValues && optionalValues.btnColor}
                >
                  {isLoading ? (
                    <CircularProgress color="inherit" size={15} />
                  ) : (
                    "Yes"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageModel;
