import {
  useState,
  useRef,
  type ChangeEvent,
  Dispatch,
  SetStateAction,
} from "react";
import {
  Card,
  CardContent,
  IconButton,
  Button,
  Box,
  Backdrop,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { uploadMasjidMedia } from "../../../redux/actions/MasjidActions/UploadMasjidMediaAction";
import { uploadMasjidProfile } from "../../../redux/actions/MasjidActions/UploadMasjidProfileAction";
import { toast } from "react-hot-toast";
import { useAppThunkDispatch } from "../../../redux/hooks";
import CircularProgress from "@mui/material/CircularProgress";
import UploadIcon from "@mui/icons-material/Upload";
import { compressMediaFile } from "../SharedHelpers/imageCompressor/imageCompressor";

interface ImageUploaderProps {
  open: boolean;
  onClose?: () => void;
  onImageRemove?: () => void;
  isCarouselMedia: boolean;
  masjidId: string;
  removeHandler: () => void;
  masjidReloader: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  imageUrl: string;
  deleteBatchCoverImages: () => Promise<boolean>;
  carouselImgId?: string; 
}

export default function ImageUploader({
  onClose,
  onImageRemove,
  open,
  masjidId,
  removeHandler,
  masjidReloader,
  isCarouselMedia,
  setOpen,
  imageUrl,
  deleteBatchCoverImages,
}: ImageUploaderProps) {
  //   const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | Blob | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppThunkDispatch();

  const handleUploadProfile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Compress the image using the same compression function.
      const compressedFile = await compressMediaFile(file, {});
      // Set the uploaded image to the compressed file.
      setUploadedImage(compressedFile);
    } catch (error: any) {
      // Show the error message and clear the file input.
      toast.error(error.message);
      event.target.value = "";
    }
  };

  const handleRemoveImage = async () => {
    setUploadedImage(null);
  
    if (isCarouselMedia && carouselImgId) {
      const res = await dispatch(deleteMasjidMedia(carouselImgId, masjidId));
      if (res?.status === 200 || res?.status === 204) {
        toast.success("Cover Image Removed!");
        masjidReloader();
      } else {
        toast.error("Failed to Remove Cover Image");
      }
    } else {
      removeHandler();
    }
  };
  
  

  //   const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
  //     const file = event.target.files?.[0];
  //     if (file) {
  //       // Create a preview URL for the uploaded image
  //       const imageUrl = URL.createObjectURL(file);
  //       setImage(imageUrl);
  //       //   handleUploadProfile?.(file);
  //     }
  //   };

  //   const handleRemove = () => {
  //     setImage(null);
  //     if (fileInputRef.current) {
  //       fileInputRef.current.value = "";
  //     }
  //     onImageRemove?.();
  //   };

  console.log(uploadedImage);

  const handleUploadImgAPIRequest = async () => {
    setIsLoading(true);
    const formData = new FormData();
    console.log("Upload Media-1");

    formData.append("image", uploadedImage as string);
    if (isCarouselMedia) {
      console.log("Upload Media0");

      const isDeleted = await deleteBatchCoverImages();
      if (!isDeleted) {
        console.log("Upload Media1");
        toast.error("Couldn't Change Cover Image");
        setIsLoading(false);
        return;
      }
    }
    console.log("Upload Media2");

    const uploadMedia = isCarouselMedia
      ? uploadMasjidMedia(masjidId, formData)
      : uploadMasjidProfile(masjidId, formData);
    console.log("Upload Media3");
    const result = await dispatch(uploadMedia);
    console.log(result);
    if (result?.status === 200 || result.data?.message === "Created") {
      toast.success("Successfully Uploaded!");
      setOpen(false);
      setIsLoading(false);
      masjidReloader();
      setUploadedImage(null);
    } else {
      toast.error(result?.message);
      setIsLoading(false);
    }
  };

  return (
    <Backdrop
      open={open}
      sx={{ zIndex: "9 !important" }}
      onClick={() => {
        onClose?.();
        setUploadedImage(null);
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          position: "absolute",
          borderRadius: 4,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          onClick={() => {
            onClose?.();
            setUploadedImage(null);
          }}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "grey.500",
          }}
        >
          <Close />
        </IconButton>

        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            {(uploadedImage || imageUrl) && (
              <Box
                sx={{
                  width: "100%",
                  height: 200,
                  position: "relative",
                  borderRadius: 6,
                  overflow: "hidden",
                  mb: 2,
                }}
              >
                <img
                  src={
                    uploadedImage
                      ? URL.createObjectURL(uploadedImage as File)
                      : imageUrl
                  }
                  alt="Uploaded profile"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </Box>
            )}

            {!uploadedImage && !imageUrl ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadProfile}
                  style={{ display: "none" }}
                  id="image-upload"
                />
                <Button
                  component="label"
                  htmlFor="image-upload"
                  variant="contained"
                  startIcon={<UploadIcon />}
                  sx={{
                    bgcolor: "#00875A",
                    "&:hover": {
                      bgcolor: "#006C46",
                    },
                    borderRadius: 6,
                    textTransform: "none",
                    py: 1.5,
                    px: 3,
                    width: "90%",
                  }}
                >
                  {isCarouselMedia
                    ? "Upload Cover Image"
                    : "Upload Profile Image"}
                </Button>
              </>
            ) : uploadedImage ? (
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                sx={{
                  bgcolor: "#00875A",
                  "&:hover": {
                    bgcolor: "#006C46",
                  },
                  borderRadius: 6,
                  textTransform: "none",
                  py: 1.5,
                  px: 3,
                  width: "90%",
                }}
                onClick={handleUploadImgAPIRequest}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Upload Image"
                )}
              </Button>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadProfile}
                  style={{ display: "none" }}
                  id="image-upload"
                />
                <Button
                  component="label"
                  htmlFor="image-upload"
                  variant="contained"
                  startIcon={<UploadIcon />}
                  sx={{
                    bgcolor: "#00875A",
                    "&:hover": {
                      bgcolor: "#006C46",
                    },
                    borderRadius: 6,
                    textTransform: "none",
                    py: 1.5,
                    px: 3,
                    width: "90%",
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : isCarouselMedia ? (
                    "Upload Cover Image"
                  ) : (
                    "Update Profile Image"
                  )}
                </Button>
              </>
            )}

            {imageUrl ? (
              <Button
                onClick={handleRemoveImage}
                variant="outlined"
                sx={{
                  borderRadius: 6,
                  borderStyle: "dashed",
                  textTransform: "none",
                  color: "#9F9E9E",
                  borderColor: "#9F9E9E",
                  "&:hover": {
                    borderColor: "grey.400",
                  },
                  py: 1.5,
                  px: 3,
                  width: "90%",
                }}
              >
                {isCarouselMedia ? "Remove Image" : " Remove Profile Image"}
              </Button>
            ) : (
              uploadedImage && (
                <Button
                  onClick={() => setUploadedImage(null)}
                  variant="outlined"
                  sx={{
                    borderWidth: 2,
                    borderRadius: 6,
                    borderStyle: "dashed",
                    textTransform: "none",
                    color: "grey.500",
                    borderColor: "#9F9E9E",
                    "&:hover": {
                      borderColor: "#9F9E9E",
                    },
                    py: 1.5,
                    px: 3,
                    width: "90%",
                  }}
                >
                  {isCarouselMedia ? "Remove Image" : "Remove Profile Image"}
                </Button>
              )
            )}
          </Box>
        </CardContent>
      </Card>
    </Backdrop>
  );
}
