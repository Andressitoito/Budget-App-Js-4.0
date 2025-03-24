import dbConnect from '../../../lib/db';
import { update_transaction } from "../../../../lib/transactions/update_transaction";

async function handler(req, res) {
	if (req.method === "PUT") {
		////////////////////////////////
		// DECLARE GLOBAL VARIABLES
		////////////////////////////////
		const { transaction_id, transaction_item, transaction_price } = req.body;

		////////////////////////////////
		// CONNECT TO THE DATABASE
		////////////////////////////////
		await dbConnect();

		////////////////////////////////
		// DELETE TRANSACTION
		////////////////////////////////
		try {
			await update_transaction(
				transaction_id,
				transaction_item,
				transaction_price
			);
		} catch (error) {
			return res.status(422).json({
				status: 422,
				message: "Something went wrong updating transaction",
				error: error.toString(),
			});
		}

		////////////////////////////////
		// SEND RESPONSE
		////////////////////////////////
		res.status(200).json({
			status: 200,
			message: `${transaction_item} was successfully updated`,
		});
	}
}

export default handler;
