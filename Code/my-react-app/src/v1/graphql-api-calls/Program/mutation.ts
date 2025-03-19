import { gql, useMutation } from "@apollo/client";

export const CREATE_PROGRAM = gql`
  mutation AddProgram($input: ProgramInput!) {
    AddProgram(input: $input) {
      _id
      programName
      description
      masjidId
      isPaid
      cost
      capacity
      metaData {
        startDate
        endDate
        recurrenceType
        recurrenceInterval
      }
      programPhotos
      isRegistrationRequired
    }
  }
`;

export const useCreateProgram = () => {
  const [createProgram, { data, loading, error }] = useMutation(CREATE_PROGRAM);

  const addProgram = async (input: any) => {
    try {
      const response = await createProgram({
        variables: { input },
      });
      return response.data.AddProgram;
    } catch (err) {
      console.error("Error creating program:", err);
      throw err;
    }
  };

  return {
    addProgram,
    data,
    loading,
    error,
  };
};

export const UPDATE_PROGRAM = gql`
  mutation UpdateProgram($id: String!, $input: ProgramInput!) {
    UpdateProgram(id: $id, input: $input) {
      _id
      isPaid
      description
      ageRange {
        minimumAge
        maximumAge
      }
    }
  }
`;



export const useUpdateProgram = () => {
  const [updateProgram, { data, loading, error }] = useMutation(UPDATE_PROGRAM);

  const UpdateProgram = async (id: string, input: any) => {
    try {
      const response = await updateProgram({
        variables: { id, input },
      });
      return response.data.UpdateProgram;
    } catch (err) {
      console.error("Error updating program:", err);
      throw err;
    }
  };

  return {
    UpdateProgram,
    data,
    loading,
    error,
  };
};

const CANCEL_PROGRAM = gql`
  mutation CancelProgram($id: String!, $all: Boolean) {
    CancelProgram(id: $id, all: $all) {
      _id
    }
  }
`;

export const useCancelProgram = () => {
  const [cancelProgram, { data, loading, error }] = useMutation(CANCEL_PROGRAM);
  return { cancelProgram, data, cancelling: loading, cnclerr: error };
};
