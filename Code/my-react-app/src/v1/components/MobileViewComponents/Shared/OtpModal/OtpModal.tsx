import React, { useEffect, useState } from "react";
import styles from "./OtpModal.module.css";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "../../../../photos/Newuiphotos/othercommonicons/mailIcon.svg";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-hot-toast";

interface OtpModalProps {
  email: string;
  onClose?: () => void;
  onVerify: (otp: string) => void;
  verifying: boolean;
  handleResendOtp: () => void;
  text?: string;
}

const OtpModal: React.FC<OtpModalProps> = ({
  email,
  onClose,
  onVerify,
  verifying,
  handleResendOtp,
  text,
}) => {
  const [otp, setOtp] = useState("");
  // const [countdown, setCountdown] = useState(300); // Start countdown at 0 (no countdown initially)
  const [canResend, setCanResend] = useState(false); // Resend button should be enabled initially
  const [deadline, setDeadline] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  // Handle countdown timer

  useEffect(() => {
    // If you want a 5-minute countdown, 5 * 60 = 300 seconds.
    // The “deadline” is current time + 300 seconds (in milliseconds).
    if (deadline === 0) {
      // On first mount, or you can do this inside handleResendOtpWrapper.
      setDeadline(Date.now() + 300000); // 300,000 ms = 5 minutes
      setCanResend(false);
    }
  }, [deadline]);

  // useEffect(() => {
  //   if (countdown > 0) {
  //     const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
  //     return () => clearTimeout(timer);
  //   } else {
  //     setCanResend(true); // Allow resend when countdown reaches 0
  //   }
  // }, [countdown]);
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (deadline > 0) {
      timer = setInterval(() => {
        const now = Date.now();
        const distance = deadline - now;
        if (distance <= 0) {
          // Time’s up
          clearInterval(timer!);
          setRemainingSeconds(0);
          setCanResend(true);
        } else {
          // Convert ms into full seconds
          setRemainingSeconds(Math.floor(distance / 1000));
        }
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [deadline]);
  // Format the countdown in mm:ss format
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Remove all whitespace characters (spaces, newlines, etc.)
    const cleanValue = value.replace(/\s+/g, "");
    setOtp(cleanValue);
  };

  console.log(otp);

  const handleVerify = () => {
    if (otp.trim() === "") {
      toast.dismiss();
      toast.error("Please enter the OTP code.");
      return;
    }
    onVerify(otp);
  };

  // Reset countdown and disable resend on OTP resend
  const handleResendOtpWrapper = () => {
    handleResendOtp();
    // Set a new deadline 5 minutes from now
    setDeadline(Date.now() + 300000);
    setCanResend(false);
    setOtp("");
  };

  return (
    <div className={styles.modalContainer}>
      {/* Close Icon */}
      {onClose && (
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
        <img src={CheckCircleOutlineIcon} className={styles.checkIcon} alt="" />
      </div>
      {/* Title */}
      <h2 className={styles.title}>Enter Your OTP</h2>
      {/* Description */}
      <p className={styles.description}>
        <span className={styles.email}>{text}</span> We have sent a confirmation
        code on your registered <span className={styles.email}>{email}</span>{" "}
        email address for the verification process.
      </p>

      <div className={styles.inputWrapper}>
        <label className={styles.floatingLabel}>Enter Code</label>
        {/* Input Field */}
        <input
          // pattern="[0-9]*" // restricts to numeric input
          type="text"
          value={otp}
          onChange={handleInputChange}
          className={styles.input}
          // maxLength={6} // Limit input to 6 digits
          aria-label="Enter the OTP code"
        />
      </div>

      {/* Verify Button */}
      <div className={styles.verifyButtonContainer}>
        <button
          className={`${styles.verifyButton} ${
            verifying ? styles.disabledVerify : ""
          }`}
          onClick={handleVerify}
        >
          {verifying ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Verify"
          )}
        </button>
      </div>
      {/* Resend OTP Text */}
      <p className={styles.resendText1}>
        Haven’t received the OTP yet?{" "}
        <span
          className={`${styles.resendLink} ${
            !canResend ? styles.disabledResend : ""
          }`}
          onClick={canResend && !verifying ? handleResendOtpWrapper : undefined}
        >
          Resend
        </span>
      </p>

      {/* Countdown Timer - only show when countdown is active */}
      {remainingSeconds > 0 && (
        <p className={styles.countdownText}>
          Request For Resend OTP in {formatCountdown(remainingSeconds)}.
        </p>
      )}
    </div>
  );
};

export default OtpModal;
