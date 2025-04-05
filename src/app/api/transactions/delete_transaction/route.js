// src/app/api/transactions/delete_transaction/route.js
import dbConnect from '../../../../lib/db';
import { Transaction } from '../../../../lib/models';
import { authMiddleware } from '../../../../lib/auth';

export async function DELETE(req) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status });
    }

    const { transaction_id, organization_id } = await req.json();

    console.log('Deleting transaction:', { transaction_id, organization_id });

    if (!transaction_id || !organization_id) {
      return new Response(JSON.stringify({ error: 'Transaction ID and Organization ID are required' }), { status: 400 });
    }

    await dbConnect();
    const result = await Transaction.findByIdAndDelete(transaction_id);
    if (!result) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), { status: 404 });
    }
    console.log(`Deleted transaction: ${transaction_id}`);

    if (global.io) {
      const deleteData = { transaction_id };
      console.log('Emitting transactionDeleted:', { deleteData, to: organization_id });
      global.io.to(organization_id).emit('transactionDeleted', deleteData);
      console.log(`Emit sent to organization: ${organization_id}`);
    } else {
      console.error('Socket.IO not available');
    }

    return new Response(JSON.stringify({ message: 'Transaction deleted' }), { status: 200 });
  } catch (error) {
    console.error('Delete transaction error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}