const Transaction = require("../../pages/api/models/transactionModel");

export const get_transactions_list = async (category_id) => {
	try {
		let transactions = await Transaction.find({ category_id: category_id });
		transactions.reverse()
		return transactions;
	} catch (error) {
		throw new Error(error);
	}
};
