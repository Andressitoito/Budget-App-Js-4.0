const Transaction = require("../../pages/api/models/transactionModel");

export const create_transaction = async (transaction) => {
	const {
		category_id,
		organization_id,
		username,
		item,
		price,
	} = transaction;

	try {
		const transaction_toSave = await new Transaction({
			category_id,
			organization_id,
			username,
			item,
			price,
			date: Date.now()
		});

		const saved_transaction = await transaction_toSave.save();

		return saved_transaction;
	} catch (error) {
		throw new Error(error);
	}
};
