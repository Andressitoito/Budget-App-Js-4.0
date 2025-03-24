const Transaction = require("../../pages/api/models/transactionModel");

export const update_transaction = async (
	transaction_id,
	transaction_item,
	transaction_price
) => {
	try {
		const update_data = {
			item: transaction_item,
			price: transaction_price,
		};

		await Transaction.findByIdAndUpdate({ _id: transaction_id }, update_data, {
			new: false,
		});
	} catch (error) {
		throw new Error(error);
	}
};
