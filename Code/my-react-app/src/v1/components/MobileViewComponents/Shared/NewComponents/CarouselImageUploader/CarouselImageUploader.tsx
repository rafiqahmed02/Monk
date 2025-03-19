import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import {
  Box,
  MobileStepper,
  CircularProgress,
  Button,
  SxProps,
} from "@mui/material";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import styled from "styled-components";
import "./CarouselImageUploader.css"; // optional style file

// Example placeholder icon imports — adjust or remove as needed
// import defaultPlaceholder from "./placeholder.svg";
// import addIcon from "./addIcon.svg";
// import deleteIcon from "./deleteIcon.svg";
import defaultPlaceholder from "../../../../../photos/Newuiphotos/Icons/noEvntphoto.svg";
import addIcon from "../../../../../photos/Newuiphotos/UploaderCarousel/greyAddImage.svg";
import deleteIcon from "../../../../../photos/Newuiphotos/Icons/deletex.svg";
import { Swiper, SwiperClass, SwiperRef, SwiperSlide } from "swiper/react";
// import "swiper/swiper-bundle.min.css";
import SwiperCore from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import toast from "react-hot-toast";
import FullScreenImageModal from "../../../Donation/Carousel/FullScreenImageModal ";
import { compressMediaFiles } from "../../../SharedHelpers/imageCompressor/imageCompressor";
/** ---------------------------------------------------------------------------
 *  Custom arrow components for react-slick
 * ---------------------------------------------------------------------------
 */
const CustomPrevArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-prev-arrow`}
      style={style}
      onClick={onClick}
    >
      <IoIosArrowBack color="white" size={15} />
    </div>
  );
};

const CustomNextArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-next-arrow`}
      style={style}
      onClick={onClick}
    >
      <IoIosArrowForward color="white" size={15} />
    </div>
  );
};

/** ---------------------------------------------------------------------------
 *  Styled components for optional Add/Delete Buttons
 * ---------------------------------------------------------------------------
 */
const ActionButton = styled.div`
  position: absolute;
  background: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  bottom: 10px;
  /* Change 'right' dynamically (or place them side by side) */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

/** ---------------------------------------------------------------------------
 *  Props for the CarouselImageUploader
 * ---------------------------------------------------------------------------
 */
export interface CarouselImage {
  url: string;
  alt: string;
  _id?: string;
}

export interface CarouselImageUploaderProps {
  /** Array of { url, alt } objects */
  images: CarouselImage[];

  /** Whether to show the add button for uploading new images */
  showAddButton?: boolean;
  /** Whether to show the delete button for each slide */
  showDeleteButton?: boolean;

  /** Called when user wants to upload a new image */
  onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Called when user wants to delete the current image */
  onDelete?: (currentIndexOrId: number | string) => void;

  /** If you have a loading state after uploading, you can trigger a spinner overlay */
  isLoading?: boolean;

  /** Whether or not to show the bottom stepper/dots */
  hideController?: boolean;

  /** Placeholder image if no images exist */
  placeholderImg?: string;
  /** Size of the placeholder icon (width/height) */
  placeholderSize?: string;
  isCarousel?: boolean;
  imgStyle?: React.CSSProperties | SxProps;
  imgBgStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  defaultImgStyle?: React.CSSProperties;
  onCustomUploadHandler?: (e: MouseEvent<HTMLDivElement, MouseEvent>) => void;
  roundededImageUploader?: boolean;
}

/** ---------------------------------------------------------------------------
 *  Main Reusable Component
 * ---------------------------------------------------------------------------
 */
const CarouselImageUploader: React.FC<CarouselImageUploaderProps> = ({
  images,
  showAddButton = true,
  showDeleteButton = true,
  onUpload,
  onDelete,
  isLoading = false,
  hideController = true,
  placeholderImg = defaultPlaceholder,
  placeholderSize = "40px",
  isCarousel = false,
  imgStyle = {},
  imgBgStyle = {},
  containerStyle = {},
  defaultImgStyle = {},
  onCustomUploadHandler,
  roundededImageUploader = false,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const swiperRef = useRef<SwiperRef>(null);
  const sliderRef = useRef<Slider | null>(null);
  const [swiperIndex, setSwiperIndex] = useState(0);

  const prevImagesLengthRef = useRef<number>(images?.length ?? 0);
  //   console.log(activeStep);
  //   console.log(swiperRef.current?.swiper.activeIndex);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [isAtBeginning, setIsAtBeginning] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [currentAlt, setCurrentAlt] = useState<string>("");
  const [fullscreenOpen, setFullScreenOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // Slick carousel settings
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    // arrows: false,
    // swipeToSlide: false,
    slidesToShow: 1,
    slidesToScroll: 1,

    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    customPaging: (i: number) => <div></div>, // Hide default dots icon
    appendDots: (dots: React.ReactNode) => (
      <div>
        <ul style={{ margin: "0px" }}>{dots}</ul>
      </div>
    ),
    beforeChange: (current: number, next: number) => {
      setActiveStep(next);
      setIsDragging(true);
    },
    afterChange: (current: number) => {
      setIsDragging(false);
      setActiveStep(current);
      if (swiperRef?.current) {
        swiperRef.current.swiper.slideTo(current);
      }
    },
  };

  // const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   // Check if onUpload is defined and we actually have at least one file
  //   if (onUpload && e.target.files && e.target.files.length > 0) {
  //     onUpload(e);
  //   }
  // };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      try {
        const { validFiles, errors } = await compressMediaFiles(filesArray, {
          // Optionally, pass your custom video compressor if needed:
          // compressVideoFn: yourCustomVideoCompressionFunction,
        });

        // If there are errors or no valid files, clear the input and stop further processing.
        if (errors.length > 0 || validFiles.length === 0) {
          errors.forEach((msg) => toast.error(msg));
          // Clear the input value so that the same file can be re-uploaded.
          e.target.value = "";
          return;
        }

        // Create a DataTransfer instance to simulate a FileList.
        const dataTransfer = new DataTransfer();
        validFiles.forEach((file) => dataTransfer.items.add(file));

        // Create a synthetic event with the compressed files.
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            files: dataTransfer.files,
          },
        } as React.ChangeEvent<HTMLInputElement>;

        // Call the parent's upload function if defined.
        if (onUpload) {
          onUpload(syntheticEvent);
        }

        // Optionally, clear the input after handling the files.
        e.target.value = "";
      } catch (err) {
        console.error("Error processing files:", err);
        // Clear input on error as well.
        e.target.value = "";
      }
    }
  };

  // useEffect(() => {
  //   if (swiperRef?.current) {
  //     if (activeStep === 0) {
  //       swiperRef.current.swiper.slideTo(0);
  //       sliderRef.current?.slickGoTo(0);
  //     } else {
  //       swiperRef.current.swiper.slideTo(activeStep + 1);
  //       sliderRef.current?.slickGoTo(activeStep);
  //     }
  //   }
  // }, [activeStep, swiperRef]);

  useEffect(() => {
    // Only run if NOT using the carousel and we have previously had images
    if (!isCarousel && prevImagesLengthRef.current > 0) {
      // Compare old length to the new length
      if (images?.length > prevImagesLengthRef.current) {
        // We just added images, so jump to the last index
        setActiveStep(images.length - 1);

        if (sliderRef.current) {
          sliderRef.current.slickGoTo(images.length - 1);
        }
        if (swiperRef.current) {
          swiperRef.current.swiper.slideTo(images.length - 1);
        }
      }
    }

    // Always update the ref after our checks
    prevImagesLengthRef.current = images?.length ?? 0;
  }, [images, isCarousel]);

  const renderBoxWithBackground = (imageUrl?: string, imageAlt?: string) => {
    return (
      <Box
        // key={index}
        className="carousel-slide"
        sx={{
          width: "100%",
          height: "auto",
          maxHeight: roundededImageUploader ? 130 : 280,
          minHeight: roundededImageUploader ? 130 : 180,
          display: "flex !important",
          alignItems: "center",
          justifyContent: roundededImageUploader ? "center" : "",
          position: "relative",
          "::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "99%",
            height: "100%",
            background: `url(${imageUrl}) no-repeat center center`,
            backgroundSize: "cover",
            filter: "blur(4px)",
            zIndex: -1,
            borderRadius: "16px",
            ...imgBgStyle,
          },
          outline: "none",
          "&:focus-visible": {
            outline: "none",
          },
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          //   alt={imageAlt}
          alt={imageAlt}
          draggable={false}
          sx={{
            display: "block",
            width: "100%",
            height: "auto",
            maxHeight: 180,
            minHeight: 180,
            objectFit: "contain",
            borderRadius: "10px",
            color: "black",
            ...imgStyle,
            outline: "none",
            "&:focus-visible": {
              outline: "none",
            },
          }}
          onClick={(e) => {
            if (!isCarousel || isDragging) return;
            setCurrentAlt(imageAlt ?? "");
            setCurrentSrc(imageUrl ?? "");
            setFullScreenOpen(true);
          }}
          onError={(e) => {
            // toast.dismiss();
            // toast.error("Failed to render image");
            // (e.currentTarget as HTMLImageElement).src = placeholderImg;
          }}
        />
      </Box>
    );
  };

  return (
    <div className="carousel-uploader-wrapper">
      <div
        className="carousel-uploader__img-container"
        style={{ ...containerStyle }}
      >
        {images?.length > 0 ? (
          <div
            style={{
              position: "relative",
              width: roundededImageUploader ? "130px" : "100%",
            }}
          >
            {/* {!isCarousel ? (
              renderBoxWithBackground(
                images[activeStep].url,
                images[activeStep].alt
              )
            ) : ( */}
            <Slider
              {...settings}
              ref={sliderRef}
              className={roundededImageUploader ? "custom-slider" : ""}
            >
              {images.map(
                (image, index) => renderBoxWithBackground(image.url, image.alt)
                // <Box
                //   key={index}
                //   className="carousel-slide"
                //   sx={{
                //     position: "relative",
                //     "::before": {
                //       content: '""',
                //       position: "absolute",
                //       top: 0,
                //       left: 0,
                //       width: "100%",
                //       height: "100%",
                //       background: `url(${image.url}) no-repeat center center`,
                //       backgroundSize: "cover",
                //       filter: "blur(4px)",
                //       zIndex: -1,
                //     },
                //   }}
                // >
                //   <Box
                //     component="img"
                //     src={image.url}
                //     alt={image.alt || `Photo ${index}`}
                //     draggable={false}
                //     sx={{
                //       display: "block",
                //       width: "100%",
                //       height: "auto",
                //       maxHeight: 180,
                //       minHeight: 180,
                //       objectFit: "contain",
                //       borderRadius: "10px",
                //     }}
                //     onError={(e) => {
                //       (e.currentTarget as HTMLImageElement).src =
                //         placeholderImg;
                //     }}
                //   />
                // </Box>
              )}
            </Slider>
            {/* )} */}
          </div>
        ) : (
          // No images - placeholder display
          <Box className="carousel-placeholder-box">
            <Box
              component="img"
              src={placeholderImg}
              alt="No images"
              draggable={false}
              sx={{
                maxHeight: 180,
                minHeight: 180,
                width: placeholderSize,
                height: 180,
                // margin: "20px 0",
                objectFit: "contain",
                ...defaultImgStyle,
              }}
            />

            {isLoading && (
              <CircularProgress
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            )}
          </Box>
        )}
        {!isCarousel && showDeleteButton && onDelete && images.length > 0 && (
          <ActionButton
            style={{ right: "10px", bottom: "16px" }}
            onClick={() => {
              if (images[activeStep]._id) {
                onDelete(images[activeStep]._id as unknown as string);
              } else {
                onDelete(activeStep);
              }
            }}
          >
            <img
              src={deleteIcon}
              alt="Delete"
              style={{ width: 15, height: 15 }}
            />
          </ActionButton>
        )}
        {!isCarousel &&
          showAddButton &&
          (onUpload || onCustomUploadHandler) && (
            <>
              <ActionButton
                style={{
                  right: images?.length > 0 ? "20px" : "20px",
                  bottom: "16px",
                  left: roundededImageUploader ? "62%" : "",
                }}
                onClick={(e) => {
                  if (onCustomUploadHandler) {
                    onCustomUploadHandler(e);
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
              >
                <img
                  src={addIcon}
                  alt="Add"
                  style={{ width: 15, height: 15 }}
                />
              </ActionButton>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileInputChange}
              />
            </>
          )}
      </div>
      {/* {!isCarousel && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            padding: "10px 0px",
            borderBottom: "0.5px solid #cdcdcd",
          }}
        >
          <Swiper
            ref={swiperRef}
            slidesPerView={"auto"}
            className="images-swiper"
            watchOverflow={true}
            onSlideChange={(swiper) => setSwiperIndex(swiper.activeIndex)}
            onReachBeginning={() => {
              if (!images?.length) return;

              setIsAtBeginning(true);
              setIsAtEnd(false);
            }}
            onReachEnd={() => {
              if (!images?.length) return;
              setIsAtEnd(true);
              setIsAtBeginning(false);
            }}
            onFromEdge={(swiper) => {
              if (!images?.length) return;

              setIsAtEnd(false);
              setIsAtBeginning(false);
              // setActiveStep(swiper.activeIndex);
              // sliderRef?.current?.slickGoTo(swiper.activeIndex);
            }}
            // onSlideChange={(swiper) => {
            //   setActiveStep(swiper.activeIndex);
            //   sliderRef?.current?.slickGoTo(swiper.activeIndex);
            // }}
          >
            <div
              className="swiper-nav-button swiper-button-prev"
              style={{
                visibility:
                  !images?.length ||
                  isAtBeginning ||
                  swiperRef?.current?.swiper.activeIndex === 0
                    ? "hidden"
                    : "visible",

                position: "absolute",
                left: 5,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                cursor: "pointer",
              }}
              onClick={() => swiperRef.current?.swiper.slidePrev()}
            >
              <IoIosArrowBack
                size={20}
                style={{
                  color: "white",
                  background: "#0000009e",
                  borderRadius: "50%",
                  width: "16px",
                  height: " 16px",
                }}
              />
            </div>
            {images.map((image, index) => (
              <SwiperSlide
                key={index}
                className={`image-slide actual-image ${
                  activeStep === index && "active-image"
                }`}
                onClick={() => {
                  setActiveStep(index);
                  if (sliderRef?.current) {
                    sliderRef?.current?.slickGoTo(index);
                  }
                }}
              >
                <img src={image.url} alt={image.alt || `Photo ${index}`} />
              </SwiperSlide>
            ))}
            <div
              className="swiper-nav-button swiper-button-next"
              style={{
                visibility:
                  !images?.length ||
                  isAtEnd ||
                  swiperRef?.current?.swiper.activeIndex === images?.length - 1
                    ? "hidden"
                    : "visible",

                position: "absolute",
                right: 5,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                cursor: "pointer",
              }}
              onClick={() => swiperRef.current?.swiper.slideNext()}
            >
              <IoIosArrowForward
                size={20}
                style={{
                  color: "white",
                  background: "#0000009e",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                }}
              />
            </div>
          </Swiper>
          <Button
            className=""
            onClick={() => fileInputRef.current?.click()}
            sx={{
              backgroundColor: "green",
              color: "white",
              "&:hover": { backgroundColor: "green" },
              borderRadius: "20px",
            }}
          >
            <img src={addIcon} alt={"Add Image"} />
            Add Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFileInputChange}
          />
        </div>
      )} */}
      {!hideController && (
        <MobileStepper
          steps={images?.length || 0}
          position="static"
          activeStep={activeStep}
          nextButton={null}
          backButton={null}
          sx={{
            justifyContent: "center",
            position: "absolute",
            // top: "90%",
            bottom: "-24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "none",
            zIndex: "200",
            marginTop: "24px",
          }}
        />
      )}
      <FullScreenImageModal
        isOpen={fullscreenOpen}
        setIsOpen={setFullScreenOpen}
        imgSrc={currentSrc}
        imgAlt={currentAlt}
      />
    </div>
  );
};

export default CarouselImageUploader;
