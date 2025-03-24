const Transaction = require("../../pages/api/models/transactionModel");
const Category = require("../../pages/api/models/categoryModel");

export const get_sum_all_transactions = async (organization_id) => {
	try {
		let transactions = await Transaction.find({
			organization_id: organization_id,
		});
		let extra_income = 0;
		let sum_spent = transactions.reduce((acc, transaction) => {
			if (transaction.price < 0) {
				extra_income += transaction.price;
				return (acc += 0);
			}
			return (acc += transaction.price);
		}, 0);

		let sum_bases = await Category.find({ organization_id: organization_id });

		sum_bases = sum_bases.reduce((acc, bases) => {
			return (acc += bases.base_amount);
		}, 0);

		let main_budget = -extra_income + sum_bases;

		return {
			main_budget,
			sum_bases,
			sum_spent,
		};
	} catch (error) {
		throw error;
	}
};
