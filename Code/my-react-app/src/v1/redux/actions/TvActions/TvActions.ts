// actions.ts
import { Dispatch } from "redux";
import {
  TvActionTypes,
  GET_ALL_TV_REQUEST,
  GET_ALL_TV_SUCCESS,
  GET_ALL_TV_FAILURE,
  PAIRING_TV_REQUEST,
  PAIRING_TV_SUCCESS,
  PAIRING_TV_FAILURE,
  UNPAIR_TV_REQUEST,
  UNPAIR_TV_SUCCESS,
  UNPAIR_TV_FAILURE,
  RESET_PAIRING_STATE,
  ASSIGN_PERMISSIONS_REQUEST,
  ASSIGN_PERMISSIONS_SUCCESS,
  ASSIGN_PERMISSIONS_FAILURE,
  UPDATE_THEME_ORIENTATION_REQUEST,
  UPDATE_THEME_ORIENTATION_SUCCESS,
  UPDATE_THEME_ORIENTATION_FAILURE,
} from "../../actiontype";
import {
  getAllTv,
  pairingTv,
  unpair,
  assignPermissions,
  updateTvThemeOrientation,
} from "../../../ClientApi-Calls/index";
import { handleSnackbar } from "../../../helpers/SnackbarHelper/SnackbarHelper";
import { toast } from "react-hot-toast";

export const resetPairingState = () => ({
  type: RESET_PAIRING_STATE,
});

export const fetchAllTv =
  (masjidId: string) => (dispatch: Dispatch<TvActionTypes>) => {
    dispatch({ type: GET_ALL_TV_REQUEST });
    getAllTv(masjidId)
      .then((response) => {
        dispatch({ type: GET_ALL_TV_SUCCESS, payload: response.data });
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data.message ||
          error.message ||
          "something went wrong";
        toast.dismiss();
        toast.error(errorMessage);
        console.log(error);
        dispatch({
          type: GET_ALL_TV_FAILURE,
          payload:
            error.response?.data.message ||
            error.message ||
            "something went wrong",
        });
      });
  };

export const pairTv =
  (pairingCode: string, tvName: string, masjidId: string) =>
  (dispatch: Dispatch<TvActionTypes>) => {
    const requestBody = {
      pairingCode: pairingCode,
      name: tvName,
      masjidId,
    };

    dispatch({ type: PAIRING_TV_REQUEST });
    return pairingTv(requestBody)
      .then((response) => {
        dispatch({ type: PAIRING_TV_SUCCESS, payload: response.data });
        return response.data;
      })
      .catch((error) => {
        console.log(error);
        const errorMessage = error.response?.data.message || error.message;
        const errorStatus = error.response?.status;
        console.log(errorStatus);

        dispatch({
          type: PAIRING_TV_FAILURE,
          payload: { message: errorMessage, status: errorStatus },
        });
        throw error;
      });
  };

export const unpairTv =
  (tvId: string) => (dispatch: Dispatch<TvActionTypes>) => {
    dispatch({ type: UNPAIR_TV_REQUEST });
    return unpair(tvId)
      .then((response) => {
        dispatch({ type: UNPAIR_TV_SUCCESS, payload: response.data });
        // Assuming handleSnackbar is a separate action creator that accepts serializable data
        handleSnackbar(
          true,
          "success",
          `${response.data.name} Unpaired Successfully`,
          dispatch
        );
        return response;
      })
      .catch((error) => {
        // Extract serializable error information
        const errorInfo = {
          message: error.response?.data.message || error.message,
          statusCode: error.response?.status,
        };
        dispatch({ type: UNPAIR_TV_FAILURE, payload: errorInfo });
        // Pass only serializable data to handleSnackbar
        handleSnackbar(true, "error", "Failed to unlink", dispatch);
        throw error; // throw so that your component knows it failed
      });
  };

export const assignPermissionsTv =
  (permissionData: { tvId: string; permissions: string[] }) =>
  (dispatch: any) => {
    // dispatch({ type: ASSIGN_PERMISSIONS_REQUEST });

    return assignPermissions(permissionData)
      .then((response) => {
        dispatch({
          type: ASSIGN_PERMISSIONS_SUCCESS,
          payload: response.data,
        });
      })
      .catch((error) => {
        dispatch({
          type: ASSIGN_PERMISSIONS_FAILURE,
          payload: error.response?.data.message || error.message,
        });
      });
  };

// Define new action for updating the theme orientation
export const updateTvTheme =
  (tvId: string, orientation: string, theme: string) =>
  (dispatch: Dispatch<TvActionTypes>) => {
    const requestBody = {
      tvId: tvId,
      orientation: orientation,
      theme: theme,
    };

    dispatch({ type: UPDATE_THEME_ORIENTATION_REQUEST });
    return updateTvThemeOrientation(requestBody)
      .then((response) => {
        dispatch({
          type: UPDATE_THEME_ORIENTATION_SUCCESS,
          payload: response.data,
        });
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data.message ||
          error.message ||
          "Failed to update theme";
        dispatch({
          type: UPDATE_THEME_ORIENTATION_FAILURE,
          payload: errorMessage,
        });
        toast.error(errorMessage);
      });
  };
