import React, { useEffect, useState } from "react";
import { SelectionScreen } from "../AddTv/TVOption/SelectionScreen";
import { SettingType } from "../AddTv/TVOption/themes/settings";
import LivetvCard from "../AddTv/TVOption/reusableComponent/LivetvCard";
import { SettingsScreen } from "../AddTv/TVOption/SettingsScreen";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import Deletemessagemodel from "../../../../photos/Newuiphotos/Common/Delete.webp";
import {
  assignPermissionsTv,
  fetchAllTv,
  unpairTv,
  updateTvTheme,
} from "../../../../redux/actions/TvActions/TvActions";
import toast from "react-hot-toast";
import { RESET_ASSIGN_PERMISSIONS_STATE } from "../../../../redux/actiontype";
import MessageModel from "../../OtherSalah/helperComponent/messageModel/messageModel";
import CircularProgress from "@mui/material/CircularProgress";
import styles from "./ConnectedTvList.module.css";
import NotCasted from "../../../../photos/Newuiphotos/Icons/Tvimages/NotCasted.webp";
import { Backdrop } from "@mui/material";
import TVCard from "../ConnectedTVCard/TVCard";

interface Tv {
  id: number;
  name: string;
  status: string;
}

interface ConnectedTvListProps {
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  screen: string;
  setScreen: React.Dispatch<React.SetStateAction<"cards" | "settings">>;
  consumerMasjidId: string;
}

const ConnectedTvList: React.FC<ConnectedTvListProps> = ({
  setEditMode,
  screen,
  setScreen,
  consumerMasjidId,
}) => {
  const {
    tvs,
    error,
    loading: isLoading,
  } = useAppSelector((state) => state.tvReducers);

  const [settingType, setSettingType] = useState<SettingType>("prayer-times");
  const [isLive, setIsLive] = useState<boolean>(false);
  const [connectedTvData, setConnectedTvData] = useState<any>();
  const [showWarning, setShowWarning] = useState(false);
  const [unLinkId, setUnLinkId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  // /** ✅ Check if any TV is paired but not configured */
  useEffect(() => {
    if (Array.isArray(tvs) && tvs.length > 0) {
      const unconfiguredTv = tvs.find(
        (tv) =>
          tv.paired &&
          (!tv.theme ||
            tv.theme === "none" ||
            !tv.orientation ||
            !tv.permissions.length)
      );
      if (unconfiguredTv) {
        let themeName = "";
        let color = "";
        if (unconfiguredTv.theme !== "none") {
          [themeName, color] = unconfiguredTv.theme.split("-");
        }

        setConnectedTvData({
          ...unconfiguredTv,
          theme: themeName,
          color,
          orientation: unconfiguredTv.orientation,
          permissions: unconfiguredTv.permissions.length
            ? unconfiguredTv.permissions
            : [],
        });
        setScreen("settings");
        setEditMode(true);
      }
    }
  }, [tvs]);

  const handleOptionSelect = (selectedtype: SettingType, tv: any) => {
    console.log(tv);
    setEditMode(true);
    if (tvs) {
      const { _id, name, orientation, theme, color, type, permissions } = tv;

      setScreen("settings");

      if (
        (tv.permissions.length != 2 && selectedtype === tv.permissions[0]) ||
        (selectedtype === "salah+events" && tv.permissions.length > 1)
      ) {
        setSettingType(selectedtype);
        const [themeName, color] = theme.split("-");

        setConnectedTvData({
          _id,
          name,
          type: !type ? selectedtype : type,
          theme: themeName,
          color,
          orientation,
          permissions,
        });
      } else {
        setConnectedTvData({
          _id,
          name,
          type: "",
          theme: "",
          color: "",
          orientation: "",
        });
        setSettingType(selectedtype);
        setScreen("cards");
      }
    }
  };

  const handleConfirmTv = async (data: any) => {
    // data might look like { id, name, orientation, theme, color, type }
    const { _id, name, orientation, theme, color, type, permissions } = data;

    try {
      setLoading(true);
      await dispatch(
        updateTvTheme(_id, orientation, `${theme.toLowerCase()}-${color}`)
      );
      const permissions =
        type === "prayer-times"
          ? ["prayer-times"]
          : type === "salah+events"
          ? ["prayer-times", "events"]
          : ["events"];
      await dispatch(assignPermissionsTv({ tvId: _id, permissions }));
      await dispatch(fetchAllTv(consumerMasjidId));
      setIsLive(true);
      // If both succeed, update local state so we can show the "Live" page
      setConnectedTvData({
        _id,
        name,
        type,
        theme,
        color,
        orientation,
        permissions,
      });

      // Optionally show a success toast/snackbar
      setLoading(false);
      toast.dismiss();
      toast.success("Updated Successfully!");
    } catch (error: any) {
      setLoading(false);
      console.error("Error updating TV:", error);
      toast.dismiss();
      toast.error("Failed to Save TV Settings");
    }
  };

  const handleokay = () => {
    setIsLive(false);
    setScreen("cards");
    setEditMode(false);
  };

  const handleCancel = () => {
    setScreen("cards");
    setEditMode(false);
  };

  const handleUnlink = async () => {
    try {
      // Wait for unpair to finish:
      await dispatch(unpairTv(unLinkId));
      // Reset any local or global states if you need:
      dispatch({ type: RESET_ASSIGN_PERMISSIONS_STATE });
      // Now fetch the updated list:
      await dispatch(fetchAllTv(consumerMasjidId));
      // Then update local UI state:
      setIsLive(false);
      setConnectedTvData(null);
      setScreen("cards");
      setEditMode(false);
    } catch (err) {
      console.error("Failed to unlink TV:", err);
      toast.error("Failed to Unlink TV");
    }
  };

  // const handleChange = () => {
  //   setScreen("settings");
  // };

  // const handlelivetvback = () => {
  //   setScreen("cards");
  //   setEditMode(false);
  // };

  const handleBack = () => {
    setScreen("cards");
    setEditMode(false);
  };

  return (
    <div style={{ marginTop: "10px" }}>
      {screen === "cards" ? (
        <>
          {isLoading ? (
            <div className={styles.tvListLoader}>
              <CircularProgress />
            </div>
          ) : error ? (
            <p>{error.message}</p>
          ) : Array.isArray(tvs) && tvs.length > 0 ? (
            tvs.map((tv) => (
              <TVCard
                TvData={tv}
                onSelect={handleOptionSelect}
                setScreen={setScreen}
              />
            ))
          ) : (
            <div className={styles.notConnected} style={{ height: "70vh" }}>
              <img src={NotCasted} alt="" style={{ width: "150px" }} />
              <p>Not Connected to Any Device Yet</p>
            </div>
          )}
        </>
      ) : (
        <SettingsScreen
          type={settingType}
          onBack={handleBack}
          onSave={handleConfirmTv}
          onCancel={handleCancel}
          isLive={isLive}
          handleokay={handleokay}
          connectedTvData={connectedTvData}
          onUnlink={(id) => {
            setUnLinkId(id);
            setShowWarning(true);
          }}
        />
      )}

      {showWarning && (
        <MessageModel
          onClose={() => setShowWarning(false)}
          onConfirm={() => {
            setShowWarning(false);
            handleUnlink();
          }}
          messageType="Unpair Device"
          message={`Do You Want to Unpair Your Device?`}
          img={Deletemessagemodel}
        ></MessageModel>
      )}

      <Backdrop open={loading} style={{ zIndex: "10" }}>
        <CircularProgress sx={{ color: "#186c56" }} />
      </Backdrop>
    </div>
  );
};

export default ConnectedTvList;
