import { gql, useQuery } from "@apollo/client";

export const GET_PROGRAMS_BY_RANGE = gql`
  query GetProgramsByRange(
    $masjidId: String!
    $startDate: String!
    $endDate: String!
  ) {
    GetProgramsByRange(
      masjidId: $masjidId
      startDate: $startDate
      endDate: $endDate
    ) {
      programName
      description
      availableSeats
      category
      description
      location {
        type
        coordinates
      }
      isCancelled
      date
      metaData {
        startDate
        endDate
        recurrenceId
        recurrenceType
        recurrenceInterval
      }
      ageRange {
        minimumAge
        maximumAge
      }
      timings {
        startTime
        endTime
      }
      isPaid
      cost
      capacity
      address
      programPhotos
      isRegistrationRequired
      _id
    }
  }
`;

export const useGetProgramsByRange = (
  masjidId: string,
  startDate: string,
  endDate: string
) => {
  const { data, loading, error } = useQuery(GET_PROGRAMS_BY_RANGE, {
    variables: {
      masjidId,
      startDate,
      endDate,
    },
    fetchPolicy: "network-only",
  });

  return {
    programs: data?.GetProgramsByRange || [],
    loading,
    error,
  };
};

export const GET_PROGRAM_BY_ID = gql`
  query GetProgram($id: String!) {
    GetProgram(id: $id) {
      programName
      description
      category
      location {
        type
        coordinates
      }
      isCancelled
      availableSeats
      metaData {
        startDate
        endDate
        recurrenceType
        recurrenceInterval
      }
      programPhotos
      ageRange {
        minimumAge
        maximumAge
      }
      timings {
        startTime
        endTime
      }
      isPaid
      cost
      capacity
      address
      isRegistrationRequired
      _id
      date
    }
  }
`;

// Custom hook to get a program by ID
export const useGetProgramById = (programId: string, skip: boolean = false) => {
  const { data, loading, error, refetch } = useQuery(GET_PROGRAM_BY_ID, {
    variables: { id: programId },
    fetchPolicy: "no-cache",
    skip,
  });

  return {
    program: data?.GetProgram,
    loading,
    error,
    refetch,
  };
};

export const RSVP_STATUS = gql`
  query rsvpAnalytics($id: String!, $type: String!) {
    rsvpAnalytics(id: $id, type: $type) {
      attending
      notAttending
      maybe
      subscribers
    }
  }
`;

// Custom hook to get RSVP analytics by ID and type
export const useRsvpAnalytics = (
  id: string,
  type: string,
  skip: boolean = false
) => {
  // Call Apollo's useQuery hook with the query and variables
  const { data, loading, error } = useQuery(RSVP_STATUS, {
    skip,
    fetchPolicy: "network-only",
    variables: { id, type }, // Pass the required variables
  });

  return {
    rsvpData: data?.rsvpAnalytics,
    loading,
    rsvperror: error,
  };
};
