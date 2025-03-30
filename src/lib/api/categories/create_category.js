import Category from '../../../models/categoryModel';
import Organization from '../../../models/organizationModel';

export async function createCategory(categoryData) {
  const { category_name, organization_id, base_amount } = categoryData;

  if (!category_name || !organization_id || base_amount === undefined) {
    throw new Error('Category name, organization ID, and base amount are required');
  }

  try {
    // Validate organization exists
    const organization = await Organization.findById(organization_id);
    if (!organization) {
      throw new Error('Invalid organization ID');
    }

    // Create new category
    const newCategory = new Category({
      category_name,
      organization_id,
      base_amount,
    });

    const savedCategory = await newCategory.save();
    console.log('Created category:', savedCategory);

    // Update organization's categories array
    await Organization.findByIdAndUpdate(
      organization_id,
      { $push: { categories: savedCategory._id } },
      { new: true }
    );

    return savedCategory;
  } catch (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }
}