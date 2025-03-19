import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import "./services.css";
import NikahFields from "./ServicesRegFields/NikahFields";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Typography } from "@mui/material";
import toast from "react-hot-toast";
import MedicalClinicFields from "./ServicesRegFields/MedicalClinicFields";
import ConsultationFields from "./ServicesRegFields/ConsultationFields";
import FinancialAssistanceFields from "./ServicesRegFields/FinancialAssistanceFields";
import BackButton from "../Shared/BackButton";
import {
  customNavigatorTo,
  validateForm,
  timeZoneGetter,
} from "../../../helpers/HelperFunction";
import ServicePreview from "./Preview/ServicePreview";
import { useMutation } from "@apollo/client";

import nextIcon from "../../../photos/Newuiphotos/Services/Group 37693.webp";

import consulationservice from "../../../photos/Newuiphotos/Services/placeholder/consulationservice.webp";
import financialservice from "../../../photos/Newuiphotos/Services/placeholder/financialservice.webp";
import funeralservice from "../../../photos/Newuiphotos/Services/placeholder/funeralservice.webp";
import medicalservice from "../../../photos/Newuiphotos/Services/placeholder/medicalservice.webp";
import nikahservice from "../../../photos/Newuiphotos/Services/placeholder/nikahservice.webp";

import {
  CREATE_SERVICE,
  UPDATE_SERVICE,
} from "../../../graphql-api-calls/mutation";
import { Get_Services } from "../../../graphql-api-calls/query";
import { uploadImage } from "../../../helpers/imageUpload/imageUpload";
import { fetchMasjidById } from "../../../redux/actions/MasjidActions/fetchMasjidById";
import { useAppSelector, useAppThunkDispatch } from "../../../redux/hooks";
import { useNavigationprop } from "../../../../MyProvider";
import SuccessMessageModel from "../../../helpers/SuccessMessageModel/SuccessMessageModel";

import useStripeConnect from "../../../helpers/StripeConnectHelper/useStripeConnect";
import { AdminRole } from "../EventComponent/enums/enums";
import useStripeStatus from "../../../helpers/StripeConnectHelper/useStripeStatus";
import CarouselImageUploader from "../Shared/NewComponents/CarouselImageUploader/CarouselImageUploader";
import { validateEmailAndPhone } from "../../../helpers/HelperFunction/validationFunction/validation";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface ServiceFormProps {
  setIsFormVisible?: Dispatch<SetStateAction<boolean>>;
  serviceData?: any;
  id?: string;
  serviceNames?: string[];
  isEditing?: boolean;
  setIsEditing?: any;
  handleToggleEditForm?: () => void;
  masjidId: string;
  isMainAdmin?: boolean;
}

const placeholder: { [key: string]: any } = {
  Consultation: consulationservice,
  "Financial Assistance": financialservice,
  Funeral: funeralservice,
  "Medical Clinic": medicalservice,
  Nikah: nikahservice,
};

const ServiceForm: React.FC<ServiceFormProps> = ({
  serviceData,
  serviceNames,
  setIsFormVisible,
  id,
  isEditing = false,
  handleToggleEditForm,
  masjidId,
  isMainAdmin = false,
}) => {
  const navigation = useNavigationprop();

  const [formData, setFormData] = useState<any>({
    serviceName: "",
    description: "",
    email: "",
    contactNumber: "",
    registrationRequired: false,
    metaData: {},
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: boolean;
  }>({});
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: boolean;
  }>({});

  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const [isSubBtnClicked, setIsSubBtnClicked] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  // const [isNoAccountDialogOpen, setIsNoAccountDialogOpen] = useState(false);
  const [masjidName, setMasjidName] = useState("");
  let AdminMasjidState = useAppSelector((state) => state.AdminMasjid);
  let admin = useAppSelector((state) => state.admin);
  const dispatch = useAppThunkDispatch();
  const masjidIdQuery =
    admin.role === AdminRole.ADMIN || admin.role === AdminRole.SUPER_ADMIN
      ? `?masjidId=${masjidId}`
      : "";
  const [nextRoute, setNextRoute] = useState("");

  const masjidAPIRequest = () => {
    const response = dispatch(fetchMasjidById(masjidId));
    response.then(function (result) {
      if (result?.masjidName) {
        //  console.log("result?.masjidName =>", result?.masjidName);
        // setTzone(timeZoneGetter(result));
        setMasjidName(result.masjidName);
      } else {
        toast.error("Unable to Fetch Masjid Data");
      }
    });
  };

  // const {
  //   stripeConnect,
  //   isLoading: isStripeLoading,
  //   error: stripeError,
  // } = useStripeConnect(handleUnexpectedError); // Use the hook
  const { isLoading: isStripeLoading, isPaymentsSetup } = useStripeStatus(
    isMainAdmin,
    masjidId
  );

  useEffect(() => {
    if (masjidId) {
      masjidAPIRequest();
    } else if (AdminMasjidState?.masjidName) {
      setMasjidName(AdminMasjidState?.masjidName);
      localStorage.setItem("MasjidtZone", timeZoneGetter(AdminMasjidState));
    }
  }, [masjidId]);

  const requiredItemHandler = (data: any) => {
    let commonItem = [
      "serviceName",
      "description",
      "email",
      "contactNumber",
      "registrationRequired",
      ...(formData.registrationOption === "paid" ? ["cost"] : []),
    ];

    let requiredItems: string[] = [...commonItem];
    const isCustom = data?.timing?.time?.includes("Custom Time");
    if (
      data.serviceName !== "Financial Assistance" &&
      data.serviceName !== "Funeral"
    ) {
      let timeFields = [
        "days",
        "time",
        ...(isCustom ? ["customStartEndTime"] : []),
      ];
      requiredItems = [...requiredItems, ...timeFields];
    }
    if (data.serviceName === "Medical Clinic") {
      requiredItems = [
        ...requiredItems,
        "healthServices",
        "residentPhysicians",
      ];
    }
    if (data.serviceName === "Consultation") {
      requiredItems = [
        ...requiredItems,
        "consultants",
        "consultationQuestions",
        "consultationType",
        "sessionTime",
      ];
    }
    if (data.serviceName === "Financial Assistance") {
      requiredItems = [...requiredItems, "assistanceTypes", "questions"];
    }
    if (!data.registrationRequired || data.serviceName === "Funeral") {
      requiredItems = commonItem;
    }

    return requiredItems;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target;
    console.log("name", name, "value => ", value);
    // console.log("value", value);

    setFormData((prevFormData: any) => {
      const updatedFormData = {
        ...prevFormData,
        [name]: type === "checkbox" ? checked : value,
      };
      const requiredItems = requiredItemHandler(updatedFormData);
      // console.log("requiredItems response = >", requiredItems);
      const validationRes = validateForm(updatedFormData, requiredItems);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (updatedFormData.email && !emailRegex.test(updatedFormData.email)) {
        validationRes.email = false;
        validationRes.all = false;
      }
      if (updatedFormData.contactNumber) {
        const cleanedPhone = updatedFormData.contactNumber.replace(
          /[\u200E\u200F\u202A-\u202E]/g,
          ""
        );
        if (
          cleanedPhone !== "" &&
          !/^[0-9+\-\s()]+$/.test(cleanedPhone.trim())
        ) {
          validationRes.contactNumber = false;
          validationRes.all = false;
        }
      }

      // console.log("validationRes = >", validationRes);
      // console.log("updatedFormData = >", updatedFormData);
      setFieldErrors(validationRes);
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
    //console.log("validationErrors=> ", fieldErrors);
    if (!formData?.isSubBtnClicked) {
      // Set isSubBtnClicked to true so that the form can be submitted
      handleChange({
        target: {
          name: "isSubBtnClicked",
          value: true,
        },
      });
    }
    // Check if the registration fee is greater than 0 for paid programs
    if (
      formData?.cost < 1 &&
      formData?.registrationOption === "paid" &&
      formData.id
    ) {
      // Show error toast if registration fee is not greater than 0
      toast.error("Registration fee must be greater than 0 for paid program.");
      return;
    }
    if (formData.email || formData.contactNumber) {
      const validationErrors = validateEmailAndPhone(
        formData.email,
        formData.contactNumber
      );

      if (Object.keys(validationErrors).length > 0) {
        toast.dismiss();
        Object.values(validationErrors).forEach((error) => toast.error(error));
        return;
      }
    }
    // Perform final validation check before submission
    if (fieldErrors?.all) {
      // Submit the form if all fields are valid
      // console.log("Form submitted successfully", formData);
      setIsPreviewVisible(true);
    } else {
      //  console.log("Validation errors", fieldErrors);
      // Show toast with validation errors
      toast.dismiss();
      let isError = false;
      for (const [key, isValid] of Object.entries(fieldErrors)) {
        let errorMessage;
        if (key === "all" || isValid) continue;
        if (key === "contactNumber" && !isValid) {
          // Show error toast for invalid contact number
          if (formData.contactNumber) {
            errorMessage = "Invalid Contact number";
          } else if (formData.email) continue;
          else {
            // Show error toast for missing email or contact number
            errorMessage = "Email or Contact is Required";
          }
        } else if (key === "email" && !isValid) {
          // Show error toast for invalid email address
          if (formData.email) {
            errorMessage = "Invalid Email Address";
          } else if (formData.contactNumber) continue;
          else {
            // Show error toast for missing email or contact number
            errorMessage = "Email or Contact is Required";
          }
        } else {
          // Show error toast for missing fields
          errorMessage = !isValid ? key + "  is Required" : "";
        }
        toast.error(`${errorMessage}`);
        if (errorMessage) {
          isError = true;
          break;
        }
      }

      if (!isError) {
        setIsPreviewVisible(true);
      }
    }
  };

  useEffect(() => {
    if (id && isEditing && serviceData) {
      setFormData(serviceData);
      setIsFormValid(true);
      handleChange({
        target: {
          name: "serviceName",
          value: serviceData.serviceName,
        },
      });
      console.log("serviceData.image=> ", serviceData.image);
      setImages(serviceData.image ? [serviceData.image] : []);
    }
  }, [serviceData, id, isEditing]);
  const renderServiceFields = () => {
    switch (formData.serviceName) {
      case "Nikah":
        return (
          <NikahFields
            formData={formData}
            handleChange={handleChange}
            setValidationErrors={setValidationErrors}
            stripeFields={[isPaymentsSetup, isStripeLoading]}
            admin={admin}
          />
        );
      case "Funeral":
        return null;
      case "Medical Clinic":
        return (
          <MedicalClinicFields
            formData={formData}
            handleChange={handleChange}
            setValidationErrors={setValidationErrors}
            stripeFields={[isPaymentsSetup, isStripeLoading]}
            admin={admin}
          />
        );
      case "Consultation":
        return (
          <ConsultationFields
            formData={formData}
            handleChange={handleChange}
            setValidationErrors={setValidationErrors}
            stripeFields={[isPaymentsSetup, isStripeLoading]}
            admin={admin}
          />
        );
      case "Financial Assistance":
        return (
          <FinancialAssistanceFields
            formData={formData}
            handleChange={handleChange}
            setValidationErrors={setValidationErrors}
            stripeFields={[isPaymentsSetup, isStripeLoading]}
            admin={admin}
          />
        );
      default:
        return null;
    }
  };

  const [images, setImages] = useState<File[] | string[]>([]);
  const [updateEventPhotos, setUpdateEventPhotos] = useState<
    { url: string; _id: string }[]
  >([]);
  const [activeStep, setActiveStep] = React.useState(0); // current image step on carousel
  const [maxSteps, setMaxSteps] = useState(0); // total images in the ImageUploader component
  const [isDeleteWarningVisible, setIsDeleteWarningVisible] = useState(false);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newImages = e.target.files ? e.target.files[0] : null;
      if (newImages) {
        setImages([newImages]);
        handleChange({
          target: {
            name: "image",
            value: newImages,
          },
        });
      }
    },
    [handleChange]
  );

  const handleImageDelete = useCallback(
    (index: number | string) => {
      if (typeof index === "number") {
        const newImages = [...images];
        newImages.splice(index, 1);
        //  console.log(newImages);
        setImages(newImages);
        handleChange({
          target: {
            name: "image",
            value: newImages.length > 0 ? newImages[0] : null, // If no images, set to null
          },
        });
      }
    },
    [images, handleChange]
  );
  // const localAdmin = adminFromLocalStg();
  // const id = localAdmin.masjids[0];
  const [createService, { data, loading: cLoading, error: cError }] =
    useMutation(CREATE_SERVICE, {
      refetchQueries: [
        { query: Get_Services, variables: { masjidId: masjidId } },
      ],
      awaitRefetchQueries: true,
    });
  const [updateService, { data: updata, loading: upLoading, error: upError }] =
    useMutation(UPDATE_SERVICE, {
      refetchQueries: [{ query: Get_Services, variables: { masjidId: id } }],
      awaitRefetchQueries: true,
    });
  const payloadFormatter = (serviceType: string, isRegRequire: boolean) => {
    const medicalOnly = [
      {
        attributeName: "healthServices",
        attributeValues: formData?.healthServices ?? [], // For medical services
      },
      {
        attributeName: "visitingPhysicians",
        attributeValues: formData?.visitingPhysicians ?? [], // For medical services
      },
      {
        attributeName: "residentPhysicians",
        attributeValues: formData?.residentPhysicians ?? [], // For medical services
      },
    ];

    const nikahOnly = [
      {
        attributeName: "time",
        attributeValues: formData?.timing?.time ?? [], // For nikah
      },
      {
        attributeName: "customStartEndTime",
        attributeValues: formData?.timing?.customStartEndTime ?? [], // For nikah
      },
    ];

    const consultationOnly = [
      {
        attributeName: "availableConsultants",
        attributeValues: formData?.consultants ?? [], // For consultation
      },
      {
        attributeName: "questions",
        attributeValues:
          [JSON.stringify(formData?.consultationQuestions ?? "")] ?? [], // For consultation
      },
    ];

    const financeOnly = [
      {
        attributeName: "assistanceTypes",
        attributeValues: formData?.assistanceTypes ?? [], // For financial assistance
      },
      {
        attributeName: "questions",
        attributeValues: [JSON.stringify(formData?.questions ?? "")] ?? [], // For financial assistance
      },
    ];

    // Base payload format
    let payload: any = {
      attributes: [
        {
          attributeName: "days",
          attributeValues: formData?.metaData?.days ?? [], // Common attribute
        },
        {
          attributeName: "registrationOption",
          attributeValues: [formData?.registrationOption || ""], // Common attribute
        },
        {
          attributeName: "widgetInfo",
          attributeValues: [masjidName, masjidId],
        },
      ],
    };

    // Append service-specific attributes based on serviceType
    switch (serviceType) {
      case "Medical Clinic":
        payload.attributes = [
          ...payload.attributes,
          ...medicalOnly,
          ...nikahOnly,
        ];
        break;
      case "Nikah":
        payload.attributes = [...payload.attributes, ...nikahOnly];
        break;
      case "Consultation":
        payload.attributes = [
          ...payload.attributes,
          ...consultationOnly,
          ...nikahOnly,
        ];
        break;
      case "Financial Assistance":
        payload.attributes = [...payload.attributes, ...financeOnly];
        break;
      case "Funeral":
        payload.attributes = [
          {
            attributeName: "widgetInfo",
            attributeValues: [masjidName, masjidId],
          },
        ];
        break;
      default:
        break;
    }
    // if (isRegRequire) {

    // }
    // Remove attributes with empty or null values

    payload.attributes = payload.attributes.filter((attribute: any) => {
      const values = attribute.attributeValues;

      // Check if attributeValues is an array or a single value
      if (Array.isArray(values)) {
        // For array: ensure no empty strings, nulls, or empty arrays
        return values.some(
          (value) =>
            value !== null &&
            value !== "" &&
            (Array.isArray(value)
              ? value[0] !== undefined && value[0] !== ""
              : true)
        );
      } else {
        // For single value: ensure it's not null or empty string
        return values !== null && values !== "";
      }
    });

    return payload;
  };

  // useEffect(() => {
  //   console.log("formData => ", formData);
  // }, [formData]);
  const handleFinalSubmitting = async () => {
    const loadingToast = toast.loading("Submitting your service...");
    const imgURL = await uploadImage(formData?.image);

    // Define the service input based on formData
    const serviceInput = {
      serviceName: formData.serviceName,
      masjidId,
      description: formData.description,
      emailAddress: formData.email,
      contactNumber: formData.contactNumber,
      serviceType: formData.serviceName,
      registrationRequired: formData.registrationRequired,
      active: true,
      ...(imgURL && { image: imgURL }),
      ...(!imgURL && formData?.id && { image: "" }),
      details: {
        cost: formData?.cost ?? 0,
        availabilityTiming: formData?.metaData?.type ?? "", // for nikah, Consultation, and medical clinic (daily, weekly)
        startTime: formData?.timing?.startTime ?? "", // for medical clinic and Consultation
        endTime: formData?.timing?.endTime ?? "", // for medical clinic and Consultation
        consultationAvailability: formData?.consultationType ?? "", // for Consultation (consultant a)
        timePerSession: formData?.sessionTime ?? "", // for Consultation (30min)
        timingOptions: "",
      },
      ...payloadFormatter(formData.serviceName, formData.registrationRequired),
    };

    try {
      const mutation = formData?.id ? updateService : createService;
      const variables = formData?.id
        ? { id: formData.id, input: serviceInput }
        : { input: serviceInput };

      const result = await mutation({ variables });

      const id =
        result?.data?.createService?.id || result?.data?.updateService?.id;

      if (!formData?.id) {
        setNextRoute(
          `/service-details/${id}${masjidIdQuery}${
            masjidIdQuery ? "&new=true" : "?new=true"
          }`
        );
      } else {
        setNextRoute(`/service-details/${id}${masjidIdQuery}`);
      }
      toast.dismiss(loadingToast);
      setOpenSuccessModal(true);
    } catch (error) {
      // Update the toast to show error message
      toast.error(
        `${
          formData.id ? "Error Updating Service" : "Error Creating Service"
        }: ${error?.message}`,
        {
          id: loadingToast, // Update the existing toast
        }
      );
    }
  };

  const requiredCheck = (key: string) => {
    const val = formData[key];
    if (isSubBtnClicked && !val) return { border: "2px solid red" };
    else {
    }
  };
  const allServices = [
    "Nikah",
    "Funeral",
    "Medical Clinic",
    "Consultation",
    "Financial Assistance",
  ];
  let filteredServices = allServices?.filter(
    (service) => !serviceNames?.includes(service)
  );
  if (!serviceNames) filteredServices = allServices;
  const validateAndHandleChange = (e) => {
    const { value } = e.target;

    // Simple email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(value)) {
      handleChange(e);
    } else {
      handleChange({
        target: {
          name: "email",
          value: "",
        },
      });
      // Show an error message using toast
      toast.error("Please enter a valid email address.");
    }
  };
  useEffect(() => {
    console.log("fieldErrors => ", fieldErrors);
  }, [fieldErrors]);
  const handleCloseSuccessModal = () => {
    setOpenSuccessModal(false);
    setIsPreviewVisible(false);
    setIsFormVisible?.(false);
    // if (navigation) navigation("/feed/7");
    // else customNavigatorTo("/feed/7");

    if (nextRoute) {
      if (navigation) navigation(nextRoute);
      else customNavigatorTo(nextRoute);
    } else {
      if (navigation) navigation(`/service-details/${id}${masjidIdQuery}`);
      else customNavigatorTo(`/service-details/${id}${masjidIdQuery}`);
    }
  };
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
        message={`${formData?.serviceName} Service ${
          formData?.id ? "Updated" : "Added"
        } Successfully`}
        open={openSuccessModal}
        onClose={handleCloseSuccessModal}
      />
      {isPreviewVisible ? (
        <ServicePreview
          loading={upLoading || cLoading ? true : false}
          formData={formData}
          isPreviewVisible={isPreviewVisible}
          setIsPreviewVisible={setIsPreviewVisible}
          handleFinalSubmitting={handleFinalSubmitting}
          masjidId={masjidId}
        />
      ) : (
        <>
          <div className={"title-container"}>
            <div className="goback">
              <BackButton handleBackBtn={handleBackBasedOnIsEditing} />
            </div>
            <h3
              className="page-title"
              style={{ color: "#3D5347", fontSize: "22px" }}
            >
              {formData?.id ? "Update" : "Add"} Service
            </h3>
            <p></p>
          </div>
          <div className="service-main-form-container">
            <div className="main-form">
              <CarouselImageUploader
                images={UploaderImages}
                onUpload={handleImageUpload}
                onDelete={handleImageDelete}
                placeholderImg={placeholder[formData.serviceName]}
                defaultImgStyle={
                  formData.serviceName
                    ? {
                        maxHeight: "180px",
                        minHeight: "180px",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "50% 45%",
                        borderRadius: "20px 20px 20px 20px",
                      }
                    : {}
                }
              ></CarouselImageUploader>
              <div className="form-container" style={{ marginTop: "10px" }}>
                <div className="form-group">
                  <FormControl
                    sx={{
                      width: "100%",
                      borderRadius: "20px",
                      "& .MuiOutlinedInput-root": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#cfcfcf",
                          borderRadius: "20px",
                        },
                      },
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#878787",
                        marginBottom: "8px",
                        fontSize: "14px",
                      }}
                    >
                      Service Name <span style={{ color: "red" }}>*</span>
                    </Typography>
                    <Select
                      inputProps={{ "data-testid": "select-input" }}
                      data-testid="serviceNameSelect"
                      disabled={serviceNames ? false : true}
                      id="serviceName"
                      name="serviceName"
                      value={formData.serviceName}
                      onChange={handleChange}
                      input={<OutlinedInput />}
                      MenuProps={MenuProps}
                      displayEmpty
                      sx={{
                        width: "100%",
                        color: "#878787",
                        borderRadius: "20px",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "20px",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#2e2e2e",
                            borderRadius: "20px",
                          },
                        },
                        "& .MuiSelect-select": {
                          padding: "8px 14px",
                          fontSize: "14px",
                        },
                      }}
                    >
                      <MenuItem style={{ color: "#878787" }} value="">
                        <em>Select Service</em>
                      </MenuItem>
                      {filteredServices.map((service) => (
                        <MenuItem
                          style={{ color: "#878787" }}
                          key={service}
                          value={service}
                        >
                          {service}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="form-group">
                  <label htmlFor="description">
                    Description <span style={{ color: "red" }}>*</span>
                  </label>
                  <textarea
                    data-testid="description"
                    id="description"
                    style={requiredCheck("description")}
                    name="description"
                    rows={4}
                    value={formData.description || ""}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    data-testid="eventEmail"
                    type="email"
                    id="email"
                    placeholder="Email"
                    style={requiredCheck("email")}
                    name="email"
                    value={formData.email}
                    onChange={handleChange} // Allow user to type freely without validation interruption
                    // onBlur={validateAndHandleChange} // Validate only when the input loses focus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactNumber">
                    Contact Number
                    {/* <span style={{ color: "#878787" }}>(Optional)</span> */}
                  </label>
                  <input
                    data-testid="contactNumber"
                    type="text"
                    id="contactNumber"
                    placeholder="Contact Number"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                  />
                </div>

                {formData.serviceName !== "Funeral" && (
                  <div className="service-checkbox-group">
                    <label htmlFor="registrationRequired">
                      Registration Required
                    </label>
                    <input
                      data-testid="registrationRequired"
                      type="checkbox"
                      id="registrationRequired"
                      name="registrationRequired"
                      checked={formData.registrationRequired}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {formData.registrationRequired && renderServiceFields()}
                <button
                  onClick={handleSubmit}
                  data-testid="nextButton"
                  // disabled={!isFormValid}
                  className="btn service-next-btn"
                >
                  <img src={nextIcon} alt="Next" className="btn-icon" />
                  <span className="btn-text">Next</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ServiceForm;
