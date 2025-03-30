import dbConnect from '../../../lib/db';
import { get_sum_all_transactions } from "../../../../lib/transactions/get_sum_all_transactions";

async function handler(req, res) {
	////////////////////////////////
	// DECLARE GLOBAL VARIABLES
	////////////////////////////////
	const { organization_id } = req.body;

	let transactions;
	////////////////////////////////
	// CONNECT TO THE DATABASE
	////////////////////////////////
	await dbConnect();

	////////////////////////////////
	// GET TRANSACTIONS ARRAY
	////////////////////////////////
	try {
		transactions = await get_sum_all_transactions(organization_id);

		console.log("transactions ", transactions)
	} catch (error) {
		return res.status(500).json({
			status: 500,
			message: "Something went wrong getting transactions",
			error: error.toString(),
		});
	}
	////////////////////////////////
	// SEND RESPONSE
	////////////////////////////////
	res.status(200).json({
		status: 200,
		message: "Get transactions successfully",
		transactions,
	});
}

export default handler;
