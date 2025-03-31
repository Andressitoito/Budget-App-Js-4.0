import dbConnect from '../../../../lib/db';
import { delete_all_transactions } from '../../../../lib/api/transactions/delete_all_transactions';

export async function DELETE(req) {
  try {
    const { category_id, organization_id } = await req.json();

    if (!category_id) {
      return new Response(JSON.stringify({
        status: 400,
        message: 'Category ID is required'
      }), { status: 400 });
    } 

    await dbConnect();
    const result = await delete_all_transactions(category_id);

    if (global.io) {
      global.io.to(organization_id).emit('transactionsDeleted', { 
        category_id,
        deletedCount: result.deletedCount 
      });
      console.log(`Emitted transactionsDeleted to org ${organization_id}`);
    }

    return new Response(JSON.stringify({
      status: 200,
      message: `Successfully deleted ${result.deletedCount} transactions`,
      data: result
    }), { status: 200 });
  } catch (error) {
    console.error('Error deleting transactions:', error);
    return new Response(JSON.stringify({
      status: 500,
      message: 'Error deleting transactions',
      error: error.message
    }), { status: 500 });
  }
}