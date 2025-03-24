const Transaction = require("../../pages/api/models/transactionModel");

export const delete_transaction = async (transaction_id) => {
	try {
		const deleted_transaction = await Transaction.findByIdAndDelete({
			_id: transaction_id,
		});

		if (deleted_transaction) {
			return "Transaction successfully deleted";
		} else {
			throw new Error("This transaction cannot be deleted");
		}
	} catch (error) {
		throw new Error(error);
	}
};
