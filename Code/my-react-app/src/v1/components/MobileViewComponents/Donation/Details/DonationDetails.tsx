import React, { useEffect, useState } from "react";
import DonationPreview from "../Preview/DonationPreview";
import ShareModal from "../../Services/Helpers/ShareModel/ShareModel";
import { useAppSelector } from "../../../../redux/hooks";
import { shareLink } from "../../OtherSalah/helperFunctions/helperFunc";

const DonationDetails = ({
  donation,
  handleCloseDonationDetails,
  handleReload,
  consumerMasjidId,
  tZone,
  isMainAdmin,
}: any) => {
  const [images, setImages] = useState({ images: donation.images });
  const [isShareVisible, setIsShareVisible] = useState(false);
  let AdminMasjidState = useAppSelector((state) => state.AdminMasjid);
  const [shareUrl, setShareUrl] = useState("");

  // const [isDonationsHistoryVisible, setIsDonationHistoryVisible] =
  //   useState(false);

  const sortedDonation = {
    ...donation,
    prices: donation.prices ? [...donation.prices].sort((a, b) => a - b) : [],
  };
  console.log("donation", donation);

  useEffect(() => {
    setShareUrl(shareLink(donation.id, "donation"));
  }, [donation]);

  // const fetchedImages: any = [];
  // const id = useCustomParams();
  // console.log(id);
  // useEffect(() => {
  //   if (id) {
  //     // Fetch the data using the id from the URL in View mode
  //   }
  // }, [id]);
  // const handleToggleDonations = () => {
  //   //handle showing donations table
  //   console.log("handleShowDonations");
  //   setIsDonationHistoryVisible(!isDonationsHistoryVisible);
  // };
  return (
    <div data-testid="donation-details">
      {/* {isDonationsHistoryVisible ? (
        <DonationHistory
          handleToggleDonations={handleToggleDonations}
          id={id}
        />
      ) : ( */}
      <DonationPreview
        // handleShowDonations={handleToggleDonations}
        donation={sortedDonation}
        isPreviewMode={false}
        handleCloseDonationDetails={handleCloseDonationDetails}
        handleReload={handleReload}
        consumerMasjidId={consumerMasjidId}
        tZone={tZone}
        setIsShareVisible={setIsShareVisible}
        isMainAdmin={isMainAdmin}
      />
      {/* )} */}
      <ShareModal
        shareType="donation"
        isOpen={isShareVisible}
        shareDetails={{
          masjidName: AdminMasjidState.masjidName,
          name: donation.name,
        }}
        onClose={() => {
          setIsShareVisible(false);
        }}
        shareLink={shareUrl}
        isRegistrationRequired={true}
        consumerMasjidId={consumerMasjidId}
        id={donation.id}
      />
    </div>
  );
};

export default DonationDetails;
