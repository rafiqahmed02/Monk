import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import styles from "./EventForm.module.css";
import "./EventForm.css";
import {
  AdminInterFace,
  EventFormData,
  EventType,
  Masjid,
} from "../../../../redux/Types";
import { useNavigationprop } from "../../../../../MyProvider";
import {
  customNavigatorTo,
  useCustomParams,
  UtcDateConverter,
  UTCTimeConverter,
  UTCTimeReverter2,
} from "../../../../helpers/HelperFunction";
import { useAppSelector, useAppThunkDispatch } from "../../../../redux/hooks";
import {
  useCreateEvent,
  useUpdateEvent,
} from "../../../../graphql-api-calls/Events/mutation";
import useStripeStatus from "../../../../helpers/StripeConnectHelper/useStripeStatus";
import SuccessMessageModel from "../../../../helpers/SuccessMessageModel/SuccessMessageModel";
import BackButton from "../../Shared/BackButton";
import { Card, SelectChangeEvent } from "@mui/material";
import EventFormFields from "../EventFormFields/EventFormFields";
import EventDetails from "../EventDetails/EventDetails";
import toast from "react-hot-toast";
import { deleteEventMedia } from "../../../../redux/actions/EventActions/DeletingEventMediaAction";
import API from "../../../../helpers/AuthenticationHelper/AuthInterceptorHelper";
import useMasjidData from "../../SharedHooks/useMasjidData";
import { AdminRole, RecurrenceType } from "../enums/enums";
import moment from "moment";

interface EventFormProps {
  isMainAdmin: boolean;
  setIsFormVisible: Dispatch<SetStateAction<boolean>>;
  refetch?: () => void;
  consumerMasjidId: string;
  eventData?: EventType | null;
  isEditMode?: boolean;
}
const EventForm = ({
  isMainAdmin,
  setIsFormVisible,
  refetch,
  consumerMasjidId,
  eventData,
  isEditMode = false,
}: EventFormProps) => {
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

  const { updateEvent } = useUpdateEvent();
  const { createEvent } = useCreateEvent();
  const [formData, setFormData] = useState<EventFormData>({
    eventName: "",
    cost: null,
    category: "",
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
  const [images, setImages] = useState<File[]>([]);
  const [updateEventPhotos, setUpdateEventPhotos] = useState<
    { url: string; _id: string }[]
  >([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [startTimeError, setStartTimeError] = useState<boolean>(true);
  // const [endTimeError, setEndTimeError] = useState<string>("");
  // const [validationErrors, setValidationErrors] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [upload, setUpload] = useState(false);
  const [nextRoute, setNextRoute] = useState("");
  const { isLoading: isPaymentsLoading, isPaymentsSetup } = useStripeStatus(
    isMainAdmin,
    consumerMasjidId
  );
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [imagesToUpload, setImagesToUpload] = useState<File[]>([]);
  const formDataSetter = (name: string, value: string | boolean | null) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (eventData && masjidData && tZone) {
      setFormData({
        eventName: eventData.eventName,
        description: eventData.description,
        latitude: eventData.location.coordinates[1],
        longitude: eventData.location.coordinates[0],
        recurrenceType: eventData.metaData.recurrenceType,
        startDate: moment
          .utc(eventData.metaData.startDate)
          .tz(tZone)
          .format("YYYY-MM-DD"),
        endDate: moment
          .utc(eventData.metaData.endDate)
          .tz(tZone)
          .format("YYYY-MM-DD"),
        startTime: UTCTimeReverter2(eventData?.timings[0].startTime, tZone),
        endTime: UTCTimeReverter2(eventData?.timings[0].endTime, tZone),
        address: eventData.address,
        cost:
          eventData.cost === null ? eventData.cost : eventData.cost.toString(),
        category: eventData.category,
        capacity: eventData.capacity,
        registrationOption:
          eventData.cost === null || eventData.cost === 0 ? "free" : "paid",
        registrationRequired: eventData.isRegistrationRequired,
        addressDifferentChecked: masjidData?.address !== eventData.address,
        dates: [],
        date: eventData?.date ?? "",
      });
      setUpdateEventPhotos(eventData.eventPhotos);
    }
  }, [eventData, masjidData, tZone]);

  useEffect(() => {
    if (
      masjidData &&
      masjidData.location &&
      masjidData.location.coordinates.length > 1
    ) {
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
        category: "Islamic Event",
      }));
    }
  }, [tZone]);
  const handleSubmit = async () => {
    const type = formData.recurrenceType;
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

    // Convert and push dates into eventObject
    const convertedDates = Dates.map((date: any) => {
      return UtcDateConverter(date.format("YYYY-MM-DD"), tZone);
    });

    let eventObject = {
      address: formData?.address,
      description: formData?.description,
      eventName: formData.eventName,
      cost: formData?.cost,
      capacity: formData?.capacity,
      category: formData?.category,
      isRegistrationRequired: formData?.registrationRequired,
      location: {
        type: "Point",
        coordinates: [formData.longitude, formData.latitude],
      },
      masjid: consumerMasjidId,
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
      date: formData.date || "",
    };
    if (
      formData.recurrenceType !== RecurrenceType.RANDOM &&
      formData.recurrenceType !== RecurrenceType.WEEKLY &&
      formData.recurrenceType !== RecurrenceType.DAILY
    ) {
      delete eventObject?.dates; // delete dates key if we are not having Random or Weekly
    }
    if (
      convertedDates?.dates &&
      convertedDates?.length === 1 &&
      formData.recurrenceType !== RecurrenceType.DAILY
    ) {
      toast.error("Select at least 2 dates for range");
    }

    if (isEditMode && id) {
      try {
        // 1) Delete images if necessary
        if (imagesToDelete?.length || images?.length) {
          const loading = toast.loading(
            images?.length && imagesToDelete?.length
              ? "Replacing Image..."
              : imagesToDelete?.length
              ? "Deleting Image...!"
              : "Uploading Image...!"
          );
        } else {
          const loading = toast.loading("Updating Event...");
        }
        if (imagesToDelete?.length > 0) {
          await handleBatchDeleteImages(imagesToDelete);
          toast.dismiss();
        }

        // 2) Upload new images if necessary
        let uploadSuccess = true;
        if (images.length > 0) {
          // const loading = toast.loading("Uploading Image...!");
          const uploadResult = await handleBatchUploadImages(id);
          uploadSuccess = !!uploadResult; // convert to boolean
          toast.dismiss();
        }

        // 3) If upload failed, return early
        if (!uploadSuccess) {
          toast.error("Something Went Wrong!");
          return;
        }

        // 4) Perform the update
        const { data } = await updateEvent({
          variables: {
            id: id,
            input: eventObject,
            all: eventData?.metaData.recurrenceType !== RecurrenceType.NONE,
          },
        });

        if (data.updateEvent) {
          toast.dismiss();
          setModalMessage("Event Updated Successfully");
          setNextRoute(`/event-details/${id}${masjidIdQuery}`);
          toast.success("Event Updated Successfully");
          setIsSuccessModalOpen(true);
        } else {
          toast.error("Update Event failed");
          throw new Error("Update failed");
        }
      } catch (error) {
        toast.dismiss();
        toast.error("Update Event Failed");
        console.error("Failed to add events:", error);
      }
    } else {
      // if(add)
      try {
        const loading = toast.loading("Please Wait");
        if (isMainAdmin && selectedMasjids?.length) {
          // Loop through selected masjids and update eventObject for each masjid ID

          const promises = selectedMasjids.map((Masjid) => {
            // Clone the eventObject and update the masjid field for each masjid
            const updatedEventObject = {
              ...eventObject,
              masjid: Masjid._id, // Assign the masjid ID to the eventObject
            };

            // Call the GraphQL mutation for each masjid with the updated event object
            return createEvent({
              variables: {
                input: updatedEventObject,
              },
            });
          });

          // Wait for all the promises to complete
          const responses = await Promise.all(promises);
          // Create an array to hold the upload promises for images
          const uploadPromises: any = [];
          let currentEventId;
          // Handle the response for each masjid

          responses.forEach((response, index) => {
            if (response?.data?.createEvent) {
              // Trigger event notification for each created event
              if (response.data.createEvent.masjid === consumerMasjidId) {
                currentEventId = response.data.createEvent._id;
              }
              if (images.length) {
                uploadPromises.push(eventImageHandler(response.data, true));
              }
            } else {
              console.error(
                `Event creation failed for Masjid ID ${selectedMasjids[index]._id}`
              );
            }
          });
          // Wait for all image uploads to complete
          await Promise.all(uploadPromises);
          // }
          // After all events and images are processed, redirect to home
          toast.dismiss(loading);
          setModalMessage("Event Added Successfully");
          // setNextRoute(`/feed/4`); // Redirect EVENTS PAGE for main admin
          setNextRoute(
            `/event-details/${currentEventId}${masjidIdQuery}${
              masjidIdQuery ? "&new=true" : "?new=true"
            }`
          );
          setIsSuccessModalOpen(true);
        } else {
          //if(musalli admin)- addEvent action is called for the masjid of admin then goes for notification
          // const result = await api.addEvent(consumerMasjidId, eventObject);
          const { data } = await createEvent({
            variables: {
              input: eventObject,
            },
          });
          if (data.createEvent) {
            if (images.length === 0) {
              toast.dismiss(loading);
              setModalMessage("Event Added Successfully");
              toast.success("Event Added Successfully");
              setIsSuccessModalOpen(true);
              setNextRoute(
                `/event-details/${data.createEvent._id}${masjidIdQuery}${
                  masjidIdQuery ? "&new=true" : "?new=true"
                }`
              );
              // setIsLoading(false);
            } else {
              eventImageHandler(data);
            }
          } else {
            toast.dismiss(loading);
            toast.error("Event Creation Failed");
            throw new Error("Event Creation failed");
          }
        }
      } catch (error) {
        toast.dismiss();
        toast.error("Event Creation Failed");
        console.error("Failed to add events:", error);
      }
    }
  };

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
        if (navigation) navigation(`/event-details/${id}${masjidIdQuery}`);
        else customNavigatorTo(`/event-details/${id}${masjidIdQuery}`);
      }
    }
  };

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const uploadedImage = e.target.files[0];
      setImages([uploadedImage]);
      if (updateEventPhotos?.length) {
        setUpdateEventPhotos([]);
        setImagesToDelete(updateEventPhotos.map((img) => img._id));
      }
    },
    [setImages, updateEventPhotos]
  );

  const handleImageDelete = useCallback(
    (indexOrId: number | string) => {
      if (typeof indexOrId === "number" && !isEditMode) {
        setImages([]);
      } else if (isEditMode) {
        if (typeof indexOrId === "string") {
          const allIds = updateEventPhotos.map((img) => img._id);

          setImagesToDelete(allIds);
          setUpdateEventPhotos([]);
        } else if (typeof indexOrId === "number") {
          // setImages((prev) =>
          //   prev.filter((_, idx) => {
          //     const realIndex = updateEventPhotos?.length
          //       ? updateEventPhotos?.length - indexOrId
          //       : indexOrId;
          //     const result = idx !== realIndex;
          //     // console.log(idx !== realIndex);
          //     return result;
          //   })
          // );
          setImages([]);
        } else {
          toast.error("Something Went Wrong!");
        }
      }
    },
    [
      isEditMode,
      setImages,
      setImagesToDelete,
      setUpdateEventPhotos,
      updateEventPhotos,
    ]
  );
  // const handleDeleteImageFromAPI = async (eventImgId: string) => {
  //   // const isConfirm = await confirmation();
  //   if (!id) return;
  //   // const loading = toast.loading("Deleting...");

  //   dispatch(deleteEventMedia(eventImgId, id))
  //     .then(function (result) {
  //       refetch?.();
  //       toast.dismiss();
  //       const restImg = updateEventPhotos.filter(
  //         (eventImg) => eventImg._id !== eventImgId
  //       );
  //       setUpdateEventPhotos(restImg);
  //       setUpload((prevSignal) => !prevSignal);
  //     })
  //     .catch((error) => {
  //       toast.dismiss();
  //     });
  // };
  const handleBatchDeleteImages = async (imageIds: string[]) => {
    if (!id || !imageIds.length) return;

    try {
      // Perform all delete requests in parallel
      await Promise.all(
        imageIds.map((eventImgId) => dispatch(deleteEventMedia(eventImgId, id)))
      );

      // If we reach here, all deletes were successful
      toast.dismiss();
      // toast.success("All images deleted successfully!");

      // Remove them locally
      const updated = updateEventPhotos.filter(
        (img) => !imageIds.includes(img._id)
      );
      setUpdateEventPhotos(updated);

      // Possibly refetch
      // refetch?.();

      // Toggle your “upload” signal if needed
      setUpload((prevSignal) => !prevSignal);
    } catch (error) {
      // refetch?.();
      // If any deletion fails, handle error
      toast.dismiss();
      toast.error("Error deleting one or more images.");
      console.error(error);
      throw error;
    }
  };
  // const updateEventImgHandler = (img: File) => {
  //   const formData = new FormData();
  //   formData.append("image", img || "");
  //   setIsUploadingImage(true);
  //   const options = {
  //     onUploadProgress: (progressEvent: any) => {
  //       const { loaded, total } = progressEvent;
  //       const percent = Math.floor((loaded * 100) / total);
  //     },
  //   };
  //   console.log("Uploading Image...");
  //   let loadingId = toast.loading("Uploading Image...");
  //   API.post(`/media/${consumerMasjidId}/upload/${id}`, formData, options)
  //     .then((res) => {
  //       const newPhoto = {
  //         _id: res.data.data._id,
  //         url: res.data.data.url,
  //       };
  //       setUpdateEventPhotos((prev) => [...prev, newPhoto]);
  //       setIsUploadingImage(false);
  //       setUpload((prevSignal) => !prevSignal);
  //       toast.dismiss(loadingId);
  //       toast.success("Image Uploaded Successfully");
  //       refetch?.();
  //     })
  //     .catch((error) => {
  //       toast.dismiss(loadingId);
  //       setIsUploadingImage(false);
  //       toast.error(
  //         error.response?.data?.message || "Adding Masjid Media Failed"
  //       );
  //     });
  // };

  const uploadSingleImageApiRequest = (
    masjidId: string,
    eventId: string,
    formData: FormData
  ) => {
    return API.post(`/media/${masjidId}/upload/${eventId}`, formData);
  };

  const handleBatchUploadImages = async (eventId: string) => {
    const promises = images.map((img) => {
      const formData = new FormData();
      formData.append("image", img);
      return uploadSingleImageApiRequest(consumerMasjidId, eventId, formData);
    });
    try {
      const res = await Promise.all(promises);
      const results = res.map((item) => item.status);
      if (results.some((status) => !(status === 201 || status === 200))) {
        toast.error("Something Went Wrong. Try Again.");
        return false;
      }
      // setImages([]); // Clear images after successful upload
      return true;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Adding Masjid Media Failed"
      );
    }
    return false;
  };

  const eventImageHandler = async (
    result: any,
    isMainAdmin: boolean = false
  ) => {
    if (result?.createEvent) {
      if (images.length) {
        const res = await handleBatchUploadImages(result.createEvent._id);

        if (res) {
          if (setNextRoute && !isMainAdmin) {
            setNextRoute(
              `/event-details/${result.createEvent._id}?masjidId=${consumerMasjidId}&new=true`
            );
          }
          if (setModalMessage && setIsSuccessModalOpen) {
            setModalMessage("Event Added Successfully");
            setIsSuccessModalOpen(true);
          }
          toast.dismiss();
        } else {
          toast.error("Something Went Wrong!");
        }
      }
    }
  };

  return (
    <div>
      <SuccessMessageModel
        message={modalMessage}
        open={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
      />
      {isPreviewVisible ? (
        <EventDetails
          isEditMode={isEditMode}
          isPreviewMode={true}
          formData={formData}
          images={images}
          handleSubmit={handleSubmit}
          setIsPreviewVisible={setIsPreviewVisible}
          isMainAdmin={isMainAdmin}
          updateEventPhotos={updateEventPhotos}
        />
      ) : (
        <>
          <div className={styles["event-form"]}>
            <div className={"title-container"}>
              <div
                // className={styles["event-form__goback"]}
                className="goback"
                // style={{ marginTop: "0" }}
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
                {!isEditMode ? "Create an Event" : "Update Event"}
              </h1>
            </div>
            <div className={styles["event-form-body-container"]}>
              <div className={styles["event-form-body"]}>
                <form className={styles["event-form__form-element"]}>
                  <Card
                    className="event-form-card"
                    sx={{ overflow: "visible" }}
                  >
                    <EventFormFields
                      isMainAdmin={isMainAdmin}
                      isEditMode={isEditMode}
                      formData={formData}
                      setFormData={setFormData}
                      images={images}
                      updateEventPhotos={updateEventPhotos}
                      handleChange={handleChange}
                      consumerMasjidId={consumerMasjidId}
                      setIsPreviewVisible={setIsPreviewVisible}
                      timingError={startTimeError}
                      setTimingError={setStartTimeError}
                      handleImageUpload={handleImageUpload}
                      handleImageDelete={handleImageDelete}
                      // handleDeleteImage={handleDeleteImage}
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

export default EventForm;
