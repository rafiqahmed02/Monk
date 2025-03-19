import React, { useState, useEffect } from "react";
import "./WebWidgetDetail.css";
import { CircularProgress, FormControl, MenuItem, Select } from "@mui/material";
import salahDesk from "../../../../../photos/Newuiphotos/Webwidgets/sa-d-2.webp";
import eventDesk from "../../../../../photos/Newuiphotos/Webwidgets/event-d.webp";
import programsDesk from "../../../../../photos/Newuiphotos/Webwidgets/Programs-d.webp";
import bmDesk from "../../../../../photos/Newuiphotos/Webwidgets/Board-d.webp";
import servicesDesk from "../../../../../photos/Newuiphotos/Webwidgets/service-d.webp";
import announcement from "../../../../../photos/Newuiphotos/Webwidgets/Announcements.webp";
import donationDesk from "../../../../../photos/Newuiphotos/Webwidgets/Donation-d.webp";
import salahM from "../../../../../photos/Newuiphotos/Webwidgets/Salah-m.webp";
import eventM from "../../../../../photos/Newuiphotos/Webwidgets/Event-m.webp";
import programsM from "../../../../../photos/Newuiphotos/Webwidgets/Programs-m.webp";
import donationM from "../../../../../photos/Newuiphotos/Webwidgets/Donations-m.webp";
import bmM from "../../../../../photos/Newuiphotos/Webwidgets/bm-m.webp";
import servicesM from "../../../../../photos/Newuiphotos/Webwidgets/Service-m.webp";
import { getWidgetUrlRootDomain } from "../../../../../helpers/WidgetUrlSetter/WidgetUrlSetter";
import { useWidgetAuth } from "../../../../../graphql-api-calls/widgetAuth/widgetAuth";
import toast from "react-hot-toast";
import { useAppSelector } from "../../../../../redux/hooks";
import useMasjidData from "../../../SharedHooks/useMasjidData";

export interface WebWidgetDetailProps {
  widgetType: string;
  isMainAdmin?: boolean;
  consumerMasjidId: string;
}

const WebWidgetDetail: React.FC<WebWidgetDetailProps> = ({
  widgetType,
  isMainAdmin = false,
  consumerMasjidId,
}) => {
  const [view, setView] = useState("desktop");
  const [iframeCode, setIframeCode] = useState("");
  const [highlightedIframeCode, setHighlightedIframeCode] =
    useState<JSX.Element | null>(null);
  let AdminMasjidState = useAppSelector((state) => state.AdminMasjid);
  const [location, setLocation] = useState([]);

  const { authenticateWidget, data, loading, error } = useWidgetAuth();

  const { masjidData, isLoading } = useMasjidData(consumerMasjidId);

  const widgetTypeMap: { [key: string]: string } = {
    "Announcements Widgets": "notification",
    "Salah Timing Widgets": "salah",
    "Board Member Widgets": "boardmembers",
    "Service Widgets": "service",
    "Program Widgets": "programs",
    "Event Widgets": "events",
    "Donation Widgets": "donations",
  };

  const imageMap: { [key: string]: { desktop: string; mobile: string } } = {
    "Announcements Widgets": { desktop: announcement, mobile: announcement },
    "Salah Timing Widgets": { desktop: salahDesk, mobile: salahM },
    "Board Member Widgets": { desktop: bmDesk, mobile: bmM },
    "Service Widgets": { desktop: servicesDesk, mobile: servicesM },
    "Program Widgets": { desktop: programsDesk, mobile: programsM },
    "Event Widgets": { desktop: eventDesk, mobile: eventM },
    "Donation Widgets": { desktop: donationDesk, mobile: donationM },
  };

  useEffect(() => {
    if (masjidData && masjidData.location && masjidData.location.coordinates) {
      setLocation(masjidData.location.coordinates);
    }
  }, [masjidData]);

  useEffect(() => {
    const generateIframeCode = async () => {
      if (!location || location.length === 0) return; // Ensure location is set
      try {
        const assetType = widgetTypeMap[widgetType] || "";

        const response = await authenticateWidget(consumerMasjidId, assetType);
        const token = response.data.widgetAuth;

        setIframeWithToken(token);
      } catch (err) {
        console.error("Error generating widget link:", err);
      }
    };

    console.log("widgetType", widgetType);

    const setIframeWithToken = (token: string) => {
      const baseUrl = getWidgetUrlRootDomain();
      let widgetUrl = "";
      switch (widgetTypeMap[widgetType]) {
        case "events":
          widgetUrl = `${baseUrl}/widget/events?token=${token}`;
          break;
        case "salah":
          widgetUrl = `${baseUrl}/widget/prayer-timing?lat=${location[1]}&lon=${location[0]}&token=${token}`;
          break;
        case "programs":
          widgetUrl = `${baseUrl}/widget/programs?masjidid=${consumerMasjidId}&token=${token}`;
          break;
        case "notification":
          widgetUrl = `${baseUrl}/widget/announcement?token=${token}`;
          break;
        case "boardmembers":
          widgetUrl = `${baseUrl}/widget/boardmembers?masjidid=${consumerMasjidId}&token=${token}`;
          break;
        case "service":
          widgetUrl = `${baseUrl}/widget/services?lat=${location[1]}&lon=${location[0]}&token=${token}`;
          break;
        case "donations":
          widgetUrl = `${baseUrl}/widget/donations?masjidid=${consumerMasjidId}&token=${token}`;
          break;
        default:
          break;
      }
      let width = view === "desktop" ? "100%" : "350px";

      let height =
        view === "desktop" && widgetType === "Board Member Widgets"
          ? "450px"
          : view === "desktop"
          ? "590px"
          : "640px";

      const iframe = `<iframe src="${widgetUrl}" width="${width}" height="${height}" scrolling="no" allow="clipboard-read; clipboard-write" title="${widgetType}-Widget" frameborder="0"></iframe>`;
      setIframeCode(iframe);
    };

    if (location.length > 0 && widgetType) {
      generateIframeCode();
    }
  }, [location, widgetType, view]);

  useEffect(() => {
    if (!iframeCode) return;

    const widthString = `width="${view === "desktop" ? "100%" : "350px"}`;
    const heightString = `height="${
      view === "desktop" && widgetType === "Board Member Widgets"
        ? "450px"
        : view === "desktop"
        ? "590px"
        : "640px"
    }`;

    if (
      !iframeCode.includes(widthString) ||
      !iframeCode.includes(heightString)
    ) {
      return;
    }

    const [beforeWidth, afterWidth] = iframeCode.split(widthString);
    if (!afterWidth) return;

    const [middle, afterHeight] = afterWidth.split(heightString);
    if (!afterHeight) return;

    setHighlightedIframeCode(
      <code style={{ whiteSpace: "pre-wrap", userSelect: "text" }}>
        {beforeWidth}
        <span className="highlight">{widthString}</span>
        {middle}
        <span className="highlight">{heightString}</span>
        {afterHeight}
      </code>
    );
  }, [iframeCode, view]);

  const handleViewChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setView(event.target.value as string);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(iframeCode);
    toast.success("Iframe Code Copied to Clipboard!");
  };

  const currentImage =
    view === "desktop"
      ? imageMap[widgetType].desktop
      : imageMap[widgetType].mobile;

  return (
    <div className="web-widget-detail-wrapper">
      <div className="web-widget-detail">
        <h2>{widgetType}</h2>
        {widgetType !== "Announcements Widgets" && (
          <div className="widget-dropdown">
            <FormControl variant="outlined" className="view-select-form">
              <Select
                value={view}
                onChange={(e) => handleViewChange(e)}
                className="view-select"
                data-testid="view-select"
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: "20px",
                  fontSize: "13px",
                  "& .MuiSelect-select": {
                    paddingTop: "8px",
                    paddingBottom: "8px",
                  },
                  "& .MuiMenuItem-root": {
                    fontSize: "13px",
                    padding: "8px",
                  },
                }}
              >
                <MenuItem
                  value="desktop"
                  data-testid="desktop-option"
                  sx={{ fontSize: "13px", padding: "8px" }}
                >
                  Landscape
                </MenuItem>
                <MenuItem
                  value="mobile"
                  data-testid="mobile-option"
                  sx={{ fontSize: "13px", padding: "8px" }}
                >
                  Portrait
                </MenuItem>
              </Select>
            </FormControl>
          </div>
        )}
        <div className="image-container">
          <img
            src={currentImage}
            alt={widgetType}
            style={view === "mobile" ? { width: "45%" } : {}}
          />
        </div>
        <p className="note-2">
          Note: You can customize width & height as per required.
        </p>
        <div
          className="iframe-container custom-scrollbar"
          style={loading || isLoading ? { textAlign: "center" } : {}}
        >
          {loading || isLoading ? (
            <CircularProgress size={20} data-testid="loading-spinner" />
          ) : (
            highlightedIframeCode
          )}
        </div>

        <button className="copy-button" onClick={copyToClipboard}>
          Copy Link
        </button>
      </div>{" "}
    </div>
  );
};

export default WebWidgetDetail;
