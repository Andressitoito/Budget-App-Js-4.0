import dbConnect from '../../../lib/db';
import { updateCategoryName } from '../../../lib/api/categories/update_category';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { category_id, newCategoryName } = req.body;

    if (!category_id || !newCategoryName) {
      return res.status(400).json({
        status: 400,
        message: 'Category ID and new category name are required'
      });
    }

    // Connect to the database
    await dbConnect();

    // Update category name
    const updatedCategory = await updateCategoryName(category_id, newCategoryName);

    return res.status(200).json({
      status: 200,
      message: `Category name updated successfully to '${updatedCategory.category_name}'`,
      data: updatedCategory
    });

  } catch (error) {
    console.error('Error updating category name:', error);
    return res.status(500).json({
      status: 500,
      message: 'Error updating category name',
      error: error.message
    });
  }
}
