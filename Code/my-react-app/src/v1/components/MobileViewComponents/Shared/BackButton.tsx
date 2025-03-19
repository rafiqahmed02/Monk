import React from "react";

import backbtn from "../../../photos/backbtn.png";
import homeButton from "../../../photos/Newuiphotos/menuIcons/homeButton.png";
import { useNavigationprop } from "../../../../MyProvider";
import { customNavigatorTo } from "../../../helpers/HelperFunction";
const BackButton = ({
  handleBackBtn,
  isHome = false,
  isBackOnly = false,
}: any) => {
  const navigation = useNavigationprop();
  const backBtn = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // marginLeft: "10px",
  };

  return (
    <div>
      <div data-testid="backBtn" className="backBtn" style={backBtn}>
        {isBackOnly ? (
          <img
            onClick={() => {
              handleBackBtn("/feed/0");
            }}
            src={backbtn}
            style={{ width: "45%", cursor: "pointer" }}
            alt="back btn"
          />
        ) : (
          <>
            <img
              onClick={() => {
                navigation
                  ? navigation("/feed/0")
                  : customNavigatorTo("/feed/0");
              }}
              src={
                homeButton
                // "https://static.vecteezy.com/system/resources/previews/017/609/002/non_2x/minimal-house-icon-website-symbol-site-sign-ui-home-icon-home-creative-icon-minimalist-vector.jpg"
              }
              style={{ width: "45%", borderRadius: "50%", cursor: "pointer" }}
              // style={{ width: "35%", borderRadius: "50%", cursor: "pointer" }}
              // alt="back btn"
            />
            {!isHome && (
              <img
                onClick={() => {
                  handleBackBtn("/feed/0");
                }}
                src={backbtn}
                style={{ width: "45%", cursor: "pointer" }}
                alt="back btn"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BackButton;
