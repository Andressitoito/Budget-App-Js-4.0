const Category = require("../../pages/api/models/categoryModel");

export const check_category = async (category_id) => {
	try {
		const category = await Category.find({ _id: category_id });
		if (category !== undefined) {
			return category;
		} else {
			throw new Error();
		}
	} catch (error) {
		throw new Error(error);
	}
};
