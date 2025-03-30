import dbConnect from '../../../lib/db';
import { updateCategoryBaseAmount } from '../../../lib/api/categories/update_category';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { category_id, new_base_amount } = req.body;

    if (!category_id || typeof new_base_amount !== 'number') {
      return res.status(400).json({
        status: 400,
        message: 'Category ID and new base amount are required. Base amount must be a number.'
      });
    }

    // Connect to the database
    await dbConnect();

    // Update category base amount
    const updatedCategory = await updateCategoryBaseAmount(category_id, new_base_amount);

    return res.status(200).json({
      status: 200,
      message: 'Base amount updated successfully',
      data: updatedCategory
    });

  } catch (error) {
    console.error('Error updating category base amount:', error);
    return res.status(500).json({
      status: 500,
      message: 'Error updating category base amount',
      error: error.message
    });
  }
}
