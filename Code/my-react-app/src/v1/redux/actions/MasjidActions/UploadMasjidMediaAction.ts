import { Dispatch } from "react";
import * as api from "../../../api-calls/index";

export const uploadMasjidMedia = (
  masjidId: string,
  formData: string
) => async (dispatch: Dispatch<any>) => {
  try {
    const response = await api.uploadMasjidMedia(masjidId, formData);
    return response;
  } catch (error) {
    console.log(error);
    let result = {
      success: false,
      message: error.response?.data?.message
        ? error.response.data.message
        : "Failed To Upload Masjid Media : SomeThing Went Wrong",
    };
    return result;
  }
};

