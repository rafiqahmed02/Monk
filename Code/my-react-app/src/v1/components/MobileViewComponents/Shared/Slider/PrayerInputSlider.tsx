import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/swiper-bundle.min.css";
import SwiperCore from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { useMediaQuery, useTheme } from "@mui/material";

SwiperCore.use([Navigation, Pagination]);

type propsType = {
  setCurrentSliderIdx: React.Dispatch<React.SetStateAction<number>>;
  currentSliderIdx: number;
  children: React.ReactNode;
  swiperRef: React.RefObject<SwiperCore>;
  goNext: () => void;
  goPrev: () => void;
  errors: { [key: string]: string } | {};
};
const defaultPrayerSteps = [
  { name: "Fajr", next: "Dhur", type: 1 },
  { name: "Dhur", next: "Asar", type: 2 },
  { name: "Asar", next: "Maghrib", type: 3 },
  { name: "Maghrib", next: "Isha", type: 4 },
  { name: "Isha", next: null, type: 5 },
];
const PrayerInputSlider = ({
  children,
  setCurrentSliderIdx,
  currentSliderIdx,
  swiperRef,
  goNext,
  goPrev,
  errors,
}: propsType) => {
  const [isMobileLocalVar, setIsMobile] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(`(max-width:767.98px)`);

  const validChildren = React.Children.toArray(children).filter(
    React.isValidElement
  );

  // useEffect(() => {
  //   const handleResize = () => {
  //     console.log("handle resize", window.innerWidth);
  //     const isMobileSize = window.innerWidth <= 767;
  //     setIsMobile(isMobileSize);
  //     setIsMobileHandler(isMobileSize);
  //   };

  //   window.addEventListener("resize", handleResize);
  //   handleResize(); // Initial check

  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []);

  return (
    <>
      {isMobile ? (
        <div className="slider-container" role="presentation">
          <Swiper
            onSlideChange={(swiper) => setCurrentSliderIdx(swiper.activeIndex)}
            loop={false}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            style={{ overflow: "visible" }}
            pagination={{
              dynamicBullets: true,
            }}
            modules={[Pagination]}
            // allowSlideNext={
            //   // Object.keys(errors).length > 0 &&
            //   defaultPrayerSteps.findIndex(
            //     (item) => item.name === Object.keys(errors)[0]
            //   ) === -1 ||
            //   currentSliderIdx !==
            //     defaultPrayerSteps.findIndex(
            //       (item) => item.name === Object.keys(errors)[0]
            //     )
            // }
          >
            {isMobile
              ? validChildren.map((child, index) =>
                  defaultPrayerSteps.findIndex(
                    (item) => item.name === Object.keys(errors)[0]
                  ) === -1 ||
                  index <=
                    defaultPrayerSteps.findIndex(
                      (item) => item.name === Object.keys(errors)[0]
                    ) ? (
                    <SwiperSlide key={index}>{child}</SwiperSlide>
                  ) : null
                )
              : validChildren}
          </Swiper>
        </div>
      ) : (
        <div
          className="tab-prayer-timing-card"
          data-testid="tab-prayer-timing-card"
        >
          {children}
        </div>
      )}
    </>
  );
};

export default PrayerInputSlider;
