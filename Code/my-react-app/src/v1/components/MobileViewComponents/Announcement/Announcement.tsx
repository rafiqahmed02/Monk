import React, { useEffect, useState } from "react";
import "./Announcement.css";
import CustomBtn from "../Shared/CustomBtn";
import AnnouncementIcon from "../../../photos/Newuiphotos/nav bar/navicons/navactiveicons/Announcementactive.svg";
import NoAnnouncment from "../../../photos/Newuiphotos/Icons/noAnnouncemetn.svg";
import AnnouncementForm from "./Form/AnnouncementForm";
import AnnouncementCard from "./Card/AnnouncementCard";
import { useAppDispatch } from "../../../redux/hooks";
import { FetchingAnnouncementNotificationByDate } from "../../../redux/actions/AnnouncementActions/FetchingAnnouncementByDateAction";
import { handleSnackbar } from "../../../helpers/SnackbarHelper/SnackbarHelper";
import {
  customNavigatorTo,
  dateReverter,
} from "../../../helpers/HelperFunction";
import moment from "moment";
import ProgressLoader from "../Shared/Loader/Loader";
import BackButton from "../Shared/BackButton";
import { useNavigationprop } from "../../../../MyProvider";
import useMasjidData from "../SharedHooks/useMasjidData";
import toast from "react-hot-toast";

type announcement = {
  id: string | undefined;
  title: string | undefined;
  body: string | undefined;
  createdAt: string | undefined;
};

type AnnouncementProps = {
  consumerMasjidId?: string;
  isMainAdmin?: boolean;
};

function Announcement({
  consumerMasjidId,
  isMainAdmin = false,
}: AnnouncementProps) {
  const navigation = useNavigationprop();
  const [isAnnouncementFormOpen, setIsAnnouncementFormOpen] = useState(false);
  const [isAnnouncementCardViewOpen, setIsAnnouncementCardViewOpen] =
    useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<announcement>();
  const dispatch = useAppDispatch();
  const [announcements, setAnnouncements] = useState([]);
  const [fetchAnnouncementData, setFetchAnnouncementData] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const {
    masjidData,
    isLoading: isMasjidDataLoading,
    error: masjidDataError,
  } = useMasjidData(consumerMasjidId || "");
  const [tZone, setTZone] = useState("");

  useEffect(() => {
    if (
      masjidData &&
      masjidData.location &&
      masjidData.location.coordinates.length > 1
    ) {
      setTZone(masjidData.location.timezone);
    } else if (masjidDataError) {
      toast.error("Masjid not found");
    }
  }, [masjidData, consumerMasjidId, masjidDataError]);
  useEffect(() => {
    setIsLoadingInitial(true);
    const fetchAnnouncements = dispatch(
      FetchingAnnouncementNotificationByDate()
    );
    fetchAnnouncements.then((result: any) => {
      if (result.data.message !== "Success") {
        handleSnackbar(
          true,
          "error",
          `Failed To Fetch: Something Went Wrong`,
          dispatch
        );
      } else {
        if (isMainAdmin && consumerMasjidId) {
          if (Array.isArray(result.data.data)) {
            const filteredData = result.data.data.filter((item: any) => {
              return (
                item?.masjids?.length > 0 &&
                item?.masjids?.some(
                  (masjidObj: any) => masjidObj._id === consumerMasjidId
                )
              );
            });
            setAnnouncements(filteredData);
          } else {
            setAnnouncements([]);
          }
          setIsLoadingInitial(false);
        } else {
          setAnnouncements(result.data.data);
          setIsLoadingInitial(false);
        }
      }
    });
  }, [fetchAnnouncementData]);

  const toggleAnnouncementForm = () => {
    setIsAnnouncementFormOpen((prev) => !prev);
  };

  return (
    <>
      {isAnnouncementCardViewOpen ? (
        <AnnouncementCard
          handleBack={() => setIsAnnouncementCardViewOpen((prev) => !prev)}
          announcementData={selectedAnnouncement}
        />
      ) : (
        <div>
          {!isAnnouncementFormOpen ? (
            <div className="announcebody">
              <div className="title-container">
                <div className="goback">
                  <BackButton
                    handleBackBtn={navigation ? navigation : customNavigatorTo}
                    isHome={true}
                  />
                </div>
                <h3 className="page-title">Announcements</h3>
              </div>

              <CustomBtn
                label="Make Announcement"
                icon={AnnouncementIcon}
                size="16vw"
                eventHandler={toggleAnnouncementForm}
              />
              {announcements.length > 0 ? (
                <div
                  className="announcementCards"
                  data-testid="announcementCards"
                >
                  {announcements.map((item, index) => (
                    <div
                      className="announceCards"
                      style={{ width: "100%" }}
                      key={index}
                    >
                      <div
                        className="announcecard"
                        onClick={() => {
                          setIsAnnouncementCardViewOpen((prev) => !prev);
                          setSelectedAnnouncement(item);
                        }}
                      >
                        <span>
                          <h4 style={{ color: "#3D5347" }}>{item.title}</h4>
                          <p>
                            {moment(
                              dateReverter(item.createdAt, tZone),
                              "YYYY-MM-DD"
                            ).format("D MMM yyyy")}
                          </p>
                        </span>
                        <p className="announcement-body">
                          {item.body.length > 100
                            ? item.body.substring(0, 100) + "....."
                            : item.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : isLoadingInitial && !announcements.length ? (
                <ProgressLoader />
              ) : (
                <div className="noannouncement">
                  <img src={NoAnnouncment} alt="" />
                  <p>No Annoucements Found</p>
                </div>
              )}
            </div>
          ) : (
            <AnnouncementForm
              masjidId={consumerMasjidId}
              toggleAnnouncementForm={toggleAnnouncementForm}
              setFetchAnnouncementData={setFetchAnnouncementData}
            />
          )}
        </div>
      )}
    </>
  );
}

export default Announcement;
