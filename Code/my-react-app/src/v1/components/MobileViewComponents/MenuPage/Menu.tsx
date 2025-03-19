import Slider from "react-slick";
import React, { useEffect, useState } from "react";
import { useAppSelector, useAppThunkDispatch } from "../../../redux/hooks";
import { fetchMasjidById } from "../../../redux/actions/MasjidActions/fetchMasjidById";
import ShareIcon from "@mui/icons-material/Share";
import proflePlaceholer from "../../../photos/Newuiphotos/home icon/profile_placeholder.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CardActionArea,
  Box,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import "./Menu.css"; // CSS file for custom styling
import shareIcon from "../../../photos/Newuiphotos/Common/shareIcon.svg";

// Icons Import
import AboutIcon from "../../../photos/Newuiphotos/menuIcons/about.webp";
import SalahIcon from "../../../photos/Newuiphotos/menuIcons/salah.webp";

import Widget from "../../../photos/Newuiphotos/menuIcons/widgetsIcon.svg";
import EventIcon from "../../../photos/Newuiphotos/menuIcons/event.webp";
import Profile from "../../../photos/Newuiphotos/menuIcons/profile.webp";
import TvIcon from "../../../photos/Newuiphotos/menuIcons/connectTv.webp";
import ServicesIcon from "../../../photos/Newuiphotos/menuIcons/services.webp";
import Members from "../../../photos/Newuiphotos/menuIcons/members.webp";
import Donation from "../../../photos/Newuiphotos/menuIcons/donationnew.svg";
import boardMember from "../../../photos/Newuiphotos/menuIcons/boardmember.webp";
import circledollar from "../../../photos/Newuiphotos/menuIcons/circledollar.webp";
import contactUsIcon from "../../../photos/Newuiphotos/menuIcons/contactus.webp";
import NoUpdateIcon from "../../../photos/Newuiphotos/menuIcons/NoUpdate.png";
import unVerifiedIcon from "../../../photos/Newuiphotos/menuIcons/unverified.svg";
import NoUpdateBackground from "../../../photos/Newuiphotos/menuIcons/NoUpdateBackground.png";

import AnnouncementIcon from "../../../photos/Newuiphotos/menuIcons/announcement.svg";
import program from "../../../photos/Newuiphotos/menuIcons/program.webp";
import { adminFromLocalStg } from "../../../helpers/AdminFromLocalStorage/AdminFromLocalStorage";
import { customNavigatorTo } from "../../../helpers/HelperFunction";
import Announcement from "../Announcement/Announcement";
import AdminProfile from "../AdminProfile/AdminProfile";
import MasjidProfile from "../MasjidProfile/MasjidProfile";
import TermAndConditions from "../Shared/TermsAndCondition/TermAndConditions";
import Donations from "../Donation/Donations";
import Services from "../Services/Main/Services";
import { useQuery } from "@apollo/client";
import { getMasjid, getMasjidById } from "../../../graphql-api-calls";
import Programs from "../Programs/Main/Programs";
import BoardMember from "../BoardMember/Main/BoardMember";
import Payments from "../Payments/Payments";
import SalahTimings from "../MobileViewCalender/SalahTimings/SalahTimings";
import ContactForm from "../ContactForm/ContactForm";
import { authLogout } from "../../../redux/actions/AuthActions/LogoutAction";
import EventMain from "../EventComponent/EventMain/EventMain";
import ProgramsNew from "../ProgramsComponent/ProgramMain/ProgramMain";
import useMasjidData from "../SharedHooks/useMasjidData";
import ReusableDatePicker from "../EventComponent/helperComponent/ReusableDatePicker";
import CustomTooltip from "../Shared/Tooltip/CustomTooltip";
import ShareModal from "../Services/Helpers/ShareButtons/ShareButtons";
import CustomButton from "../Shared/NewComponents/CustomButton/CustomButton";
import { BasicButtonStyle } from "../SharedHelpers/helpers";
import useStripeConnect from "../../../helpers/StripeConnectHelper/useStripeConnect";
import { updateAdminMasjid } from "../../../redux/actions/MasjidActions/UpdatingMasjidByAdmin";
import { IExternalLinks, Masjid } from "../../../redux/Types";
import MessageModel from "../OtherSalah/helperComponent/messageModel/messageModel";
import toast from "react-hot-toast";
import ConnectTvMain from "../ConnectTv/ConnectTvMain/ConnectTvMain";
import WebWidgets from "../WebWidgets/WidgetsPage/WebWidgets";

const Menu = () => {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
  };
  const localAdmin = adminFromLocalStg();
  let admin = useAppSelector((state) => state.admin);
  const consumerMasjidId = localAdmin?.masjids?.[0] ?? "";
  let AdminMasjidState = useAppSelector((state) => state.AdminMasjid);
  const [masjid, setMasjid] = useState<any>(null);
  const dispatch = useAppThunkDispatch();
  const { tab } = useParams();
  const [followers, setFollowers] = useState<number>(0); // Sample follower count
  const [myMasjidCount, setMyMasjidCount] = useState<number>(0); // Sample My Masjid count
  const [activeTab, setActiveTab] = useState<number>(0);
  const [tmConOpener, setTmConOpener] = useState(false);
  const [isAdminMasjidStateLoaded, setIsAdminMasjidStateLoaded] =
    useState(false);
  const [isPaymentsSetup, setIsPaymentsSetup] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [isNoUpdateLoading, setIsNoUpdateLoading] = useState(false);
  const {
    masjidData,
    isLoading: masjidDataLoading,
    error,
    handleRefetch: refetch,
  } = useMasjidData(consumerMasjidId);

  const checkIsMasjidAssigned = async () => {
    if (!consumerMasjidId) {
      const result = await swal({
        title: "Oops",
        text: "You have no masjid assigned yet, If you have submitted your details we will verify the details and notify you via email, otherwise Contact Admin to assign masjid",
        icon: "warning",
        buttons: {
          catch: {
            text: "Logout",
            value: "Logout",
          },
          // Logout: true,
        },
        className: "my-custom-alert-nomasjid",
      }).then((value) => {
        swal("Logging out");
        dispatch(authLogout());
      });
    }
  };
  const handleUpdateMasjid = async () => {
    if (!error && !isLoading) {
      const toastid = toast.loading("Updating Masjid...");

      setIsNoUpdateLoading(true);
      // const sanitizedLinks = masjid.externalLinks.map(
      const sanitizedLinks = masjid?.externalLinks
        ? masjid.externalLinks.map(({ __typename, ...rest }) => rest)
        : [];
      console.log(sanitizedLinks);
      const res = await dispatch(
        updateAdminMasjid(consumerMasjidId, {
          masjidName: masjid.masjidName,
          description: masjid.description,
          contact: masjid.contact,
          externalLinks: sanitizedLinks,
          address: masjid.address,
          location: {
            type: "Point",
            coordinates: masjid?.location?.coordinates ?? [], // Save the coordinates
          },
        })
      );
      if (res?.message === "Success") {
        toast.dismiss(toastid);
        toast.success("Successfully Updated!");
        setIsNoUpdateLoading(false);
      } else {
        toast.dismiss(toastid);
        toast.error(res.message);
        setIsNoUpdateLoading(false);
      }
    }
  };
  useEffect(() => {
    if (tab) setActiveTab(+tab);
    if (tab === "0") {
      refetch();
    } else {
      handleAllTooltipsClose();
    }
  }, [tab]);

  useEffect(() => {
    checkIsMasjidAssigned();
  }, []);

  useEffect(() => {
    if (masjidData && Object.keys(masjidData).length > 0 && !error) {
      console.log(masjidData);
      if (masjidData?.isFreezed) {
        setIsLoading(false);
        // toast.error("Your masjid is frozen. Contact Admin to unfreeze");
        const logOut = async () => {
          const result = await swal({
            title: "Oops",
            text: "Your Masjid is Frozen. Contact Admin to Unfreeze",
            icon: "error",
            buttons: {
              catch: {
                text: "Logout",
                value: "Logout",
              },
              // Logout: true,
            },
          }).then((value) => {
            swal("Logging out");
            dispatch(authLogout());
          });
        };
        logOut();
      } else {
        setFollowers(masjidData.followers ?? 0);
        setMyMasjidCount(masjidData.subscribers ?? 0);
        setIsVerified(masjidData.isVerified);
        setMasjid(masjidData);
        setIsLoading(false);
      }
    } else if (error && consumerMasjidId) {
      setIsLoading(false);
      toast.error("Unable to Fetch Masjid Data");
      // dispatch(authLogout());

      const logOut = async () => {
        const result = await swal({
          title: "Oops",
          text: "Unable to Fetch Masjid Info, Contact Admin",
          icon: "error",
          buttons: {
            catch: {
              text: "Logout",
              value: "Logout",
            },
            // Logout: true,
          },
        }).then((value) => {
          switch (value) {
            // case "Request":
            //   setOpen(true);
            //   break;

            case "Logout":
              swal("Logging out");
              dispatch(authLogout());
              break;

            default:
              swal("Logging out");
              dispatch(authLogout());
          }
        });
      };
      logOut();
    }
  }, [masjidData, error]);

  // useEffect(() => {
  //   if (masjid && Object.keys(masjid).length > 0) {

  //   }
  // }, [masjid]);

  const handleUnexpectedError = () => {
    // setIsNoAccountDialogOpen(true);
    setIsPaymentsSetup(false);
  };

  const {
    stripeConnect,
    isLoading: isStripeLoading,
    error: stripeError,
  } = useStripeConnect(
    handleUnexpectedError,
    admin?.role === "admin" || admin?.role === "superadmin",
    consumerMasjidId
  );

  const handleStripeConnect = async (email: string, otp: string) => {
    const { success, status, data, error } = await stripeConnect(
      email,
      otp,
      false
    );

    if (success) {
      if (
        status === 200 ||
        (status === 202 && data.account.status !== "approved")
      ) {
        setIsPaymentsSetup(false);
      } else if (status === 202 && data.account.status === "approved") {
        setIsPaymentsSetup(true);
      }
    } else if (!success && status === 400) {
      setIsPaymentsSetup(false);
    } else if (error) {
      setIsPaymentsSetup(false);
    }
  };
  useEffect(() => {
    handleStripeConnect("", "");
  }, []);
  // const {
  //   masjidData,
  //   isLoading: masjidDataLoading,
  //   error: masjidDataError,
  //   handleRefetch: refetch,
  // } = useMasjidData(consumerMasjidId);

  // const checkIsMasjidAssigned = async () => {
  //   if (!consumerMasjidId) {
  //     const result = await swal({
  //       title: "Oops",
  //       text: "You have no masjid assigned. Contact Admin to assign masjid",
  //       icon: "error",
  //       buttons: {
  //         catch: {
  //           text: "Logout",
  //           value: "Logout",
  //         },
  //         // Logout: true,
  //       },
  //     }).then((value) => {
  //       // if (value === "Logout") {
  //       swal("Logging out");
  //       dispatch(authLogout());
  //       // }
  //     });
  //   }
  // };

  // useEffect(() => {
  //   if (masjidData) {
  //     // set Masjid state or use masjidData
  //     setMasjid(masjidData);
  //   }
  // }, [masjidData]);

  // useEffect(() => {
  //   if (tab) setActiveTab(+tab);
  //   if (tab === "0") {
  //     refetch();
  //   } else {
  //     handleAllTooltipsClose();
  //   }
  // }, [tab]);
  // useEffect(() => {
  //   checkIsMasjidAssigned();
  // }, []);
  // const { loading, error, data } = useQuery(getMasjidById(), {
  //   variables: {
  //     id: consumerMasjidId,
  //   },
  //   skip: !AdminMasjidState?.masjidName,
  // });

  // useEffect(() => {
  //   if (data?.getMasjidById) {
  //     setFollowers(data?.getMasjidById.followers ?? 0);
  //     setMyMasjidCount(data?.getMasjidById.subscribers ?? 0);
  //   }
  // }, [data]);

  // if (!AdminMasjidState) {
  //   return <div>Loading...</div>; // or some kind of loading spinner
  // } // Menu items
  const menuItems = [
    {},
    {
      label: "About Masjid",
      link: "/feed/1",
      icon: AboutIcon,
      content: (
        <MasjidProfile
          consumerMasjidId={consumerMasjidId}
          isMainAdmin={false}
        />
      ),
    },

    {
      label: "Salah Timings",
      link: "/feed/2",
      icon: SalahIcon,

      content: <SalahTimings consumerMasjidId={consumerMasjidId} />,
    },
    {},
    {
      label: "Events",
      link: "/feed/4",
      icon: EventIcon,
      content: <EventMain consumerMasjidId={consumerMasjidId} />,
    },
    {
      label: "Announcements",
      link: "/feed/5",
      icon: AnnouncementIcon,
      content: <Announcement consumerMasjidId={consumerMasjidId} />,
    },
    {
      label: "Donations",
      link: "/feed/6",
      icon: Donation,
      content: <Donations consumerMasjidId={consumerMasjidId} />,
    },

    {
      label: "Services",
      link: "/feed/7",
      icon: ServicesIcon,
      content: <Services consumerMasjidId={consumerMasjidId} />,
    },
    {
      label: "Connect TV",
      link: "/feed/8",
      icon: TvIcon,
      content: <ConnectTvMain consumerMasjidId={consumerMasjidId} />,
    },

    {
      label: "Programs",
      link: "/feed/9",
      icon: program,
      content: <ProgramsNew consumerMasjidId={consumerMasjidId} />,
    },
    {
      label: "Board Member",
      link: "/feed/10",
      icon: boardMember,
      content: <BoardMember consumerMasjidId={consumerMasjidId} />,
    },
    {
      label: "Web Widgets",
      link: "/feed/11",
      icon: Widget,
      content: <WebWidgets consumerMasjidId={consumerMasjidId} />,
    },
    {
      label: "Payments",
      link: "/feed/12",
      icon: circledollar,

      content: <Payments consumerMasjidId={consumerMasjidId} />,
    },
    {
      label: "Profile",
      link: "/feed/13",
      icon: Profile,
      content: <AdminProfile />,
    },
    {
      label: "Contact Us",
      link: "/feed/14",
      icon: contactUsIcon,
      content: <ContactForm consumerMasjidId={consumerMasjidId} />,
    },
  ];
  const [open, setOpen] = useState(false);
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  const [tooltipTimeouts, setTooltipTimeouts] = useState<
    Record<string, NodeJS.Timeout>
  >({});
  const [isShareVisible, setIsShareVisible] = useState(false);

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
  // const handleTooltipClose = (id: string) => {
  //   // Clear the timeout and close the tooltip
  //   if (tooltipTimeouts.has(id)) {
  //     clearTimeout(tooltipTimeouts.get(id));
  //     tooltipTimeouts.delete(id);
  //   }
  //   setOpen(false);
  //   setOpenTooltipId(null);
  // };

  return (
    <>
      <ShareModal
        isOpen={isShareVisible}
        onClose={() => {
          setIsShareVisible(false);
        }}
        assetType="shareMasjid"
        masjidUrl={`https://app.connectmazjid.com/?type=masjid&key=${consumerMasjidId}&utm_source=cm_tvapp&utm_medium=show&utm_campaign=${encodeURIComponent(
          masjid?.masjidName
        )}`}
      />
      {showWarning && (
        <MessageModel
          onClose={() => setShowWarning(false)}
          onConfirm={() => {
            setShowWarning(false);
            handleUpdateMasjid();
          }}
          messageType="No Update"
          message={`Are you sure that there are no updates?`}
          img={NoUpdateBackground}
          isLoading={isNoUpdateLoading}
        ></MessageModel>
      )}

      {activeTab === 0 ? (
        <div className="home_main_container">
          <div className="home_desktop">
            <div className="masjid_header">
              <img
                src={masjid?.masjidProfilePhoto || proflePlaceholer}
                alt="Masjid"
                className="header-image"
              />
              <span className="header-name">
                {masjid?.masjidName}{" "}
                {isVerified && masjid && (
                  <img
                    src={shareIcon}
                    alt="Share"
                    onClick={() => {
                      setIsShareVisible(true);
                    }}
                  />
                )}
                {!isVerified && (
                  <CustomTooltip
                    id="6"
                    open={openTooltipId === "6" && open}
                    handleTooltipOpen={handleTooltipOpen}
                    text="Verification pending for this masjid."
                    handleClickOutside={handleClickOutside}
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
                    icon={
                      <img
                        src={unVerifiedIcon}
                        alt="Info Icon"
                        style={{ marginLeft: "1vmin", width: "2vmin" }}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the document click event
                          handleTooltipOpen("6");
                        }}
                      />
                    }
                  />
                )}
              </span>
              <span className="header-followers">
                <b>{followers}</b>
                <b className="label">
                  Follower
                  <CustomTooltip
                    id="1"
                    open={openTooltipId === "1" && open}
                    handleTooltipOpen={handleTooltipOpen}
                    text="Users who have subscribed to receive updates from your Masjid, including events, programs, etc."
                    handleClickOutside={handleClickOutside}
                  />
                </b>
              </span>
              <span className="header-myMasjid">
                <b>{myMasjidCount}</b>{" "}
                <b className="label">
                  Musali
                  <CustomTooltip
                    id="2"
                    open={openTooltipId === "2" && open}
                    handleTooltipOpen={handleTooltipOpen}
                    text="Users who have set Salah timings based on your Masjid."
                    handleClickOutside={handleClickOutside}
                  />
                </b>
              </span>
            </div>
          </div>
          <div className="slider-container">
            <div className="slider-container-1">
              <Slider {...settings}>
                {masjid?.masjidPhotos?.length > 0 ? (
                  masjid?.masjidPhotos?.map((photo: any, index: number) => (
                    <div key={index} className="slide">
                      <img
                        src={photo.url}
                        alt={`Masjid Slide ${index}`}
                        className="slide-image"
                      />
                    </div>
                  ))
                ) : (
                  <div className="slide">
                    <img
                      src={proflePlaceholer}
                      alt={`Masjid Slide}`}
                      className="slide-image"
                    />
                  </div>
                )}
              </Slider>
            </div>

            <div className="profile-section">
              <div className="followers">
                <div className="count">{followers}</div>
                <div className="label">
                  Followers
                  <CustomTooltip
                    id="3"
                    open={openTooltipId === "3" && open}
                    handleTooltipOpen={handleTooltipOpen}
                    text="Users who have subscribed to receive updates from your masjid, including events, programs, etc."
                    handleClickOutside={handleClickOutside}
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
                  />
                </div>
              </div>
              <div className="profile-image-container">
                <img
                  src={masjid?.masjidProfilePhoto || proflePlaceholer}
                  alt="Profile"
                  className="profile-image"
                />
              </div>
              <div className="my-masjid">
                <div className="count">{myMasjidCount}</div>
                <div className="label">
                  Musali
                  <CustomTooltip
                    id="4"
                    open={openTooltipId === "4" && open}
                    handleTooltipOpen={handleTooltipOpen}
                    text="Users who have set salah timings based on your Masjid."
                    handleClickOutside={handleClickOutside}
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
                  />
                </div>
              </div>
            </div>
            <div className="menu-container">
              <b className="header-name-1">
                {masjid?.masjidName}
                {isVerified && masjid && (
                  <img
                    src={shareIcon}
                    alt="Share"
                    onClick={() => {
                      setIsShareVisible(true);
                    }}
                    style={{ marginLeft: "5px" }}
                  />
                )}
                {!isVerified && (
                  <CustomTooltip
                    id="5"
                    open={openTooltipId === "5" && open}
                    handleTooltipOpen={handleTooltipOpen}
                    text="Verification pending for this masjid."
                    handleClickOutside={handleClickOutside}
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
                    icon={
                      <img
                        src={unVerifiedIcon}
                        alt="Info Icon"
                        style={{ marginLeft: "8px", width: "20px" }}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the document click event
                          handleTooltipOpen("5");
                        }}
                      />
                    }
                  />
                )}
              </b>

              <Grid container spacing={0} style={{ padding: 0, width: "100%" }}>
                {menuItems.map((item, index) => {
                  const restrictedItems = [
                    "Donations",
                    "Services",
                    "Payments",
                    "Board Member",
                    "Connect TV",
                    "Web Widgets",
                    // "Connect TV",
                  ];
                  const requiresVerification = ["Payments", "Donations"];

                  if (
                    index === 0 ||
                    // index === 9 ||
                    index === 3 ||
                    // index === 13 ||
                    !admin
                    // ||
                    // (admin.role !== "subadmin" &&
                    //   admin.role !== "superadmin" &&
                    //   restrictedItems.includes(item.label))
                  ) {
                    return null;
                  }
                  const isItemDisabled =
                    (requiresVerification.includes(item.label) &&
                      !isVerified) ||
                    (requiresVerification.includes(item.label) && isLoading) ||
                    (admin?.role === "musaliadmin" &&
                      restrictedItems.includes(item.label));
                  return (
                    <Grid
                      item
                      xs={4}
                      sm={4}
                      md={3}
                      lg={3}
                      key={index}
                      sx={{ padding: { xs: "5px", sm: "5px", md: "0.4vw" } }}
                      // style={{ padding: "5px" }}
                    >
                      <Card
                        component={Link}
                        to={isItemDisabled ? "#" : item.link}
                        onClick={(e) => {
                          if (isItemDisabled) {
                            e.preventDefault(); // Prevent navigation if disabled
                            swal(
                              admin?.role === "musaliadmin"
                                ? "This Feature is Available for Masjid Admin Only"
                                : "This Feature is Unavailable as the Masjid is Not Verified."
                            );
                          } else {
                            setActiveTab(index);
                          }
                        }}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          height: { xs: "15vh", sm: "16vh", md: "20vh" },
                          borderRadius: {
                            xs: "10px",
                            sm: "10px",
                            md: "10px",
                            lg: "1vmin",
                          },
                          textDecoration: "none",
                        }}
                      >
                        <CardActionArea sx={{ height: "100%" }}>
                          <CardContent sx={{ textAlign: "center", padding: 0 }}>
                            <Box
                              component="img"
                              src={item.icon}
                              alt={item.label}
                              sx={{
                                width: {
                                  xs: item.label === "Connect TV" ? 30 : 25,
                                  sm: item.label === "Connect TV" ? 36 : 30,
                                  md: item.label === "Connect TV" ? 40 : 35,
                                  lg:
                                    item.label === "Connect TV"
                                      ? "5vmin"
                                      : "4vmin",
                                },
                                height: { xs: 25, sm: 30, md: 35, lg: "4vmin" },
                                filter: isItemDisabled
                                  ? "grayscale(100%)"
                                  : "none",
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: {
                                  xs: "0.8rem",
                                  sm: "0.8rem",
                                  md: "0.9rem",
                                  lg: "2vmin",
                                },
                                lineHeight: "1rem",
                                color: isItemDisabled ? "#545454" : "#1D785A",
                                fontWeight: "bold",
                                marginTop: "2vmin",
                                textDecoration: "none",
                              }}
                            >
                              {item.label}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </div>
          </div>
          <CustomButton
            text={masjidDataLoading ? "Loading..." : "No Update"}
            iconSrc={NoUpdateIcon}
            onClick={() => {
              if (masjidDataLoading || error) return;

              setShowWarning(true);
            }}
            buttonStyle={{
              ...BasicButtonStyle,
              ...{
                position: "fixed",
                bottom: "60px",
                right: "10px",
                fontSize: {
                  xs: "10px",
                  sm: "10px",
                  md: "2vmin",
                },
              },
            }}
            iconStyle={{ width: "20px", height: "20px" }}
            // isLoading={masjidDataLoading}
          />
        </div>
      ) : (
        <div className="content-container">{menuItems[activeTab].content}</div>
      )}
      <TermAndConditions
        tmConOpener={tmConOpener}
        setTmConOpener={setTmConOpener}
      />
      <footer className="terms-footer">
        <Typography
          variant="subtitle2"
          style={{
            textAlign: "center",
            color: "#33443B",
            textDecoration: "underline",
          }}
          onClick={() => setTmConOpener(true)}
        >
          Terms and Conditions
        </Typography>
      </footer>
    </>
  );
};

export default Menu;
