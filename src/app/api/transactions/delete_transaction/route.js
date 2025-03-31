import dbConnect from '../../../../lib/db';
import { delete_transaction } from "../../../../lib/transactions/delete_transaction";

export async function POST(req) {
  try {
    const { transaction_id, transaction_item, organization_id } = await req.json();
    await dbConnect();
    
    await delete_transaction(transaction_id);

    if (global.io) {
      global.io.to(organization_id).emit('transactionDeleted', { 
        transaction_id,
        transaction_item 
      });
      console.log(`Emitted transactionDeleted to org ${organization_id}`);
    }

    return new Response(JSON.stringify({
      status: 200,
      message: `${transaction_item} was successfully deleted`,
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 422,
      message: "Something went wrong deleting transaction",
      error: error.toString(),
    }), { status: 422 });
  }
}