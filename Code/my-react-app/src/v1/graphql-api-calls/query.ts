import { gql } from "@apollo/client";

export const Get_Services = gql`
  query GetServices($masjidId: String!) {
    getServices(masjidId: $masjidId) {
      id
      serviceName
      description
      emailAddress
      image
      active
      contactNumber
      registrationRequired
      serviceType
      details {
        cost
        availabilityTiming
        startTime
        endTime
      }
      attributes {
        attributeName
        attributeValues
      }
    }
  }
`;
export const Get_BoardMember = gql`
  query getBoardMembers($masjidId: String!) {
    GetBoardMembers(masjidId: $masjidId) {
      _id
      name
      position
      email
      about
      phone
      image
    }
  }
`;
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

export const Get_PROGRAMS = gql`
  query GetPrograms($masjidId: String!) {
    GetPrograms(masjidId: $masjidId) {
      programName
      description
      availableSeats
      category
      description
      location {
        type
        coordinates
      }
      metaData {
        startDate
        endDate
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

export const Get_PROGRAMS_BY_RANGE = gql`
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
      metaData {
        startDate
        endDate
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

export const GET_PROGRAM_BY_ID = gql`
  query GetProgram($id: String!) {
    GetProgram(id: $id) {
      programName
      description
      category
      description
      location {
        type
        coordinates
      }
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
    }
  }
`;
export const GET_SERVICE_BY_ID = gql`
  query GetServiceById($id: String!) {
    getServiceById(id: $id) {
      serviceName
      description
      emailAddress
      contactNumber
      registrationRequired
      id
      active
      serviceType
      image
      details {
        cost
        availabilityTiming
        startTime
        endTime
        consultationAvailability
        timePerSession
      }
      attributes {
        attributeName
        attributeValues
      }
    }
  }
`;

export const GET_USERS_FOR_SERVICE = gql`
  query GetUsersForService($serviceId: String!) {
    getUsersForService(serviceId: $serviceId) {
      _id
      name
      email
      contact
      attributes {
        attributeName
        attributeValues
      }
      details {
        date
        time
        duration
      }
    }
  }
`;

export const GET_PROGRAM_TICKETS = gql`
  query ProgramTickets($programId: String!) {
    programTickets(programId: $programId) {
      _id
      programId
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

export const GET_MASJIDS = gql`
  query GetMasjids($id: String, $masjidName: String, $page: Int, $limit: Int) {
    getMasjids(id: $id, masjidName: $masjidName, page: $page, limit: $limit) {
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

export const GET_MASJID_BY_ID = gql`
  query GetMasjidById($id: String!) {
    getMasjidById(id: $id) {
      _id
      masjidName
      masjidPhotos {
        _id
        url
      }
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
      isVerified
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

export const GET_ADMIN_DETAILS = gql`
  query Me {
    me {
      _id
      name
      email
      role
      autoPrefillingTiming
      isVerified
      __typename
      createdAt
      email
      isFreezed
      isVerified
      masjidDetails {
        followers
        subscribers
      }
      profilePhoto
      masjids
    }
  }
`;
