import { gql, useMutation } from "@apollo/client";
import { MasjidLocation, TempUserInput } from "../../../Types/MasjidTypes";
import { ExternalLinkInput } from "../../../Types/MasjidTypes";

// Define the createMasjid GraphQL mutation
const CREATE_MASJID_MUTATION = gql`
  mutation CreateMasjid($input: MasjidInput!) {
    createMasjid(input: $input) {
      _id
      masjidName
      address
    }
  }
`;

export interface MasjidInput {
  masjidName: string;
  masjidProfilePhoto?: string;
  description: string;
  address: string;
  location: MasjidLocation;
  contact: string;
  externalLinks: ExternalLinkInput[];
  tempUser?: TempUserInput;
}

interface CreateMasjidResponse {
  _id: string;
  masjidName: string;
  address: string;
}

export const useCreateMasjid = () => {
  const [createMasjidMutation, { data, loading, error }] = useMutation<
    { createMasjid: CreateMasjidResponse },
    { input: MasjidInput }
  >(CREATE_MASJID_MUTATION);

  const createMasjid = async (input: MasjidInput) => {
    try {
      const response = await createMasjidMutation({
        variables: { input },
      });
      if (response.errors && response.errors.length > 0) {
        // Check if the error message contains the specific MongoDB duplicate key error
        const duplicateKeyError = response.errors.find((err) =>
          err.message.includes("E11000 duplicate key error")
        );
        if (duplicateKeyError) {
          throw new Error(
            "A masjid with the same name already exists. Please choose a different name."
          );
        }
      }
      return response.data?.createMasjid;
    } catch (err: any) {
      console.error("Error creating Masjid:", err);
      // Prepare a more specific error message based on known error patterns
      const errorContext = {
        message: err.message || "Failed to create masjid due to server issue.",
        userFriendlyMessage:
          err.message || "Failed to process your request. Please try again.",
      };
      throw errorContext;
    }
  };

  return {
    createMasjid,
    loading,
    error,
    data,
  };
};
