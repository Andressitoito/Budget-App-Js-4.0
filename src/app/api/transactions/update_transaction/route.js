// src/app/api/transactions/update_transaction/route.js
import { updateTransaction } from '../../../../lib/api/transactions/update_transaction';
import dbConnect from '../../../../lib/db';

export async function POST(req) {
  try {
    await dbConnect();
    const { transaction_id, item, price, organization_id } = await req.json();

    console.log('Updating transaction:', { transaction_id, item, price, organization_id });

    if (!transaction_id || !item || price === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const updatedTransaction = await updateTransaction({ transaction_id, item, price });

    if (global.io) {
      global.io.to(organization_id).emit('transactionUpdated', updatedTransaction.toObject());
      console.log(`Emitted transactionUpdated to org ${organization_id}`);
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