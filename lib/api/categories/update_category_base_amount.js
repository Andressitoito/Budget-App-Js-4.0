const Category = require("../../pages/api/models/categoryModel");

export const update_category_base_amount = async (category_id, base_amount) => {
 try {
  let updated_category = await Category.findByIdAndUpdate(
   { _id: category_id },
   { base_amount: base_amount },
   { new: true }
  );
  return updated_category
 } catch (error) {
  throw new Error(error);
 }
};
