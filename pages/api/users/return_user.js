import dbConnect from '../../../lib/db';

const User = require("../../models/usersModel");

async function handler(req, res) {
	////////////////////////////////
	// DECLARE GLOBAL VARIABLES
	////////////////////////////////
	const { email } = req.body;

	let user;

	////////////////////////////////
	// CONNECT TO THE DATABASE
	////////////////////////////////
	await dbConnect();

	////////////////////////////////
	// FIND USER
	////////////////////////////////
	user = await User.findOne({ email: email });

	////////////////////////////////
	// DECLARE GLOBAL VARIABLES
	////////////////////////////////
	res.status(200).json({
		status: 200,
		user,
	});
}

export default handler;
