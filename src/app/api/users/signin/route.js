import dbConnect from '../../../lib/db';
import { random_message } from "../../../../lib/signin/random_message";
const User = require("../../models/usersModel");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

console.log("JWT ", JWT_SECRET)

async function handler(req, res) {
	if (req.method === "POST") {
		//////////////////////////////////
		// DECLARE GLOBAL VARIABLES
		//////////////////////////////////
		let email = req.body;
		let user;

		//////////////////////////////////
		// CONNECT TO THE DATABASE
		//////////////////////////////////
		await dbConnect();

		//////////////////////////////////
		// CHECK USER
		//////////////////////////////////
		try {
			const userData = await User.findOne({ email: email });

			if (userData?.email === email) {
				user = userData;
			} else {
				throw new Error(
					`This user ${email} is not registered, please Signup and try again!`
				);
			}
		} catch (error) {
			return res.status(403).json({
				status: 403,
				message: "Invalid user",
				error: error.toString(),
			});
		}

		//////////////////////////////////
		// GET RANDOM MESSAGE
		//////////////////////////////////
		const message = random_message(user.given_name);

		//////////////////////////////////
		// GENERATE JWT TOKEN
		//////////////////////////////////
		const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1000h' });

		//////////////////////////////////
		// SEND RESPONSE USER
		//////////////////////////////////
		res.status(200).json({
			status: 200,
			message: message,
			user: user,
			token: token
		});
	}
}

export default handler;
