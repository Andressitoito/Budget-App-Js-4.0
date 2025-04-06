// src/app/api/transactions/create_transaction/route.js
import dbConnect from '../../../../lib/db';
import { Transaction } from '../../../../lib/models';
import { authMiddleware } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status });
    }

    const { item, price, category_id, organization_id, username } = await req.json();

    console.log('Creating transaction:', { item, price, category_id, organization_id, username });

    if (!item || !price || !category_id || !organization_id || !username) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    await dbConnect();
    const transaction = new Transaction({ item, price, category_id, organization_id, username });
    await transaction.save();
    console.log( transaction )
    console.log('Transaction created:', transaction._id);

    if (global.io) {
      const transactionData = transaction.toObject();
      console.log('Emitting newTransaction:', { transactionData, to: organization_id });
      global.io.to(organization_id).emit('newTransaction', transactionData);
      console.log(`Emit sent to organization: ${organization_id}`);
    } else {
      console.error('Socket.IO not available');
    }

    return new Response(JSON.stringify({ message: 'Transaction created', transaction: transaction.toObject() }), { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}