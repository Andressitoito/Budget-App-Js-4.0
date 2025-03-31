import dbConnect from '../../../../lib/db';
import { get_sum_all_transactions } from "../../../../lib/transactions/get_sum_all_transactions";

export async function POST(req) {
  try {
    const { organization_id } = await req.json();
    await dbConnect();
    
    const transactions = await get_sum_all_transactions(organization_id);

    return new Response(JSON.stringify({
      status: 200,
      message: "Get transactions successfully",
      transactions,
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 500,
      message: "Something went wrong getting transactions",
      error: error.toString(),
    }), { status: 500 });
  }
}