// src/app/api/transactions/create_transaction/route.js
import { createTransaction } from '../../../../lib/api/transactions/create_transaction';
import dbConnect from '../../../../lib/db';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    console.log("route hit", body);

    const savedTransaction = await createTransaction(body);

    if (global.io) {
      global.io.to(body.organization_id).emit('newTransaction', savedTransaction.toObject());
      console.log(`Emitted newTransaction to org ${body.organization_id}`);
    }

    return new Response(JSON.stringify({ message: 'Transaction created', transaction: savedTransaction.toObject() }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}