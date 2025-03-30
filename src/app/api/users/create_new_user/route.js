import dbConnect from '../../../lib/db';
import { create_new_user } from "../../../../lib/api/users/create_new_user";
import { find_organization_by_id } from "../../../../lib/api/organizations/find_organization_by_id";
import { find_user_by_email } from "../../../../lib/api/users/find_user_by_email";

async function handler(req, res) {
	if (req.method === "POST") {
		////////////////////////////////
		// DECLARE GLOBAL VARIABLES
		////////////////////////////////
		const { organization_id, user } = req.body;

		let saved_user;
		let organization;

		////////////////////////////////
		// CONNECT TO THE DATABASE
		////////////////////////////////
		await dbConnect();

		////////////////////////////////
		// FIND USER BY EMAIL
		////////////////////////////////
		try {
			await find_user_by_email(user.email, res);
		} catch (error) {
			return res.status(401).json({
				status: 401,
				error: error.toString(),
			});
		}

		////////////////////////////////
		// FIND ORGANIZATION BY ID
		////////////////////////////////
		try {
			organization = await find_organization_by_id(organization_id);
			console.log("This is organization", organization);
		} catch (error) {
			return res.status(422).json({
				status: 422,
				error: error.toString(),
			});
		}

		////////////////////////////////
		// DEFINE USER PATH TRUE / FALSE
		////////////////////////////////
		if (user.organization_owner) {
			////////////////////////////////
			// PATH USER TRUE
			////////////////////
			console.log("This is an OWNER");
		} else {
			////////////////////////////////
			// PATH USER FALSE
			////////////////////
			console.log("This is NOT an OWNER");

			////////////////////////////////
			// CREATE AND SAVE NEW USER
			////////////////////////////////
			saved_user = await create_new_user(user, organization_id, organization, res);
		}

		////////////////////////////////
		// SEND RESPONSE
		// USER
		////////////////////////////////
		res.status(201).json({
			status: 201,
			message: `New user ${user.name} has been successfully created and saved`,
			user: saved_user,
		});
	}
}

export default handler;
