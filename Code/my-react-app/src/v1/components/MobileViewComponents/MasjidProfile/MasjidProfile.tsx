import React, { useEffect, useMemo, useState } from "react";
import swal from "sweetalert";
import { IExternalLinks } from "../../../redux/Types";
import proflePlaceholer from "../../../photos/Newuiphotos/home icon/profile_placeholder.png";
import masjidcoverplaceholder from "../../../photos/Newuiphotos/masjidProfile/placeholder/masjidCover.webp";
import masjidprofileplaceholder from "../../../photos/Newuiphotos/masjidProfile/placeholder/masjidProfile.webp";
import edit from "../../../photos/Newuiphotos/home icon/edit.svg";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import "./MasjidProfile.css";
import { useAppSelector, useAppThunkDispatch } from "../../../redux/hooks";
import toast from "react-hot-toast";
import InstagramIcon from "@mui/icons-material/Instagram";
import EmailIcon from "@mui/icons-material/Email";
import { fetchMasjidById } from "../../../redux/actions/MasjidActions/fetchMasjidById";
import MoreBtn from "../Shared/MoreBtn";
import {
  customNavigatorTo,
  timeZoneGetter,
} from "../../../helpers/HelperFunction";
import { authLogout } from "../../../redux/actions/AuthActions/LogoutAction";
import Slider from "react-slick";
import EditProfile from "./EditProfile";
import LinkWrapper from "../Shared/LinkWrapperProps/LinkWrapperProps";
import BackButton from "../Shared/BackButton";
import { useNavigationprop } from "../../../../MyProvider";
import { Box, Typography } from "@mui/material";
import Skeleton from "react-loading-skeleton";
import FullScreenImageModal from "../Donation/Carousel/FullScreenImageModal ";
import CarouselImageUploader from "../Shared/NewComponents/CarouselImageUploader/CarouselImageUploader";
import { AdminRole } from "../Shared/enums/AdminEnums";

type MasjidProfileProps = {
  consumerMasjidId: string;
  isMainAdmin?: boolean;
};
const MasjidProfile = ({
  consumerMasjidId,
  isMainAdmin = true,
}: MasjidProfileProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");
  const [currentAlt, setCurrentAlt] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  let AdminMasjidState = useAppSelector((state) => state.AdminMasjid);
  let admin = useAppSelector((state) => state.admin);
  const [isMasjidEditOpen, setIsMasjidEditOpen] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const [masjid, setMasjid] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppThunkDispatch();
  const [isDragging, setIsDragging] = useState(false);
  const masjidAPIRequest = () => {
    const response = dispatch(fetchMasjidById(consumerMasjidId));
    response.then(function (result) {
      if (result?.masjidName) {
        console.log("result.masjidname", result);
        setIsLoading(false);
        setMasjid(result);
      } else if (result?.isFreezed) {
        toast.error("Your Masjid is Frozen. Contact Admin to Unfreeze");
        dispatch(authLogout());
      } else {
        toast.error("Unable to Fetch Masjid Data");
        dispatch(authLogout());
      }
    });
  };

  useEffect(() => {
    if (consumerMasjidId) {
      masjidAPIRequest();
    } else if (AdminMasjidState?.masjidName) {
      setMasjid(AdminMasjidState);
      localStorage.setItem("MasjidtZone", timeZoneGetter(AdminMasjidState));
      setIsLoading(false);
    }
  }, [consumerMasjidId]);

  // const zoneConverter = (location: any) => {
  //   const lon = location?.coordinates[0];
  //   const lat = location?.coordinates[1];
  //   if (lat && lon) {
  //     let location = tz_lookup(lat, lon);
  //     return location;
  //   }
  //   return "";
  // };

  const masjidReloader = () => {
    masjidAPIRequest();
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const checkIsMasjidAssigned = async () => {
    if (!consumerMasjidId) {
      const result = await swal({
        title: "Oops",
        text: "You Have No Masjid Assigned. Contact Admin to Assign Masjid",
        icon: "error",
        buttons: {
          catch: {
            text: "Logout",
            value: "Logout",
          },
          // Logout: true,
        },
      }).then((value) => {
        // if (value === "Logout") {
        swal("Logging out");
        dispatch(authLogout());
        // }
      });
    }
  };

  useEffect(() => {
    // Assuming masjid?.masjidPhotos is the array used for slides
    setSlideCount(masjid?.masjidPhotos?.length || 0);
  }, [masjid?.masjidPhotos]);

  useEffect(() => {
    checkIsMasjidAssigned();
  }, []);

  const socialLinksHandler = (key: string, links: IExternalLinks[]) => {
    if (!links) return "";
    const matchedItems = links.find((link) => link.name === key);
    return matchedItems ? matchedItems.url : "";
  };

  const updateSlideCount = () => {
    const slider = document.querySelector(".slick-slider");
    if (slider) {
      const slideCount = slider.querySelectorAll(".slick-slide").length;
      setSlideCount(slideCount);
    }
  };

  useEffect(() => {
    updateSlideCount();
  }, [windowWidth]);
  const handleBeforeChange = () => {
    setIsDragging(true);
  };

  const handleAfterChange = () => {
    // The carousel has settled on a slide, so we can re-enable clicks
    setIsDragging(false);
  };
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    customPaging: function (i: any) {
      return <div></div>; // Hide default dots
    },
    appendDots: (dots: any) => (
      <div>
        <ul style={{ margin: "0px" }}> {dots} </ul>
        <div className="image-counter">
          {currentSlide + 1}/{slideCount}
        </div>
      </div>
    ),
    beforeChange: (current: any, next: any) => {
      setCurrentSlide(next);
      handleBeforeChange();
    },
    // When the slide is fully changed
    afterChange: (current: any) => {
      setCurrentSlide(current);
      handleAfterChange();
    },
  };

  const getSavedOffsetFromLocalStorage = (): number => {
    return JSON.parse(localStorage.getItem("imageOffset") || "50");
  };

  const savedOffset = getSavedOffsetFromLocalStorage();

  const maxTextLength = windowWidth > 374 ? 50 : 38;
  const fbLink = socialLinksHandler("Facebook", masjid?.externalLinks);
  const webLink = socialLinksHandler("Website", masjid?.externalLinks);
  const instaLink = socialLinksHandler("Instagram", masjid?.externalLinks);
  const email = socialLinksHandler("Email", masjid?.externalLinks);

  const truncatedName =
    fbLink.length > maxTextLength - 5
      ? fbLink.substring(0, maxTextLength - 5) + "...."
      : fbLink;
  const truncatedWebLink =
    webLink.length > maxTextLength - 10
      ? webLink.substring(0, maxTextLength - 20) + "...."
      : webLink;
  const truncatedInstaLink =
    instaLink.length > maxTextLength - 20
      ? instaLink.substring(0, maxTextLength - 20) + "...."
      : instaLink;
  const truncatedEmail =
    email.length > maxTextLength - 20
      ? email.substring(0, maxTextLength - 20) + "...."
      : email;

  const navigation = useNavigationprop();

  const carouselImages = useMemo(() => {
    if (masjid?.masjidPhotos?.length) {
      return masjid.masjidPhotos.map((photo: any, index: number) => ({
        url: photo.url,
        alt: `Photo ${index}`,
      }));
    }
    return [];
  }, [masjid?.masjidPhotos]);
  if (isMasjidEditOpen)
    return (
      <EditProfile
        openMasjidEdit={isMasjidEditOpen}
        setOpenMasjidEdit={setIsMasjidEditOpen}
        masjid={masjid}
        masjidReloader={masjidReloader}
        masjidId={consumerMasjidId}
      />
    );
  return (
    <>
      <div className="masjid-details">
        <div>
          <div className="goback" style={{ top: "40px", zIndex: "2" }}>
            <BackButton
              handleBackBtn={navigation ? navigation : customNavigatorTo}
              isHome={true}
            />
          </div>
          <div className="masjid-preview-img">
            <CarouselImageUploader
              images={carouselImages}
              isCarousel={true}
              imgStyle={{
                "@media (min-width: 768px)": {
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "50% 45%",
                  borderRadius: "0px 0px 30px 30px",
                  maxHeight: "300px",
                },
                objectFit: "cover",
              }}
              containerStyle={{
                backgroundColor: "#b9e4cf",
              }}
              imgBgStyle={{
                maxHeight: "300px",
              }}
              placeholderImg={masjidcoverplaceholder}
              defaultImgStyle={{
                maxHeight: "300px",
                minHeight: "200px",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "30px 30px 0px 0px",
              }}
            ></CarouselImageUploader>
          </div>

          <div className="profile-bottom-part">
            <div className="profile-card">
              <div className="profile-top-container">
                <div className="home-masjid-circular-img">
                  {masjid?.masjidProfilePhoto ? (
                    <img
                      src={masjid?.masjidProfilePhoto}
                      alt="masjid-img"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <img
                      src={masjidprofileplaceholder}
                      alt="masjid-preview-img"
                    />
                  )}
                </div>
                <div className="profile-card-top">
                  <h3 className="profile-card-title">{masjid?.masjidName}</h3>
                  <div>
                    <img
                      alt="edit img"
                      onClick={() => setIsMasjidEditOpen(true)}
                      src={edit}
                    />
                  </div>
                </div>
              </div>

              {!consumerMasjidId ? (
                <div>
                  <>
                    <h5>You Don't Have Any Masjid Assigned to You</h5>
                  </>
                </div>
              ) : (
                <div>
                  <h5>Description</h5>
                  {isLoading ? (
                    <Skeleton
                      count={1}
                      width={"40%"}
                      style={{ margin: "14px 0px" }}
                    />
                  ) : (
                    <MoreBtn tsx={masjid?.description} txLength={250} />
                  )}

                  {(admin?.role === "superadmin" ||
                    admin?.role === "admin") && (
                    <div className="location-box-container">
                      <div className="location-box">
                        <p style={{ fontWeight: "500" }}>Latitude</p>
                        {isLoading ? (
                          <Skeleton
                            count={1}
                            width={"40%"}
                            style={{ margin: "12px 0px" }}
                          />
                        ) : (
                          <p>{masjid?.location?.coordinates[1]}</p>
                        )}
                      </div>
                      <div className="location-box">
                        <p style={{ fontWeight: "500" }}>Longitude</p>
                        {isLoading ? (
                          <Skeleton
                            count={1}
                            width={"40%"}
                            style={{ margin: "12px 0px" }}
                          />
                        ) : (
                          <p>{masjid?.location?.coordinates[0]}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="icon-box-group">
                    <div
                      className="icon-box-container"
                      style={!fbLink ? { width: "100%" } : {}}
                    >
                      <div className="icon-box">
                        <div>
                          <CallRoundedIcon sx={{ width: "20px" }} />
                        </div>
                        {isLoading ? (
                          <Skeleton
                            count={1}
                            width={"100%"}
                            style={{ margin: "12px 0px" }}
                          />
                        ) : (
                          <p>{masjid?.contact}</p>
                        )}
                      </div>
                      {truncatedWebLink && (
                        <LinkWrapper url={webLink}>
                          <div className="icon-box">
                            <div data-testid="website-testid">
                              <LanguageRoundedIcon sx={{ width: "20px" }} />
                            </div>
                            {isLoading ? (
                              <Skeleton
                                count={1}
                                width={"40%"}
                                style={{ margin: "12px 0px" }}
                              />
                            ) : (
                              <p>{truncatedWebLink}</p>
                            )}
                            {/* <p>{zoneConverter(masjid?.location)}</p> */}
                          </div>
                        </LinkWrapper>
                      )}
                    </div>
                    {fbLink && (
                      <LinkWrapper url={fbLink}>
                        <div className="icon-box">
                          <div data-testid="facebook-testid">
                            <FacebookRoundedIcon sx={{ width: "20px" }} />
                          </div>
                          {isLoading ? (
                            <Skeleton
                              count={1}
                              width={"40%"}
                              style={{ margin: "12px 0px" }}
                            />
                          ) : (
                            <p>{truncatedName}</p>
                          )}
                        </div>
                      </LinkWrapper>
                    )}
                    {admin?.role &&
                      (admin?.role === AdminRole.SUPER_ADMIN ||
                        admin?.role === AdminRole.ADMIN) &&
                      truncatedInstaLink && (
                        <LinkWrapper url={instaLink}>
                          <div className="icon-box">
                            <div data-testid="website-testid">
                              <InstagramIcon sx={{ width: "20px" }} />
                            </div>
                            {isLoading ? (
                              <Skeleton
                                count={1}
                                width={"40%"}
                                style={{ margin: "12px 0px" }}
                              />
                            ) : (
                              <p>{truncatedInstaLink}</p>
                            )}
                          </div>
                        </LinkWrapper>
                      )}
                    {truncatedEmail && (
                      <LinkWrapper url={email}>
                        <div className="icon-box">
                          <div data-testid="website-testid">
                            <EmailIcon sx={{ width: "20px" }} />
                          </div>
                          {isLoading ? (
                            <Skeleton
                              count={1}
                              width={"40%"}
                              style={{ margin: "12px 0px" }}
                            />
                          ) : (
                            <p>{truncatedEmail}</p>
                          )}
                        </div>
                      </LinkWrapper>
                    )}
                  </div>

                  <div className="icon-box-container2">
                    <div className="icon-box">
                      <div>
                        <LocationOnRoundedIcon sx={{ width: "20px" }} />
                      </div>
                      <p>{masjid?.address}</p>
                    </div>
                    {isMainAdmin && (
                      <div className="icon-box">
                        <p>Last Updated By : </p>
                        <p>{masjid?.updatedBy?.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <FullScreenImageModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          imgSrc={currentSrc}
          imgAlt={currentAlt}
        />
      </div>
    </>
  );
};
export default MasjidProfile;
