import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import styles from "./ProgramForm.module.css";
import "./ProgramForm.css";
import { AdminInterFace, Masjid } from "../../../../redux/Types";
import { useNavigationprop } from "../../../../../MyProvider";
import {
  customNavigatorTo,
  useCustomParams,
  UtcDateConverter,
  UTCTimeConverter,
  UTCTimeReverter2,
} from "../../../../helpers/HelperFunction";
import { useAppSelector, useAppThunkDispatch } from "../../../../redux/hooks";
import useStripeStatus from "../../../../helpers/StripeConnectHelper/useStripeStatus";
import SuccessMessageModel from "../../../../helpers/SuccessMessageModel/SuccessMessageModel";
import BackButton from "../../Shared/BackButton";
import { Card, SelectChangeEvent } from "@mui/material";
import ProgramFormFields from "../ProgramFormFields/ProgramFormFields";
import ProgramDetails from "../ProgramDetails/ProgramDetails";
import { validateForm } from "../Helper/Functions/validation";
import toast from "react-hot-toast";
import useMasjidData from "../../SharedHooks/useMasjidData";
import { AdminRole, RecurrenceType } from "../enums/enums";
import { ProgramFormData, ProgramType } from "../Types/Types";
import {
  useCreateProgram,
  useUpdateProgram,
} from "../../../../graphql-api-calls/Program/mutation";
import { uploadImage } from "../../../../helpers/imageUpload/imageUpload";
import moment from "moment";

interface ProgramFormProps {
  isMainAdmin: boolean;
  setIsFormVisible: Dispatch<SetStateAction<boolean>>;
  refetch?: () => void;
  consumerMasjidId: string;
  programData?: ProgramType | null;
  isEditMode?: boolean;
}

const ProgramForm = ({
  isMainAdmin,
  setIsFormVisible,
  refetch,
  consumerMasjidId,
  programData,
  isEditMode = false,
}: ProgramFormProps) => {
  const [selectedMasjids, setSelectedMasjids] = useState<Masjid[]>([]);
  const [tZone, setTZone] = useState("");
  const navigation = useNavigationprop();
  const dispatch = useAppThunkDispatch();
  const id = useCustomParams();
  let admin = useAppSelector((state) => state.admin) as AdminInterFace;
  let AdminMasjidState = useAppSelector((state) => state.AdminMasjid);

  const masjidIdQuery =
    admin.role === AdminRole.ADMIN || admin.role === AdminRole.SUPER_ADMIN
      ? `?masjidId=${consumerMasjidId}`
      : "";

  const {
    masjidData,
    isLoading: isMasjidDataLoading,
    error: masjidDataError,
  } = useMasjidData(consumerMasjidId);

  // ---------------------------------------------Form Code Start Here------------------------------------------------------//
  // -----------------------------------------------------//----------------------------------------------------------------//
  // -----------------------------------------------------//----------------------------------------------------------------//
  // -----------------------------------------------------//----------------------------------------------------------------//
  // -----------------------------------------------------//----------------------------------------------------------------//
  // -----------------------------------------------------//----------------------------------------------------------------//
  const { UpdateProgram } = useUpdateProgram();
  const { addProgram } = useCreateProgram();

  const [formData, setFormData] = useState<ProgramFormData>({
    programName: "",
    programPhotos: [],
    cost: null,
    isPaid: false,
    category: "",
    ageOption: "all",
    minAge: "",
    maxAge: "",
    description: "",
    latitude: 0,
    longitude: 0,
    recurrenceType: "none",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    address: masjidData?.address ?? "",
    capacity: "",
    registrationOption: "free",
    registrationRequired: false,
    addressDifferentChecked: false,
    dates: [],
    days: [],
  });
  const [images, setImages] = useState<any[]>([]);
  const [updateProgramPhotos, setUpdateProgramPhotos] = useState<any[]>([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [startTimeError, setStartTimeError] = useState<boolean>(true);
  const [endTimeError, setEndTimeError] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [upload, setUpload] = useState(false);
  const [nextRoute, setNextRoute] = useState("");
  const { isLoading: isPaymentsLoading, isPaymentsSetup } = useStripeStatus(
    isMainAdmin,
    consumerMasjidId
  );

  const formDataSetter = (name: string, value: string | boolean | null) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (programData && masjidData && tZone) {
      setFormData({
        programName: programData.programName,
        programPhotos: programData.programPhotos
          ? programData.programPhotos
          : [],
        ageOption: programData.ageRange.maximumAge > 0 ? "range" : "all",
        minAge: programData.ageRange.minimumAge,
        maxAge: programData.ageRange.maximumAge,
        description: programData.description,
        latitude: programData.location.coordinates[1],
        longitude: programData.location.coordinates[0],
        recurrenceType: programData.metaData.recurrenceType.toLowerCase(),
        startDate: moment
          .utc(programData.metaData.startDate)
          .tz(tZone)
          .format("YYYY-MM-DD"),
        endDate: moment
          .utc(programData.metaData.endDate)
          .tz(tZone)
          .format("YYYY-MM-DD"),

        startTime: UTCTimeReverter2(programData?.timings[0].startTime, tZone),
        endTime: UTCTimeReverter2(programData?.timings[0].endTime, tZone),
        address: programData.address,
        cost:
          programData.cost === null
            ? programData.cost
            : programData.cost.toString(),
        isPaid: programData.isPaid,
        category: programData.category,
        capacity: programData.capacity,
        registrationOption:
          programData.cost === null || programData.cost === 0 ? "free" : "paid",
        registrationRequired: programData.isRegistrationRequired,
        addressDifferentChecked: masjidData?.address !== programData.address,
        dates: [],
        date: programData?.date ?? "",
      });
      setUpdateProgramPhotos(programData.programPhotos);
      // setImages(programData.programPhotos);
    }
  }, [programData, masjidData, tZone]);

  useEffect(() => {
    if (
      masjidData &&
      masjidData.location &&
      masjidData.location.coordinates.length > 1
    ) {
      console.log("setTZone", tZone);
      setTZone(masjidData.location.timezone);
      setFormData((prevFormData) => ({
        ...prevFormData,
        latitude: masjidData.location.coordinates[1],
        longitude: masjidData.location.coordinates[0],
      }));
    } else if (masjidDataError) {
      toast.error("Masjid Not Found");
    }
  }, [masjidData, consumerMasjidId, masjidDataError]);

  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | SelectChangeEvent<unknown>
  ) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;
    const { name, value } = target;
    const type = target.type; // Now you can access the type property
    const checked = target instanceof HTMLInputElement ? target.checked : null; // Now you can access the checked property

    formDataSetter(name, type === "checkbox" ? checked : value);
  };

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      startDate: "",
      endDate: "",
      dates: [],
      days: [],
    }));
  }, [formData.recurrenceType]);
  useEffect(() => {
    if (!isEditMode) {
      const todayInTimeZone = tZone
        ? moment().tz(tZone).startOf("day")
        : moment().startOf("day");
      setFormData((prevFormData) => ({
        ...prevFormData,
        startDate: todayInTimeZone.format("YYYY-MM-DD"),
        endDate: todayInTimeZone.format("YYYY-MM-DD"),
        startTime: tZone
          ? moment().tz(tZone).format("HH:mm")
          : moment().format("HH:mm"),
        // startTime: "00:00",
        endTime: tZone
          ? moment().tz(tZone).format("HH:mm")
          : moment().format("HH:mm"),
        capacity: "100",
        // category:""
      }));
    }
  }, [tZone]);
  const handleSubmit = async () => {
    console.log("handleSubmit", formData);
    const type = formData.recurrenceType.toLowerCase();
    const Dates: any = formData.dates;

    const startDate =
      type === RecurrenceType.DAILY || type === RecurrenceType.WEEKLY
        ? Dates[0].format("YYYY-MM-DD")
        : type === RecurrenceType.NONE
        ? formData.startDate
        : Dates[0]?.format("YYYY-MM-DD");

    const endDate =
      type === RecurrenceType.DAILY || type === RecurrenceType.WEEKLY
        ? Dates[Dates.length - 1]?.format("YYYY-MM-DD")
        : type === RecurrenceType.NONE
        ? formData.endDate
        : type === RecurrenceType.RANDOM && Dates.length > 0
        ? Dates[Dates.length - 1]?.format("YYYY-MM-DD")
        : Dates[0]?.format("YYYY-MM-DD");

    // Validate masjid information
    if (!AdminMasjidState?.address || !AdminMasjidState?.masjidName) {
      toast.error(
        `${!AdminMasjidState?.address ? "Address" : "Masjid Name"} is missing`
      );
      return;
    }

    // Convert and push dates into ProgramObject
    const convertedDates = Dates.map((date: any) => {
      return UtcDateConverter(date.format("YYYY-MM-DD"), tZone);
    });
    console.log(
      "UTCTimeConverter",
      formData.startTime,
      "1",
      formData.endTime,
      "2",
      startDate,
      "3",
      tZone,
      "4",
      endDate,
      "5"
    );
    let ProgramObject = {
      address: formData?.address,
      description: formData?.description,
      programName: formData.programName,
      ageRange: {
        minimumAge: formData?.minAge === "" ? 0 : formData?.minAge,
        maximumAge: formData?.maxAge === "" ? 0 : formData?.maxAge,
      },
      cost: formData?.cost,
      isPaid: formData?.isPaid,
      capacity: formData?.capacity,
      category: formData?.category,
      isRegistrationRequired: formData?.registrationRequired,
      location: {
        type: "Point",
        coordinates: [formData.longitude, formData.latitude],
      },
      masjidId: consumerMasjidId,
      metaData: {
        startDate: UtcDateConverter(startDate, tZone),
        endDate: UtcDateConverter(endDate, tZone, true),
        recurrenceType: formData.recurrenceType.toLowerCase(),
      },
      timings: [
        {
          startTime: UTCTimeConverter(formData.startTime, startDate, tZone),
          endTime: UTCTimeConverter(formData.endTime, endDate, tZone),
        },
      ],
      dates: convertedDates, // Push converted dates here
      // date: formData.date || "",
      programPhotos: formData?.programPhotos,
    };
    console.log("ProgramObject", ProgramObject);
    if (
      formData.recurrenceType !== RecurrenceType.RANDOM &&
      formData.recurrenceType !== RecurrenceType.WEEKLY &&
      formData.recurrenceType !== RecurrenceType.DAILY
    ) {
      delete ProgramObject?.dates; // delete dates key if we are not having Random or Weekly
    }
    if (
      convertedDates?.dates &&
      convertedDates?.length === 1 &&
      formData.recurrenceType !== RecurrenceType.DAILY
    ) {
      toast.error("Select at least 2 dates for range");
    }

    console.log("images updating", images, updateProgramPhotos);
    if (images.length > 0 || updateProgramPhotos.length > 0) {
      const loading = toast.loading("Uploading Images...");
      try {
        // Upload new images
        const uploadedImageUrls = await Promise.all(
          images.map((img) => uploadImage(img))
        );

        // Filter successful uploads
        const validUrls = uploadedImageUrls.filter((url) => url);

        // Extract only URLs from updateProgramPhotos
        const existingUrls = updateProgramPhotos.filter(
          (item) => typeof item === "string"
        );

        // Merge existing URLs with newly uploaded URLs
        ProgramObject.programPhotos = [
          ...existingUrls, // Add already uploaded URLs
          ...validUrls, // Add new uploaded URLs
        ];

        toast.dismiss(loading);
      } catch (error) {
        toast.dismiss(loading);
        toast.error("Failed to Upload Images.");
        console.error("Image upload error:", error);
      }
    } else if (images.length === 0 && updateProgramPhotos.length === 0) {
      ProgramObject.programPhotos = [];
      // console.log("updateProgramPhotos", updateProgramPhotos);
      // ProgramObject.programPhotos = updateProgramPhotos.filter(
      //   (item) => typeof item === "string"
      // );
    }

    if (isEditMode && id) {
      const loading = toast.loading("Please Wait...!");

      try {
        const response = await UpdateProgram(id, ProgramObject);
        console.log(response);
        toast.dismiss(loading);
        if (response) {
          toast.success("Program Updated Successfully!");
          setModalMessage("Program Updated Successfully");
          setNextRoute(`/program-details/${response._id}${masjidIdQuery}`);
          setIsSuccessModalOpen(true);
        }
      } catch (error) {
        toast.dismiss(loading);
        toast.error("Failed to Update the Program.");
      }
    } else {
      // if(add)
      try {
        const loading = toast.loading("Please Wait");
        // if (isMainAdmin && selectedMasjids?.length) {
        //   // Loop through selected masjids and update ProgramObject for each masjid ID

        //   const promises = selectedMasjids.map((Masjid) => {
        //     // Clone the ProgramObject and update the masjid field for each masjid
        //     const updatedEventObject = {
        //       ...ProgramObject,
        //       masjidId: Masjid._id, // Assign the masjid ID to the ProgramObject
        //     };

        //     // Call the GraphQL mutation for each masjid with the updated event object
        //     return addProgram({
        //       variables: {
        //         input: updatedEventObject,
        //       },
        //     });
        //   });

        // Wait for all the promises to complete
        // const responses = await Promise.all(promises);
        // Create an array to hold the upload promises for images
        // const uploadPromises: any = [];
        // let currentEventId;
        // // Handle the response for each masjid

        // responses.forEach((response, index) => {
        //   if (response?.data?.createEvent) {
        //     // Trigger event notification for each created event
        //     if (response.data.createEvent.masjid === consumerMasjidId) {
        //       currentEventId = response.data.createEvent._id;
        //     }
        //     if (images.length) {
        //       uploadPromises.push(eventImageHandler(response.data, true)); // Pass an additional flag to handle main admin redirection
        //     }
        //   } else {
        //     console.error(
        //       `Program creation failed for Masjid ID ${selectedMasjids[index]._id}`
        //     );
        //   }
        // });
        // // Wait for all image uploads to complete
        // await Promise.all(uploadPromises);
        // }
        // After all events and images are processed, redirect to home
        //   toast.dismiss(loading);
        //   setModalMessage("Programs Added Successfully");
        //   setNextRoute(`/feed/9`); // Redirect EVENTS PAGE for main admin
        //   // setNextRoute(`/program-details/${currentEventId}${masjidIdQuery}`);
        //   setIsSuccessModalOpen(true);
        // }
        // else {
        try {
          const response = await addProgram(ProgramObject);
          if (response) {
            toast.dismiss();
            setModalMessage("Program Created Successfully");
            setNextRoute(
              `/program-details/${response._id}${masjidIdQuery}${
                masjidIdQuery ? "&new=true" : "?new=true"
              }`
            );
            setIsSuccessModalOpen(true);
          }
        } catch (error) {
          toast.dismiss(loading);
          toast.error("Failed to Create the Program.");
        }
        // }
      } catch (error) {
        console.error("Failed to add programs:", error);
      }
    }
  };

  console.log("uplpoadeded", updateProgramPhotos);

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);

    if (isEditMode) {
      refetch?.();
      setIsFormVisible?.(false);
    } else {
      if (nextRoute) {
        if (navigation) navigation(nextRoute);
        else customNavigatorTo(nextRoute);
      } else {
        if (navigation) navigation(`/programs-details/${id}${masjidIdQuery}`);
        else customNavigatorTo(`/programs-details/${id}${masjidIdQuery}`);
      }
    }
  };

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const uploadedImage = e.target.files[0];
      setImages((prev) => [uploadedImage]);
      setUpdateProgramPhotos((prev) => [uploadedImage]);
    },
    []
  );

  const handleImageDelete = useCallback((index: number | string) => {
    if (typeof index === "number") {
      setImages([(prev) => prev.filter((_, idx) => idx !== index)]);
    }
  }, []);

  const handleDeleteImage = useCallback(
    (imageToDelete: string | number) => {
      if (typeof imageToDelete === "number") {
        // Newly added photo
        // setImages((prev) => prev.filter((img) => img !== imageToDelete));
        // programData?.programPhotos?.length;
        // console.log();
        // const isNew =
        //   imageToDelete + 1 > updateProgramPhotos?.length - images?.length;

        // const realIndexForImages = isNew
        //   ? imageToDelete - (updateProgramPhotos?.length - images?.length)
        //   : -1;
        // console.log(realIndexForImages);
        //  3 5-2

        setImages([]);
        setUpdateProgramPhotos([]);
      } else if (typeof imageToDelete === "string") {
        // Already uploaded photo (URL)
        setUpdateProgramPhotos([]);
      }
    },
    [updateProgramPhotos, images]
  );

  return (
    <div>
      <SuccessMessageModel
        message={modalMessage}
        open={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
      />
      {isPreviewVisible ? (
        <ProgramDetails
          isEditMode={isEditMode}
          isPreviewMode={true}
          formData={formData}
          images={images}
          handleSubmit={handleSubmit}
          setIsPreviewVisible={setIsPreviewVisible}
          isMainAdmin={isMainAdmin}
          updateProgramPhotos={updateProgramPhotos}
        />
      ) : (
        <>
          <div className={styles["program-form"]}>
            <div className={"title-container"}>
              <div
                className={styles["program-form__goback"]}
                style={{ marginTop: "0" }}
              >
                <BackButton
                  handleBackBtn={() => {
                    setIsFormVisible(false);
                  }}
                />
              </div>
              <h1
                className="page-title"
                data-testid="header-title"
                style={{ color: "#054635" }}
              >
                {!isEditMode ? "Create a Program" : "Update Program"}
              </h1>
            </div>
            <div className={styles["program-form-body-container"]}>
              <div className={styles["program-form-body"]}>
                <form className={styles["program-form__form-element"]}>
                  <Card
                    className="program-form-card"
                    sx={{ overflow: "visible" }}
                  >
                    <ProgramFormFields
                      isMainAdmin={isMainAdmin}
                      isEditMode={isEditMode}
                      formData={formData}
                      setFormData={setFormData}
                      images={images}
                      updateProgramPhotos={updateProgramPhotos}
                      handleChange={handleChange}
                      consumerMasjidId={consumerMasjidId}
                      setIsPreviewVisible={setIsPreviewVisible}
                      timingError={startTimeError}
                      setTimingError={setStartTimeError}
                      handleImageUpload={handleImageUpload}
                      handleImageDelete={handleImageDelete}
                      handleDeleteImage={handleDeleteImage}
                      setSelectedMasjids={setSelectedMasjids}
                      stripeFields={[isPaymentsSetup, isPaymentsLoading]}
                    />
                  </Card>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgramForm;
