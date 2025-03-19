import React, { useState, useMemo, useEffect } from "react";
import moment from "moment";
import BackButton from "../Shared/BackButton";
import "./OtherSalahMain.css";
import { SalahType } from "../MobileViewCalender/SalahTimings/SalahTimings";
import OtherSalahCard from "./OtherSalahCard/OtherSalahCard";
import CustomBtn from "../Shared/CustomBtn";
import btnImg from "../../../photos/clockIcon.png";
import noPrayer from "../../../photos/prayerIcon/noPrayer.svg";
import OtherSalahOptions from "./OtherSalahOptions/OtherSalahOptions";
import { useGetSpecialTimesByMasjidId } from "../../../graphql-api-calls/OtherSalah/query";
import { CircularProgress } from "@mui/material";
import { useAppThunkDispatch } from "../../../redux/hooks";
import { useDeleteSpecialTimes } from "../../../graphql-api-calls/OtherSalah/mutation";
import { toast } from "react-hot-toast";
import MessageModel from "./helperComponent/messageModel/messageModel";
import OtherSalahForm from "./OtherSalahForm/OtherSalahForm";
import { fetchMasjidById } from "../../../redux/actions/MasjidActions/fetchMasjidById";
import Deletemessagemodel1 from "../../../photos/Newuiphotos/Common/Delete.webp";
import CustomButton from "../Shared/NewComponents/CustomButton/CustomButton";

interface OtherSalahMainProps {
  consumerMasjidId: string;
  setSelectedType: React.Dispatch<React.SetStateAction<SalahType>>;
}

const OtherSalahMain = ({
  consumerMasjidId,
  setSelectedType,
}: OtherSalahMainProps) => {
  const [showSelectSalah, setShowSelectSalah] = useState(false);
  const [tZone, setTZone] = useState("");

  const {
    deleteTimes,
    isDeleting,
    error: deleteError,
  } = useDeleteSpecialTimes();

  const [otherPrayer, setOtherPrayer] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [selectedSalah, setSelectedSalah] = useState<any | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filteredSalah, setFilteredSalah] = useState<any[]>([]);

  const dispatch = useAppThunkDispatch();

  const handleDeleteSalah = async (selectedSalah: any) => {
    setSelectedSalah(selectedSalah);
    setShowDeleteWarning(true);
  };

  const confirmDeleteSalah = async () => {
    if (selectedSalah) {
      const result = await deleteTimes(selectedSalah._id);
      if (result) {
        toast.success("Deleted Successfully");
        setRefetchTrigger(!refetchTrigger);
      } else {
        console.error("Failed to delete");
        toast.error("Failed to Delete");
      }
      setShowDeleteWarning(false);
      setSelectedSalah(null);
    }
  };

  const masjidAPIRequest = () => {
    const response = dispatch(fetchMasjidById(consumerMasjidId));
    response
      .then((result) => {
        if (result?.masjidName) {
          setTZone(result.location.timezone);
        } else {
          toast.error("Unable to Fetch Masjid Data");
        }
      })
      .catch(() => {
        toast.error("Unable to Fetch Masjid Data");
      });
  };

  useEffect(() => {
    if (consumerMasjidId) {
      masjidAPIRequest();
    }
  }, [consumerMasjidId]);

  // Memoize start and end dates
  const { startDate, endDate } = useMemo(() => {
    if (tZone) {
      const now = moment().tz(tZone).startOf("day");
      return {
        startDate: now.toISOString(),
        endDate: now.add(1, "year").toISOString(),
      };
    }
    return {
      startDate: "",
      endDate: "",
    };
  }, [tZone]);

  // Fetch special times data only when dates are set
  const {
    loading,
    error,
    specialTimes = [],
    refetch,
  } = useGetSpecialTimesByMasjidId(
    consumerMasjidId,
    startDate && endDate ? startDate : null,
    startDate && endDate ? endDate : null
  );

  useEffect(() => {
    if (error) {
      setIsLoading(false);
    } else if (loading || !startDate || !endDate) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      setOtherPrayer(specialTimes);
    }
  }, [loading, error, specialTimes]);

  useEffect(() => {
    if (startDate && endDate) {
      refetch();
    }
  }, [refetchTrigger, startDate, endDate, selectedSalah]);

  // Normalize special times data with time zone conversion
  const normalizedSpecialTimes = specialTimes.map((salah: any) => ({
    ...salah,
    timings: salah.timings
      ? salah.timings.map((timing: any) => ({
          startDate: `${moment(timing.startDate)
            .tz(tZone)
            .format("DD-MMM-YYYY")}`,
          endDate: timing.endDate
            ? `${moment(timing.endDate).tz(tZone).format("DD-MMM-YYYY")}`
            : timing.endDate,
          azanTime: timing.azaanTime
            ? moment.unix(timing.azaanTime).tz(tZone).format("hh:mm a")
            : "",
          iqamaTime: timing.jamaatTime
            ? moment.unix(timing.jamaatTime).tz(tZone).format("hh:mm a")
            : "",
        }))
      : [
          {
            startDate: `${moment(salah.startDate)
              .tz(tZone)
              .format("DD-MMM-YYYY")}`,
            endDate: salah.endDate
              ? `${moment(salah.endDate).tz(tZone).format("DD-MMM-YYYY")}`
              : salah.endDate,
            azanTime: salah.azaanTime
              ? moment.unix(salah.azaanTime).tz(tZone).format("hh:mm a")
              : "",
            iqamaTime: salah.jamaatTime
              ? moment.unix(salah.jamaatTime).tz(tZone).format("hh:mm a")
              : "",
          },
        ],
  }));

  const addedPrayers: Set<string> = useMemo(() => {
    return new Set(normalizedSpecialTimes.map((salah: any) => salah.name));
  }, [normalizedSpecialTimes]);

  // Handler for showing the SelectOtherSalah component
  const handleShowSelectSalah = () => {
    setShowSelectSalah(true);
  };

  // Handler for editing a Salah
  const handleEditSalah = (salah: any) => {
    setSelectedSalah(salah);
    console.log("selectedSalah", salah?.name.split(" ")[0]);
    setShowForm(true);
    const relevantSalah = otherPrayer?.filter((item: any) =>
      item.name
        .toLowerCase()
        .startsWith(salah?.name.split(" ")[0].toLowerCase())
    );
    setFilteredSalah(relevantSalah || []);
  };

  return (
    <div className="other-salah-main" data-testid="other-salah-main">
      {!showSelectSalah && (
        <div
          // className="header" style={{ padding: "20px", margin: 0 }}
          className={"title-container"}
        >
          <div
            className="goback"
            // style={{ marginTop: "0" }}
          >
            <BackButton
              handleBackBtn={() =>
                showForm ? setShowForm(false) : setSelectedType(null)
              }
            />
          </div>
          <h3 className="page-title" data-testid="header-title">
            {showForm ? `Update Salah` : "Other Salah"}
          </h3>
        </div>
      )}
      {showForm ? (
        <OtherSalahForm
          selectedSalah={selectedSalah?.name || ""}
          consumerMasjidId={consumerMasjidId}
          setShowSelectSalah={setShowForm}
          setRefetchTrigger={setRefetchTrigger}
          initialTimings={selectedSalah?.timings || []}
          selectedSalahId={selectedSalah?._id}
          filteredSalah={filteredSalah}
        />
      ) : showSelectSalah ? (
        <OtherSalahOptions
          addedPrayers={addedPrayers}
          setShowSelectSalah={setShowSelectSalah}
          consumerMasjidId={consumerMasjidId}
          setRefetchTrigger={setRefetchTrigger}
          allOtherSalah={otherPrayer}
        />
      ) : (
        <>
          <div className="center-block" style={{ marginBottom: "1rem" }}>
            <CustomButton
              onClick={handleShowSelectSalah}
              text={"Add Other Salah"}
              iconSrc={btnImg}
              buttonStyle={{
                backgroundColor: "#1B8368",
                color: "white",
                fontSize: "0,8rem",
                borderRadius: "30px",
                width: "260px",
                textTransform: "none",
                "@media (min-width: 768px)": {
                  display: "inline-flex",
                },
                ":hover": {
                  backgroundColor: "#1B8368",
                },
              }}
              iconStyle={{
                marginRight: "5px",
                height: "1rem",
                width: "1rem",
              }}
            />
          </div>
          {isLoading ? (
            <p
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <CircularProgress />
            </p>
          ) : error ? (
            <p>Error loading data: {error.message}</p>
          ) : normalizedSpecialTimes.length > 0 ? (
            normalizedSpecialTimes.map((salah: any) => (
              <React.Fragment key={salah._id}>
                <OtherSalahCard
                  id={salah._id}
                  title={salah.name}
                  timings={salah.timings}
                  onEdit={() => handleEditSalah(salah)}
                  onDelete={() => handleDeleteSalah(salah)}
                />
              </React.Fragment>
            ))
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                height: "50vh",
              }}
            >
              <img src={noPrayer} alt="no prayers" />
              <p
                style={{
                  marginTop: "1rem",
                  color: "#666",
                  fontSize: "0.9rem",
                }}
              >
                No Other Salah Found
              </p>
            </div>
          )}
        </>
      )}
      {showDeleteWarning && (
        <MessageModel
          onClose={() => setShowDeleteWarning(false)}
          onConfirm={confirmDeleteSalah}
          messageType="Delete Other Salah"
          message={`Are you sure want to delete the Entire ${selectedSalah?.name}`}
          isLoading={isDeleting}
          img={Deletemessagemodel1}
        />
      )}
    </div>
  );
};

export default OtherSalahMain;
