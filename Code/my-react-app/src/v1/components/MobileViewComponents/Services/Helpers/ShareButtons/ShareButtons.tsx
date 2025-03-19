import React, { useEffect, useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  RedditShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  RedditIcon,
  EmailIcon,
} from "react-share";
import toast from "react-hot-toast";
import { useWidgetAuth } from "../../../../../graphql-api-calls/widgetAuth/widgetAuth";
import { getWidgetUrlRootDomain } from "../../../../../helpers/WidgetUrlSetter/WidgetUrlSetter";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const ShareModal = ({
  id,
  assetType,
  isOpen,
  onClose,
  consumerMasjidId,
  masjidUrl,
}: any) => {
  //   const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const isMobile = useMediaQuery("(max-width:768px)");
  const isLargeMobile = useMediaQuery("(max-width:768px)");

  const { authenticateWidget, data, loading, error } = useWidgetAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  // Function to generate the share URL based on asset type
  const createShareLink = (token?: string) => {
    // console.log(assetType);
    let baseUrl = getWidgetUrlRootDomain();

    switch (assetType) {
      case "program":
        baseUrl += `/programDetails?id=${id}&token=${token}`;
        break;
      case "event":
        baseUrl += `/eventDetails?id=${id}&token=${token}`;
        break;
      case "service":
        baseUrl += `/serviceDetails?id=${id}&token=${token}`;
        break;
      case "shareMasjid":
        baseUrl = masjidUrl;
        break;
      default:
        baseUrl += `/details?id=${id}&token=${token}`;
        break;
    }

    return baseUrl;
  };

  // Authenticate and generate the share URL
  const handleAuthenticate = async () => {
    setIsLoading(true);
    try {
      setIsError(false);
      const response = await authenticateWidget(consumerMasjidId, assetType);
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

  useEffect(() => {
    if (isOpen && !masjidUrl) {
      handleAuthenticate(); // Generate the share URL when the modal opens
    } else {
      const generatedUrl = createShareLink();
      // console.log(generatedUrl);
      setShareUrl(generatedUrl); // Update the share URL with the generated one
      setIsLoading(false);
    }
  }, [isOpen]);

  // console.log(handleAuthenticate());

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    // setCopied(true);
    // setTimeout(() => setCopied(false), 2000);
    toast.success("Copied!");
  };

  return (
    <Dialog
      data-testid="share-modal"
      open={isOpen}
      onClose={onClose}
      //   maxWidth="xs"
      //   fullWidth
      //   sx={{
      //     "&.MuiDialog-container": { alignItems: isMobile ? "end" : "center" },
      //   }}
      PaperProps={{
        sx: {
          padding: "0px", // Custom padding
          margin: "0px",
          width: isMobile ? "100%" : isLargeMobile ? "60%" : "40%",
          borderRadius: "22px",
          //   backgroundColor: "#f0f0f0",
          //   borderRadius: "15px",
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
            <WhatsappShareButton url={shareUrl}>
              <WhatsappIcon size={45} round />
            </WhatsappShareButton>
          </Box>

          <FacebookShareButton url={shareUrl}>
            <FacebookIcon size={45} round />
          </FacebookShareButton>

          <TwitterShareButton url={shareUrl}>
            <TwitterIcon size={45} round />
          </TwitterShareButton>

          <RedditShareButton url={shareUrl}>
            <RedditIcon size={45} round />
          </RedditShareButton>

          <EmailShareButton url={shareUrl}>
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
        {/* {copied && <Button color="success">Link Copied!</Button>} */}
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
