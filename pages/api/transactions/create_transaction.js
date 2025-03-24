import dbConnect from '../../../lib/db';

const {
	create_transaction,
} = require("../../../../lib/transactions/create_transaction");

async function handler(req, res) {
	if (req.method === "POST") {
		////////////////////////////////
		// DECLARE GLOBAL VARIABLES
		////////////////////////////////
		const { transaction } = req.body;

		let saved_transaction;

		////////////////////////////////
		// CONNECT TO THE DATABASE
		////////////////////////////////
		await dbConnect();

		////////////////////////////////
		// CREATE TRANSACTION
		////////////////////////////////
		try {
			saved_transaction = await create_transaction(transaction);
		} catch (error) {
			return res.status(421).json({
				status: 421,
				message: "Something went wrong creating a new transaction",
				error: error.toString(),
			});
		}

		////////////////////////////////
		// SEND RESPONSE
		// TRANSACTION
		////////////////////////////////
		res.status(201).json({
			status: 201,
			message: "The transaction was successfully created",
			new_transaction: saved_transaction,
		});
	}
}

export default handler;
