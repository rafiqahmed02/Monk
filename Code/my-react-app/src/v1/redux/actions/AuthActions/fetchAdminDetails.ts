import * as api from "../../../api-calls/index";

import { client } from "../../../../App"; // Import your configured Apollo Client
import { GET_ADMIN_DETAILS } from "../../../graphql-api-calls/query";

export const fetchAdminDetails = () => async () => {
  try {
    // Execute the GraphQL query
    const { data } = await client.query({
      query: GET_ADMIN_DETAILS,
      fetchPolicy: "network-only",
    });
    if (data && data.me) {
      const adminData = { ...data.me };
      adminData.message = "Success";
      return adminData;
    } else {
      throw new Error("Admin details not found");
    }
  } catch (error: any) {
    console.error("Error fetching admin details:", error);

    // Handle errors with a consistent structure
    return {
      success: false,
      error: "Failed to Login",
      message: "Failed to Send Email",
    };
  }
};
