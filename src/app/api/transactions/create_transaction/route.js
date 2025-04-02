// src/app/api/transactions/create_transaction/route.js
import dbConnect from '../../../../lib/db';
import { Transaction, Category } from '../../../../lib/models';

export async function POST(req) {
  try {
    await dbConnect();
    const { category_id, organization_id, username, item, price } = await req.json();

    if (!category_id || !organization_id || !username || !item || price === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const transaction = new Transaction({
      category_id,
      organization_id,
      username,
      item,
      price,
      date: new Date(),
    });
    await transaction.save();

    const category = await Category.findById(category_id);
    if (!category) throw new Error('Category not found');
    category.spent_amount += price;
    category.remaining_budget = category.base_amount - category.spent_amount;
    await category.save();

    if (global.io) {
      global.io.to(organization_id).emit('newTransaction', transaction.toObject());
      global.io.to(organization_id).emit('categoryUpdated', category.toObject());
      console.log(`Emitted newTransaction and categoryUpdated to org ${organization_id}`);
    }

    return new Response(JSON.stringify({
      message: 'Transaction created',
      transaction: transaction.toObject(),
    }), { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}