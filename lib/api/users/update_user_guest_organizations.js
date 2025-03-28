import User from '../../../models/usersModel';
import Organization from '../../../models/organizationModel';

export const update_user_guest_organization = async (_id, organization_id) => {
  try {
    const organizationData = await Organization.findById(organization_id);
    if (!organizationData) {
      throw new Error("Organization not found");
    }

    const userData = await User.findById(_id);
    if (!userData) {
      throw new Error("User not found");
    }

    // Check if the user is already a member of the organization
    const isAlreadyMember = userData.organizations.some(
      (org) => org.organization.toString() === organization_id.toString()
    );

    if (!isAlreadyMember) {
      const { organization } = organizationData;
      const saved_user = await User.findByIdAndUpdate(
        _id,
        {
          $push: {
            organizations: {
              organization: organization_id,
              role: "member", // Default role as per your schema
            },
          },
        },
        { new: true } // Return the updated document
      );
      return { saved_user, organization };
    } else {
      throw new Error(
        "Oops! It looks like you're already a member of this organization. Please sign in to access your account."
      );
    }
  } catch (error) {
    // Re-throw the error with the original message if it’s specific, otherwise a generic one
    throw new Error(error.message || "Failed to update user organization");
  }
};