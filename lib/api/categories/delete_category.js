const Transaction = require("../../pages/api/models/transactionModel");
const Category = require("../../pages/api/models/categoryModel");

export const delete_category = async (category_id) => {
	try {
		const result = await Transaction.deleteMany({
			category_id: category_id,
		});
		await Category.findByIdAndDelete({ _id: category_id });
		return `${result.deletedCount}`;
	} catch (error) {
		throw new Error(error);
	}
};
