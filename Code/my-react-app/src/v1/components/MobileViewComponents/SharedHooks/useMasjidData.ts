// useMasjidData.js
import { useAppSelector, useAppThunkDispatch } from "../../../redux/hooks";
import { fetchMasjidById } from "../../../redux/actions/MasjidActions/fetchMasjidById";
import { useEffect, useState } from "react";

const useMasjidData = (consumerMasjidId: string) => {
  const dispatch = useAppThunkDispatch();
  const AdminMasjidState = useAppSelector((state) => state.AdminMasjid);
  // console.log(AdminMasjidState);
  const [masjidData, setMasjidData] = useState(
    AdminMasjidState && Object.keys(AdminMasjidState).length >= 0
      ? AdminMasjidState
      : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    if ((masjidData && Object.keys(masjidData).length === 0 && consumerMasjidId) || refetch) {
      setIsLoading(true);
      const fetchData = async () => {
        const response = await dispatch(fetchMasjidById(consumerMasjidId));
        if (response?.masjidName) {
          setMasjidData(response);
        }else {
          setError("No masjid found");
        }
        setIsLoading(false);
        setRefetch(false);
      };
      fetchData();
    } else if (!masjidData && !consumerMasjidId) {
      setError("No masjid found");
    }
  }, [masjidData, consumerMasjidId, dispatch, refetch]);

  const handleRefetch = () => {
    setRefetch(true);
  };

  return { masjidData, isLoading, error, handleRefetch };
};

export default useMasjidData;
