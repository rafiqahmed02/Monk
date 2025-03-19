import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  InputAdornment,
  useMediaQuery,
  Box,
  CircularProgress,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  RedditShareButton,
  EmailShareButton,
  FacebookIcon,
  XIcon,
  WhatsappIcon,
  TelegramIcon,
  EmailIcon,
  TelegramShareButton,
} from "react-share";
import toast from "react-hot-toast";
import { useWidgetAuth } from "../../../../../graphql-api-calls/widgetAuth/widgetAuth";
import { getWidgetUrlRootDomain } from "../../../../../helpers/WidgetUrlSetter/WidgetUrlSetter";
import {
  getDonationMessage,
  getServiceMessage,
  getProgramMessage,
} from "./messageHelperFunctions/Helper";
import { getEventMessage } from "./messageHelperFunctions/Helper";

const ShareModal = ({
  isOpen,
  onClose,
  shareLink,
  shareType,
  shareDetails,
  isRegistrationRequired,
  id,
  consumerMasjidId,
}: any) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const isLargeMobile = useMediaQuery("(max-width:768px)");

  const [shareUrl, setShareUrl] = useState(shareLink); // For dynamically updating the share URL
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const { authenticateWidget } = useWidgetAuth();

  // Helper function to encode the URL to base64
  const encodeToBase64 = (url: string) => {
    return btoa(url);
  };

  // Function to generate the share URL based on asset type
  const createShareLink = (token?: string) => {
    let baseUrl = getWidgetUrlRootDomain();

    switch (shareType) {
      case "program":
        baseUrl += `/programDetails?id=${id}&token=${token}`;
        break;
      case "event":
        baseUrl += `/eventDetails?id=${id}&token=${token}`;
        break;
      case "service":
        baseUrl += `/serviceDetails?id=${id}&token=${token}`;
        break;
      case "donation":
        baseUrl += `/donationDetails?id=${id}&token=${token}&masjidId=${consumerMasjidId}`;
        break;
      default:
        baseUrl += `/details?id=${id}&token=${token}`;
        break;
    }
    const encodebase64 = encodeToBase64(baseUrl);

    shareLink += `&redirect=${encodebase64}`; // Add redirect param if registration is required

    return shareLink;
  };

  // Authenticate and generate the share URL if required
  const handleAuthenticate = async () => {
    setIsLoading(true);
    try {
      setIsError(false);
      const response = await authenticateWidget(consumerMasjidId, shareType);
      const token = response.data.widgetAuth; // Assuming this is where the token is returned
      const generatedUrl = createShareLink(token);
      setShareUrl(generatedUrl); // Update the share URL with the generated one

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setIsError(true);
      console.error("Error during authentication:", err);
    }
  };

  // Generate the share link on modal open or whenever conditions change
  useEffect(() => {
    if (isOpen) {
      console.log(isRegistrationRequired);
      if (isRegistrationRequired) {
        handleAuthenticate(); // Only authenticate if registration is required
      } else {
        setShareUrl(shareLink);
      }
    } else {
      setShareUrl(shareLink);
    }
  }, [isOpen, isRegistrationRequired, shareLink]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Copied!");
  };

  const getMessage = () => {
    switch (shareType) {
      case "event":
        return getEventMessage(shareDetails, shareUrl, isRegistrationRequired);
      case "service":
        return getServiceMessage(
          shareDetails,
          shareUrl,
          isRegistrationRequired
        );
      case "program":
        return getProgramMessage(
          shareDetails,
          shareUrl,
          isRegistrationRequired
        );
      case "donation":
        return getDonationMessage(shareDetails, shareUrl);
      default:
        return "";
    }
  };

  const getSubject = () => {
    switch (shareType) {
      case "event":
        return `Join ${shareDetails.masjidName} for ${shareDetails.name}`;
      case "service":
        return `Book your appointment for ${shareDetails.name} services at ${shareDetails.masjidName}`;
      case "program":
        return `New program: ${shareDetails.name} at ${shareDetails.masjidName}`;
      case "donation":
        return `Support the ${shareDetails.name} cause at ${shareDetails.masjidName}`;
      default:
        return "Sharing details from ConnectMasjid";
    }
  };

  const message = React.useMemo(
    () => getMessage(),
    [shareDetails, shareUrl, shareType, isRegistrationRequired]
  );

  const subject = React.useMemo(() => getSubject(), [shareType, shareDetails]);

  const handleShareClick = () => {
    const shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      message
    )}`;
    window.open(shareLink, "_blank");
  };

  // Facebook share onClick handler to copy the share link to clipboard
  const handleFacebookShare = () => {
    navigator.clipboard.writeText(message);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Dialog
      data-testid="share-modal"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          padding: "0px",
          margin: "0px",
          width: isMobile ? "100%" : isLargeMobile ? "60%" : "40%",
          borderRadius: "22px",
        },
      }}
      sx={{
        "& .MuiDialog-container": {
          alignItems: isMobile ? "flex-end" : "center",
        },
      }}
    >
      <DialogTitle>
        Share
        <IconButton
          data-testid="close-button"
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "20px",
            position: "relative",
          }}
        >
          <Box
            sx={{
              "& .react-share__ShareButton svg path": {
                transform: "translate(-1%, 2%)",
              },
            }}
          >
            <button
              onClick={handleShareClick}
              disabled={isLoading || isError}
              style={{
                backgroundColor: "transparent",
                border: "none",
                padding: "0px",
                font: "inherit",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <WhatsappIcon size={45} round />
            </button>
          </Box>

          <FacebookShareButton
            url={shareUrl}
            disabled={isLoading || isError}
            onClick={handleFacebookShare}
          >
            <FacebookIcon size={45} round />
          </FacebookShareButton>

          <TwitterShareButton url={message} disabled={isLoading || isError}>
            <XIcon size={45} round />
          </TwitterShareButton>

          {/* <TelegramShareButton url={message}>
            <TelegramIcon size={45} round />
          </TelegramShareButton> */}

          <EmailShareButton
            url={message}
            subject={subject}
            disabled={isLoading || isError}
          >
            <EmailIcon size={45} round />
          </EmailShareButton>
        </div>
        <TextField
          fullWidth
          value={
            isLoading
              ? "loading..."
              : isError
              ? "Unexpected Error Occured..."
              : shareUrl
              ? shareUrl
              : ""
          }
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                {isLoading ? (
                  <CircularProgress size={24} /> // Show loader while loading
                ) : isError ? (
                  <ErrorOutlineIcon color="error" /> // Show error icon when there's an error
                ) : (
                  <IconButton onClick={handleCopy}>
                    <ContentCopyIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
