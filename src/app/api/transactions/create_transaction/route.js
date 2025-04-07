// src/app/api/transactions/create_transaction/route.js
import dbConnect from '../../../../lib/db';
import { Transaction, Category } from '../../../../lib/models';
import { authMiddleware } from '../../../../lib/auth';

let lastEmitTime = 0;
const debounceTime = 1000; // 1 second debounce

export async function POST(req) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status });
    }

    const { item, price, category_id, organization_id, username } = await req.json();

    if (!item || !price || !category_id || !organization_id || !username) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    await dbConnect();
    const transaction = new Transaction({ item, price, category_id, organization_id, username });
    await transaction.save();

    const category = await Category.findById(category_id);
    if (!category) {
      return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 });
    }
    category.remaining_budget -= price;
    await category.save();

    if (global.io) {
      const now = Date.now();
      if (now - lastEmitTime >= debounceTime) {
        const transactionData = transaction.toObject();
        const categoryData = category.toObject();
        global.io.to(organization_id).emit('newTransaction', transactionData);
        global.io.to(organization_id).emit('categoryUpdated', categoryData); // Ensure this fires
        lastEmitTime = now;
      }
    }

    return new Response(JSON.stringify({ message: 'Transaction created', transaction: transaction.toObject() }), { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}