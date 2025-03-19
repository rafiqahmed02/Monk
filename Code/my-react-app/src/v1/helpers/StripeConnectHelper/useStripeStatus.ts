import { useState, useEffect } from "react";
import axios from "axios";
import { getRestAPIRootDomain } from "../ApiSetter/GraphQlApiSetter";
import { AuthTokens } from "../../redux/Types";

const useStripeStatus = (isMainAdmin: boolean=false, consumerMasjidId:string="") => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentsSetup, setIsPaymentsSetup] = useState(false);

  useEffect(() => {
    const checkStripeStatus = async () => {
      setIsLoading(true);
      const BaseRestUrl = getRestAPIRootDomain();
      const url = `${BaseRestUrl}/stripe/connect${isMainAdmin && consumerMasjidId ? `?masjidId=${consumerMasjidId}` : ""}`;
      const authTokensString = localStorage.getItem("authTokens");
      const token: AuthTokens | null = authTokensString
        ? JSON.parse(authTokensString)
        : null;

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token?.accessToken}`,
          },
        });

        setIsLoading(false);
        if (
          response.status === 202 && response?.data?.account?.stripeStatus === "active" &&
          response?.data?.account?.status === "approved" || response?.data?.account?.status === "active"
        ) {
          setIsPaymentsSetup(true);
        } else {
          setIsPaymentsSetup(false);
        }
      } catch (error) {
        setIsLoading(false);
        setIsPaymentsSetup(false);
      }
    };
    checkStripeStatus();
  }, []);

  return { isLoading, isPaymentsSetup };
};

export default useStripeStatus;
