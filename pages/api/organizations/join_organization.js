import dbConnect from '../../../lib/db';
import { check_organization_ownership } from "../../../lib/api/organizations/check_organization_ownership";
import { find_organization_by_id } from "../../../lib/api/organizations/find_organization_by_id";
import { update_organization_member } from "../../../lib/api/organizations/update_organization_member";
import { update_user_guest_organization } from "../../../lib/api/users/update_user_guest_organizations";
import { create_new_user } from "../../../lib/api/users/create_new_user";
import User from '../../../models/usersModel';

async function handler(req, res) {
	if (req.method === "POST") {
		////////////////////////////////
		// DECLARE GLOBAL VARIABLES
		////////////////////////////////
		const { user: user_info, organization_id } = req.body;

		console.log("user_info ", user_info);

		let saved_user;
		let organization;
		let saved_organization;
		let user;
		////////////////////////////////
		// CONNECT TO THE DATABASE
		////////////////////////////////
		await dbConnect();

		////////////////////////////////
		// GET USER FROM DATABASE
		////////////////////////////////
		const actual_data = await User.findOne({ email: user_info.email });
		console.log(actual_data)

		if (actual_data === null) {
			user = user_info;
			user.organization_owner = "none";
		} else {
			const { organization_owner: org_owner } = actual_data;

			user = {
				...user_info,
				organization_owner: org_owner,
			};
		}
		console.log('USER EXISTS ?? ', user.userExists)
		////////////////////////////////
		// CHECK VALID ORGANIZATION ID
		////////////////////////////////
		try {
			organization = await find_organization_by_id(organization_id);
		} catch (error) {
			return res.status(422).json({
				status: 422,
				message: "Wrong id validator",
				error: error.toString(),
			});
		}

		if (user.userExists === true) {
			////////////////////////////////
			// USER TRUE
			////////////////////////////////
			// JOIN ORGANIZATION
			////////////////////////////////

			////////////////////////////////
			// CHECK ORGANIZATION OWNERSHIP
			////////////////////////////////
			try {
				await check_organization_ownership(
					organization_id,
					user.organization_owner
				);
			} catch (error) {
				return res.status(401).json({
					status: 401,
					message: "Forbidden attempt",
					error: error.toString(),
				});
			}

			////////////////////////////////
			// UPDATE USER GUEST_ORGANIZATION
			////////////////////////////////
			try {
				console.log('THIS IS USER ', user)
				let updated_user = await update_user_guest_organization(
					actual_data._id,
					organization_id
				);
				saved_user = updated_user.saved_user;
				organization = updated_user.organization;
			} catch (error) {
				return res.status(422).json({
					status: 422,
					message: "Something went wrong updating user",
					error: error.toString(),
				});
			}

			////////////////////////////////
			// UPDATE ORGANIZATION MEMBER
			////////////////////////////////
			try {
				saved_organization = await update_organization_member(
					actual_data._id,
					user.name,
					organization_id
				);

				console.log(saved_organization);
			} catch (error) {
				return res.status(422).json({
					status: 422,
					message:
						"Error updating organization member, check the provided organizatoin_id",
					error: error.toString(),
				});
			}

			////////////////////////////////
			// SEND RESPONSE
			// USER AND ORGANIZATION
			////////////////////////////////
			res.status(201).json({
				status: 201,
				message: `The user ${user.name} has successfully joined to the ${organization} organization`,
				user: saved_user,
				organization: saved_organization,
			});
		} else {
			////////////////////////////////
			// USER FALSE
			////////////////////////////////
			// CREATE NEW USER
			// JOIN ORGANIZATION
			////////////////////////////////
			////////////////////////////////
			// CREATE	NEW USER
			////////////////////////////////
			try {
				saved_user = await create_new_user(user);
			} catch (error) {
				return res.status(501).json({
					status: 501,
					message: "Something went wrong",
					error: error.toString(),
				});
			}

			////////////////////////////////
			// UPDATE USER GUEST_ORGANIZATION
			////////////////////////////////
			try {
				let updated_user = await update_user_guest_organization(
					saved_user._id,
					organization_id
				);
				saved_user = updated_user.saved_user;
				organization = updated_user.organization;
			} catch (error) {
				return res.status(422).json({
					status: 422,
					message: "Something went wrong updating user",
					error: error.toString(),
				});
			}

			////////////////////////////////
			// UPDATE ORGANIZATION MEMBER
			////////////////////////////////
			try {
				saved_organization = await update_organization_member(
					saved_user._id,
					saved_user.name,
					organization_id
				);

				console.log(saved_organization);
			} catch (error) {
				return res.status(422).json({
					status: 422,
					message:
						"Error updating organization member, check the provided organizatoin_id",
					error: error.toString(),
				});
			}

			////////////////////////////////
			// SEND RESPONSE
			// USER AND ORGANIZATION
			////////////////////////////////
			res.status(201).json({
				status: 201,
				message: `The user ${user.name} has successfully joined to the ${organization} organization`,
				user: saved_user,
				organization: saved_organization,
			});
		}
	}
}

export default handler;
