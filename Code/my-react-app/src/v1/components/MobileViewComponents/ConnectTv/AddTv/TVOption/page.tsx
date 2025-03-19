import { useState } from "react";
import { SelectionScreen } from "./SelectionScreen";
import { SettingsScreen } from "./SettingsScreen";
import BackButton from "../../../Shared/BackButton";
import { useNavigationprop } from "../../../../../../MyProvider";
import { customNavigatorTo } from "../../../../../helpers/HelperFunction";
import styles from "./Option.module.css";
import type { SettingType } from "./themes/settings";
import { useAppDispatch } from "../../../../../redux/hooks";
import toast from "react-hot-toast";
import {
  assignPermissionsTv,
  fetchAllTv,
  unpairTv,
  updateTvTheme,
} from "../../../../../redux/actions/TvActions/TvActions";
import MessageModel from "../../../OtherSalah/helperComponent/messageModel/messageModel";
import Deletemessagemodel from "../../../../../photos/Newuiphotos/Common/Delete.webp";
import { RESET_ASSIGN_PERMISSIONS_STATE } from "../../../../../redux/actiontype";
import { Backdrop, CircularProgress } from "@mui/material";

export default function Page({ newTvDetail, tvName, MasjidId }: any) {
  const navigation = useNavigationprop();
  const dispatch = useAppDispatch();
  const [screen, setScreen] = useState<"settings">("settings");
  const [settingType, setSettingType] = useState<SettingType>("prayer-times");
  const [isLive, setIsLive] = useState<boolean>(false);
  const [connectedTvData, setConnectedTvData] = useState<any>(newTvDetail);
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionSelect = (selectedtype: SettingType, tv?: any) => {
    const { _id, name } = tv;
    setConnectedTvData({
      _id,
      name,
      selectedtype,
    });
    setSettingType(selectedtype);
    setScreen("settings");
  };

  const handleBack = () => {
    navigation ? navigation("/feed/8") : customNavigatorTo("/feed/8");
  };

  const handleConfirmTv = async (data: any) => {
    // data might look like { id, name, orientation, theme, color, type }
    const { _id, name, orientation, theme, color, type } = data;
    try {
      setIsLoading(true);
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
      // If both succeed, update local state so we can show the "Live" page
      setIsLive(true);
      setConnectedTvData({
        _id,
        name,
        type,
        theme,
        color,
        orientation,
      });

      // Optionally show a success toast/snackbar
      setIsLoading(false);
      toast.dismiss();
      toast.success("Connected Successfully!");
    } catch (error: any) {
      setIsLoading(false);
      console.error("Error updating TV:", error);
      toast.dismiss();
      toast.error("Failed to Save TV Settings");
    }
  };

  const handleokay = () => {
    navigation ? navigation("/feed/8") : customNavigatorTo("/feed/8");
  };

  const handleCancel = () => {
    navigation ? navigation("/feed/8") : customNavigatorTo("/feed/8");
  };

  const handleUnlink = async () => {
    try {
      // Wait for unpair to finish:
      await dispatch(unpairTv(newTvDetail._id));
      // Reset any local or global states if you need:
      dispatch({ type: RESET_ASSIGN_PERMISSIONS_STATE });
      // Now fetch the updated list:
      await dispatch(fetchAllTv(MasjidId));
      // Then update local UI state:
      setIsLive(false);
      setConnectedTvData(null);
      setConnectedTvData(null);
      navigation ? navigation("/feed/8") : customNavigatorTo("/feed/8");
    } catch (err) {
      console.error("Failed to unlink TV:", err);
    }
  };

  const handleChange = () => {
    setScreen("settings");
  };

  const handlelivetvback = () => {
    navigation ? navigation("/feed/8") : customNavigatorTo("/feed/8");
  };

  return (
    <div>
      <div className={styles.titleContainer}>
        <div className="goback">
          <BackButton
            handleBackBtn={navigation ? navigation : customNavigatorTo}
            isHome={true}
          />
        </div>
        <h3 className="page-title">Tv App</h3>
      </div>

      {screen && (
        <SettingsScreen
          type={settingType}
          onBack={handleBack}
          onSave={handleConfirmTv}
          onCancel={handleCancel}
          isLive={isLive}
          handleokay={handleokay}
          connectedTvData={connectedTvData}
          tvName={tvName}
        />
      )}

      {showWarning && (
        <MessageModel
          onClose={() => setShowWarning(false)}
          onConfirm={() => {
            setShowWarning(false);
            handleUnlink();
          }}
          messageType="Do You Want to Unlink?"
          message={`Are you sure that there are no updates?`}
          img={Deletemessagemodel}
          // isLoading={isNoUpdateLoading}
        ></MessageModel>
      )}
      <Backdrop open={isLoading} style={{ zIndex: "10" }}>
        <CircularProgress sx={{ color: "#186c56" }} />
      </Backdrop>
    </div>
  );
}
