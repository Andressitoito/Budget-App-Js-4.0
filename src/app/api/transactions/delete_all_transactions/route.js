// src/app/api/transactions/delete_all_transactions/route.js
import dbConnect from '../../../../lib/db';
import { Transaction } from '../../../../lib/models';
import { authMiddleware } from '../../../../lib/auth';

export async function DELETE(req) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status });
    }

    const { category_id, organization_id } = await req.json();

    if (!category_id || !organization_id) {
      return new Response(JSON.stringify({ error: 'Category ID and Organization ID are required' }), { status: 400 });
    }

    await dbConnect();
    const result = await Transaction.deleteMany({ category_id, organization_id });

    if (global.io) {
      const deleteData = { category_id, deletedCount: result.deletedCount };
      global.io.to(organization_id).emit('transactionsDeleted', deleteData);
    }

    return new Response(JSON.stringify({ message: 'Transactions deleted', deletedCount: result.deletedCount }), { status: 200 });
  } catch (error) {
    console.error('Delete transactions error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}