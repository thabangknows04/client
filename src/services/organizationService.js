import axios from "axios";

export const getOrganizationUserDetails = async (user) => {
  try {
    if (!user || !user._id) {
      throw new Error("Invalid organization user data");
    }

    const response = await axios.get(
      `http://localhost:5011/api/organizations/get/${user._id}`
    );

    if (response.status !== 200) {
      throw new Error("Failed to fetch organization user details");
    }

    return response.data;
  } catch (err) {
    console.error("Error fetching organization user details:", err);
    throw err;
  }
};
