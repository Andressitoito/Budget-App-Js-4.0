// src/app/api/transactions/create_transaction/route.js
import { createTransaction } from '../../../../lib/api/transactions/create_transaction';
import { Category } from '../../../../lib/models';
import dbConnect from '../../../../lib/db';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    console.log("route hit", body);

    const savedTransaction = await createTransaction(body);

    // Fetch updated category
    const updatedCategory = await Category.findById(body.category_id).lean();

    if (global.io) {
      // Emit new transaction
      global.io.to(body.organization_id).emit('newTransaction', savedTransaction.toObject());
      // Emit updated category
      global.io.to(body.organization_id).emit('categoryUpdated', updatedCategory);
      console.log(`Emitted newTransaction and categoryUpdated to org ${body.organization_id}`);
    }

    return new Response(JSON.stringify({ message: 'Transaction created', transaction: savedTransaction.toObject() }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message === 'Missing required fields' ? 400 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}