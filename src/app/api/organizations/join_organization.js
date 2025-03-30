import dbConnect from '../../../lib/db';
import { find_organization_by_id } from "../../../lib/api/organizations/find_organization_by_id";
import { update_organization_member } from "../../../lib/api/organizations/update_organization_member";
import { update_user_guest_organization } from "../../../lib/api/users/update_user_guest_organizations";
import { create_new_user } from "../../../lib/api/users/create_new_user";
import User from '../../../models/usersModel';

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: 405, message: "Method not allowed" });
  }

  const { user: user_info, organization_id } = req.body;
  console.log("Request body:", req.body);

  try {
    await dbConnect();

    const existingUser = await User.findOne({ email: user_info.email });
    console.log("Existing user:", existingUser);

    let user = { ...user_info };

    let organization;
    try {
      organization = await find_organization_by_id(organization_id);
    } catch (error) {
      return res.status(422).json({
        status: 422,
        message: "Invalid organization ID",
        error: error.toString(),
      });
    }

    const orgName = organization.organization; // Store the name explicitly

    if (existingUser) {
      if (existingUser.isMemberOf(organization_id)) {
        return res.status(422).json({
          status: 422,
          message: "User is already a member of this organization",
          user: existingUser,
          organization,
        });
      }

      let saved_user, saved_organization;
      try {
        const updated = await update_user_guest_organization(existingUser._id, organization_id);
        saved_user = updated.saved_user;
        organization = updated.organization;
      } catch (error) {
        return res.status(422).json({
          status: 422,
          message: "Something went wrong updating user",
          error: error.toString(),
        });
      }

      try {
        saved_organization = await update_organization_member(existingUser._id, organization_id);
        console.log("Updated organization:", saved_organization);
      } catch (error) {
        return res.status(422).json({
          status: 422,
          message: "Error updating organization member",
          error: error.toString(),
        });
      }

      res.status(201).json({
        status: 201,
        message: `The user ${user.name} has successfully joined the ${orgName} organization`,
        user: saved_user,
        organization: saved_organization,
      });
    } else {
      let saved_user, saved_organization;

      try {
        saved_user = await create_new_user(user);
      } catch (error) {
        return res.status(501).json({
          status: 501,
          message: "Something went wrong creating user",
          error: error.toString(),
        });
      }

      try {
        const updated = await update_user_guest_organization(saved_user._id, organization_id);
        saved_user = updated.saved_user;
        organization = updated.organization;
      } catch (error) {
        return res.status(422).json({
          status: 422,
          message: "Something went wrong updating user",
          error: error.toString(),
        });
      }

      try {
        console.log('Calling update_organization_member with:', {
          user_id: saved_user._id,
          organization_id: organization_id,
        });
        saved_organization = await update_organization_member(saved_user._id, organization_id);
      } catch (error) {
        return res.status(422).json({
          status: 422,
          message: "Error updating organization member",
          error: error.toString(),
        });
      }

      res.status(201).json({
        status: 201,
        message: `The user ${user.name} has successfully joined the ${orgName} organization`,
        user: saved_user,
        organization: saved_organization,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.toString(),
    });
  }
}

export default handler;