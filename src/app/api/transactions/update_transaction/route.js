// src/app/api/transactions/update_transaction/route.js
import dbConnect from '../../../../lib/db';
import { Transaction } from '../../../../lib/models';

export async function POST(req) {
  try {
    await dbConnect();
    const { transaction_id, item, price, organization_id } = await req.json();

    if (!transaction_id || !item || price === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transaction_id,
      { item, price },
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), { status: 404 });
    }

    if (global.io) {
      const transactionData = updatedTransaction.toObject();
      global.io.to(organization_id).emit('transactionUpdated', transactionData);
    }

    return new Response(JSON.stringify({
      message: `${item} was successfully updated`,
      transaction: updatedTransaction.toObject(),
    }), { status: 200 });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return new Response(JSON.stringify({
      error: error.message,
    }), { status: error.message === 'Missing required fields' ? 400 : 500 });
  }
}