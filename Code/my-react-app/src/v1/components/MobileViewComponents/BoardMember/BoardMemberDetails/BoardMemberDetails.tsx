import React, { useEffect, useState } from "react";
import BoardMemberPreview from "../BoardMemberPreview/BoardMemberPreview";
import BoardMemberForm from "../BoardMemberForm/BoardMemberForm";
import { adminFromLocalStg } from "../../../../helpers/AdminFromLocalStorage/AdminFromLocalStorage";
import { useCustomParams } from "../../../../helpers/HelperFunction";
import { useQuery } from "@apollo/client";
import { Get_BoardMember } from "../../../../graphql-api-calls/query";
import { BoardMember } from "../../../../redux/Types";
import toast from "react-hot-toast";

const BoardMemberDetails = () => {
  const [formData, setFormData] = useState<BoardMember>({
    about: "",
    email: "",
    name: "",
    phone: "",
    position: "",
    image: "",
    _id: "",
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const masjidIdQuery = queryParams.get("masjidId");
  const consumerMasjidId = masjidIdQuery
    ? masjidIdQuery
    : adminFromLocalStg().masjids[0];

  const id = useCustomParams();

  const { loading, error, data } = useQuery(Get_BoardMember, {
    variables: { masjidId: consumerMasjidId },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!loading && data && data.GetBoardMembers) {
      const member = data.GetBoardMembers.find(
        (member: BoardMember) => member._id === id
      );
      if (member) {
        const { name, email, position, about, _id, phone, image } = member;
        setFormData({
          name,
          email,
          phone,
          position,
          about,
          _id,
          image: image ? [image] : [],
        });
      }
    } else if (error) {
      console.error(error);
      toast.error("Error Fetching Board Members");
    }
  }, [data, loading, error]);
  const handleToggleEditForm = () => {
    setIsFormVisible(!isFormVisible);
  };

  if (isFormVisible)
    return (
      <div data-testid="board-member-details-form">
        <BoardMemberForm
          boardMemberData={formData}
          isEditing={true}
          handleToggleEditForm={handleToggleEditForm}
          id={id}
          masjidId={consumerMasjidId}
        />
      </div>
    );

  return (
    <div data-testid="board-member-details-preview">
      <BoardMemberPreview
        masjidId={consumerMasjidId}
        isEditing={true}
        formData={formData}
        handleEditButton={handleToggleEditForm}
      />
    </div>
  );
};

export default BoardMemberDetails;
