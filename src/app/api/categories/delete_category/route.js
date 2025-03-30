import dbConnect from '../../../lib/db';
import { deleteCategory } from '../../../lib/api/categories/delete_category';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { category_id } = req.query;

    if (!category_id) {
      return res.status(400).json({
        status: 400,
        message: 'Category ID is required'
      });
    }

    // Connect to the database
    await dbConnect();

    // Delete category and get deletion results
    const result = await deleteCategory(category_id);

    return res.status(200).json({
      status: 200,
      message: `Category and ${result.deletedTransactions} associated transactions were successfully deleted`,
      data: result
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({
      status: 500,
      message: 'Error deleting category',
      error: error.message
    });
  }
}
