import { gql, useQuery } from "@apollo/client";
import { useEffect } from "react";

// const GET_EVENT = gql`
//   query GetEvent($id: String!) {
//     event(id: $id) {
//       _id
//       eventName
//       masjid
//       masjidDetails {
//         location {
//           type
//           coordinates
//         }
//       }
//       description
//       eventProfilePhoto
//       date
//       timings {
//         startTime
//         endTime
//       }
//       location {
//         type
//         coordinates
//       }
//       metaData {
//         startDate
//         endDate
//         recurrenceId
//         recurrenceType
//         recurrenceInterval
//       }
//       address
//       capacity
//       availableSeats
//       category
//       cost
//       isCancelled
//       guests {
//         _id
//         guestName
//         guestDescription
//         guestProfilePhoto
//         arivalTime
//         departureTime
//         createdAt
//         updatedAt
//       }
//       eventPhotos {
//         _id
//         url
//       }
//       isRegistrationRequired
//       stripeProductId
//       updatedAt
//       createdAt
//     }
//   }
// `;

const GET_EVENT = gql`
  query GetEvent($id: String!) {
    event(id: $id) {
      _id
      eventName
      description
      eventProfilePhoto
      date
      timings {
        startTime
        endTime
      }
      location {
        type
        coordinates
      }
      metaData {
        startDate
        endDate
        recurrenceType
      }
      address
      capacity
      availableSeats
      category
      cost
      isCancelled
      guests {
        _id
        guestName
        guestDescription
        guestProfilePhoto
        arivalTime
        departureTime
      }
      eventPhotos {
        _id
        url
      }
      isRegistrationRequired
      stripeProductId
      updatedAt
      createdAt
    }
  }
`;

export const useGetEvent = (id: string, skip: boolean = false) => {
  const { data, loading, error, refetch } = useQuery(GET_EVENT, {
    variables: { id },
    fetchPolicy: "no-cache",
    skip,
  });
  return { event: data, loading, error, refetch };
};

// Define the GraphQL query
export const GET_RANGE_EVENTS = gql`
  query RangeEvents(
    $masjidId: String!
    $startDate: String!
    $endDate: String!
    $page: Int
    $limit: Int
  ) {
    rangeEvents(
      masjidId: $masjidId
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      _id
      eventName
      date
      capacity
      availableSeats
      category
      isCancelled
      isRegistrationRequired
      cost
      capacity
      address
      metaData {
        startDate
        endDate
        recurrenceId
        recurrenceType
      }
      timings {
        startTime
        endTime
      }
      eventPhotos {
        _id
        url
      }
    }
  }
`;

// Create the custom hook
export const useRangeEvents = (
  masjidId: string,
  startDate: string,
  endDate: string,
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: string
) => {
  // Apollo's useQuery hook to fetch data
  const { data, loading, error } = useQuery(GET_RANGE_EVENTS, {
    variables: {
      masjidId,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      sortOrder,
    },
  });

  return {
    events: data?.rangeEvents || [],
    loading,
    error,
  };
};

//Get Masjid Details
export const GET_TICKETS = gql`
  query Tickets($parentId: String!) {
    tickets(parentId: $parentId) {
      _id
      parentId
      name
      email
      phone
      seats
      status
      paymentId
      bookingId
      createdAt
      updatedAt
      checkInSeats
    }
  }
`;
