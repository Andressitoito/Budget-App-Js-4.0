const Category = require("../../pages/api/models/categoryModel");

export const get_all_categories = async (organization_id) => {
	try {
		const arrayOfCategories = await Category.find({
			organization_id: organization_id,
		});
		return arrayOfCategories;
	} catch (error) {
		throw new Error(error);
	}
};
