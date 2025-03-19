import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import "../../Services/services.css";
import toast from "react-hot-toast";
import nextIcon from "../../../../photos/Newuiphotos/BoardMember/addImgIcon.webp";
import BackButton from "../../Shared/BackButton";

import BoardMemberPreview from "../BoardMemberPreview/BoardMemberPreview";
import {
  customNavigatorTo,
  validateForm2,
} from "../../../../helpers/HelperFunction";
import { useNavigationprop } from "../../../../../MyProvider";
import {
  CREATE_BOARD_MEMBER,
  UPDATE_BOARD_MEMBER,
} from "../../../../graphql-api-calls/mutation";
import { useMutation } from "@apollo/client";
import { Get_BoardMember } from "../../../../graphql-api-calls/query";
import { BoardMember } from "../../../../redux/Types";
import { uploadImage } from "../../../../helpers/imageUpload/imageUpload";
import addServiceIcon from "../../../../photos/Newuiphotos/BoardMember/Vector (14) (1).webp";
import SuccessMessageModel from "../../../../helpers/SuccessMessageModel/SuccessMessageModel";
import "./BoardMemberForm.css";
import CarouselImageUploader from "../../Shared/NewComponents/CarouselImageUploader/CarouselImageUploader";
import memberIcon from "../../../../photos/Newuiphotos/BoardMember/placeholder/boardmemberholder.webp";
import { validateEmailAndPhone } from "../../../../helpers/HelperFunction/validationFunction/validation";

interface BoardMemberFormProps {
  setIsFormVisible?: Dispatch<SetStateAction<boolean>>;
  boardMemberData?: any;
  id?: string;
  isEditing?: boolean;
  setIsEditing?: any;
  handleToggleEditForm?: () => void;
  masjidId: string;
}

const BoardMemberForm: React.FC<BoardMemberFormProps> = ({
  boardMemberData,
  setIsFormVisible,
  id,
  isEditing = false,
  handleToggleEditForm,
  masjidId,
}) => {
  const navigation = useNavigationprop();

  const [formData, setFormData] = useState<BoardMember>({
    name: "",
    email: "",
    position: "",
    about: "",
    phone: "",
    isSubBtnClicked: false,
    image: [],
  });
  const [images, setImages] = useState<File[]>([]);
  useEffect(() => {
    if (formData?.image.length) setImages(formData?.image);
  }, [formData?.image]);
  // console.log("formData => ", formData);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: boolean;
  }>({});
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target;
    const requiredField = ["name", "position"];

    setFormData((prevFormData: any) => {
      const updatedFormData = {
        ...prevFormData,
        [name]: type === "checkbox" ? checked : value,
      };
      const validRes = validateForm2(updatedFormData, requiredField);

      setValidationErrors(validRes);
      return updatedFormData;
    });
  };
  const handleBackBasedOnIsEditing = () => {
    if (isEditing) {
      if (handleToggleEditForm) handleToggleEditForm();
    } else {
      setIsFormVisible?.(false);
    }
  };

  const handleSubmit = () => {
    handleChange({
      target: {
        name: "isSubBtnClicked",
        value: true,
      },
    });

    if (formData.email || formData.phone) {
      const validationErrors = validateEmailAndPhone(
        formData.email,
        formData.phone
      );

      if (Object.keys(validationErrors).length > 0) {
        toast.dismiss();
        Object.values(validationErrors).forEach((error) => toast.error(error));
        return;
      }
    }

    // Perform final validation check before submission
    if (validationErrors?.all) {
      setIsPreviewVisible(true);
    } else {
      toast.dismiss();
      // Show toast with validation errors
      for (const [key] of Object.entries(validationErrors)) {
        if (key === "all" || validationErrors[key]) continue; // Skip the 'all' key

        toast.error(
          `${
            key === "position"
              ? "Role"
              : key.charAt(0).toUpperCase() + key.slice(1)
          } is Required`
        );
      }
    }
  };

  useEffect(() => {
    if (boardMemberData && isEditing && boardMemberData) {
      setFormData(boardMemberData);
    }
  }, [boardMemberData, id, isEditing]);

  const [updateEventPhotos, setUpdateEventPhotos] = useState<
    { url: string; _id: string }[]
  >([]);
  const [activeStep, setActiveStep] = React.useState(0); // current image step on carousel
  const [maxSteps, setMaxSteps] = useState(0);
  const [isDeleteWarningVisible, setIsDeleteWarningVisible] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const handleImageUpload = (e: any) => {
    const newImages = e.target.files[0];

    setImages([newImages]);
    handleChange({
      target: {
        name: "image",
        value: [newImages],
      },
    });
  };

  const handleImageDelete = (index: number | string) => {
    setImages([]);
    handleChange({
      target: {
        name: "image",
        value: [],
      },
    });
  };
  const [createBoardMember, { data, loading: cLoading, error: cError }] =
    useMutation(CREATE_BOARD_MEMBER, {
      refetchQueries: [
        { query: Get_BoardMember, variables: { masjidId: masjidId } },
      ],
      awaitRefetchQueries: true,
    });
  const [updateBoardMember] = useMutation(UPDATE_BOARD_MEMBER, {
    refetchQueries: [
      { query: Get_BoardMember, variables: { masjidId: masjidId } },
    ],
    awaitRefetchQueries: true,
  });
  const handleFinalSubmitting = async () => {
    const loadingToast = toast.loading("Submitting Your BoardMember...");
    const imgURL = await uploadImage(formData?.image[0]);

    // Define the boardMember input based on formData
    const boardMemberInput = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      about: formData.about.trim(),
      phone: formData.phone.trim(),
      position: formData.position.trim(),
      image: imgURL || "",
      // image: formData.image,
    };

    try {
      const mutation = formData?._id ? updateBoardMember : createBoardMember;
      const variables = formData?._id
        ? { masjidId: masjidId, id: formData._id, input: boardMemberInput }
        : { masjidId: masjidId, input: boardMemberInput };

      await mutation({ variables });

      // Update the toast to show success message
      toast.success(
        ` Board Member ${formData._id ? " Updated" : " Created"} Successfully`,
        {
          id: loadingToast, // Update the existing toast
        }
      );
      setOpenSuccessModal(true);
    } catch (error) {
      // Update the toast to show error message
      toast.error(
        `Error ${formData._id ? "Updating" : "Creating"} Board Member: ${
          error?.message
        }`,
        {
          id: loadingToast, // Update the existing toast
        }
      );
    }
  };

  const checkError = (field: string) => {
    if (formData.isSubBtnClicked && !validationErrors[field])
      return { border: "2px solid red" };
    else return {};
  };

  console.log(formData);

  const UploaderImages = useMemo(() => {
    if (images?.length) {
      return images.reduce((acc, image, index) => {
        if (image instanceof File) {
          acc.push({
            url: URL.createObjectURL(image),
            alt: `Image ${index}`,
            createdByObjectURL: true, // Add this property
          });
        } else {
          acc.push({
            url: image,
            alt: `Image ${index}`,
            createdByObjectURL: true, // Add this property
          });
        }

        return acc;
      }, [] as { url: string; alt: string; createdByObjectURL: boolean }[]);
    } else {
      return [];
    }
  }, [images]);

  return (
    <>
      <SuccessMessageModel
        message={` Board Member ${
          formData?._id ? "Updated" : "Added"
        } Successfully`}
        open={openSuccessModal}
        onClose={() => {
          setOpenSuccessModal(false);
          customNavigatorTo("/feed/10");
          if (!formData?._id) setIsFormVisible?.(false);
        }}
      />
      {isPreviewVisible ? (
        <div>
          <BoardMemberPreview
            formData={formData}
            isEditing={false}
            isPreviewMode={true}
            setIsPreviewVisible={setIsPreviewVisible}
            handleDisclaimerStatus={handleFinalSubmitting}
            masjidId={masjidId}
          ></BoardMemberPreview>
        </div>
      ) : (
        <>
          <div className="title-container">
            <div className="goback" style={{ margin: "0" }}>
              <BackButton handleBackBtn={handleBackBasedOnIsEditing} />
            </div>
            <h3
              className="page-title"
              style={{ color: "#3D5347", fontSize: "22px" }}
            >
              {isEditing ? "Update" : "Add"} Board Member
            </h3>
            <p></p>
          </div>
          <div className="board-member-form-container">
            <div className="main-form board-member-form">
              <CarouselImageUploader
                images={UploaderImages}
                onUpload={handleImageUpload}
                onDelete={handleImageDelete}
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

              <div className="form-container">
                <div className="form-group">
                  <label htmlFor="position">
                    Role <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    placeholder="Role"
                    type="text"
                    id="position"
                    name="position"
                    style={checkError("position")}
                    value={formData.position}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="name">
                    Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    id="name"
                    style={checkError("name")}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="about">About</label>
                  <textarea
                    id="about"
                    placeholder="About"
                    name="about"
                    rows={4}
                    // style={checkError("about")}
                    value={formData.about || ""}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="text"
                    placeholder="Email"
                    id="email"
                    name="email"
                    // style={checkError("email")}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Contact Number</label>
                  <input
                    max={15}
                    type="number"
                    onKeyDown={(e) =>
                      ["e", ".", "-", "ArrowUp", "ArrowDown"].includes(e.key) &&
                      e.preventDefault()
                    }
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <button onClick={handleSubmit} className="btn">
                    <img
                      src={addServiceIcon}
                      alt="Next"
                      className="btn-icon"
                      style={{ width: "22px", height: "17px" }}
                    />
                    <span className="btn-text" style={{ fontSize: "14px" }}>
                      {isEditing ? "Update" : "Add"} Board Member
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BoardMemberForm;
