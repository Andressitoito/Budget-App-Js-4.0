import dbConnect from '../../../../lib/db';
import { check_category } from "../../../../lib/api/categories/check_category";
import { get_transactions_list } from "../../../../lib/api/transactions/get_transactions_list";

export async function POST(req) {
  try {
    const { category_id } = await req.json();
    await dbConnect();
    
    await check_category(category_id);
    const transactions = await get_transactions_list(category_id);

    return new Response(JSON.stringify({
      status: 200,
      message: "Get transactions successfully",
      transactions,
    }), { status: 200 });
  } catch (error) {
    const status = error.message.includes('invalid or inexistent') ? 422 : 500;
    return new Response(JSON.stringify({
      status,
      message: status === 422 ? 
        "The provided category_id is invalid or inexistent" : 
        "Something went wrong getting transactions",
      error: error.toString(),
    }), { status });
  }
}