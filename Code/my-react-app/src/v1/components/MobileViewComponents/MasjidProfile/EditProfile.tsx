import React, {
  useState,
  useEffect,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  FC,
  useCallback,
  useMemo,
} from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
  Box,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import proflePlaceholer from "../../../photos/Newuiphotos/home icon/profile_placeholder.png";
import Deletemessagemodel1 from "../../../photos/Newuiphotos/Common/Delete.webp";
import updatemodelimg from "../../../photos/Newuiphotos/masjidProfile/Delete.svg";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import masjidcoverplaceholder from "../../../photos/Newuiphotos/masjidProfile/placeholder/masjidCover.webp";
import masjidprofileplaceholder from "../../../photos/Newuiphotos/masjidProfile/placeholder/masjidProfile.webp";

import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import toast from "react-hot-toast";
import { useAppThunkDispatch, useAppSelector } from "../../../redux/hooks";
import default_home_img from "../../../photos/default-home-img.png";
import delete_icon from "../../../photos/Newuiphotos/masjidProfile/deleteIcon.svg";
import camera_icon from "../../../photos/Newuiphotos/masjidProfile/camera!.svg";
import { updateAdminMasjid } from "../../../redux/actions/MasjidActions/UpdatingMasjidByAdmin";
import { deleteMasjidMedia } from "../../../redux/actions/MasjidActions/DeletingMasjidMediaAction";
import { deleteMasjidProfile } from "../../../redux/actions/MasjidActions/DeletingMasjidProfileAction";
import ImageUploadModal from "./ImageUploadModal";
import DeleteConfirmation from "../Shared/DeleteConfirmation/DeleteConfirmation";
import UpdateConfirmation from "../Shared/UpdateConfirmation/UpdateConfirmation";
import { IExternalLinks, Masjid } from "../../../redux/Types";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useMediaQuery, useTheme } from "@material-ui/core";
import { styled } from "@mui/system";
import ImageUploader from "./imageUploader";
import MessageModel from "../OtherSalah/helperComponent/messageModel/messageModel";
import BackButton from "../Shared/BackButton";
import { customNavigatorTo } from "../../../helpers/HelperFunction";
import { useNavigationprop } from "../../../../MyProvider";
import { validateAddress } from "../../../helpers/HelperFunction/GoogleAPI/GoogleLocation";
import InfoIcon from "@mui/icons-material/Info";
import CustomTooltip from "../Shared/Tooltip/CustomTooltip";
import { handleSnackbar } from "../../../helpers/SnackbarHelper/SnackbarHelper";
import { AdminRole } from "../Shared/enums/AdminEnums";
import CarouselImageUploader from "../Shared/NewComponents/CarouselImageUploader/CarouselImageUploader";
import AutocompleteAddressInput from "../Signup/AddMasjidForm/AutocompleteAddressInput";
import { useJsApiLoader } from "@react-google-maps/api";
import { roleRenamer } from "../SharedHelpers/helpers";

const RoundedIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: "50%",
  padding: 3, // Adjust padding to control the size of the button
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

interface EditMasjidProps {
  masjid: Masjid;
  openMasjidEdit: boolean;
  setOpenMasjidEdit: Dispatch<SetStateAction<boolean>>;
  masjidId: string;
  masjidReloader: () => void;
}

const customTheme = createTheme({
  palette: {
    primary: {
      main: "#ffff",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgba(0, 0, 0, 0.23)",
              borderRadius: "20px",
            },
            "&:hover fieldset": {
              borderColor: "#1976d2",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1976d2",
            },
          },
        },
      },
    },
  },
});

interface ImageData {
  id?: string;
  src: string;
  offset: number;
}
const libraries: any = ["places"];

const EditProfile: FC<EditMasjidProps> = ({
  masjid,
  openMasjidEdit,
  setOpenMasjidEdit,
  masjidId,
  masjidReloader,
}) => {
  const admin = useAppSelector((state) => state.admin);

  const [emailError, setEmailError] = useState<string>("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [websiteError, setWebsiteError] = useState("");
  const [facebookError, setFacebookError] = useState("");
  const [instagramError, setInstagramError] = useState("");
  const [latitudeError, setLatitudeError] = useState("");
  const [longitudeError, setLongitudeError] = useState("");
  const [isAddressVerified, setIsAddressVerified] = useState(true);
  const [isAddressValid, setIsAddressValid] = useState(true);
  const [isCarouselMediaVisible, setIsCarouselMediaVisible] =
    useState<boolean>(false);
  const [isUploadProfileVisible, setIsUploadProfileVisible] =
    useState<boolean>(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] =
    useState(false);
  const [isProgressActive, setIsProgressActive] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const [email, setEmail] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [carouselImgId, setCarouselImgId] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [facebook, setFacebook] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [latitude, setLatitude] = useState<string>(""); // New state for latitude
  const [longitude, setLongitude] = useState<string>(""); // New state for longitude
  const [masjidPhotos, setMasjidPhotos] = useState<string[]>([]);
  const [masjidProfilePhoto, setMasjidProfilePhoto] = useState<string>("");
  const [coverImages, setCoverImages] = useState<ImageData[]>([]);

  const [masjidName, setMasjidName] = useState("");
  const dispatch = useAppThunkDispatch();
  const isFormValid =
    masjidName &&
    address &&
    // phoneNumber &&
    !phoneNumberError &&
    !emailError &&
    latitude &&
    !latitudeError && // Ensure latitude is not empty
    longitude &&
    !longitudeError && // Ensure latitude is not empty
    (!website || !websiteError) &&
    (!facebook || !facebookError) &&
    (!instagram || !instagramError);

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Validation functions
  const validatePhoneNumber = (phone: string) => {
    const regex = /^\+?[\d\s()-]+(,\s*\+?[\d\s()-]+)*$/;
    // /^\+?([0-9]{1,3})?[-. ]?([0-9]{3})[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return regex.test(phone);
  };
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateWebsite = (url: string) => {
    const regex = /^(https?:\/\/)?([\w\d\-]+\.)+\w{2,}(\/.*)?$/;
    return regex.test(url);
  };

  const validateFacebookURL = (url: string) => {
    const regex =
      /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/[a-zA-Z0-9(\.\?)?]+/;
    return regex.test(url);
  };
  const validateInstagramURL = (url: string) => {
    const regex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/;
    return regex.test(url);
  };

  const validateLatitude = (latitude: string) => {
    const latNum = parseFloat(latitude);
    return !isNaN(latNum) && latNum >= -90 && latNum <= 90;
  };

  // Validator for Longitude
  const validateLongitude = (longitude: string) => {
    const longNum = parseFloat(longitude);
    return !isNaN(longNum) && longNum >= -180 && longNum <= 180;
  };

  const handleBlur = (
    value: string,
    validator: (val: string) => boolean,
    setError: React.Dispatch<React.SetStateAction<string>>,
    errorMessage: string
  ) => {
    if (value && !validator(value)) {
      setError(errorMessage);
    } else {
      setError("");
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    setValue: React.Dispatch<React.SetStateAction<string>>,
    setError: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setValue(e.target.value);
    if (setError) setError("");
  };

  const socialLinksHandler = (key: string, links: IExternalLinks[]) => {
    if (!links) return "";
    const matchedItems = links.find((link) => link.name === key);
    return matchedItems ? matchedItems.url : "";
  };

  const deleteBatchCoverImages = async () => {
    if (coverImages.length === 0) return true; // No images to delete

    try {
      await Promise.all(
        coverImages.map(async (image) => {
          if (image.id) {
            // Dispatch the deletion for each image
            const deleteResult = await dispatch(
              deleteMasjidMedia(image.id, masjidId)
            );
            if (deleteResult?.status !== 200 && deleteResult?.status !== 204) {
              throw Error("Failed to replace cover image");
              // Optionally, you can add error notification here
            }
            // Optional: Check deleteResult for error handling if needed
          }
        })
      );
      setCoverImages([]);

      return true;
      // Clear the cover images state after successful deletion
    } catch (error) {
      console.error("Error deleting cover images:", error);
      return false;
      // Optionally, you can add error notification here
    }
  };

  useEffect(() => {
    setMasjidName(masjidName || masjid?.masjidName);
    setDescription(description || masjid?.description || "");
    setPhoneNumber(phoneNumber || masjid?.contact || "");
    setWebsite(website || socialLinksHandler("Website", masjid?.externalLinks));
    setFacebook(
      facebook || socialLinksHandler("Facebook", masjid?.externalLinks)
    );
    setInstagram(
      instagram || socialLinksHandler("Instagram", masjid?.externalLinks)
    );
    setEmail(email || socialLinksHandler("Email", masjid?.externalLinks));
    setAddress(address || masjid?.address || "");
    setLatitude(
      (latitude || masjid?.location?.coordinates?.[1] || "").toString()
    );
    setLongitude(
      (longitude || masjid?.location?.coordinates?.[0] || "").toString()
    );
    setMasjidPhotos(masjid?.masjidPhotos || []);
    setMasjidProfilePhoto(masjid?.masjidProfilePhoto || "");
  }, [masjid]);

  useEffect(() => {
    if (!isUploadProfileVisible && isCarouselMediaVisible) {
      setIsCarouselMediaVisible(false);
    }
  }, [isUploadProfileVisible]);

  const cancelEditMasjidHandler = () => {
    setOpenMasjidEdit(false);
  };

  const updateEditMasjidHandler = async () => {
    setIsProgressActive(true);
    const res = await dispatch(
      updateAdminMasjid(masjidId, {
        masjidName,
        description: description || "",
        contact: phoneNumber || "",
        externalLinks: [
          { name: "Facebook", url: facebook },
          { name: "Website", url: website },
          { name: "Instagram", url: instagram },
          { name: "Email", url: email },
        ],
        address,
        location: {
          type: "Point",
          coordinates: [longitude, latitude], // Save the coordinates
        },
      })
    );
    if (res?.message === "Success") {
      toast.success("Successfully Updated!");
      setIsUpdateConfirmationOpen(false);
      setIsProgressActive(false);
      setOpenMasjidEdit(false);
      masjidReloader();
    } else {
      toast.error(res.message);
      setIsProgressActive(false);
    }
  };

  const deleteProfileConfirmationModalHandler = async () => {
    setIsDeleteConfirmationOpen(true);
  };

  const handleRejection = () => {
    setIsCarouselMediaVisible(false);
    setIsDeleteConfirmationOpen(false);
    setIsUpdateConfirmationOpen(false);
  };

  const deleteProfilePhotoHandler = async () => {
    setIsProgressActive(true);
    let isDeleted = false;

    if (carouselImgId) {
      // In carousel mode, delete all cover images
      isDeleted = await deleteBatchCoverImages();
    } else {
      // Otherwise, delete the profile photo
      const res = await dispatch(deleteMasjidProfile(masjidId));
      isDeleted = res?.status === 200 || res?.status === 204;
    }

    if (isDeleted) {
      toast.success("Successfully Deleted!");
      setIsDeleteConfirmationOpen(false);
      setIsUploadProfileVisible(false);
      setCarouselImgId("");
      masjidReloader();
    } else {
      toast.error("Failed to Delete Cover Image");
    }
    setIsProgressActive(false);
  };

  const texts = {
    main: "Are you sure you want to delete this masjid profile?",
  };

  const handleMediaModal = (isCarousel: boolean) => {
    setIsUploadProfileVisible(true);
    setIsCarouselMediaVisible(isCarousel);
    setCarouselImgId("");
  };
  const handleCarouselMediaDelete = (imgId = "") => {
    setIsCarouselMediaVisible(true);
    setIsDeleteConfirmationOpen(true);
    setCarouselImgId(imgId); // Stores the ID of the image to be deleted
  };
  

  useEffect(() => {
    const savedOffset = JSON.parse(localStorage.getItem("imageOffset") || "50");
    const initialCoverImages = masjidPhotos.map((photo) => ({
      id: photo._id,
      src: photo.url,
      offset: savedOffset,
    }));
    setCoverImages(initialCoverImages);
  }, [masjidPhotos]);

  useEffect(() => {
    if (isTooltipOpen) {
      const timeout = setTimeout(() => {
        setIsTooltipOpen(false);
      }, 6000);
    }
  }, [isTooltipOpen]);
  const handleClickOutside = () => {
    console.log("close");
    setIsTooltipOpen(false);
  };
  const UploaderImages = useMemo(() => {
    if (coverImages?.length) {
      return coverImages.map((img, index) => ({
        url: img.src,
        alt: `Photo ${index}`,
        _id: img.id,
      }));
    } else {
      return [];
    }
  }, [coverImages]);

  const isInternalAdmin =
    admin?.role === AdminRole.SUPER_ADMIN || admin?.role === AdminRole.ADMIN;
  return (
    <>
      {/* <DeleteConfirmation
        setDeleteDialogOpen={setIsDeleteConfirmationOpen}
        warningTexts={texts}
        isDeleteDialogOpen={isDeleteConfirmationOpen}
        isDeleteInProgress={isProgressActive}
        handleReject={handleRejection}
        handleDelete={deleteProfilePhotoHandler}
      /> */}
      {(isDeleteConfirmationOpen || isUpdateConfirmationOpen) && (
        <MessageModel
          onClose={handleRejection}
          onConfirm={
            isDeleteConfirmationOpen
              ? deleteProfilePhotoHandler
              : updateEditMasjidHandler
          }
          messageType={
            isDeleteConfirmationOpen
              ? isCarouselMediaVisible
                ? "Delete Cover Image"
                : "Delete Profile Images"
              : "Update Masjid Profile"
          }
          message={
            isDeleteConfirmationOpen
              ? isCarouselMediaVisible
                ? `Are you sure you want to delete this masjid cover image ?`
                : `Are you sure you want to delete this masjid profile image ?`
              : `Are you sure you want to update the masjid profile?`
          }
          isLoading={isProgressActive}
          img={isDeleteConfirmationOpen ? Deletemessagemodel1 : updatemodelimg}
          optionalValues={
            !isDeleteConfirmationOpen
              ? {
                  icon: (
                    <PriorityHighIcon
                      sx={{
                        position: "absolute",
                        top: {
                          xs: "20px",
                          sm: "20px",
                          md: "20px",
                          lg: "2vmin",
                        },
                        color: "green",
                        fontSize: {
                          xs: "2rem",
                          sm: "2rem",
                          md: "2rem",
                          lg: "4vmin",
                        },
                      }}
                    />
                  ),
                  btnColor: { background: "green", color: "white" },
                }
              : {}
          }
        />
      )}
      {/* <UpdateConfirmation
        setOpen={setIsUpdateConfirmationOpen}
        texts={texts}
        open={isUpdateConfirmationOpen}
        progress={isProgressActive}
        handleReject={handleRejection}
        handleConfirm={updateEditMasjidHandler}
      /> */}
      <ThemeProvider theme={customTheme}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              position: "relative",
            }}
          >
            <div
              className="goback editmasjid"
              // style={{ top: "40px", left: "2px" }}
            >
              <BackButton
                handleBackBtn={cancelEditMasjidHandler}
                // isHome={true}
              />
            </div>
            <h1 className="page-title">Edit Profile</h1>
          </div>
          <Card
            sx={{
              maxWidth: isLargeScreen ? "calc(80% - 12px)" : "calc(95% - 12px)",
              padding: "5px",
              boxShadow: "2px 2px 10px #ccc",
              margin: "12px",
              borderRadius: "20px",
              "& .MuiPaper-root": {
                margin: "10px",
              },
            }}
          >
            <CarouselImageUploader
              images={UploaderImages}
              // onDelete={(currentIndexOrId: string | number) => {
              //   console.log(currentIndexOrId);
              //   handleCarouselMediaDelete(currentIndexOrId as string);
              // }}
              onCustomUploadHandler={(e) => {
                handleMediaModal(true);
              }}
              placeholderImg={masjidcoverplaceholder}
              defaultImgStyle={{
                maxHeight: "300px",
                minHeight: "200px",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "20px 20px 0px 0px",
              }}
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
            ></CarouselImageUploader>

            <Box
              sx={{
                zIndex: "3",
                position: "relative",
                left: isLargeScreen ? 10 : 0,
                top: -140,
                transform: "translateY(100%)",
                display: "flex",
                flexDirection: isLargeScreen ? "" : "column",
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative" }}>
                {masjidProfilePhoto ? (
                  <img
                    src={masjidProfilePhoto}
                    alt="Profile"
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      border: "5px solid white",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <img
                    src={masjidprofileplaceholder}
                    alt="Profile"
                    style={{
                      width: "110px",
                      height: "110px",
                      borderRadius: "50%",
                      border: "5px solid white",
                    }}
                  />
                )}
                <IconButton
                  color="primary"
                  component="label"
                  sx={{
                    position: "absolute",
                    top: 50,
                    left: 50,
                    transform: "translate(50%, 50%)",
                  }}
                  onClick={() => handleMediaModal(false)}
                >
                  <img
                    src={camera_icon}
                    alt="camera-icon"
                    style={{ width: "30px", height: "30px" }}
                  />
                </IconButton>
              </div>
            </Box>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Masjid Name"
                    value={masjidName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setMasjidName(e.target.value)
                    }
                    variant="outlined"
                    margin="dense"
                    required
                    data-testid="edit-masjid-name"
                    sx={{ "& label.Mui-focused": { color: "black" } }}
                    disabled={
                      !admin ||
                      admin?.role === AdminRole.MUSALI_ADMIN ||
                      admin?.role === AdminRole.SUB_ADMIN
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={description}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setDescription(e.target.value)
                    }
                    multiline
                    rows={4}
                    variant="outlined"
                    margin="dense"
                    data-testid="edit-description"
                    sx={{ "& label.Mui-focused": { color: "black" } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Masjid Email"
                    type="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleChange(e, setEmail, setEmailError)
                    }
                    onBlur={() =>
                      handleBlur(
                        email,
                        validateEmail,
                        setEmailError,
                        "Invalid Email Format"
                      )
                    }
                    error={!!emailError}
                    helperText={emailError}
                    // multiline
                    // rows={4}
                    variant="outlined"
                    margin="dense"
                    data-testid="edit-masjidemail"
                    sx={{ "& label.Mui-focused": { color: "black" } }}
                  />
                </Grid>
                <Grid item xs={6} md={!isInternalAdmin ? 4 : 6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={phoneNumber}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleChange(e, setPhoneNumber, setPhoneNumberError)
                    }
                    onBlur={() =>
                      handleBlur(
                        phoneNumber,
                        validatePhoneNumber,
                        setPhoneNumberError,
                        "Invalid Phone Number Format"
                      )
                    }
                    variant="outlined"
                    margin="dense"
                    // required
                    error={!!phoneNumberError}
                    helperText={phoneNumberError}
                    data-testid="edit-phone"
                    sx={{ "& label.Mui-focused": { color: "black" } }}
                  />
                </Grid>
                <Grid item xs={6} md={!isInternalAdmin ? 4 : 6}>
                  <TextField
                    fullWidth
                    label="Website Links"
                    value={website}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleChange(e, setWebsite, setWebsiteError)
                    }
                    onBlur={() =>
                      handleBlur(
                        website,
                        validateWebsite,
                        setWebsiteError,
                        "Invalid Website URL"
                      )
                    }
                    variant="outlined"
                    margin="dense"
                    error={!!websiteError}
                    helperText={websiteError}
                    data-testid="edit-website"
                    sx={{ "& label.Mui-focused": { color: "black" } }}
                  />
                </Grid>
                <Grid item xs={12} md={!isInternalAdmin ? 4 : 6}>
                  <TextField
                    fullWidth
                    label="Facebook Links"
                    value={facebook}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleChange(e, setFacebook, setFacebookError)
                    }
                    onBlur={() =>
                      handleBlur(
                        facebook,
                        validateFacebookURL,
                        setFacebookError,
                        "Invalid Facebook URL"
                      )
                    }
                    variant="outlined"
                    margin="dense"
                    error={!!facebookError}
                    helperText={facebookError}
                    data-testid="edit-facebook"
                    sx={{ "& label.Mui-focused": { color: "black" } }}
                  />
                </Grid>
                {isInternalAdmin && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Instagram Links"
                      value={instagram}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleChange(e, setInstagram, setInstagramError)
                      }
                      onBlur={() =>
                        handleBlur(
                          instagram,
                          validateInstagramURL,
                          setInstagramError,
                          "Invalid Instagram URL"
                        )
                      }
                      variant="outlined"
                      margin="dense"
                      error={!!instagramError}
                      helperText={instagramError}
                      data-testid="edit-instagram"
                      sx={{ "& label.Mui-focused": { color: "black" } }}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    color={"red"}
                    sx={{
                      textAlign: "center",
                      fontSize: {
                        xs: "11.5px", // small devices
                        sm: "14px", // medium devices
                        md: "15 px", // large devices
                        lg: "18px", // extra large devices
                      },
                    }}
                  >
                    Latitude & Longitude Values Affect Salah Timings.
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    variant="outlined"
                    margin="normal"
                    label="Latitude"
                    sx={{ "& label.Mui-focused": { color: "black" } }}
                    required
                    value={latitude}
                    error={!!latitudeError}
                    helperText={latitudeError}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleChange(e, setLatitude, setLatitudeError)
                    }
                    onClick={(e) => {
                      if (
                        !admin ||
                        admin?.role === AdminRole.MUSALI_ADMIN ||
                        admin?.role === AdminRole.SUB_ADMIN
                      ) {
                        toast.dismiss();

                        toast.error(
                          `${
                            admin?.role
                              ? `${roleRenamer(
                                  admin?.role
                                )} Cannot Change Latitude.`
                              : ""
                          }`
                        );
                      }
                    }}
                    onWheel={(e) => e.target.blur()}
                    onBlur={() =>
                      handleBlur(
                        latitude,
                        validateLatitude,
                        setLatitudeError,
                        "Latitude must be between -90 and 90."
                      )
                    }
                    disabled={
                      !admin ||
                      admin?.role === AdminRole.MUSALI_ADMIN ||
                      admin?.role === AdminRole.SUB_ADMIN
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    variant="outlined"
                    margin="normal"
                    label="Longitude"
                    sx={{ "& label.Mui-focused": { color: "black" } }}
                    error={!!longitudeError}
                    helperText={longitudeError}
                    required
                    value={longitude}
                    onClick={(e) => {
                      if (
                        !admin ||
                        admin?.role === AdminRole.MUSALI_ADMIN ||
                        admin?.role === AdminRole.SUB_ADMIN
                      ) {
                        toast.dismiss();
                        toast.error(
                          `${
                            admin?.role
                              ? `${roleRenamer(
                                  admin?.role
                                )} Cannot Change Longitude.`
                              : ""
                          }`
                        );
                      }
                    }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleChange(e, setLongitude, setLongitudeError)
                    }
                    onWheel={(e) => e.target.blur()}
                    onBlur={() =>
                      handleBlur(
                        longitude,
                        validateLongitude,
                        setLongitudeError,
                        "Longitude must be between -180 and 180."
                      )
                    }
                    disabled={
                      !admin ||
                      admin?.role === AdminRole.MUSALI_ADMIN ||
                      admin?.role === AdminRole.SUB_ADMIN
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <AutocompleteAddressInput
                    isLoaded={isLoaded}
                    bounds={null}
                    onAddressChange={({ address, lat, lng, isValid }) => {
                      setLatitude(lat);
                      setLongitude(lng);
                      setAddress(address);
                      setIsAddressValid(isValid);
                    }}
                    initialAddress={masjid?.address ?? ""}
                    initialLat={
                      masjid?.location?.coordinates?.[1].toString() || ""
                    }
                    initialLng={
                      masjid?.location?.coordinates?.[0].toString() || ""
                    }
                    disabled={
                      !admin ||
                      admin?.role === AdminRole.MUSALI_ADMIN ||
                      admin?.role === AdminRole.SUB_ADMIN
                    }
                    disabledMsg={`${
                      admin?.role
                        ? `${roleRenamer(admin?.role)} Cannot Change Address.`
                        : ""
                    }`}
                  ></AutocompleteAddressInput>
                </Grid>
                {/* <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={address}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (e.target.value.trim() === masjid?.address?.trim()) {
                        setIsAddressVerified(true);
                        setIsAddressValid(true);
                        setAddress(e.target.value);
                      } else {
                        setIsAddressValid(false);
                        setIsAddressVerified(false);
                        setAddress(e.target.value);
                      }
                    }}
                    disabled={
                      !admin ||
                      admin?.role === AdminRole.MUSALI_ADMIN ||
                      admin?.role === AdminRole.SUB_ADMIN
                    }
                    variant="outlined"
                    margin="dense"
                    required
                    sx={{ "& label.Mui-focused": { color: "black" } }}
                  />
                </Grid> */}
              </Grid>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "10px",
                  gap: "10px",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={cancelEditMasjidHandler}
                  sx={{
                    // background: "#ff7272",
                    background: "grey",
                    borderRadius: "20px",
                    width: "135px",
                    color: "white",
                    textTransform: "none",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => {
                    if (!isAddressVerified) {
                      toast.error(
                        "Address is Not Validated. Please Validate Address Before Submitting!"
                      );
                    } else if (!isAddressValid) {
                      toast.error(
                        "Address is Not Valid. Please Change It and Validate Again!"
                      );
                    } else {
                      setIsUpdateConfirmationOpen(true);
                    }
                  }}
                  disabled={!isFormValid}
                  sx={{
                    background: "#1B8368",
                    borderRadius: "20px",
                    width: "135px",
                    color: "white",
                    textTransform: "none",
                    "&:hover": {
                      background: "#1B8368",
                    },
                  }}
                >
                  Update
                </Button>
              </Box>
            </CardContent>
          </Card>
        </div>
      </ThemeProvider>
      <div className="modal-container">
        <ImageUploader
          masjidId={masjidId}
          masjidReloader={masjidReloader}
          open={isUploadProfileVisible}
          setOpen={setIsUploadProfileVisible}
          onClose={() => setIsUploadProfileVisible(false)}
          onImageRemove={() => console.log("Image removed")}
          removeHandler={deleteProfileConfirmationModalHandler}
          isCarouselMedia={isCarouselMediaVisible}
          imageUrl={isCarouselMediaVisible ? "" : masjidProfilePhoto}
          deleteBatchCoverImages={deleteBatchCoverImages}
          carouselImgId={carouselImgId}
        />
      </div>
    </>
  );
};

export default EditProfile;
