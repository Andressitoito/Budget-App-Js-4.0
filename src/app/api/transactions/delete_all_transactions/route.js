// src/app/api/transactions/delete_all_transactions/route.js
import dbConnect from '../../../../lib/db';
import { Transaction } from '../../../../lib/models';

export async function DELETE(req) {
  try {
    const { category_id, organization_id } = await req.json();

    if (!category_id || !organization_id) {
      return new Response(JSON.stringify({
        error: 'Category ID and Organization ID are required'
      }), { status: 400 });
    }

    await dbConnect();
    const result = await Transaction.deleteMany({ category_id });

    if (global.io) {
      global.io.to(organization_id).emit('transactionsDeleted', { 
        category_id,
        deletedCount: result.deletedCount 
      });
      console.log(`Emitted transactionsDeleted to org ${organization_id}`);
    }

    return new Response(JSON.stringify({
      message: `Successfully deleted ${result.deletedCount} transactions`,
      deletedCount: result.deletedCount
    }), { status: 200 });
  } catch (error) {
    console.error('Error deleting transactions:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), { status: 500 });
  }
}