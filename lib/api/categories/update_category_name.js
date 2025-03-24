const Category = require("../../pages/api/models/categoryModel");

export const update_category_name = async (category_id, newCategoryName) => {
 try {
  const updatedCategory = await Category.findByIdAndUpdate(
   { _id: category_id },
   { category_name: newCategoryName },
   { new: true }
  );
  return updatedCategory;
 } catch (error) {
  throw new Error(error);
 }
};
