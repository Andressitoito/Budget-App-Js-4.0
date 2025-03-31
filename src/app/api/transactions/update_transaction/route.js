import dbConnect from '../../../../lib/db';
import { update_transaction } from "../../../../lib/transactions/update_transaction";

export async function PUT(req) {
  try {
    const { transaction_id, transaction_item, transaction_price, organization_id } = await req.json();
    await dbConnect();
    
    const updatedTransaction = await update_transaction(
      transaction_id,
      transaction_item,
      transaction_price
    );

    if (global.io) {
      global.io.to(organization_id).emit('transactionUpdated', updatedTransaction.toObject());
      console.log(`Emitted transactionUpdated to org ${organization_id}`);
    }

    return new Response(JSON.stringify({
      status: 200,
      message: `${transaction_item} was successfully updated`,
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 422,
      message: "Something went wrong updating transaction",
      error: error.toString(),
    }), { status: 422 });
  }
}