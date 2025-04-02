// src/app/api/transactions/delete_transaction/route.js
import dbConnect from '../../../../lib/db';
import { Transaction, Category } from '../../../../lib/models';

export async function DELETE(req) {
  try {
    await dbConnect();
    const { transaction_id, organization_id } = await req.json();

    if (!transaction_id || !organization_id) {
      return new Response(JSON.stringify({ error: 'Transaction ID and organization ID required' }), { status: 400 });
    }

    const transaction = await Transaction.findById(transaction_id);
    if (!transaction) throw new Error('Transaction not found');

    const category = await Category.findById(transaction.category_id);
    if (category) {
      category.spent_amount -= transaction.price;
      category.remaining_budget = category.base_amount - category.spent_amount;
      await category.save();
    }

    await Transaction.deleteOne({ _id: transaction_id });

    if (global.io) {
      global.io.to(organization_id).emit('transactionDeleted', { transaction_id });
      if (category) {
        global.io.to(organization_id).emit('categoryUpdated', category.toObject());
      }
    }

    return new Response(JSON.stringify({ message: 'Transaction deleted' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}