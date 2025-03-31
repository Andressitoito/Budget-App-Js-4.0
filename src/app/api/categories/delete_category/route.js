import dbConnect from '../../../../lib/db';
import { deleteCategory } from '../../../../lib/api/categories/delete_category';

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category_id = searchParams.get('category_id');
    const organization_id = searchParams.get('organization_id');

    if (!category_id || !organization_id) {
      return new Response(JSON.stringify({
        status: 400,
        message: 'Category ID and Organization ID are required'
      }), { status: 400 });
    }

    await dbConnect();
    const result = await deleteCategory(category_id);

    if (global.io) {
      global.io.to(organization_id).emit('categoryDeleted', { 
        category_id,
        deletedTransactions: result.deletedTransactions 
      });
      console.log(`Emitted categoryDeleted to org ${organization_id}`);
    }

    return new Response(JSON.stringify({
      status: 200,
      message: `Category and ${result.deletedTransactions} transactions deleted`,
      data: result
    }), { status: 200 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return new Response(JSON.stringify({
      status: 500,
      message: 'Error deleting category',
      error: error.message
    }), { status: 500 });
  }
}