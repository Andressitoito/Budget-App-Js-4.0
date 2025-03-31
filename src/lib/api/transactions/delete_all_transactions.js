import Transaction from "../../../models/transactionModel";
import dbConnect from "../../db";

export const delete_all_transactions = async (category_id) => {
	try {
		await dbConnect();
		const result = await Transaction.deleteMany({
			category_id: category_id,
		});

		return `${result.deletedCount} transactions were deleted`;
	} catch (error) {
		throw new Error(error);
	}
};
