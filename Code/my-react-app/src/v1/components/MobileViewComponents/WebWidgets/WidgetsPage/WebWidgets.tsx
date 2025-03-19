import React, { useEffect, useState } from "react";
import "./WebWidgets.css";
import SalahIcon from "../../../../photos/Newuiphotos/menuIcons/salah.webp";
import EventIcon from "../../../../photos/Newuiphotos/menuIcons/event.webp";
import program from "../../../../photos/Newuiphotos/menuIcons/program.webp";
import AnnouncementIcon from "../../../../photos/Newuiphotos/menuIcons/announcement.svg";
import ServicesIcon from "../../../../photos/Newuiphotos/menuIcons/services.webp";
import Members from "../../../../photos/Newuiphotos/menuIcons/members.webp";
import Donation from "../../../../photos/Newuiphotos/menuIcons/donation.svg";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BackButton from "../../Shared/BackButton";
import { customNavigatorTo } from "../../../../helpers/HelperFunction";
import { useNavigationprop } from "../../../../../MyProvider";
import WebWidgetDetail from "./WebWidgetDetail/WebWidgetDetail";
import useStripeConnect from "../../../../helpers/StripeConnectHelper/useStripeConnect";
import StripeErrorModal from "../../Payments/StripeErrorModal/StripeErrorModal";
import Skeleton from "react-loading-skeleton";
import { useAppSelector } from "../../../../redux/hooks";

const WebWidgets: React.FC<{
  consumerMasjidId: string;
  isMainAdmin?: boolean;
}> = ({ consumerMasjidId, isMainAdmin = false }) => {
  const navigation = useNavigationprop();
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isNoAccountDialogOpen, setIsNoAccountDialogOpen] =
    useState<boolean>(false);
  const [isPaymentsSetup, setIsPaymentsSetup] = useState<boolean>(false);
  let AdminMasjidState = useAppSelector((state) => state.AdminMasjid);

  const widgets = [
    { label: "Salah Timing Widgets", iconPath: SalahIcon },
    { label: "Event Widgets", iconPath: EventIcon },
    { label: "Program Widgets", iconPath: program },
    { label: "Announcements Widgets", iconPath: AnnouncementIcon },
    { label: "Service Widgets", iconPath: ServicesIcon },
    { label: "Board Member Widgets", iconPath: Members },
    { label: "Donation Widgets", iconPath: Donation },
  ];

  const handleCardClick = (label: string) => {
    setSelectedWidget(label);
  };

  const handleBackToCards = () => {
    setSelectedWidget(null);
  };

  const handleUnexpectedError = () => {
    // setIsNoAccountDialogOpen(true);
    setIsPaymentsSetup(false);
  };

  const {
    stripeConnect,
    isLoading: isStripeLoading,
    error: stripeError,
  } = useStripeConnect(handleUnexpectedError, isMainAdmin, consumerMasjidId); // Use the hook

  const handleStripeConnect = async (email: string, otp: string) => {
    const { success, status, data, error } = await stripeConnect(
      email,
      otp,
      false
    );

    if (success) {
      if (
        status === 200 ||
        (status === 202 &&
          ((data?.account?.status !== "approved" &&
            data?.account?.status !== "active") ||
            data?.account?.stripeStatus !== "active"))
      ) {
        setIsPaymentsSetup(false);
      } else if (
        status === 202 &&
        (data?.account?.status === "approved" ||
          data?.account?.status === "active")
      ) {
        setIsPaymentsSetup(true);
      }
    } else if (!success && status === 400) {
      setIsPaymentsSetup(false);
    }
  };
  useEffect(() => {
    handleStripeConnect("", "");
  }, []);

  const handleToggle = () => {
    if (!AdminMasjidState.isVerified) {
      swal("This feature is unavailable as the masjid is not verified.");
      return;
    }
    if (!isPaymentsSetup) {
      setIsNoAccountDialogOpen(true);
    }
  };

  return (
    <div className="web-widgets">
      <div className={"title-container"}>
        <div
          className="goback"
          // style={{ marginTop: "0" }}
        >
          <BackButton
            handleBackBtn={
              selectedWidget
                ? handleBackToCards
                : navigation
                ? navigation
                : customNavigatorTo
            }
            isHome={selectedWidget ? false : true}
          />
        </div>
        <h1
          className="page-title"
          data-testid="header-title"
          style={{ color: "rgb(5, 70, 53)" }}
        >
          Web Widgets
        </h1>
      </div>
      {selectedWidget ? (
        <WebWidgetDetail
          widgetType={selectedWidget}
          consumerMasjidId={consumerMasjidId}
        />
      ) : (
        <div className="widgets-list" data-testid="widgets-list">
          {widgets.map((widget, index) => (
            <div
              key={index}
              className="widget-card"
              data-testid="widget-card"
              onClick={() =>
                widget.label === "Donation Widgets" && !isPaymentsSetup
                  ? handleToggle()
                  : handleCardClick(widget.label)
              }
            >
              <div className="widget-content">
                <img
                  src={widget.iconPath}
                  alt={`${widget.label} icon`}
                  className="widget-icon"
                />
                <span
                  className="widget-label"
                  style={
                    widget.label === "Donation Widgets" && !isPaymentsSetup
                      ? { color: "grey" }
                      : {}
                  }
                >
                  {widget.label === "Donation Widgets" && isStripeLoading ? (
                    <Skeleton width={130} height={15} />
                  ) : (
                    widget.label
                  )}
                </span>
              </div>
              <span className="right-arrow">
                <ChevronRightIcon />
              </span>
            </div>
          ))}
        </div>
      )}

      <StripeErrorModal
        isMainAdmin={isMainAdmin}
        isOpen={isNoAccountDialogOpen}
        handleButtonClick={() => {
          if (navigation) navigation("/feed/12");
          else customNavigatorTo("/feed/12");
        }}
        handleClose={() => {
          setIsNoAccountDialogOpen(false);
          // if (navigation) navigation("/feed/0");
          // else customNavigatorTo("/feed/0");
        }}
        feature={"to Create Donation"}
      />
    </div>
  );
};

export default WebWidgets;
