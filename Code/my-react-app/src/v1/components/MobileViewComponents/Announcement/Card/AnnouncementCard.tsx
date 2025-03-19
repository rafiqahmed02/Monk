import React from "react";
import BackButton from "../../Shared/BackButton";
import MoreBtn from "../../Shared/MoreBtn";
import moment from "moment";
import { dateReverter } from "../../../../helpers/HelperFunction";

type announcement = {
  id: string | undefined;
  title: string | undefined;
  body: string | undefined;
  createdAt: string | undefined;
};
type PropsType = {
  handleBack: () => void;
  isDetailView?: boolean;
  title?: string;
  description?: string;
  announcementData?: announcement | undefined;
};

function AnnouncementCard({
  handleBack,
  isDetailView,
  title,
  description,
  announcementData,
}: PropsType) {
  let tZone = localStorage.getItem("MasjidtZone");
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      {!isDetailView ? (
        <>
          <div className="title-container">
            <div className="goback">
              <BackButton handleBackBtn={handleBack} />
            </div>
            <h3 className="page-title">History</h3>
          </div>

          <div className="announcementDetailCard">
            <span>
              <h3 style={{ color: "#1D785A", fontSize: "16px" }}>
                {announcementData?.title}
              </h3>
              <p style={{ margin: "0" }}>
                {moment(
                  dateReverter(announcementData?.createdAt, tZone),
                  "YYYY-MM-DD"
                ).format("D MMM yyyy")}{" "}
              </p>
            </span>
            <p className="announcedes announcement-body">
              <MoreBtn
                tsx={announcementData?.body}
                txLength={announcementData?.body?.length}
                height={announcementData?.body?.length > 500 ? "340px" : ""}
              />
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="title-container">
            <div className="goback">
              <BackButton handleBackBtn={handleBack} />
            </div>
            <h3 className="page-title">History</h3>
          </div>

          <div className="announcementDetailCard">
            <span>
              <h3 style={{ color: "#1D785A", fontSize: "16px" }}>{title}</h3>
              <p style={{ margin: "0" }}>
                {moment(new Date(), "YYYY-MM-DD").format("D MMM yyyy")}{" "}
              </p>
            </span>
            <p className="announcedes">
              <MoreBtn
                tsx={description}
                txLength={description.length}
                height={description.length > 500 ? "390px" : ""}
              />
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default AnnouncementCard;
