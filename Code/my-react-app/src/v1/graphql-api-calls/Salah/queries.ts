// queries.ts
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";

// Define the GraphQL query
export const GET_TIMINGS_BY_MASJID_ID_WITH_ENDDATE = gql`
  query GetTimingsByMasjidId(
    $masjidId: String
    $startDate: String
    $endDate: String
  ) {
    getTimingsByMasjidId(
      masjidId: $masjidId
      startDate: $startDate
      endDate: $endDate
    ) {
      _id
      masjidId
      date
      prayerType
      prayerMethod
      timings {
        _id
        namazName
        type
        azaanTime
        jamaatTime
        offset {
          iqamah
          azaan
        }
        iqamahType
      }
    }
  }
`;
const GET_TIMINGS_BY_MASJID_ID_WITHOUT_ENDDATE = gql`
  query GetTimingsByMasjidId($masjidId: String, $startDate: String) {
    getTimingsByMasjidId(masjidId: $masjidId, startDate: $startDate) {
      _id
      masjidId
      date
      prayerType
      prayerMethod
      timings {
        _id
        namazName
        type
        azaanTime
        jamaatTime
        offset {
          iqamah
          azaan
        }
        iqamahType
      }
    }
  }
`;

export const UPDATE_MASJID_META = gql`
  mutation UpdateMasjidMeta($id: String!, $input: UpdateMetaInput!) {
    updateMasjidMeta(id: $id, input: $input) {
      _id
      masjidName
      masjidProfilePhoto
      description
      address
      location {
        type
        coordinates
      }
      lastEditor
      contact
      externalLinks {
        name
        url
      }
      isFreezed
      widgets
      isAssigned
      timings {
        _id
        masjidId
        date
        lastEditor
        prayerType
        prayerMethod
        timings {
          _id
          namazName
          type
          azaanTime
          jamaatTime
          offset {
            iqamah
            azaan
          }
        }
        createdAt
        updatedAt
      }
      assignedUser {
        _id
        name
      }
      updatedBy {
        name
        isUnofficial
        role
      }
      subscribers
      followers
      metadata {
        method
        juristic
      }
      createdAt
      updatedAt
    }
  }
`;
