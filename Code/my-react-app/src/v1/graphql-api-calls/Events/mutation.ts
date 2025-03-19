import { gql, useMutation } from "@apollo/client";

export const CHECKIN_TICKET = gql`
  mutation CheckIn($bookingId: String!, $noOfPersons: Int!) {
    checkIn(bookingId: $bookingId, noOfPersons: $noOfPersons)
  }
`;

//CREATE

const CREATE_EVENT = gql`
  mutation CreateEvent($input: EventInput!) {
    createEvent(input: $input) {
      _id
      masjid
    }
  }
`;

export const useCreateEvent = () => {
  const [createEvent, { data, loading, error }] = useMutation(CREATE_EVENT, {
    fetchPolicy: "no-cache",
  });
  return { createEvent, data, loading, error };
};

//UPDATE

const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: String!, $input: EventInput!, $all: Boolean) {
    updateEvent(id: $id, input: $input, all: $all) {
      _id
      eventName
    }
  }
`;

export const useUpdateEvent = () => {
  const [updateEvent, { data, loading, error }] = useMutation(UPDATE_EVENT, {
    fetchPolicy: "no-cache",
  });
  return { updateEvent, data, loading, error };
};

// //DELETE

// const DELETE_EVENT = gql`
//   mutation DeleteEvent($id: String!, $all: Boolean) {
//     deleteEvent(id: $id, all: $all) {
//       _id
//     }
//   }
// `;

// export const useDeleteEvent = () => {
//   const [deleteEvent, { data, loading, error }] = useMutation(DELETE_EVENT);
//   return { deleteEvent, data, loading, error };
// };

//CANCEL

const CANCEL_EVENT = gql`
  mutation CancelEvent($id: String!, $all: Boolean) {
    cancelEvent(id: $id, all: $all) {
      _id
    }
  }
`;

export const useCancelEvent = () => {
  const [cancelEvent, { data, loading, error }] = useMutation(CANCEL_EVENT);
  return { cancelEvent, data, cancelling: loading, cnclerr: error };
};
