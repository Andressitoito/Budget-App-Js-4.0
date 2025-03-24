const Transaction = require("../../pages/api/models/transactionModel");

export const delete_all_transactions = async (category_id) => {
	try {
		const result = await Transaction.deleteMany({
			category_id: category_id,
		});

		return `${result.deletedCount} transactions were deleted`;
	} catch (error) {
		throw new Error(error);
	}
};
