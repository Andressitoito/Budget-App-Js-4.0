import dbConnect from '../../../lib/db';
import { check_category } from "../../../../lib/api/categories/check_category";
import { get_transactions_list } from "../../../../lib/api/transactions/get_transactions_list";

async function handler(req, res) {
	////////////////////////////////
	// DECLARE GLOBAL VARIABLES
	////////////////////////////////
	const { category_id } = req.body;

	let transactions;
	////////////////////////////////
	// CONNECT TO THE DATABASE
	////////////////////////////////
	await dbConnect();

	////////////////////////////////
	// CHECK VALID CATEGORY ID
	////////////////////////////////
	try {
		await check_category(category_id);
	} catch (error) {
		return res.status(422).json({
			status: 422,
			message: "The provided category_id is invalid or inexistent",
			error: error.toString(),
		});
	}

	////////////////////////////////
	// GET TRANSACTIONS ARRAY
	////////////////////////////////
	try {
		transactions = await get_transactions_list(category_id);
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
