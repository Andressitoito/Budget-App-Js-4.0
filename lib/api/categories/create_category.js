import Category from '../../../models/categoryModel';

export async function createCategory(category) {
  const { category_name, organization_id } = category;

  if (!category_name || !organization_id) {
    throw new Error('Category name and organization ID are required');
  }

  try {
    const newCategory = new Category({
      category_name,
      organization_id,
    });

    const savedCategory = await newCategory.save();
    return savedCategory;
  } catch (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }
}
