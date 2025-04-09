// src/app/api/webhooks/mercado-pago/route.js
import dbConnect from '../../../../lib/db';
import { User, IncomingTransaction } from '../../../../lib/models';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    console.log('Mercado Pago Webhook:', body);

    // Validate payload (mock for now, replace with real MP validation)
    if (!body.user_id || !body.transaction_id) {
      return new Response(JSON.stringify({ error: 'Invalid webhook payload' }), { status: 400 });
    }

    // Step 4: Find user by mp_id
    const user = await User.findOne({ mp_id: body.user_id });
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Step 5: Mock MP API call (replace with real GET later)
    const mockMPResponse = {
      amount: 5000, // Mock price
      description: `Payment ${body.transaction_id}`, // Mock desc
      date: new Date().toISOString(), // Mock date
    };

    // Step 6: Extract data
    const incomingTransaction = new IncomingTransaction({
      _id: body.transaction_id,
      name: mockMPResponse.description,
      amount: mockMPResponse.amount,
      user_id: user._id.toString(),
      organization_id: user.mp_organization_id || user.defaultOrgId, // Use MP-linked org or default
      date: new Date(mockMPResponse.date),
    });

    // Step 7: Save (pending state by default)
    await incomingTransaction.save();

    // Emit to socket (for notifications)
    if (global.io) {
      global.io.to(incomingTransaction.organization_id).emit('newIncomingTransaction', incomingTransaction.toObject());
    }

    return new Response(JSON.stringify({ message: 'Webhook processed' }), { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}