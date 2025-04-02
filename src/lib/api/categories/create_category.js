import { Category, Organization } from "src/lib/models";

export async function createCategory(categoryData) {
  const { name, organization_id, base_amount } = categoryData;

  if (!name || !organization_id || base_amount === undefined) {
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
      name,
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