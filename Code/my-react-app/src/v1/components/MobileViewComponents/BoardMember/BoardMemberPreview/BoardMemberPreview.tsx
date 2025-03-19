import React, { useEffect, useMemo, useState } from "react";

import { Box } from "@mui/material";

import serviceIcon from "../../../../photos/Newuiphotos//BoardMember/Vector (11).webp";
import BoardMember from "../../../../photos/Newuiphotos/BoardMember/member-default.webp";
import edit from "../../../../photos/Newuiphotos/Icons/Edit.svg";
import del from "../../../../photos/Newuiphotos/Icons/delete.svg";

import "./boardMemberPreview.css";
import { useMutation } from "@apollo/client";
import CustomBtn from "../../Shared/CustomBtn";
import Disclaimer from "../../Shared/Disclaimer/Disclaimer";
import DeleteWarningCard from "../../Shared/DeleteWarningCard/DeleteWarningCard";
import { customNavigatorTo } from "../../../../helpers/HelperFunction";
import { useNavigationprop } from "../../../../../MyProvider";
import { DELETE_BOARD_MEMBER } from "../../../../graphql-api-calls/mutation";
import { Get_BoardMember } from "../../../../graphql-api-calls/query";
import toast from "react-hot-toast";
import MoreBtn from "../../Shared/MoreBtn";
import PreviewPageContainer from "../../Shared/previewPageContainer/PreviewPageContainer";
import CarouselImageUploader from "../../Shared/NewComponents/CarouselImageUploader/CarouselImageUploader";
import memberIcon from "../../../../photos/Newuiphotos/BoardMember/bmplaceholder.svg";

const BoardMemberPreview = ({
  formData,
  handleDisclaimerStatus,
  isPreviewMode,
  isEditing = true,
  setIsPreviewVisible,
  handleEditButton,
  masjidId,
}: any) => {
  const navigation = useNavigationprop();

  const [isSubmitWarningVisible, setIsSubmitWarningVisible] = useState(false);
  const [isDeleteWarningVisible, setIsDeleteWarningVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  //   const [open, setOpen] = useState(false);
  //console.log("from program proview=> ", formData);
  const [deleteMember, { loading, error }] = useMutation(DELETE_BOARD_MEMBER, {
    refetchQueries: [
      { query: Get_BoardMember, variables: { masjidId: masjidId } },
    ],
    awaitRefetchQueries: true,
  });
  const handleBoardMemberDelete = async (id: string) => {
    const loadingToast = toast.loading("Removing Board Member...");
    try {
      const { data } = await deleteMember({ variables: { masjidId, id } });
      console.log(data.deleteBoardMember);
      if (data.deleteBoardMember) {
        toast.success("Board Member Removed Successfully");
        toast.success("Board Member Removed Successfully", {
          id: loadingToast, // Update the existing toast
        });
        setIsDeleteWarningVisible(false);
        handleBackDetails();
      } else {
        toast.error("Failed to Remove Board Member", {
          id: loadingToast, // Update the existing toast
        });
      }
    } catch (e) {
      console.error("Error deleting Board Member:", e);
    } finally {
      // Ensure the toast is dismissed
      toast.dismiss(loadingToast);
    }
  };

  const handleBackPreview = () => {
    if (setIsPreviewVisible) {
      setIsPreviewVisible(false);
    } else {
      handleBackDetails();
    }
  };
  const handleBackDetails = () => {
    if (navigation) navigation("/feed/10");
    else customNavigatorTo(`/feed/10`);
  };
  const handleImg = () => {
    const image = formData?.image?.[0];
    if (Array.isArray(formData?.image)) {
      return typeof image === "string"
        ? image
        : image
        ? URL.createObjectURL(image)
        : BoardMember;
    }
    return formData?.image || BoardMember;
  };
  const carouselImages = useMemo(() => {
    if (formData?.image?.length) {
      if (formData?.image[0] instanceof File) {
        return [
          {
            url: URL.createObjectURL(formData.image[0]),
            alt: "Image 0",
            createdByObjectURL: true, // Mark this URL as created by URL.createObjectURL
          },
        ];
      } else {
        return [
          {
            url: formData?.image,
            alt: "Image 0",
            createdByObjectURL: false, // Mark this URL as created by URL.createObjectURL
          },
        ];
      }
    } else {
      return [];
    }
  }, [formData?.image]);

  useEffect(() => {
    return () => {
      for (const image of carouselImages) {
        if (image.createdByObjectURL) {
          URL.revokeObjectURL(image.url);
        }
      }
    };
  }, [carouselImages]);

  return (
    <PreviewPageContainer
      handleBackBtn={isPreviewMode ? handleBackPreview : handleBackDetails}
      title="Board Members Details"
    >
      <div className="board-member-input-img-prev">
        <CarouselImageUploader
          images={carouselImages}
          isCarousel={true}
          imgStyle={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "unset",
            objectFit: "contain",
            maxHeight: "130px",
            minHeight: "100px",
          }}
          placeholderImg={memberIcon}
          defaultImgStyle={{
            maxHeight: "130px",
            minHeight: "100px",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "50% 45%",
            borderRadius: "20px 20px 20px 20px",
            background: "white",
          }}
          containerStyle={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
          }}
          roundededImageUploader={true}
        ></CarouselImageUploader>
      </div>

      <div className="board-member-details">
        <div className="board-member-title">
          <p>
            {formData.name} <span>{"(" + formData.position + ")"}</span>{" "}
            <span className="del-edit-box">
              <img
                onClick={() =>
                  isPreviewMode ? handleBackPreview() : handleEditButton()
                }
                src={edit}
                alt="edit-btn"
              />{" "}
              {isEditing ? (
                <img
                  onClick={() =>
                    setIsDeleteWarningVisible(!isDeleteWarningVisible)
                  }
                  className="del-img"
                  src={del}
                  alt="delete-img"
                />
              ) : null}
            </span>
          </p>
        </div>
        <div className="board-member-drop-item">
          <h5>About </h5>
          {formData?.about?.trim().length > 0 ? (
            <p>
              <MoreBtn
                tsx={formData?.about}
                txLength={formData?.about.length}
              />
            </p>
          ) : (
            <p style={{ color: "#FF7272" }}>Not Available</p>
          )}
        </div>
        <div className="board-member-drop-item">
          <h5>Email Address</h5>
          {formData?.email?.trim().length > 0 ? (
            <p>{formData?.email}</p>
          ) : (
            <p style={{ color: "#FF7272" }}>Not Available</p>
          )}
        </div>
        <div className="board-member-drop-item">
          <h5>Contact Number </h5>
          {formData?.phone?.trim().length > 0 ? (
            <p>{formData?.phone || "N/A"}</p>
          ) : (
            <p style={{ color: "#FF7272" }}>Not Available</p>
          )}
        </div>

        <div
          className="board-preview-btn"
          style={{ display: "flex", justifyContent: "center" }}
        >
          {isPreviewMode && (
            <div className="confirm-btn" style={{}}>
              <CustomBtn
                // size={"5px"}
                eventHandler={() => {
                  setIsSubmitWarningVisible(true);
                }}
                label={"Confirm Board Member"}
                isDisabled={false}
                icon={serviceIcon}
                imgWidth={"10%"}
              />
            </div>
          )}
        </div>
      </div>
      {isDeleteWarningVisible ? (
        <DeleteWarningCard
          wariningType="Remove Board Member"
          warining={"Are you sure you want to remove Board Member?"}
          onClose={() => setIsDeleteWarningVisible(false)}
          onConfirm={() => {
            handleBoardMemberDelete(formData._id);
          }}
          icon={del}
          progress={loading}
        />
      ) : null}
      {isSubmitWarningVisible ? (
        <Disclaimer
          showDisclaimer={isSubmitWarningVisible}
          handleDisclaimerStatus={handleDisclaimerStatus}
          setDisclaimer={setIsSubmitWarningVisible}
          setIsSubmitting={setIsSubmitting}
        />
      ) : null}
    </PreviewPageContainer>
  );
};

export default BoardMemberPreview;
