import { gql, useQuery } from "@apollo/client";
import { SearchMasjidsData } from "../../../Types/MasjidTypes";

// Define the searchMasjids query
export const SEARCH_MASJIDS = gql`
  query SearchMasjids(
    $q: String
  
    $page: Int = 1
    $limit: Int = 10
  ) {
    searchMasjids(q: $q, page: $page, limit: $limit) {
      _id
      masjidName
      address
      contact
      isAssigned
      assignedUser {
        _id
        name
        role
      }
      isVerified
      updatedBy {
        name
        isUnofficial
        role
      }
    }
  }
`;

interface SearchMasjidsVars {
  q?: string;
  lat?: number;
  lng?: number;
  page?: number;
  limit?: number;
}

export const useSearchMasjids = (
  q?: string,
  lat?: number,
  lng?: number,
  page: number = 1,
  limit: number = 10
) => {
  const { data, loading, error, refetch } = useQuery<
    SearchMasjidsData,
    SearchMasjidsVars
  >(SEARCH_MASJIDS, {
    variables: { q,  page, limit },
  });

  return {
    masjids: data?.searchMasjids,
    loading,
    error,
    refetch
  };
};
