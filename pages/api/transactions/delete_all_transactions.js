import dbConnect from '../../../lib/db';
import { deleteAllTransactions } from '../../../lib/api/transactions/delete_transactions';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { category_id } = req.body;

    if (!category_id) {
      return res.status(400).json({
        status: 400,
        message: 'Category ID is required'
      });
    }

    // Connect to the database
    await dbConnect();

    // Delete all transactions for the category
    const result = await deleteAllTransactions(category_id);

    return res.status(200).json({
      status: 200,
      message: `Successfully deleted ${result.deletedCount} transactions`,
      data: result
    });

  } catch (error) {
    console.error('Error deleting transactions:', error);
    return res.status(500).json({
      status: 500,
      message: 'Error deleting transactions',
      error: error.message
    });
  }
}
