import React, { useEffect, useState } from "react";

import addtvIcon from "../../../../photos/Newuiphotos/Icons/Tvimages/AddTv.webp";
import styles from "./ConnectTvMain.module.css";
import CustomButton from "../../Shared/NewComponents/CustomButton/CustomButton";

import BackButton from "../../Shared/BackButton";
import { useNavigationprop } from "../../../../../MyProvider";
import { customNavigatorTo } from "../../../../helpers/HelperFunction";
import ConnectedTvList from "../ConnectedTvList/ConnectedTvList";
import { useAppDispatch } from "../../../../redux/hooks";
import { fetchAllTv } from "../../../../redux/actions/TvActions/TvActions";

interface Tv {
  id: number;
  name: string;
  status: string;
}

const ConnectTvMain: React.FC<any> = ({ consumerMasjidId }) => {
  const navigation = useNavigationprop();
  const [editMode, setEditMode] = useState(false);
  const [screen, setScreen] = useState<"cards" | "settings">("cards");

  //redux state
  const dispatch = useAppDispatch();
  console.log(consumerMasjidId);
  useEffect(() => {
    dispatch(fetchAllTv(consumerMasjidId));
  }, [dispatch]);

  const handleAddTv = () => {
    navigation
      ? navigation(`/add-tv/${consumerMasjidId}`)
      : customNavigatorTo(`/add-tv/${consumerMasjidId}`); // Navigate to the add TV page
  };

  const handleBack = () => {
    setScreen("cards");
    setEditMode(false);
  };

  return (
    <div className={styles.tvmaincontainer}>
      <div className={"title-container"}>
        <div
          className="goback"
          //  style={{ marginTop: "0" }}
        >
          <BackButton
            handleBackBtn={
              editMode 
                ? handleBack
                : navigation
                ? navigation
                : customNavigatorTo
            }
            isHome={editMode ? false : true}
          />
        </div>
        <h3 className="page-title">{editMode ? "TV App" : "Connected TV"}</h3>
      </div>

      {!editMode && (
        <div className={styles.addTvButtonContainer}>
          <CustomButton
            onClick={handleAddTv}
            text="Add New TV"
            iconSrc={addtvIcon}
            className={styles.addTvButton}
            iconStyle={{ height: "20px", width: "30px" }}
            //   disabled={shouldDisableButton()}
          />
        </div>
      )}

      <div>
        <ConnectedTvList
          setEditMode={setEditMode}
          consumerMasjidId={consumerMasjidId}
          screen={screen}
          setScreen={setScreen}
        />
      </div>
    </div>
  );
};

export default ConnectTvMain;
